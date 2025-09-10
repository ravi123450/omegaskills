// server/seed_free_quant_from_csv.js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- DB ----------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
async function query(sql, params = []) { return pool.query(sql, params); }
async function getOne(sql, params = []) {
  const { rows } = await pool.query(sql, params);
  return rows[0] || null;
}

// ---------- CSV utils (same shape as your main seed) ----------
async function csv(text) {
  const rows = [];
  let f = "", inQ = false, cur = [];
  const pushF = () => { cur.push(f); f = ""; };
  const pushR = () => { if (cur.length) { rows.push(cur.slice()); cur.length = 0; } };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else inQ = false; }
      else f += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") pushF();
      else if (c === "\r") { /* ignore */ }
      else if (c === "\n") { pushF(); pushR(); }
      else f += c;
    }
  }
  pushF(); pushR();
  return rows.filter((r) => r.some((x) => x.trim() !== ""));
}
function toInt(s) {
  const n = parseInt(String(s ?? "").trim(), 10);
  return Number.isFinite(n) ? n : null;
}

// ---------- Topics (Quant) ----------
const QUANT_TOPICS = [
  { slug: "number_system", name: "Number System", section: "Quantitative Aptitude" },
  { slug: "percentages", name: "Percentages", section: "Quantitative Aptitude" },
  { slug: "profit_loss", name: "Profit & Loss", section: "Quantitative Aptitude" },
  { slug: "average", name: "Average", section: "Quantitative Aptitude" },
  { slug: "ratio_proportion", name: "Ratio & Proportion", section: "Quantitative Aptitude" },
  { slug: "mixtures", name: "Mixtures", section: "Quantitative Aptitude" },
  { slug: "time_work", name: "Time & Work", section: "Quantitative Aptitude" },
  { slug: "sdt", name: "Speed–Distance–Time", section: "Quantitative Aptitude" },
  { slug: "pipes_cisterns", name: "Pipes & Cisterns", section: "Quantitative Aptitude" },
  { slug: "algebra", name: "Algebra", section: "Quantitative Aptitude" },
  { slug: "geometry", name: "Geometry", section: "Quantitative Aptitude" },
  { slug: "height_distance", name: "Height & Distance", section: "Quantitative Aptitude" },
  { slug: "mensuration", name: "Mensuration", section: "Quantitative Aptitude" },
  { slug: "coordinate_geometry", name: "Co-ordinate Geometry", section: "Quantitative Aptitude" },
  { slug: "permutations_combinations", name: "Permutations & Combinations", section: "Quantitative Aptitude" },
  { slug: "probability", name: "Probability", section: "Quantitative Aptitude" },
  { slug: "interest", name: "Simple & Compound Interest", section: "Quantitative Aptitude" },
  { slug: "ages", name: "Ages", section: "Quantitative Aptitude" },
  { slug: "logs", name: "Logs", section: "Quantitative Aptitude" },
  { slug: "sets", name: "Sets", section: "Quantitative Aptitude" },
];

// Map labels→slugs like your main seed
function buildTopicSlugMapper(topicsDef) {
  const map = new Map();
  const norm = (s) => String(s || "").toLowerCase().replace(/[\s&\-\/]+/g, " ").trim();
  for (const t of topicsDef) {
    map.set(norm(t.slug), t.slug);
    map.set(norm(t.name), t.slug);
  }
  // common aliases
  map.set("percent", "percentages");
  map.set("speed distance time", "sdt");
  map.set("speed distance and time", "sdt");
  map.set("p&l", "profit_loss");
  return (x) => map.get(norm(x)) || topicsDef[0].slug;
}

// Load a CSV into insert-ready records
async function loadCsv(file, topicsDef) {
  const content = await fs.readFile(file, "utf8");
  const rows = await csv(content);
  if (!rows.length) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (n) => header.indexOf(n);
  const mapTopicSlug = buildTopicSlugMapper(topicsDef);

  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];

    const optsRaw = (r[idx("options_json")] || r[idx("options")] || "").trim();
    let options = [];
    if (/^\s*\[/.test(optsRaw)) {
      try { options = JSON.parse(optsRaw); } catch {}
    } else options = optsRaw.split("|").map((s) => s.trim()).filter(Boolean);

    const answer = (r[idx("answer")] || "").trim();
    let correct_index = toInt(r[idx("correct_index")]);
    if (!Number.isInteger(correct_index) && answer) {
      const ix = options.findIndex((o) => o.toLowerCase() === answer.toLowerCase());
      if (ix >= 0) correct_index = ix;
    }

    const topicSlugRaw = (r[idx("topic_slug")] || "").trim();
    const topicLabelRaw = (r[idx("topic")] || "").trim();
    const resolvedTopicSlug = mapTopicSlug(topicSlugRaw || topicLabelRaw || topicsDef[0].slug);

    out.push({
      topic_slug: resolvedTopicSlug,
      type: (r[idx("type")] || "mcq").trim().toLowerCase(),
      text: (r[idx("text")] || "").trim(),
      options,
      correct_index,
      answer,
      explanation: (r[idx("explanation")] || "").trim(),
      difficulty: (r[idx("difficulty")] || "mixed").trim().toLowerCase(),
      marks: toInt(r[idx("marks")]) ?? 1,
      negative_marks: parseFloat(r[idx("negative_marks")] || 0) || 0,
      tags: (r[idx("tags")] || ""),
    });
  }
  return out;
}

// ---------- DB helpers ----------
async function upsertCourse(_dbIgnored, { title, description, is_public = 0 }) {
  let row = await getOne("SELECT id FROM courses WHERE title = $1", [title]);
  if (row) {
    if (is_public) await query("UPDATE courses SET is_public = 1 WHERE id = $1", [row.id]);
    console.log(`Course exists: ${title} (id=${row.id})`);
    return row.id;
  }
  row = await getOne(
    "INSERT INTO courses (title, description, is_public) VALUES ($1,$2,$3) RETURNING id",
    [title, description, is_public ? 1 : 0]
  );
  console.log(`Course created: ${title} (id=${row.id})`);
  return row.id;
}

async function ensureExamTopics(_dbIgnored, exam_id, topicsDef) {
  const out = [];
  for (const t of topicsDef) {
    let row = await getOne("SELECT id FROM exam_topics WHERE exam_id = $1 AND slug = $2", [exam_id, t.slug]);
    if (!row) {
      row = await getOne(
        "INSERT INTO exam_topics (exam_id, name, slug, section) VALUES ($1,$2,$3,$4) RETURNING id",
        [exam_id, t.name, t.slug, t.section]
      );
    }
    out.push({ id: row.id, ...t });
  }
  return out;
}

async function upsertExam(_dbIgnored, { course_id, title, minutes, free, topicsDef }) {
  let row = await getOne("SELECT id FROM exams WHERE course_id = $1 AND title = $2", [course_id, title]);
  if (!row) {
    const cfgSections = [...new Set(topicsDef.map((t) => t.section))];
    row = await getOne(
      "INSERT INTO exams (course_id, title, duration_minutes, duration_sec, total_marks, is_free, config_json) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id",
      [course_id, title, minutes, minutes * 60, 100, free ? 1 : 0, JSON.stringify({ sections: cfgSections })]
    );
    console.log(`  Exam created: ${title} (id=${row.id})`);
  } else {
    if (free) await query("UPDATE exams SET is_free = 1 WHERE id = $1", [row.id]);
    console.log(`  Exam exists: ${title} (id=${row.id})`);
  }
  const topics = await ensureExamTopics(null, row.id, topicsDef);
  return { exam_id: row.id, topics };
}

async function countQuestions(_dbIgnored, exam_id) {
  const row = await getOne("SELECT COUNT(*)::int AS c FROM questions WHERE exam_id = $1", [exam_id]);
  return row?.c || 0;
}

async function insertQuestions(_dbIgnored, exam_id, topic_id, arr) {
  for (const q of arr) {
    const opts = JSON.stringify(q.options || []);
    const cidx = Number.isInteger(q.correct_index) ? q.correct_index : null;
    const ans = q.answer ?? (Number.isInteger(cidx) ? String((q.options || [])[cidx]) : null);
    await query(
      "INSERT INTO questions (exam_id, topic_id, type, text, options_json, correct_index, answer, explanation, difficulty, tags, marks, negative_marks) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)",
      [
        exam_id,
        topic_id,
        q.type || "mcq",
        q.text,
        opts,
        cidx,
        ans,
        q.explanation || "",
        q.difficulty || "mixed",
        q.tags || "",
        q.marks ?? 1,
        q.negative_marks ?? 0,
      ]
    );
  }
}

async function grantAccessToAllUsers(_dbIgnored, course_id) {
  const { rows: users } = await query("SELECT id FROM users");
  for (const u of users) {
    const existing = await getOne("SELECT id FROM access WHERE user_id = $1 AND course_id = $2", [u.id, course_id]);
    if (!existing) {
      await query("INSERT INTO access (user_id, course_id, granted_by) VALUES ($1,$2,$3)", [u.id, course_id, null]);
    }
  }
  console.log(`Granted access to course ${course_id} for ${users.length} users.`);
}

// ---------- Load CSV from fixed free_mocks folder ----------
const FREE_DIR = path.join(__dirname, "data", "exams", "free_mocks");
const examCsvPath = (i) =>
  path.join(FREE_DIR, `exam_${String(i).padStart(2, "0")}.csv`);

// ---------- Main ----------
async function seedFreeQuantFromCsv() {
  // 1) Ensure course (public)
  const courseTitle = "Quantitative Aptitude (Free Mocks)";
  const courseId = await upsertCourse(null, {
    title: courseTitle,
    description: "3 free quantitative aptitude mock tests (CSV-loaded).",
    is_public: 1,
  });

  // 2) Grant access to everyone explicitly
  await grantAccessToAllUsers(null, courseId);

  // 3) Create 3 exams and load from CSVs
  const minutes = 90;
  for (let i = 1; i <= 3; i++) {
    const title = `Quant Apt Free Mock ${String(i).padStart(2, "0")}`;
    const { exam_id, topics } = await upsertExam(null, {
      course_id: courseId,
      title,
      minutes,
      free: 1,
      topicsDef: QUANT_TOPICS,
    });

    const already = await countQuestions(null, exam_id);
    if (already > 0) {
      console.log(`  ${title}: ${already} questions already present — skipping insert`);
      continue;
    }

    const file = examCsvPath(i);
    const st = await fs.stat(file).catch(() => null);
    if (!st?.isFile()) {
      console.warn(`  ${title}: CSV not found at ${path.relative(__dirname, file)} — skipping this exam`);
      continue;
    }

    const rows = await loadCsv(file, QUANT_TOPICS);
    if (!rows.length) {
      console.warn(`  ${title}: CSV empty or unreadable — skipping`);
      continue;
    }

    // Group by topic slug resolved via QUANT_TOPICS
    const mapTopicSlug = buildTopicSlugMapper(QUANT_TOPICS);
    const byTopic = new Map();
    for (const q of rows) {
      const s = mapTopicSlug(q.topic_slug || q.topic || QUANT_TOPICS[0].slug);
      if (!byTopic.has(s)) byTopic.set(s, []);
      byTopic.get(s).push(q);
    }

    let inserted = 0;
    for (const [slug, arr] of byTopic) {
      const t = topics.find((x) => x.slug === slug) || topics[0];
      await insertQuestions(null, exam_id, t.id, arr);
      inserted += arr.length;
    }
    console.log(`  ${title}: inserted ${inserted} questions from ${path.relative(__dirname, file)}`);
  }
}

seedFreeQuantFromCsv()
  .then(async () => {
    console.log("Free Quant CSV seeding complete.");
    await pool.end().catch(() => {});
  })
  .catch(async (e) => {
    console.error(e);
    await pool.end().catch(() => {});
    process.exit(1);
  });
