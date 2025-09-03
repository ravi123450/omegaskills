import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Pool } from "pg"; // PostgreSQL import
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import crypto from "crypto";

// --- Database setup ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Make sure to add the PostgreSQL connection URL to .env
});

async function run(sql, params = []) {
  const client = await pool.connect();
  try {
    const res = await client.query(sql, params);
    return res;
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
}

async function get(sql, params = []) {
  const client = await pool.connect();
  try {
    const res = await client.query(sql, params);
    return res.rows[0]; // Returns the first row
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
}

async function all(sql, params = []) {
  const client = await pool.connect();
  try {
    const res = await client.query(sql, params);
    return res.rows; // Returns all rows
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
}

// --- Config ---
const app = express();
const PORT = process.env.PORT || 4000;
const ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const TOKEN_COOKIE = "token";

// --- Middleware ---
app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: ORIGIN,
    credentials: true,
  })
);

const SIGNUP_OTP_REQUIRED = String(process.env.SIGNUP_OTP_REQUIRED || "1") !== "0";

const genOtp = () => String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
const randomId = () => (crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex"));
const PENDING_TTL_MS = 10 * 60 * 1000; // 10 minutes

// --- Mailer ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: String(process.env.SMTP_SECURE || "true") === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendMail(to, subject, html) {
  if (!process.env.SMTP_HOST) {
    console.warn("SMTP not configured; skipping email send");
    return;
  }
  await transporter.sendMail({
    from: process.env.FROM_EMAIL || "no-reply@localhost",
    to,
    subject,
    html,
  });
}

function sixDigit() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
function maskEmail(email) {
  const [u, d] = String(email).split("@");
  if (!u || !d) return email;
  const half = Math.max(1, Math.floor(u.length / 2));
  return `${u.slice(0, half)}***@${d}`;
}

// --- Helpers ---
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
function extractToken(req) {
  if (req.cookies[TOKEN_COOKIE]) return req.cookies[TOKEN_COOKIE];
  const h = req.headers.authorization || "";
  const m = h.match(/^Bearer\s+(.+)/i);
  return m ? m[1] : null;
}
function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// --- Health ---
app.get("/", (_req, res) => res.json({ ok: true, service: "omega-softskills-combined" }));

app.post("/api/auth/signup", async (req, res) => {
  try {
    let { name, email, password } = req.body || {};
    name = (name || "").trim();
    email = (email || "").trim().toLowerCase();
    const pw = String(password || "");

    if (!name || !email || !pw)
      return res.status(400).json({ error: "Name, email, and password are required" });

    // strong password check
    const strong =
      pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw);
    if (!strong)
      return res.status(400).json({
        error: "Password must be 8+ chars with upper, lower, number, and symbol.",
      });

    // already registered?
    const exists = await get("SELECT id FROM users WHERE email=$1", [email]);
    if (exists) return res.status(409).json({ error: "Email already in use" });

    // OTP-FIRST FLOW
    if (SIGNUP_OTP_REQUIRED) {
      const pending_id = randomId();
      const hash = await bcrypt.hash(pw, 12);
      const otp = genOtp();
      const now = Date.now();

      // ensure only one pending row per email
      await run("DELETE FROM pending_signups WHERE email=$1", [email]);
      await run(
        `INSERT INTO pending_signups
         (id,name,email,password_hash,otp_code,otp_expires_at,created_at,attempts,resend_count)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [pending_id, name, email, hash, otp, now + PENDING_TTL_MS, now, 0, 0]
      );

      // send OTP
      await sendMail(
        email,
        "Your Omega Skills Academy verification code",
        `Your verification code is: ${otp}`
      );

      return res.json({
        otp_required: true,
        pending_id,
        email_masked: maskEmail(email),
      });
    }

    // Fallback: immediate signup
    const hash = await bcrypt.hash(pw, 12);
    const created_at = Date.now();
    const r = await run(
      "INSERT INTO users(name,email,password_hash,role,created_at) VALUES($1,$2,$3,$4,$5) RETURNING id",
      [name, email, hash, "student", created_at]
    );
    const user = { id: r.rows[0].id, name, email, role: "student" };
    const token = signToken(user);
    return res
      .cookie(TOKEN_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ user, token, otp_required: false });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/auth/signup-verify", async (req, res) => {
  try {
    const { pending_id, otp } = req.body || {};
    if (!pending_id || !otp) return res.status(400).json({ error: "pending_id and otp required" });

    const row = await get("SELECT * FROM pending_signups WHERE id=$1", [pending_id]);
    if (!row) return res.status(404).json({ error: "Signup session not found or expired" });

    if (Date.now() > Number(row.otp_expires_at)) {
      await run("DELETE FROM pending_signups WHERE id=$1", [pending_id]);
      return res.status(400).json({ error: "Code expired. Please restart signup." });
    }

    if (String(row.otp_code) !== String(otp)) {
      await run("UPDATE pending_signups SET attempts=attempts+1 WHERE id=$1", [pending_id]);
      const updated = await get("SELECT attempts FROM pending_signups WHERE id=$1", [pending_id]);
      if (updated.attempts >= 5) {
        await run("DELETE FROM pending_signups WHERE id=$1", [pending_id]);
        return res.status(400).json({ error: "Too many attempts. Please restart signup." });
      }
      return res.status(400).json({ error: "Invalid code. Try again." });
    }

    // create user now
    const exists = await get("SELECT id FROM users WHERE email=$1", [row.email]);
    if (exists) {
      await run("DELETE FROM pending_signups WHERE id=$1", [pending_id]);
      return res.status(409).json({ error: "Email already registered" });
    }

  const created_at = Math.floor(Date.now() / 1000); // Convert milliseconds to seconds
const r = await run(
  "INSERT INTO users(name,email,password_hash,role,created_at) VALUES($1,$2,$3,$4,$5) RETURNING id",
  [row.name, row.email, row.password_hash, "student", created_at]
);
await run("DELETE FROM pending_signups WHERE id=$1", [pending_id]);

    const user = { id: r.rows[0].id, name: row.name, email: row.email, role: "student" };
    const token = signToken(user);
    return res
      .cookie(TOKEN_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ user, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});


// ... All other routes (admin, attempts, courses, etc.) should follow the same pattern, with PostgreSQL queries.
// Assuming the previous setup with `pg` is used for PostgreSQL connection

// --- Resend Signup OTP ---
app.post("/api/auth/signup-resend", async (req, res) => {
  try {
    const { pending_id } = req.body || {};
    if (!pending_id) return res.status(400).json({ error: "pending_id required" });

    const row = await get("SELECT * FROM pending_signups WHERE id=$1", [pending_id]);
    if (!row) return res.status(404).json({ error: "Signup session not found" });
    if (row.resend_count >= 3) return res.status(400).json({ error: "Resend limit reached" });

    const otp = genOtp();
    const now = Date.now();
    await run(
      "UPDATE pending_signups SET otp_code=$1, otp_expires_at=$2, resend_count=resend_count+1 WHERE id=$3",
      [otp, now + 10 * 60 * 1000, pending_id]
    );

    // Send OTP email
    await sendMail(
      row.email,
      "Your new verification code",
      `<p>Your new verification code is <b>${otp}</b>. It expires in 10 minutes.</p>`
    );

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// --- User Login ---
app.post("/api/auth/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const row = await get("SELECT * FROM users WHERE email=$1", [email]);
    if (!row) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    // MFA (email OTP) if enabled
    if (String(process.env.MFA_EMAIL_OTP || "off") === "required") {
      const code = sixDigit();
      const codeHash = await bcrypt.hash(code, 10);
      const ttlMin = Number(process.env.RESET_WINDOW_MINUTES || 15);
      const expires = Date.now() + ttlMin * 60 * 1000;

      const r = await run(
        "INSERT INTO login_otps(user_id, code_hash, expires_at, created_at) VALUES($1, $2, $3, $4) RETURNING id",
        [row.id, codeHash, expires, Date.now()]
      );

      // Send the OTP email
      await sendMail(
        row.email,
        "Your Omega Skills Login OTP",
        `
          <div style="font-family:Inter,Arial,sans-serif;font-size:14px">
            <p>Hi ${row.name || ""},</p>
            <p>Your one-time login code is:</p>
            <div style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</div>
            <p>This code expires in ${ttlMin} minutes.</p>
            <p>If you didn't try to sign in, please ignore this email.</p>
          </div>
        `
      );

      return res.json({
        mfa: true,
        pending_id: r.rows[0].id,
        email_masked: maskEmail(row.email),
      });
    }

    // Normal login (no MFA)
    const user = { id: row.id, name: row.name, email: row.email, role: row.role };
    const token = signToken(user);
    res
      .cookie(TOKEN_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ user, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// --- Verify OTP for Login ---
app.post("/api/auth/login/verify-otp", async (req, res) => {
  try {
    const pending_id = Number(req.body.pending_id);
    const code = String(req.body.code || "");
    if (!pending_id || !/^\d{6}$/.test(code))
      return res.status(400).json({ error: "Invalid request" });

    const row = await get("SELECT * FROM login_otps WHERE id=$1", [pending_id]);
    if (!row || row.consumed || Date.now() > row.expires_at)
      return res.status(400).json({ error: "Code expired or invalid" });

    const ok = await bcrypt.compare(code, row.code_hash);
    if (!ok) return res.status(400).json({ error: "Incorrect code" });

    // Mark consumed
    await run("UPDATE login_otps SET consumed=1 WHERE id=$1", [pending_id]);

    const u = await get("SELECT id,name,email,role FROM users WHERE id=$1", [row.user_id]);
    if (!u) return res.status(404).json({ error: "User not found" });

    const token = signToken(u);
    res
      .cookie(TOKEN_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ user: u, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// Reset password request: email link + code
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ error: "Email required" });

    // Fetch user from PostgreSQL
    const user = await get("SELECT id,name,email FROM users WHERE email=$1", [email]);

    // Always respond OK to avoid email enumeration
    const ttlMin = Number(process.env.RESET_WINDOW_MINUTES || 15);
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const code = sixDigit();
      const otpHash = await bcrypt.hash(code, 10);
      const expires = Date.now() + ttlMin * 60 * 1000;

      // Insert reset request into password_resets table
      await run(
  `INSERT INTO password_resets(user_id, token, otp_code_hash, expires_at, used, created_at)
   VALUES($1, $2, $3, $4, false, $5)`, // Use 'false' instead of 0 for boolean
  [user.id, token, otpHash, expires, Date.now()]
);


      const link = `${ORIGIN}/reset-password?token=${token}`;
      await sendMail(
        user.email,
        "Reset your Omega Skills password",
        `
          <div style="font-family:Inter,Arial,sans-serif;font-size:14px">
            <p>Hi ${user.name || ""},</p>
            <p>You can reset your password using either option below (valid ${ttlMin} minutes):</p>
            <ol>
              <li>Click reset link: <a href="${link}">${link}</a></li>
              <li>Or enter this OTP in the reset form: <b style="font-size:18px;letter-spacing:4px">${code}</b></li>
            </ol>
            <p>If you didn't request this, ignore this email.</p>
          </div>
        `
      );
    }

    res.json({ ok: true, message: "If that email exists, a reset link has been sent." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// Reset via link token OR email + OTP
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { token, email, otp, new_password } = req.body || {};
    const pw = String(new_password || "");

    // Password strength validation (same as signup)
    const strong =
      pw.length >= 8 &&
      /[A-Z]/.test(pw) &&
      /[a-z]/.test(pw) &&
      /[0-9]/.test(pw) &&
      /[^A-Za-z0-9]/.test(pw);
    if (!strong)
      return res.status(400).json({
        error: "Password must be 8+ chars with upper, lower, number, and symbol.",
      });

    let userId = null;

    if (token) {
      // Reset via token
      const row = await get(
        "SELECT * FROM password_resets WHERE token=$1 AND used=false",
        [String(token)]
      );

      if (!row || Date.now() > row.expires_at)
        return res.status(400).json({ error: "Reset link expired or invalid" });

      userId = row.user_id;

      // Update 'used' column to boolean 'true' (instead of '1')
      await run("UPDATE password_resets SET used=true WHERE id=$1", [row.id]);
    } else if (email && otp) {
      // Reset via email and OTP
      const u = await get("SELECT id FROM users WHERE email=$1", [
        String(email).toLowerCase().trim(),
      ]);
      if (!u) return res.status(400).json({ error: "Invalid request" });

      const row = await get(
        `SELECT * FROM password_resets
         WHERE user_id=$1 AND used=false
         ORDER BY id DESC LIMIT 1`,
        [u.id]
      );
      if (!row || Date.now() > row.expires_at)
        return res.status(400).json({ error: "Code expired or invalid" });

      const ok = await bcrypt.compare(String(otp), row.otp_code_hash || "");
      if (!ok) return res.status(400).json({ error: "Incorrect code" });

      userId = u.id;

      // Update 'used' column to boolean 'true' (instead of '1')
      await run("UPDATE password_resets SET used=true WHERE id=$1", [row.id]);
    } else {
      return res.status(400).json({ error: "Provide reset token OR email+otp" });
    }

    // Hash and update the new password
    const hash = await bcrypt.hash(pw, 12);
    await run("UPDATE users SET password_hash=$1 WHERE id=$2", [hash, userId]);

    res.json({ ok: true, message: "Password updated successfully." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/auth/me", requireAuth, (req, res) => res.json({ user: req.user }));

app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie(TOKEN_COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ ok: true });
});

// --- Create tables if missing (idempotent) ---
(async function initTables() {
  try {
    await run(`
      CREATE TABLE IF NOT EXISTS mock_slots (
        id SERIAL PRIMARY KEY,
        track TEXT NOT NULL,            
        day_label TEXT NOT NULL,        
        time_label TEXT NOT NULL,       
        tz TEXT NOT NULL DEFAULT 'IST', 
        mode TEXT NOT NULL DEFAULT 'Live on Zoom',
        capacity INTEGER NOT NULL DEFAULT 1,
        notes TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at BIGINT NOT NULL
      )
    `);
  } catch (e) {
    console.error("Failed creating mock_slots table:", e);
  }
})();

// --- Courses, Exams, Attempts, Friends, Leaderboard, Dashboard, Admin ---

app.get("/api/courses", requireAuth, async (req, res) => {
  const rows = await all("SELECT id, title, description, cover, is_public FROM courses ORDER BY id");
  res.json(rows);
});

app.get("/api/courses/:id/exams", requireAuth, async (req, res) => {
  const cid = req.params.id;
  const ent = await get("SELECT 1 FROM access WHERE user_id=$1 AND course_id=$2", [req.user.id, cid]);
  if (!ent) return res.status(403).json({ error: "No access to this course" });

  const rows = await all("SELECT id, title, duration_sec, config_json FROM exams WHERE course_id=$1 ORDER BY id", [cid]);
  const out = rows.map(r => ({ ...r, config: r.config_json ? r.config_json : {} }));

res.json(out);
});

// --- Exam lifecycle ---
app.post("/api/attempts/start", requireAuth, async (req, res) => {
  const { exam_id } = req.body || {};
  if (!exam_id) return res.status(400).json({ error: "exam_id required" });

  const exam = await get("SELECT * FROM exams WHERE id=$1", [exam_id]);
  if (!exam) return res.status(404).json({ error: "Exam not found" });

  const ent = await get("SELECT 1 FROM access WHERE user_id=$1 AND course_id=$2", [req.user.id, exam.course_id]);
  if (!ent) return res.status(403).json({ error: "No access to this exam" });

  const start = Date.now();
  const result = await run("INSERT INTO attempts(user_id, exam_id, started_at, duration_sec, last_seen_at) VALUES($1, $2, $3, $4, $5) RETURNING id", 
    [req.user.id, exam_id, start, exam.duration_sec, start]);
  
  const attempt_id = result.rows[0].id;
  
  const qs = await all(`
    SELECT q.id, q.text, q.type, q.options_json, q.difficulty, t.slug as topic_slug, t.name as topic_name, t.section
    FROM exam_questions eq
    JOIN questions q ON q.id = eq.question_id
    LEFT JOIN exam_topics t ON t.id = q.topic_id
    WHERE eq.exam_id = $1 ORDER BY q.id`, 
    [exam_id]
  );
  
 const sanitized = qs.map(q => ({
  id: q.id,
  text: q.text,
  type: q.type,
  options: q.options_json ? q.options_json : [],  // No need to parse; directly access JSON field
  difficulty: q.difficulty || "mixed",
  topic_slug: q.topic_slug,
  topic_name: q.topic_name,
  section: q.section || q.topic_name,
}));


  const ends_at = start + exam.duration_sec * 1000;
 res.json({
  attempt_id,
  exam: { 
    id: exam.id, 
    title: exam.title, 
    duration_sec: exam.duration_sec, 
    config: exam.config_json ? exam.config_json : {}  // No need to parse if it's a JSON or JSONB field
  },
  questions: sanitized,
  started_at: start,
  ends_at,
});
});

app.post("/api/attempts/:id/answer", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { question_id, chosen, time_spent_sec = 0 } = req.body || {};

  const attempt = await get("SELECT * FROM attempts WHERE id=$1 AND user_id=$2", [id, req.user.id]);
  if (!attempt) return res.status(404).json({ error: "Attempt not found" });
  if (attempt.submitted_at) return res.status(400).json({ error: "Attempt already finished" });

  const endsAt = Number(attempt.started_at) + Number(attempt.duration_sec) * 1000;
  if (Date.now() > endsAt) return res.status(400).json({ error: "Time is over" });

  const q = await get("SELECT options_json, correct_index FROM questions WHERE id=$1", [question_id]);
  if (!q) return res.status(404).json({ error: "Question not found" });

  const selected_index = Number.isInteger(chosen) 
  ? chosen 
  : (() => {
      const opts = Array.isArray(q.options_json) ? q.options_json : JSON.parse(q.options_json || "[]");
      const ix = opts.findIndex(o => String(o) === String(chosen));
      return ix >= 0 ? ix : null;
  })();

  const correct = (Number.isInteger(selected_index) && selected_index === q.correct_index) ? 1 : 0;

  await run(`
  INSERT INTO answers(attempt_id, question_id, selected_index, is_correct, time_spent_seconds)
  VALUES($1, $2, $3, $4, $5)
  ON CONFLICT(attempt_id, question_id)
  DO UPDATE SET 
    selected_index = excluded.selected_index, 
    is_correct = excluded.is_correct, 
    time_spent_seconds = answers.time_spent_seconds + excluded.time_spent_seconds`,
  [id, question_id, selected_index, correct, time_spent_sec]
);
await run("UPDATE attempts SET last_seen_at=$1 WHERE id=$2", [Date.now(), id]);

res.json({ ok: true });

});
app.post("/api/attempts/:id/finish", requireAuth, async (req, res) => {
  const { id } = req.params;
  const attempt = await get("SELECT * FROM attempts WHERE id=$1 AND user_id=$2", [id, req.user.id]);
  
  if (!attempt) return res.status(404).json({ error: "Attempt not found" });

  // Prevent finishing the same attempt twice
  if (attempt.submitted_at) return res.status(400).json({ error: "Attempt already finished" });

  const exam = await get("SELECT * FROM exams WHERE id=$1", [attempt.exam_id]);

  // Score + breakdown
  const rows = await all(`
    SELECT q.id, q.text, q.options_json, q.correct_index, q.answer, q.explanation,
           t.slug, t.name as topic_name, t.section, a.selected_index, a.is_correct
    FROM questions q
    LEFT JOIN exam_topics t ON t.id = q.topic_id
    LEFT JOIN answers a ON a.attempt_id=$1 AND a.question_id=q.id
    WHERE q.exam_id=$2`, 
    [id, attempt.exam_id]
  );

  let correct = 0, total = rows.length;
  const topicMap = new Map();

  const answerDetails = rows.map(r => {
    const sec = r.section || r.topic_name || "Section";
  
    // Initialize the topic map if it doesn't exist
    if (!topicMap.has(sec)) {
      topicMap.set(sec, { name: sec, total: 0, correct: 0 });
    }

    const t = topicMap.get(sec);
    t.total++;

    // If the answer is correct, increment the correct count
    if (r.is_correct) {
      t.correct++;
      correct++;
    }

    // Safely parse options_json or handle as comma-separated string
    let options = [];
    try {
      // If options_json is valid JSON, parse it
      if (r.options_json && typeof r.options_json === 'string') {
        options = JSON.parse(r.options_json);
      }
    } catch (e) {
      // If JSON parsing fails, treat it as a comma-separated string
      console.error(`Failed to parse options_json for question ID ${r.id}:`, e);
      if (r.options_json && typeof r.options_json === 'string') {
        options = r.options_json.split(",").map(option => option.trim());
      }
    }

    // Determine the correct answer text
    let correctText = "";
    if (Number.isInteger(r.correct_index) && r.correct_index >= 0 && r.correct_index < options.length) {
      correctText = options[r.correct_index];
    } else {
      correctText = r.answer || "";  // Use the answer field if the index is invalid
    }

    return {
      id: r.id,
      text: r.text,
      options,
      correct_index: r.correct_index,
      correct_text: correctText,
      selected_index: r.selected_index,
      explanation: r.explanation || "",
      is_correct: !!r.is_correct,
      section: sec,
      topic_name: r.topic_name
    };
  });

  const score = Math.round((correct / Math.max(1, total)) * 100);
  const topics = [...topicMap.values()].map(s => ({
    section: s.name, total: s.total, correct: s.correct, accuracy: Math.round((s.correct / Math.max(1, s.total)) * 100)
  })).sort((a, b) => a.accuracy - b.accuracy);

  const suggestions = topics.filter(t => t.accuracy < 70).slice(0, 5)
    .map(t => `Improve ${t.section}: Review wrong answers and practice 20 questions in this section.`);

  // Update the attempt with submission details
  await run(
    "UPDATE attempts SET submitted_at=$1, score=$2, breakdown=$3 WHERE id=$4",
    [Math.floor(Date.now() / 1000), score, JSON.stringify(topics), id]  // Convert to seconds
  );

  res.json({
    score, total, correct, topics, suggestions,
    answers: answerDetails
  });
});



// --- Presence / Anti-Cheat (Optional Endpoints) ---
app.post("/api/attempts/:id/focus-violation", requireAuth, async (req, res) => {
  // For analytics; your exam page can auto-finish on blur/fullscreen exit too.
  await run("UPDATE attempts SET last_seen_at=$1 WHERE id=$2", [Date.now(), req.params.id]);
  res.json({ ok: true });
});

// --- My Attempts ---
app.get("/api/attempts/my", requireAuth, async (req, res) => {
  const rows = await all(`
    SELECT a.id, a.exam_id, a.started_at, a.submitted_at, a.duration_sec, a.score, e.title AS exam_title
    FROM attempts a
    JOIN exams e ON e.id=a.exam_id
    WHERE a.user_id=$1 ORDER BY a.id DESC LIMIT 50`, [req.user.id]);
  res.json(rows);
});

// --- Dashboard ---
app.get("/api/dashboard", requireAuth, async (req, res) => {
  try {
    // Fetch last 5 unique valid attempts (ignore duplicates and invalid dates)
    const attempts = await all(`
      SELECT DISTINCT ON (exam_id) id, exam_id, submitted_at, score
      FROM attempts
      WHERE user_id = $1
        AND submitted_at IS NOT NULL
        AND submitted_at > 0
        AND score IS NOT NULL
      ORDER BY exam_id, submitted_at DESC
    `, [req.user.id]);

    if (!attempts.length) return res.json({ attempts: [], weaknesses: [], suggestions: [] });

    // Limit to last 5 attempts
    const latestAttempts = attempts.slice(0, 5);

    const topicMap = new Map();

    for (const attempt of latestAttempts) {
      const rows = await all(`
        SELECT t.section, a.is_correct
        FROM answers a
        JOIN questions q ON q.id = a.question_id
        LEFT JOIN exam_topics t ON t.id = q.topic_id
        WHERE a.attempt_id = $1
      `, [attempt.id]);

      for (const r of rows) {
        const sec = r.section || "Section";
        if (!topicMap.has(sec)) topicMap.set(sec, { section: sec, total: 0, correct: 0 });
        const t = topicMap.get(sec);
        t.total++;
        if (r.is_correct) t.correct++;
      }
    }

    const weaknesses = [...topicMap.values()]
      .map(t => ({ ...t, accuracy: Math.round((t.correct / Math.max(1, t.total)) * 100) }))
      .sort((a, b) => a.accuracy - b.accuracy);

    const suggestions = weaknesses
      .filter(w => w.accuracy < 70)
      .slice(0, 4)
      .map(w => `You are weak in ${w.section}. Practice basics and time yourself (1 min/question).`);

    res.json({
      attempts: latestAttempts.map(a => a.id),
      weaknesses,
      suggestions
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error processing dashboard data" });
  }
});


// --- Friends ---
app.get("/api/friends", requireAuth, async (req, res) => {
  const me = req.user.id;

  const incoming = await all(`
    SELECT f.id, f.user_id AS from_id, u.name AS from_name, u.email AS from_email, f.status
    FROM friends f
    JOIN users u ON u.id = f.user_id
    WHERE f.friend_user_id = $1 AND f.status = 'pending'
    ORDER BY f.id DESC`, [me]);

  const outgoing = await all(`
    SELECT f.id, f.friend_user_id AS to_id, u.name AS to_name, u.email AS to_email, f.status
    FROM friends f
    JOIN users u ON u.id = f.friend_user_id
    WHERE f.user_id = $1 AND f.status = 'pending'
    ORDER BY f.id DESC`, [me]);

  const accepted = await all(`
    SELECT u.id, u.name, u.email
    FROM friends f
    JOIN users u ON u.id = CASE WHEN f.user_id = $1 THEN f.friend_user_id ELSE f.user_id END
    WHERE (f.user_id = $1 OR f.friend_user_id = $1)
      AND f.status = 'accepted'
    GROUP BY u.id, u.name, u.email
    ORDER BY u.name ASC`, [me]);

  res.json({ incoming, outgoing, friends: accepted });
});

app.post("/api/friends/request", requireAuth, async (req, res) => {
  const me = req.user.id;
  const email = String(req.body?.email || "").toLowerCase().trim();
  if (!email) return res.status(400).json({ error: "Email required" });

  const target = await get("SELECT id FROM users WHERE email = $1", [email]);
  if (!target) return res.status(404).json({ error: "User not found" });
  if (target.id === me)
    return res.status(400).json({ error: "Cannot friend yourself" });

  const exists = await get(
    "SELECT id, status FROM friends WHERE user_id = $1 AND friend_user_id = $2",
    [me, target.id]
  );
  if (exists && exists.status === "pending")
    return res.status(400).json({ error: "Request already sent" });
  if (exists && exists.status === "accepted")
    return res.status(400).json({ error: "Already friends" });

  await run(
    "INSERT INTO friends(user_id, friend_user_id, status) VALUES($1, $2, $3)",
    [me, target.id, "pending"]
  );
  res.json({ ok: true });
});

// --- Accept / Reject Friend Request ---
app.post("/api/friends/respond", requireAuth, async (req, res) => {
  const me = req.user.id;
  const { from_user_id, action } = req.body || {};
  if (!from_user_id || !["accept", "reject"].includes(action))
    return res.status(400).json({ error: "Invalid request" });

  const pending = await get(
    "SELECT id FROM friends WHERE user_id = $1 AND friend_user_id = $2 AND status = 'pending'",
    [from_user_id, me]
  );
  if (!pending) return res.status(404).json({ error: "No pending request" });

  if (action === "reject") {
    await run("DELETE FROM friends WHERE id = $1", [pending.id]);
    return res.json({ ok: true });
  }

  // accept
  await run("UPDATE friends SET status = 'accepted' WHERE id = $1", [pending.id]);
  const reciprocal = await get(
    "SELECT id FROM friends WHERE user_id = $1 AND friend_user_id = $2",
    [me, from_user_id]
  );
  if (!reciprocal) {
    await run(
      "INSERT INTO friends(user_id, friend_user_id, status) VALUES($1, $2, $3)",
      [me, from_user_id, "accepted"]
    );
  } else {
    await run("UPDATE friends SET status = 'accepted' WHERE id = $1", [
      reciprocal.id,
    ]);
  }
  res.json({ ok: true });
});

// --- Remove Friend ---
app.delete("/api/friends/:friend_id", requireAuth, async (req, res) => {
  const me = req.user.id;
  const fid = Number(req.params.friend_id);
  if (!fid) return res.status(400).json({ error: "Invalid friend id" });

  await run(
    `DELETE FROM friends
      WHERE (user_id = $1 AND friend_user_id = $2)
         OR (user_id = $2 AND friend_user_id = $1)`,
    [me, fid]
  );
  res.json({ ok: true });
});

// --- Leaderboard: Me + Accepted Friends (Avg of Last 5 Attempts, Best Score) ---

// --- Mock Interviews: Public & Admin ---
app.get("/api/leaderboard/friends", requireAuth, async (req, res) => {
  const me = req.user.id;
  const idsRows = await all(
    `SELECT DISTINCT CASE WHEN f.user_id = $1 THEN f.friend_user_id ELSE f.user_id END AS friend_id
       FROM friends f
      WHERE (f.user_id = $1 OR f.friend_user_id = $1) AND f.status = 'accepted'`,
    [me]
  );
  const ids = [me, ...idsRows.map((r) => r.friend_id)];
  if (ids.length === 0) return res.json([]);

  // Generate placeholders for the SQL query
  const placeholders = ids.map((_, index) => "$" + (index + 1)).join(",");

  const rows = await all(
    `
    WITH scores AS (
      SELECT u.id, 
             ROUND(COALESCE(AVG(a.score), 0)::numeric, 1) AS avg_score,  -- Calculate average score
             MAX(a.score) AS best_score
        FROM users u
        LEFT JOIN attempts a ON a.user_id = u.id
        WHERE u.id IN (${placeholders}) 
          AND a.score IS NOT NULL
        GROUP BY u.id
    )
    SELECT u.id, u.name, u.email, s.avg_score, s.best_score
    FROM users u
    JOIN scores s ON s.id = u.id
    ORDER BY COALESCE(s.avg_score, 0) DESC, COALESCE(s.best_score, 0) DESC, u.name ASC`,
    ids
  );

  // Process the rows and treat any null scores as 0 before sending the response
  const leaderboardData = rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    avg_score: r.avg_score ?? 0, // If avg_score is null, treat as 0
    best_score: r.best_score ?? 0, // If best_score is null, treat as 0
  }));

  res.json(leaderboardData);
});

// --- Admin Bulk Access ---
app.post("/api/admin/access/bulk", requireAuth, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });

  const { course_id, emails = [] } = req.body || {};
  for (const e of emails) {
    const u = await get("SELECT * FROM users WHERE email = $1", [String(e || "").toLowerCase()]);
    if (u) await run("INSERT INTO access(user_id, course_id, granted_by) VALUES($1, $2, $3) ON CONFLICT DO NOTHING", [u.id, course_id, req.user.id]);
  }
  res.json({ ok: true });
});

// --- Admin Guard ---
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
}

// --- Create course (admin only) ---
app.post("/api/admin/courses", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, description = "", is_public = false } = req.body || {};
    const titleClean = String(title || "").trim();
    if (!titleClean) return res.status(400).json({ error: "Title is required" });

    // Insert into PostgreSQL 'courses' table. 'cover' is optional (NULL here).
    const { rows } = await pool.query(
      "INSERT INTO courses(title, description, cover, is_public) VALUES($1, $2, $3, $4) RETURNING *",
      [titleClean, description, null, is_public ? true : false]
    );

    const created = rows[0]; // Get the newly created course

    res.status(201).json({
      ...created,
      is_public: !!created.is_public, // convert 0/1 -> boolean for UI
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not create course" });
  }
});

// --- Delete course (admin only) ---
app.delete("/api/admin/courses/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid course id" });

    // Best-effort cleanup of related rows (adjust to match your schema)
    await pool.query("DELETE FROM access WHERE course_id = $1", [id]);

    const { rows: exams } = await pool.query("SELECT id FROM exams WHERE course_id = $1", [id]);
    for (const exam of exams) {
      await pool.query("DELETE FROM answers WHERE attempt_id IN (SELECT id FROM attempts WHERE exam_id = $1)", [exam.id]);
      await pool.query("DELETE FROM attempts WHERE exam_id = $1", [exam.id]);
      await pool.query("DELETE FROM exam_questions WHERE exam_id = $1", [exam.id]);
      await pool.query("DELETE FROM questions WHERE exam_id = $1", [exam.id]);
      await pool.query("DELETE FROM exams WHERE id = $1", [exam.id]);
    }

    await pool.query("DELETE FROM courses WHERE id = $1", [id]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not delete course" });
  }
});

// --- Search exams by title filter (admin only) ---
app.get("/api/admin/exams/search", requireAuth, requireAdmin, async (req, res) => {
  try {
    const like = String(req.query.like || "").trim();
    if (!like) return res.status(400).json({ error: "like query param required" });

    const { rows } = await pool.query(
      "SELECT id, title, course_id FROM exams WHERE title ILIKE $1 ORDER BY id",
      [`%${like}%`]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "search failed" });
  }
});

// --- Reassign exams to a target course_id (admin only) ---
app.post("/api/admin/exams/reassign", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { course_id, exam_ids } = req.body || {};
    const cid = Number(course_id);
    if (!cid || !Array.isArray(exam_ids) || exam_ids.length === 0) {
      return res.status(400).json({ error: "course_id and non-empty exam_ids[] required" });
    }

    const placeholders = exam_ids.map((_, i) => `$${i + 2}`).join(",");
    const query = `
      UPDATE exams 
      SET course_id = $1 
      WHERE id IN (${placeholders})
    `;
    await pool.query(query, [cid, ...exam_ids]);

    const { rows } = await pool.query("SELECT COUNT(*) AS n FROM exams WHERE course_id = $1", [cid]);
    res.json({ ok: true, course_id: cid, exams_now_in_course: rows[0].n });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "reassign failed" });
  }
});

// --- Public course catalog (minimal fields; no auth required) ---
app.get("/api/public/courses", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, title, description, cover, is_public FROM courses ORDER BY id"
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load courses" });
  }
});

// --- Debug: Show course and how many exams it has (admin only) ---
app.get("/api/admin/debug/course-summary", requireAuth, requireAdmin, async (req, res) => {
  try {
    const title = String(req.query.title || "").trim();
    if (!title) return res.status(400).json({ error: "title query param required" });

    const { rows: course } = await pool.query("SELECT id, title FROM courses WHERE title = $1", [title]);
    if (!course.length) return res.status(404).json({ error: `Course "${title}" not found` });

    const { rows: count } = await pool.query("SELECT COUNT(*) AS n FROM exams WHERE course_id = $1", [course[0].id]);
    const { rows: sample } = await pool.query(
      "SELECT id, title FROM exams WHERE course_id = $1 ORDER BY id LIMIT 5",
      [course[0].id]
    );

    res.json({ course: course[0], exam_count: count[0].n, sample });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "debug failed" });
  }
});

// --- Relink exams to a course (admin only) ---
app.post("/api/admin/exams/relink-any", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { courseTitle, contains = [] } = req.body || {};
    if (!courseTitle || !Array.isArray(contains) || contains.length === 0) {
      return res.status(400).json({ error: "courseTitle and non-empty contains[] required" });
    }

    const { rows: course } = await pool.query("SELECT id, title FROM courses WHERE title = $1", [courseTitle]);
    if (!course.length) return res.status(404).json({ error: `Course "${courseTitle}" not found` });

    // Build dynamic WHERE with OR of LIKEs
    const where = contains.map(() => "title ILIKE $1").join(" OR ");
    const params = contains.map((s) => `%${s}%`);

    const { rows: preview } = await pool.query(
      `SELECT id, title, course_id FROM exams WHERE ${where} ORDER BY id`,
      params
    );

    // Update
    const updateQuery = `UPDATE exams SET course_id = $1 WHERE ${where}`;
    await pool.query(updateQuery, [course[0].id, ...params]);

    const { rows: linkedNow } = await pool.query(
      "SELECT id, title FROM exams WHERE course_id = $1 ORDER BY id",
      [course[0].id]
    );

    res.json({
      ok: true,
      course_id: course[0].id,
      matched_before: preview.length,
      linked_now: linkedNow.length,
      linked_titles_preview: linkedNow.slice(0, 10).map((x) => x.title),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not relink exams" });
  }
});

// --- Mock Interviews: Public & Admin ---


app.get("/api/public/mock-slots", async (_req, res) => {
  try {
    // Use 1 to represent TRUE if is_active is an integer
    const { rows } = await pool.query(
      `SELECT id, track, day_label, time_label, tz, mode, capacity, notes 
       FROM mock_slots WHERE is_active = 1 ORDER BY created_at DESC, id DESC`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load mock interview slots" });
  }
});

app.get("/api/mock-slots", requireAuth, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, track, day_label, time_label, tz, mode, capacity, notes, is_active 
       FROM mock_slots ORDER BY is_active DESC, created_at DESC, id DESC`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load mock interview slots" });
  }
});

// Admin: Create a slot
app.post("/api/admin/mock-slots", requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      track = "",
      day_label = "",
      time_label = "",
      tz = "IST",
      mode = "Live on Zoom",
      capacity = 1,
      notes = "",
      is_active = true,
    } = req.body || {};

    if (!track.trim() || !day_label.trim() || !time_label.trim()) {
      return res.status(400).json({ error: "track, day_label, and time_label are required" });
    }

    const created_at = Date.now();

    // Ensure that is_active is an integer (1 for true, 0 for false)
    const isActiveInt = is_active ? 1 : 0;

    const { rows } = await pool.query(
      `INSERT INTO mock_slots(track, day_label, time_label, tz, mode, capacity, notes, is_active, created_at)
       VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        track.trim(),
        day_label.trim(),
        time_label.trim(),
        (tz || "IST").trim(),
        (mode || "Live on Zoom").trim(),
        Math.max(1, Number(capacity) || 1),
        String(notes || ""),
        isActiveInt, // Pass the integer value (1 or 0)
        created_at,
      ]
    );

    res.status(201).json(rows[0]);

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not create slot" });
  }
});

// Admin: delete a slot
app.delete("/api/admin/mock-slots/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid slot id" });
    
    // Delete the slot from PostgreSQL
    await pool.query("DELETE FROM mock_slots WHERE id = $1", [id]);

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not delete slot" });
  }
});

// Admin: toggle active (optional)
app.post("/api/admin/mock-slots/:id/toggle", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid slot id" });

    // Fetch the current active status from PostgreSQL
    const { rows } = await pool.query("SELECT is_active FROM mock_slots WHERE id = $1", [id]);
    if (!rows.length) return res.status(404).json({ error: "Slot not found" });

    const next = rows[0].is_active ? false : true;

    // Update the active status in PostgreSQL
    await pool.query("UPDATE mock_slots SET is_active = $1 WHERE id = $2", [next, id]);

    res.json({ ok: true, is_active: next });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not toggle slot" });
  }
});

// --- One-time helper: relink exams to a course by title ---
app.post("/api/admin/exams/relink", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { courseTitle = "Verbal Ability", examTitlePrefix = "Verbal Ability" } = req.body || {};

    // Get the course ID by its title
    const { rows: course } = await pool.query("SELECT id FROM courses WHERE title = $1", [courseTitle]);
    if (course.length === 0) return res.status(404).json({ error: `Course titled "${courseTitle}" not found` });

    // Update exams whose title starts with the given prefix and assign them to the course
    await pool.query("UPDATE exams SET course_id = $1 WHERE title LIKE $2", [course[0].id, `${examTitlePrefix}%`]);

    // Fetch the exams that have been relinked to the course
    const { rows: linkedExams } = await pool.query(
      "SELECT id, title FROM exams WHERE course_id = $1 AND title LIKE $2 ORDER BY id",
      [course[0].id, `${examTitlePrefix}%`]
    );

    res.json({
      ok: true,
      course_id: course[0].id,
      linked_count: linkedExams.length,
      linked_titles: linkedExams.map(x => x.title),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not relink exams" });
  }
});

// Home route to check if the server is running
app.get("/", (_req, res) => res.json({ ok: true }));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Allowing CORS from: ${ORIGIN}`);
});
