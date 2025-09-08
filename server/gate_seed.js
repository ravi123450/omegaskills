// server/gate_seed.js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ---------------- tiny pg helpers ----------------
async function query(sql, params = []) {
  return pool.query(sql, params);
}
async function getOne(sql, params = []) {
  const { rows } = await pool.query(sql, params);
  return rows[0] || null;
}

// --------------- schema probe for marks columns --
let HAS_MARKS = false;
let HAS_NEGATIVE = false;

async function probeSchema() {
  const cols = await query(
    `SELECT column_name FROM information_schema.columns WHERE table_name='questions'`
  );
  const names = new Set(cols.rows.map((r) => r.column_name));
  HAS_MARKS = names.has("marks");
  HAS_NEGATIVE = names.has("negative_marks");
  if (HAS_MARKS && HAS_NEGATIVE) {
    console.log(`Detected marks/negative_marks on questions → will seed by type (MCQ=1/−0.33, MSQ=2/−0.66).`);
  } else {
    console.log(`Questions table lacks marks/negative_marks → seeding without those columns.`);
  }
}

// ---------------- robust CSV loader --------------
async function csvParse(text) {
  const rows = [];
  let f = "";
  let inQ = false;
  let cur = [];
  const pushF = () => {
    cur.push(f);
    f = "";
  };
  const pushR = () => {
    if (cur.length) {
      rows.push(cur.slice());
      cur.length = 0;
    }
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          f += '"';
          i++;
        } else inQ = false;
      } else f += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") pushF();
      else if (c === "\r") {
        // ignore
      } else if (c === "\n") {
        pushF();
        pushR();
      } else f += c;
    }
  }
  pushF();
  pushR();
  return rows.filter((r) => r.some((x) => (x ?? "").trim() !== ""));
}

async function loadCsv(file) {
  const txt0 = await fs.readFile(file, "utf8");
  const txt = txt0.replace(/^\uFEFF/, ""); // strip BOM
  const rows = await csvParse(txt);
  if (!rows.length) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (n) => header.indexOf(n);

  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const get = (key) => {
      const k = idx(key);
      return k >= 0 ? String(r[k] ?? "").trim() : "";
    };

    // options_json may be JSON array or pipe-separated
    let options = [];
    const optionsRaw = get("options_json");
    if (optionsRaw) {
      if (/^\s*\[/.test(optionsRaw)) {
        try {
          const parsed = JSON.parse(optionsRaw);
          if (Array.isArray(parsed)) options = parsed.map((s) => String(s));
        } catch {
          // fallback to splitter
        }
      }
      if (!options.length) {
        options = optionsRaw
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    const row = {
      exam_title_csv: get("exam_title") || "",
      topic_slug: (get("topic_slug") || "general").toLowerCase(),
      type: (get("type") || "mcq").toLowerCase(), // "mcq" or "msq"
      text: get("text") || "",
      options,
      answer: get("answer") || "",
      explanation: get("explanation") || "",
      difficulty: (get("difficulty") || "mixed").toLowerCase(),
      tags: get("tags") || "",
    };

    if (row.text) out.push(row);
  }
  return out;
}

// --- robust cleaners for options/answers ---

/** Remove leading enumeration markers like "A) ", "(a). ", "1: ", "(2) " */
function stripEnumPrefix(s) {
  return String(s || "")
    .replace(/^\s*\(?([A-Za-z]|\d+)\)?[-.):]\s*/u, "") // - first in class to avoid range; handles A) A. (1) 1: etc.
    .trim();
}

/** Normalize plain text for forgiving comparisons */
function normTxt(s) {
  return String(s || "")
    .replace(/\u00A0/g, " ") // nbsp → space
    .replace(/\s+/g, " ")
    .replace(/\s*[.;,]\s*$/u, "") // trim trailing punctuation
    .trim()
    .toLowerCase();
}

/** Expand tokens like "A,B", "AC", "1 3", "1-3", "(2)", "a&d", etc. to an array of token strings */
function tokenizeAnswer(raw) {
  const s = String(raw || "").trim();

  // JSON array? e.g. ["A","C"] or [1,3]
  try {
    const parsed = JSON.parse(s);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {}

  // Split by common delimiters
  let tks = s.split(/[,;/|&\s]+/u).filter(Boolean);

  // Also handle compact letter runs like "ACD"
  if (tks.length === 1 && /^[A-Za-z]+$/.test(tks[0]) && tks[0].length > 1) {
    tks = tks[0].split("");
  }

  // Handle simple ranges like "1-3" or "B-D"
  const rangeMatch = s.match(/^\s*([A-Za-z]|\d+)\s*-\s*([A-Za-z]|\d+)\s*$/u);
  if (rangeMatch) {
    const a = rangeMatch[1],
      b = rangeMatch[2];
    // numeric range
    if (/^\d+$/.test(a) && /^\d+$/.test(b)) {
      const sN = parseInt(a, 10),
        eN = parseInt(b, 10);
      const out = [];
      const st = Math.min(sN, eN),
        en = Math.max(sN, eN);
      for (let i = st; i <= en; i++) out.push(String(i));
      return out;
    }
    // alpha range
    if (/^[A-Za-z]$/.test(a) && /^[A-Za-z]$/.test(b)) {
      const sC = Math.min(a.toUpperCase().charCodeAt(0), b.toUpperCase().charCodeAt(0));
      const eC = Math.max(a.toUpperCase().charCodeAt(0), b.toUpperCase().charCodeAt(0));
      const out = [];
      for (let c = sC; c <= eC; c++) out.push(String.fromCharCode(c));
      return out;
    }
  }

  return tks;
}

/**
 * Map raw answer(s) to:
 *  - MCQ: { answerText, correctIndex }  (index into cleaned options)
 *  - MSQ: { answerText, correctIndex: null } with "opt1 | opt3" text
 */
function mapAnswerToTextAndIndex(options, rawAnswer, type, unresolvedCollector) {
  const opts = (options || []).map((o) => stripEnumPrefix(o));
  const tokens = tokenizeAnswer(rawAnswer);

  const used = new Set();
  const chosen = [];
  const indices = [];

  const pushIx = (ix) => {
    if (ix >= 0 && ix < opts.length) {
      const v = opts[ix].trim();
      const k = normTxt(v);
      if (!used.has(k)) {
        used.add(k);
        chosen.push(v);
        indices.push(ix);
      }
      return true;
    }
    return false;
  };

  // Try each token
  for (let tok of tokens) {
    const tRaw = String(tok).trim();
    const t = normTxt(stripEnumPrefix(tRaw));
    if (!t) continue;

    // A/B/C -> 0/1/2
    if (/^[a-z]$/i.test(t)) {
      const ix = t.toUpperCase().charCodeAt(0) - 65;
      if (pushIx(ix)) continue;
    }

    // numeric index (try both 0-based and 1-based)
    if (/^\d+$/.test(t)) {
      const n = parseInt(t, 10);
      if (pushIx(n)) continue; // zero-based token
      if (pushIx(n - 1)) continue; // 1-based token
    }

    // exact option text match (case-insensitive)
    let matched = false;
    for (let i = 0; i < opts.length; i++) {
      if (normTxt(opts[i]) === t) {
        matched = pushIx(i);
        if (matched) break;
      }
    }
    if (matched) continue;

    // last resort: substring contains (both ways)
    for (let i = 0; i < opts.length; i++) {
      const oi = normTxt(opts[i]);
      if (oi.includes(t) || t.includes(oi)) {
        matched = pushIx(i);
        if (matched) break;
      }
    }
  }

  const isMsq = (type || "mcq").toLowerCase() === "msq";

  if (!isMsq) {
    // MCQ: pick the first; index is mandatory for evaluation path
    if (chosen.length) {
      return { answerText: chosen[0], correctIndex: indices[0] };
    }
    unresolvedCollector?.push({ raw: rawAnswer, options });
    return { answerText: String(rawAnswer || "").trim(), correctIndex: null };
  }

  // MSQ: store all option texts joined by pipes; index remains null (multi-correct)
  if (chosen.length) {
    return { answerText: chosen.join(" | "), correctIndex: null };
  }
  unresolvedCollector?.push({ raw: rawAnswer, options });
  return { answerText: String(rawAnswer || "").trim(), correctIndex: null };
}

// ---------------- courses/exams/topics ------------
async function upsertCourse({ title, description, is_public = 0 }) {
  let row = await getOne(`SELECT id FROM courses WHERE title=$1`, [title]);
  if (row) return row.id;
  row = await getOne(
    `INSERT INTO courses (title, description, is_public) VALUES ($1,$2,$3) RETURNING id`,
    [title, description, is_public ? 1 : 0]
  );
  console.log(`Course created: ${title} (id=${row.id})`);
  return row.id;
}

async function upsertExamByFixedTitle({ course_id, setIndex, minutes = 180, is_free = false }) {
  const title = `GATE Mock — Set ${String(setIndex).padStart(2, "0")}`;
  let row = await getOne(`SELECT id FROM exams WHERE course_id=$1 AND title=$2`, [course_id, title]);
  if (row) return { id: row.id, title };
  row = await getOne(
    `INSERT INTO exams (course_id, title, duration_minutes, duration_sec, total_marks, is_free, config_json)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [course_id, title, minutes, minutes * 60, 0, is_free ? 1 : 0, JSON.stringify({ sections: [] })]
  );
  console.log(`  Exam created: ${title} (id=${row.id})`);
  return { id: row.id, title };
}

async function ensureExamTopic(exam_id, { slug, name = null, section = null }) {
  let row = await getOne(`SELECT id FROM exam_topics WHERE exam_id=$1 AND slug=$2`, [exam_id, slug]);
  if (row) return row.id;
  row = await getOne(
    `INSERT INTO exam_topics (exam_id, name, slug, section) VALUES ($1,$2,$3,$4) RETURNING id`,
    [exam_id, name || slug, slug, section || "GATE"]
  );
  return row.id;
}

// --------------- insert questions ----------------
/**
 * CSV has: exam_title, topic_slug, type, text, options_json, answer, explanation, difficulty, tags
 * We insert:
 *   - legacy columns: exam_id, topic_id, type, text, options_json, answer, explanation, difficulty, tags
 *   - PLUS: correct_index (computed from answer mapping for MCQ; null for MSQ)
 *   - If marks/negative_marks columns exist → set by type (MCQ=1/−0.33, MSQ=2/−0.66)
 */
async function insertQuestions(exam_id, topic_id, arr, unresolved) {
  for (const q of arr) {
    const { answerText, correctIndex } = mapAnswerToTextAndIndex(q.options || [], q.answer || "", q.type || "mcq", unresolved);

    // base columns
    const cols = [
      "exam_id",
      "topic_id",
      "type",
      "text",
      "options_json",
      "answer",
      "explanation",
      "difficulty",
      "tags",
      "correct_index",
    ];
    const vals = [
      exam_id,
      topic_id,
      q.type || "mcq",
      q.text,
      JSON.stringify((q.options || []).map(stripEnumPrefix)),
      answerText,
      q.explanation || "",
      q.difficulty || "mixed",
      q.tags || "",
      correctIndex, // MCQ → integer; MSQ → null
    ];

    if (HAS_MARKS && HAS_NEGATIVE) {
      const isMsq = (q.type || "").toLowerCase() === "msq";
      const marks = isMsq ? 2 : 1;
      const neg = isMsq ? 0.66 : 0.33;
      cols.push("marks", "negative_marks");
      vals.push(marks, neg);
    }

    const placeholders = cols.map((_, i) => `$${i + 1}`).join(",");
    const sql = `INSERT INTO questions (${cols.join(",")}) VALUES (${placeholders})`;
    await query(sql, vals);
  }
}

// ---------------- file helpers -------------------
const GATE_DIR = path.join(__dirname, "data", "exams", "gate");
function csvPath(i) {
  return path.join(GATE_DIR, `gate_exam_${String(i).padStart(2, "0")}.csv`);
}

// ---------------- main seeder --------------------
async function seedGate() {
  await probeSchema();

  const courseTitle = "GATE Master Pack";
  const courseDesc = "GATE CS/IT mocks seeded from CSV (MCQ & MSQ).";
  const courseId = await upsertCourse({ title: courseTitle, description: courseDesc, is_public: 0 });

  let totalExams = 0,
    totalQs = 0;

  for (let i = 1; i <= 50; i++) {
    const file = csvPath(i);
    const st = await fs.stat(file).catch(() => null);
    if (!st || !st.isFile()) continue;

    console.log(`\nLoading ${file} ...`);
    const rows = await loadCsv(file);
    if (!rows.length) {
      console.log(`  (empty)`);
      continue;
    }

    // fixed, per-file exam title
    const { id: examId, title } = await upsertExamByFixedTitle({
      course_id: courseId,
      setIndex: i,
      minutes: 180,
      is_free: i <= 2,
    });

    // wipe ONLY this exam's questions
    console.log(`  Clearing questions for "${title}" (exam_id=${examId})`);
    await query(`DELETE FROM questions WHERE exam_id=$1`, [examId]);

    // group by topic and insert
    const byTopic = new Map();
    for (const r of rows) {
      const slug = (r.topic_slug || "general").toLowerCase().trim();
      if (!byTopic.has(slug)) byTopic.set(slug, []);
      byTopic.get(slug).push(r);
    }

    let inserted = 0;
    const unresolved = [];

    for (const [slug, arr] of byTopic) {
      const topicId = await ensureExamTopic(examId, { slug, name: slug, section: "GATE" });
      await insertQuestions(examId, topicId, arr, unresolved);
      inserted += arr.length;
    }

    if (unresolved.length) {
      console.warn(
        `  [warn] ${unresolved.length} answers didn’t resolve cleanly → check CSV. Example raw="${unresolved[0].raw}"`
      );
    }
    console.log(`  Inserted ${inserted} questions into "${title}"`);
    totalExams += 1;
    totalQs += inserted;
  }

  console.log(`\nGATE seeding done: ${totalExams} exams, ${totalQs} questions.`);
  await pool.end().catch(() => {});
}

seedGate().catch(async (e) => {
  console.error(e);
  await pool.end().catch(() => {});
  process.exit(1);
});
