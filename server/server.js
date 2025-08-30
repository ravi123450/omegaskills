// server/server.js
import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Database setup ---
sqlite3.verbose();
const db = new sqlite3.Database(path.join(__dirname, "data.db"));

function run(sql, p = []) {
  return new Promise((res, rej) =>
    db.run(sql, p, function (e) {
      e ? rej(e) : res(this);
    })
  );
}
function get(sql, p = []) {
  return new Promise((res, rej) => db.get(sql, p, (e, r) => (e ? rej(e) : res(r))));
}
function all(sql, p = []) {
  return new Promise((res, rej) => db.all(sql, p, (e, r) => (e ? rej(e) : res(r))));
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

// --- Helpers ---
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
function extractToken(req) {
  // 1. Cookie
  if (req.cookies[TOKEN_COOKIE]) return req.cookies[TOKEN_COOKIE];
  // 2. Bearer
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

// --- Auth ---
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
      pw.length >= 8 &&
      /[A-Z]/.test(pw) &&
      /[a-z]/.test(pw) &&
      /[0-9]/.test(pw) &&
      /[^A-Za-z0-9]/.test(pw);
    if (!strong)
      return res.status(400).json({
        error: "Password must be 8+ chars with upper, lower, number, and symbol.",
      });

    const exists = await get("SELECT id FROM users WHERE email=?", [email]);
    if (exists) return res.status(409).json({ error: "Email already in use" });

    const hash = await bcrypt.hash(pw, 12);
    const created_at = Date.now();
    const r = await run(
      "INSERT INTO users(name,email,password_hash,role,created_at) VALUES(?,?,?,?,?)",
      [name, email, hash, "student", created_at]
    );

    const user = { id: r.lastID, name, email, role: "student" };
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

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const row = await get("SELECT * FROM users WHERE email=?", [email]);
    if (!row) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

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
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        track TEXT NOT NULL,            -- e.g. 'DSA' | 'SYSTEM DESIGN' | 'BEHAVIORAL'
        day_label TEXT NOT NULL,        -- e.g. 'Fri'
        time_label TEXT NOT NULL,       -- e.g. '7:30–8:30 PM'
        tz TEXT NOT NULL DEFAULT 'IST', -- e.g. 'IST'
        mode TEXT NOT NULL DEFAULT 'Live on Zoom',
        capacity INTEGER NOT NULL DEFAULT 1,
        notes TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL
      )
    `);
  } catch (e) {
    console.error("Failed creating mock_slots table:", e);
  }
})();


// --- Courses, Exams, Attempts, Friends, Leaderboard, Dashboard, Admin ---
// ✨ Paste the ENTIRE exam lifecycle, courses, friends, leaderboard, dashboard,
// and admin bulk access routes you already had (they work unchanged).
// Just ensure they all use `requireAuth` instead of the old `auth` middleware.

// --- Start ---

app.get("/api/courses", requireAuth, async (req,res)=>{
  const rows=await all("SELECT id,title,description,cover,is_public FROM courses ORDER BY id");
  res.json(rows);
});

app.get("/api/courses/:id/exams", requireAuth, async (req,res)=>{
  const cid=req.params.id;
  const ent=await get("SELECT 1 FROM access WHERE user_id=? AND course_id=?", [req.user.id, cid]);
  if(!ent) return res.status(403).json({error:"No access to this course"});
  const rows=await all("SELECT id,title,duration_sec,config_json FROM exams WHERE course_id=? ORDER BY id", [cid]);
  const out=rows.map(r=>({...r, config: JSON.parse(r.config_json||"{}")}));
  res.json(out);
});

/* --- Exam lifecycle --- */
app.post("/api/attempts/start", requireAuth, async (req,res)=>{
  const {exam_id}=req.body||{};
  if(!exam_id) return res.status(400).json({error:"exam_id required"});
  const exam=await get("SELECT * FROM exams WHERE id=?", [exam_id]);
  if(!exam) return res.status(404).json({error:"Exam not found"});
  const ent=await get("SELECT 1 FROM access WHERE user_id=? AND course_id=?", [req.user.id, exam.course_id]);
  if(!ent) return res.status(403).json({error:"No access to this exam"});

  const start=Date.now();
  const r=await run("INSERT INTO attempts(user_id,exam_id,started_at,duration_sec,last_seen_at) VALUES(?,?,?,?,?)",
    [req.user.id, exam_id, start, exam.duration_sec, start]);
  const attempt_id=r.lastID;

  const qs = await all(
    `SELECT q.id,q.text,q.type,q.options_json,q.difficulty,t.slug as topic_slug,t.name as topic_name,t.section
     FROM exam_questions eq
     JOIN questions q ON q.id=eq.question_id
     LEFT JOIN exam_topics t ON t.id=q.topic_id
     WHERE eq.exam_id=? ORDER BY q.id`, [exam_id]
  );
  const sanitized = qs.map(q=>({
    id:q.id, text:q.text, type:q.type,
    options: JSON.parse(q.options_json||"[]"),
    difficulty: q.difficulty||"mixed",
    topic_slug: q.topic_slug, topic_name: q.topic_name, section: q.section||q.topic_name
  }));

  const ends_at = start + exam.duration_sec*1000;
  res.json({
    attempt_id,
    exam:{id:exam.id,title:exam.title,duration_sec:exam.duration_sec,config: JSON.parse(exam.config_json||"{}")},
    questions: sanitized,
    started_at:start,
    ends_at
  });
});

app.post("/api/attempts/:id/answer", requireAuth, async (req,res)=>{
  const {id}=req.params;
  const {question_id, chosen, time_spent_sec=0} = req.body||{};
  const attempt = await get("SELECT * FROM attempts WHERE id=? AND user_id=?", [id, req.user.id]);
  if(!attempt) return res.status(404).json({error:"Attempt not found"});
  if(attempt.submitted_at) return res.status(400).json({error:"Attempt already finished"});

  const endsAt = Number(attempt.started_at)+Number(attempt.duration_sec)*1000;
  if(Date.now()>endsAt) return res.status(400).json({error:"Time is over"});

  const q = await get("SELECT options_json,correct_index FROM questions WHERE id=?", [question_id]);
  if(!q) return res.status(404).json({error:"Question not found"});

  const selected_index = Number.isInteger(chosen) ? chosen : (()=>{ // if API sends value, map to index if needed
    const opts=JSON.parse(q.options_json||"[]");
    const ix = opts.findIndex(o=>String(o)===String(chosen));
    return ix>=0?ix:null;
  })();

  const correct = (Number.isInteger(selected_index) && selected_index===q.correct_index) ? 1 : 0;

  await run(
    `INSERT INTO answers(attempt_id,question_id,selected_index,is_correct,time_spent_seconds)
     VALUES(?,?,?,?,?)
     ON CONFLICT(attempt_id,question_id)
     DO UPDATE SET selected_index=excluded.selected_index,is_correct=excluded.is_correct,time_spent_seconds=time_spent_seconds+excluded.time_spent_seconds`,
    [id,question_id,selected_index,correct,time_spent_sec]
  );
  await run("UPDATE attempts SET last_seen_at=? WHERE id=?", [Date.now(), id]);

  res.json({ok:true});
});

app.post("/api/attempts/:id/finish", requireAuth, async (req,res)=>{
  const {id}=req.params;
  const attempt=await get("SELECT * FROM attempts WHERE id=? AND user_id=?", [id, req.user.id]);
  if(!attempt) return res.status(404).json({error:"Attempt not found"});

  const exam = await get("SELECT * FROM exams WHERE id=?", [attempt.exam_id]);

  // Score + breakdown
  const rows = await all(
    `SELECT q.id,q.text,q.options_json,q.correct_index,q.answer,q.explanation,
            t.slug,t.name as topic_name,t.section, a.selected_index,a.is_correct
     FROM questions q
     LEFT JOIN exam_topics t ON t.id=q.topic_id
     LEFT JOIN answers a ON a.attempt_id=? AND a.question_id=q.id
     WHERE q.exam_id=?`, [id, attempt.exam_id]
  );
  let correct=0, total=rows.length;
  const topicMap = new Map();
  const answerDetails = rows.map(r=>{
    const sec = r.section || r.topic_name || "Section";
    if(!topicMap.has(sec)) topicMap.set(sec, {name:sec, total:0, correct:0});
    const t=topicMap.get(sec); t.total++; if(r.is_correct) {t.correct++; correct++;}

    const options = JSON.parse(r.options_json||"[]");
    return {
      id:r.id,
      text:r.text,
      options,
      correct_index:r.correct_index,
      correct_text: Number.isInteger(r.correct_index)? options[r.correct_index] : r.answer,
      selected_index: r.selected_index,
      explanation: r.explanation||"",
      is_correct: !!r.is_correct,
      section: sec,
      topic_name: r.topic_name
    };
  });
  const score = Math.round((correct/Math.max(1,total))*100);
  const topics = [...topicMap.values()].map(s=>({
    section:s.name, total:s.total, correct:s.correct, accuracy: Math.round((s.correct/Math.max(1,s.total))*100)
  })).sort((a,b)=>a.accuracy-b.accuracy);

  const suggestions = topics.filter(t=>t.accuracy<70).slice(0,5)
    .map(t=>`Improve ${t.section}: Review wrong answers and practice 20 questions in this section.`);

  await run("UPDATE attempts SET submitted_at=?, score=?, breakdown=? WHERE id=?",
    [Date.now(), score, JSON.stringify(topics), id]);

  res.json({
    score, total, correct, topics, suggestions,
    answers: answerDetails
  });
});

/* presence / anti-cheat (optional endpoints) */
app.post("/api/attempts/:id/focus-violation", requireAuth, async (req,res)=>{
  // For analytics; your exam page can auto-finish on blur/fullscreen exit too.
  await run("UPDATE attempts SET last_seen_at=? WHERE id=?", [Date.now(), req.params.id]);
  res.json({ok:true});
});

app.get("/api/attempts/my", requireAuth, async (req,res)=>{
  const rows = await all(
    `SELECT a.id,a.exam_id,a.started_at,a.submitted_at,a.duration_sec,a.score,e.title AS exam_title
     FROM attempts a JOIN exams e ON e.id=a.exam_id
     WHERE a.user_id=? ORDER BY a.id DESC LIMIT 50`, [req.user.id]
  );
  res.json(rows);
});

app.get("/api/dashboard", requireAuth, async (req,res)=>{
  // compute aggregated weaknesses from last 5 attempts
  const attempts = await all(`SELECT id FROM attempts WHERE user_id=? AND submitted_at IS NOT NULL ORDER BY id DESC LIMIT 5`, [req.user.id]);
  if(!attempts.length) return res.json({attempts:[], weaknesses:[], suggestions:[]});
  const topic=new Map();
  for(const a of attempts){
    const rows = await all(
      `SELECT t.section, a.is_correct
       FROM answers a JOIN questions q ON q.id=a.question_id
       LEFT JOIN exam_topics t ON t.id=q.topic_id
       WHERE a.attempt_id=?`, [a.id]
    );
    for(const r of rows){
      const sec=r.section||"Section";
      if(!topic.has(sec)) topic.set(sec,{section:sec,total:0,correct:0});
      const s=topic.get(sec); s.total++; if(r.is_correct) s.correct++;
    }
  }
  const weaknesses=[...topic.values()].map(s=>({...s, accuracy:Math.round((s.correct/Math.max(1,s.total))*100)}))
    .sort((a,b)=>a.accuracy-b.accuracy);
  const suggestions=weaknesses.filter(w=>w.accuracy<70).slice(0,4)
    .map(w=>`You are weak in ${w.section}. Practice basics and time yourself (1 min/question).`);
  res.json({attempts:attempts.map(a=>a.id), weaknesses, suggestions});
});
app.get("/api/friends", requireAuth, async (req, res) => {
  const me = req.user.id;

  const incoming = await all(
    `SELECT f.id, f.user_id AS from_id, u.name AS from_name, u.email AS from_email, f.status
       FROM friends f
       JOIN users u ON u.id = f.user_id
      WHERE f.friend_user_id = ? AND f.status = 'pending'
      ORDER BY f.id DESC`,
    [me]
  );

  const outgoing = await all(
    `SELECT f.id, f.friend_user_id AS to_id, u.name AS to_name, u.email AS to_email, f.status
       FROM friends f
       JOIN users u ON u.id = f.friend_user_id
      WHERE f.user_id = ? AND f.status = 'pending'
      ORDER BY f.id DESC`,
    [me]
  );

  const accepted = await all(
    `SELECT u.id, u.name, u.email
       FROM friends f
       JOIN users u
         ON u.id = CASE WHEN f.user_id = ? THEN f.friend_user_id ELSE f.user_id END
      WHERE (f.user_id = ? OR f.friend_user_id = ?)
        AND f.status = 'accepted'
   GROUP BY u.id, u.name, u.email
   ORDER BY u.name ASC`,
    [me, me, me]
  );

  res.json({ incoming, outgoing, friends: accepted });
});

// Send friend request by email
app.post("/api/friends/request", requireAuth, async (req, res) => {
  const me = req.user.id;
  const email = String(req.body?.email || "").toLowerCase().trim();
  if (!email) return res.status(400).json({ error: "Email required" });
  const target = await get("SELECT id FROM users WHERE email = ?", [email]);
  if (!target) return res.status(404).json({ error: "User not found" });
  if (target.id === me)
    return res.status(400).json({ error: "Cannot friend yourself" });

  const exists = await get(
    "SELECT id, status FROM friends WHERE user_id = ? AND friend_user_id = ?",
    [me, target.id]
  );
  if (exists && exists.status === "pending")
    return res.status(400).json({ error: "Request already sent" });
  if (exists && exists.status === "accepted")
    return res.status(400).json({ error: "Already friends" });

  await run(
    "INSERT OR REPLACE INTO friends(user_id, friend_user_id, status) VALUES(?,?,?)",
    [me, target.id, "pending"]
  );
  res.json({ ok: true });
});

// Accept / Reject friend request
app.post("/api/friends/respond", requireAuth, async (req, res) => {
  const me = req.user.id;
  const { from_user_id, action } = req.body || {};
  if (!from_user_id || !["accept", "reject"].includes(action))
    return res.status(400).json({ error: "Invalid request" });

  const pending = await get(
    "SELECT id FROM friends WHERE user_id = ? AND friend_user_id = ? AND status = 'pending'",
    [from_user_id, me]
  );
  if (!pending) return res.status(404).json({ error: "No pending request" });

  if (action === "reject") {
    await run("DELETE FROM friends WHERE id = ?", [pending.id]);
    return res.json({ ok: true });
  }

  // accept
  await run("UPDATE friends SET status = 'accepted' WHERE id = ?", [pending.id]);
  const reciprocal = await get(
    "SELECT id FROM friends WHERE user_id = ? AND friend_user_id = ?",
    [me, from_user_id]
  );
  if (!reciprocal) {
    await run(
      "INSERT INTO friends(user_id, friend_user_id, status) VALUES(?,?,?)",
      [me, from_user_id, "accepted"]
    );
  } else {
    await run("UPDATE friends SET status = 'accepted' WHERE id = ?", [
      reciprocal.id,
    ]);
  }
  res.json({ ok: true });
});

// Remove friend (both directions)
app.delete("/api/friends/:friend_id", requireAuth, async (req, res) => {
  const me = req.user.id;
  const fid = Number(req.params.friend_id);
  if (!fid) return res.status(400).json({ error: "Invalid friend id" });
  await run(
    `DELETE FROM friends
      WHERE (user_id = ? AND friend_user_id = ?)
         OR (user_id = ? AND friend_user_id = ?)` ,
    [me, fid, fid, me]
  );
  res.json({ ok: true });
});

// Leaderboard: me + accepted friends (avg of last 5 attempts, best score)
app.get("/api/leaderboard/friends", requireAuth, async (req, res) => {
  const me = req.user.id;
  const idsRows = await all(
    `SELECT DISTINCT CASE WHEN f.user_id = ? THEN f.friend_user_id ELSE f.user_id END AS friend_id
       FROM friends f
      WHERE (f.user_id = ? OR f.friend_user_id = ?) AND f.status = 'accepted'`,
    [me, me, me]
  );
  const ids = [me, ...idsRows.map((r) => r.friend_id)];
  if (ids.length === 0) return res.json([]);

  const placeholders = ids.map(() => "?").join(",");
  const rows = await all(
    `
    SELECT u.id, u.name, u.email,
      (
        SELECT ROUND(AVG(score), 1)
          FROM (SELECT score
                  FROM attempts
                 WHERE user_id = u.id AND score IS NOT NULL
                 ORDER BY id DESC
                 LIMIT 5)
      ) AS avg_score,
      (
        SELECT MAX(score)
          FROM attempts
         WHERE user_id = u.id AND score IS NOT NULL
      ) AS best_score
    FROM users u
    WHERE u.id IN (${placeholders})
    ORDER BY COALESCE(avg_score,0) DESC, COALESCE(best_score,0) DESC, u.name ASC
    `,
    ids
  );
  res.json(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      avg_score: r.avg_score ?? 0,
      best_score: r.best_score ?? 0,
    }))
  );
});

/* Admin bulk access */
app.post("/api/admin/access/bulk", requireAuth, async (req,res)=>{
  if(req.user.role!=="admin") return res.status(403).json({error:"Admin only"});
  const {course_id, emails=[]}=req.body||{};
  for(const e of emails){
    const u = await get("SELECT * FROM users WHERE email=?", [String(e||"").toLowerCase()]);
    if(u) await run("INSERT OR IGNORE INTO access(user_id,course_id,granted_by) VALUES(?,?,?)", [u.id, course_id, req.user.id]);
  }
  res.json({ok:true});
});

// --- Admin guard (after requireAuth is defined) ---
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
}

// --- Create course (admin only) ---
// NOTE: global app.use(express.json()) is already set, so no need to add it here.
app.post("/api/admin/courses", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, description = "", is_public = false } = req.body || {};
    const titleClean = String(title || "").trim();
    if (!titleClean) return res.status(400).json({ error: "Title is required" });

    // Insert into sqlite 'courses' table. 'cover' is optional (NULL here).
    const r = await run(
      "INSERT INTO courses(title, description, cover, is_public) VALUES(?,?,?,?)",
      [titleClean, String(description), null, is_public ? 1 : 0]
    );

    // Return the new row in the same shape your frontend expects
    const created = await get(
      "SELECT id, title, description, cover, is_public FROM courses WHERE id=?",
      [r.lastID]
    );

    res.status(201).json({
      ...created,
      is_public: !!created.is_public, // convert 0/1 -> boolean for UI
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not create course" });
  }
});

// BELOW the POST /api/admin/courses route, add:

app.delete("/api/admin/courses/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid course id" });

    // Best-effort cleanup of related rows (adjust to match your schema)
    await run("DELETE FROM access WHERE course_id=?", [id]);
    const exams = await all("SELECT id FROM exams WHERE course_id=?", [id]);
    for (const e of exams) {
      await run("DELETE FROM answers WHERE attempt_id IN (SELECT id FROM attempts WHERE exam_id=?)", [e.id]);
      await run("DELETE FROM attempts WHERE exam_id=?", [e.id]);
      await run("DELETE FROM exam_questions WHERE exam_id=?", [e.id]);
      await run("DELETE FROM questions WHERE exam_id=?", [e.id]);
      await run("DELETE FROM exams WHERE id=?", [e.id]);
    }

    await run("DELETE FROM courses WHERE id=?", [id]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not delete course" });
  }
});


// Public course catalog (minimal fields; no auth required)
// Public: list courses without auth (for pre-login catalog)
app.get("/api/public/courses", async (_req, res) => {
  try {
    const rows = await all(
      "SELECT id,title,description,cover,is_public FROM courses ORDER BY id"
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load courses" });
  }
});

// ---------- MOCK INTERVIEWS: PUBLIC & ADMIN ----------

// Public (pre-login) – show active slots (used by marketing page)
app.get("/api/public/mock-slots", async (_req, res) => {
  try {
    const rows = await all(
      `SELECT id,track,day_label,time_label,tz,mode,capacity,notes
         FROM mock_slots
        WHERE is_active=1
        ORDER BY created_at DESC, id DESC`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load mock interview slots" });
  }
});

// Authed (optional: same list, can include inactive later if needed)
app.get("/api/mock-slots", requireAuth, async (_req, res) => {
  try {
    const rows = await all(
      `SELECT id,track,day_label,time_label,tz,mode,capacity,notes,is_active
         FROM mock_slots
        ORDER BY is_active DESC, created_at DESC, id DESC`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load mock interview slots" });
  }
});

// Admin: create a slot
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
    const r = await run(
      `INSERT INTO mock_slots(track,day_label,time_label,tz,mode,capacity,notes,is_active,created_at)
       VALUES(?,?,?,?,?,?,?,?,?)`,
      [
        track.trim(),
        day_label.trim(),
        time_label.trim(),
        (tz || "IST").trim(),
        (mode || "Live on Zoom").trim(),
        Math.max(1, Number(capacity) || 1),
        String(notes || ""),
        is_active ? 1 : 0,
        created_at,
      ]
    );

    const created = await get(
      `SELECT id,track,day_label,time_label,tz,mode,capacity,notes,is_active
         FROM mock_slots WHERE id=?`,
      [r.lastID]
    );
    created.is_active = !!created.is_active;
    res.status(201).json(created);
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
    await run("DELETE FROM mock_slots WHERE id=?", [id]);
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
    const row = await get("SELECT is_active FROM mock_slots WHERE id=?", [id]);
    if (!row) return res.status(404).json({ error: "Not found" });
    const next = row.is_active ? 0 : 1;
    await run("UPDATE mock_slots SET is_active=? WHERE id=?", [next, id]);
    res.json({ ok: true, is_active: !!next });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not toggle slot" });
  }
});



app.get("/", (_req,res)=>res.json({ok:true}));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Allowing CORS from: ${ORIGIN}`);
});
