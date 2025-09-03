// server/seed.js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { Pool } from "pg"; // PostgreSQL
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration using the environment variable DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Canonical exams dir (kept) — but we’ll search more places now
const EXAMS_DIR = path.join(__dirname, "data", "exams");

// ------------------------------ tiny pg helpers ------------------------------
async function query(sql, params = []) {
  return pool.query(sql, params);
}
async function getOne(sql, params = []) {
  const { rows } = await pool.query(sql, params);
  return rows[0] || null;
}

// NOTE: schema migration removed per your request.

// ------------------------------ utils ------------------------------
async function hash(pw) {
  return bcrypt.hash(String(pw), 10);
}

// ------------------------------ topic helpers ------------------------------
/** Build a flexible mapping from human labels & slugs → canonical slug */
function buildTopicSlugMapper(topicsDef) {
  const map = new Map();
  const norm = (s) => String(s || "").toLowerCase().replace(/[\s&\-\/]+/g, " ").trim();
  for (const t of topicsDef) {
    map.set(norm(t.slug), t.slug);
    map.set(norm(t.name), t.slug);
  }
  // common synonyms for verbal
  map.set("reading comprehension", "rc");
  map.set("grammar", "grammar");
  map.set("vocab", "vocab");
  map.set("vocabulary", "vocab");
  map.set("para jumbles", "para_jumbles");
  map.set("cloze", "cloze");
  map.set("cloze test", "cloze");
  map.set("sentence correction", "sentence_correction");
  map.set("fill in the blanks", "fill_blanks");
  map.set("fill blanks", "fill_blanks");
  map.set("idioms", "idioms");
  map.set("idioms phrases", "idioms");
  map.set("one word substitutes", "one_word");
  map.set("one-word substitutes", "one_word");
  map.set("verbal reasoning", "verbal_reasoning");
  return (labelOrSlug) => map.get(norm(labelOrSlug)) || topicsDef[0].slug;
}

// ------------------------------ CSV loader ------------------------------
async function csv(text) {
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
      } else if (c === "\n") {
        pushF();
        pushR();
      } else f += c;
    }
  }
  pushF();
  pushR();
  return rows.filter((r) => r.some((x) => x.trim() !== ""));
}
function toInt(s) {
  const n = parseInt(String(s ?? "").trim(), 10);
  return Number.isFinite(n) ? n : null;
}

/** Load CSV and normalize to our insert shape; map topic/topic_slug to canonical slug */
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
      try {
        options = JSON.parse(optsRaw);
      } catch {}
    } else options = optsRaw.split("|").map((s) => s.trim()).filter(Boolean);

    const answer = (r[idx("answer")] || "").trim();
    let correct_index = toInt(r[idx("correct_index")]);
    if (!Number.isInteger(correct_index) && answer) {
      const ix = options.findIndex((o) => o.toLowerCase() === answer.toLowerCase());
      if (ix >= 0) correct_index = ix;
    }

    // accept either topic_slug or topic
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

// ------------------------------ topics ------------------------------
const SOFTSKILLS_TOPICS = [
  { slug: "aptitude", name: "Aptitude & Arithmetic", section: "Aptitude" },
  { slug: "quant", name: "Quantitative Analysis", section: "Quant" },
  { slug: "reasoning", name: "Logical Reasoning", section: "Reasoning" },
  { slug: "verbal", name: "Verbal Ability", section: "Verbal" },
  { slug: "communication", name: "Communication Skills", section: "Communication" },
];

const VERBAL_TOPICS = [
  { slug: "rc", name: "Reading Comprehension", section: "Reading Comprehension" },
  { slug: "grammar", name: "Grammar (Clauses, Tenses)", section: "Grammar" },
  { slug: "vocab", name: "Vocabulary", section: "Vocabulary" },
  { slug: "para_jumbles", name: "Para Jumbles", section: "Para Jumbles" },
  { slug: "cloze", name: "Cloze Test", section: "Cloze Test" },
  { slug: "sentence_correction", name: "Sentence Correction", section: "Sentence Correction" },
  { slug: "fill_blanks", name: "Fill in the Blanks", section: "Fill Blanks" },
  { slug: "idioms", name: "Idioms & Phrases", section: "Idioms/Phrases" },
  { slug: "one_word", name: "One-word Substitutes", section: "One-word Substitutes" },
  { slug: "verbal_reasoning", name: "Verbal Reasoning", section: "Verbal Reasoning" },
];

// NEW: Logical Reasoning topics
const LOGICAL_TOPICS = [
  { slug: "seating", name: "Seating Arrangements", section: "Logical Reasoning" },
  { slug: "puzzles", name: "Puzzles", section: "Logical Reasoning" },
  { slug: "syllogisms", name: "Syllogisms", section: "Logical Reasoning" },
  { slug: "statements_args", name: "Statements & Arguments", section: "Logical Reasoning" },
  { slug: "coding_decoding", name: "Coding–Decoding", section: "Logical Reasoning" },
  { slug: "series", name: "Series", section: "Logical Reasoning" },
  { slug: "venn", name: "Venn Diagrams", section: "Logical Reasoning" },
  { slug: "analytical", name: "Analytical Reasoning", section: "Logical Reasoning" },
  { slug: "blood_relations", name: "Blood Relations", section: "Logical Reasoning" },
  { slug: "direction", name: "Direction Sense", section: "Logical Reasoning" },
];

// ADD THIS BLOCK near your other TOPICS constants
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

// ------------------------------ DB ops (Postgres) ------------------------------
async function upsertUser(_dbIgnored, { name, email, password, role = "student" }) {
  const existing = await getOne("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
  if (existing) return existing.id;

  const hashed = await hash(password);
  const inserted = await getOne(
    "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id",
    [name, email.toLowerCase(), hashed, role]
  );
  console.log(`${role === "admin" ? "Admin" : "Student"} created: ${email}${role === "admin" ? " / " + password : ""}`);
  return inserted.id;
}

async function upsertCourse(_dbIgnored, { title, description, is_public = 0 }) {
  let row = await getOne("SELECT id FROM courses WHERE title = $1", [title]);
  if (row) {
    console.log(`Course exists: ${title} (id=${row.id})`);
    return row.id;
  }
  row = await getOne(
    "INSERT INTO courses (title, description, is_public) VALUES ($1, $2, $3) RETURNING id",
    [title, description, is_public ? 1 : 0]
  );
  console.log(`Course created: ${title} (id=${row.id})`);
  return row.id;
}

async function grantAccess(_dbIgnored, user_id, course_id, by = null) {
  const row = await getOne("SELECT id FROM access WHERE user_id = $1 AND course_id = $2", [user_id, course_id]);
  if (!row) {
    await query("INSERT INTO access (user_id, course_id, granted_by) VALUES ($1, $2, $3)", [user_id, course_id, by]);
  }
}

async function ensureExamTopics(_dbIgnored, exam_id, topicsDef) {
  const out = [];
  for (const t of topicsDef) {
    let row = await getOne("SELECT id FROM exam_topics WHERE exam_id = $1 AND slug = $2", [exam_id, t.slug]);
    if (!row) {
      row = await getOne(
        "INSERT INTO exam_topics (exam_id, name, slug, section) VALUES ($1, $2, $3, $4) RETURNING id",
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

// ------------------------------ generators (fallbacks) ------------------------------
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function genSoft(topicSlug, count) {
  const out = [];
  for (let i = 0; i < count; i++) {
    if (["aptitude", "quant"].includes(topicSlug)) {
      const a = 10 + Math.floor(Math.random() * 90);
      const b = 10 + Math.floor(Math.random() * 90);
      const ans = a + b;
      const opts = [ans, ans - 1, ans + 1, ans + 2].map(String);
      out.push({ type: "mcq", text: `What is ${a} + ${b}?`, options: opts, correct_index: 0, explanation: `${a}+${b}=${ans}` });
    } else if (topicSlug === "reasoning") {
      out.push({ type: "mcq", text: `Next in series: 2, 4, 8, 16, … ?`, options: ["32", "36", "30", "28"], correct_index: 0 });
    } else if (topicSlug === "verbal") {
      out.push({ type: "mcq", text: "Synonym of 'rapid'?", options: ["swift", "slow", "dull", "weak"], correct_index: 0 });
    } else {
      out.push({
        type: "mcq",
        text: "Best email etiquette?",
        options: ["Clear subject", "ALL CAPS", "Random emojis", "No salutation"],
        correct_index: 0,
      });
    }
  }
  return out;
}

function genVerbal(topicSlug, count) {
  const out = [];
  for (let i = 0; i < count; i++) {
    switch (topicSlug) {
      case "rc": {
        const t = pick(["rainforests", "renewable energy", "digital privacy", "urban transport"]);
        out.push({
          type: "mcq",
          text: `Reading Comprehension: The passage discusses ${t}. Which option best captures the main idea?`,
          options: ["Central claim", "Random detail", "Author bio", "Unrelated fact"],
          correct_index: 0,
        });
        break;
      }
      case "grammar": {
        out.push({
          type: "mcq",
          text: "Choose the correct sentence.",
          options: ["She has went to school.", "She have gone to school.", "She has gone to school.", "She gone to school."],
          correct_index: 2,
        });
        break;
      }
      case "vocab": {
        out.push({ type: "mcq", text: "Synonym of 'lucid' is ____.", options: ["clear", "vague", "dim", "harsh"], correct_index: 0 });
        break;
      }
      case "para_jumbles": {
        out.push({
          type: "mcq",
          text: "Rearrange to form a coherent sentence: (A) quickly (B) the (C) finished (D) team (E) task",
          options: ["D C B E A", "D B E C A", "B D C E A", "D C A B E"],
          correct_index: 0,
        });
        break;
      }
      case "cloze": {
        out.push({
          type: "mcq",
          text: "He ____ the exam last year. (Cloze)",
          options: ["take", "took", "taken", "taking"],
          correct_index: 1,
        });
        break;
      }
      case "sentence_correction": {
        out.push({
          type: "mcq",
          text: "Find the error: 'Each of the players have a unique style.'",
          options: ["Each of", "players", "have", "a unique style"],
          correct_index: 2,
          explanation: "'Each' is singular → 'has'.",
        });
        break;
      }
      case "fill_blanks": {
        out.push({
          type: "mcq",
          text: "Choose the best option: 'She is ____ honest person.'",
          options: ["a", "an", "the", "no article"],
          correct_index: 1,
        });
        break;
      }
      case "idioms": {
        out.push({
          type: "mcq",
          text: "Meaning of the idiom 'beat around the bush'?",
          options: ["avoid the main topic", "hit a plant", "walk in circles", "celebrate"],
          correct_index: 0,
        });
        break;
      }
      case "one_word": {
        out.push({
          type: "mcq",
          text: "One-word substitute: 'A person who speaks many languages'",
          options: ["Polyglot", "Pedant", "Hermit", "Novice"],
          correct_index: 0,
        });
        break;
      }
      case "verbal_reasoning": {
        out.push({
          type: "mcq",
          text: "All roses are flowers. Some flowers fade quickly. Therefore ___.",
          options: ["some roses fade quickly (cannot be concluded)", "all flowers are roses", "no roses fade quickly", "none of the above"],
          correct_index: 0,
          explanation: "From given premises, specific subset cannot be asserted.",
        });
        break;
      }
      default:
        out.push({
          type: "mcq",
          text: "Select the grammatically correct option.",
          options: ["I is", "He are", "They am", "We are"],
          correct_index: 3,
        });
    }
  }
  return out;
}

// NEW: Logical Reasoning generator (fallback/top-up)
function genLR(topicSlug, count) {
  const out = [];
  for (let i = 0; i < count; i++) {
    switch (topicSlug) {
      case "seating":
        out.push({
          type: "mcq",
          text: "Six people A–F sit around a circle facing center. A sits second to the left of B. Who sits immediately right of A?",
          options: ["C", "D", "E", "F"],
          correct_index: 0,
        });
        break;
      case "puzzles":
        out.push({
          type: "mcq",
          text:
            "Five boxes are stacked one above another. Red is above Blue; Green is below Yellow; Blue is not at the bottom. Which is at the top?",
          options: ["Red", "Blue", "Green", "Yellow"],
          correct_index: 0,
        });
        break;
      case "syllogisms":
        out.push({
          type: "mcq",
          text: "All cats are animals. Some animals are wild. Conclusions: (I) Some cats may be wild. (II) All wild are cats.",
          options: ["Only I follows", "Only II follows", "Both follow", "None follows"],
          correct_index: 0,
        });
        break;
      case "statements_args":
        out.push({
          type: "mcq",
          text: "Statement: City should ban private cars on odd-even days. Argument: It can reduce traffic and pollution.",
          options: ["Strong", "Weak", "Both strong", "Both weak"],
          correct_index: 0,
        });
        break;
      case "coding_decoding":
        out.push({
          type: "mcq",
          text: "If CODE is written as 3175 (C=3,O=1,D=7,E=5), how is DEED written?",
          options: ["7575", "7755", "7577", "7557"],
          correct_index: 0,
        });
        break;
      case "series":
        out.push({
          type: "mcq",
          text: "Find the next number: 3, 8, 15, 24, ?",
          options: ["35", "34", "33", "32"],
          correct_index: 0,
          explanation: "+5, +7, +9, +11 → 35",
        });
        break;
      case "venn":
        out.push({
          type: "mcq",
          text: "Which Venn diagram fits: Students, Graduates, Engineers?",
          options: [
            "Engineers ⊆ Graduates; Students overlaps both",
            "All disjoint",
            "Students ⊆ Engineers ⊆ Graduates",
            "Graduates ⊆ Students; Engineers disjoint",
          ],
          correct_index: 0,
        });
        break;
      case "analytical":
        out.push({
          type: "mcq",
          text:
            "If every manager attends exactly two weekly meetings and there are 8 managers, minimum distinct meetings needed?",
          options: ["2", "4", "8", "16"],
          correct_index: 1,
        });
        break;
      case "blood_relations":
        out.push({
          type: "mcq",
          text:
            "Pointing to a photo, A says: 'He is the son of my grandfather’s only daughter.' How is the boy related to A?",
          options: ["Brother", "Cousin", "Uncle", "Nephew"],
          correct_index: 0,
        });
        break;
      case "direction":
        out.push({
          type: "mcq",
          text:
            "A walks 4m north, 3m east, 4m south, then 3m west. How far and in which direction from start?",
          options: ["0m (same point)", "2m east", "2m west", "1m north"],
          correct_index: 0,
        });
        break;
      default:
        out.push({
          type: "mcq",
          text: "Logical equivalence of ¬(A ∧ B) is __.",
          options: ["\u00A0\u00A0\u00A0\u00A0\u00ACA \u2228 \u00ACB", "A \u2228 B", "A \u2192 B", "\u00ACA \u2227 \u00ACB"],
          correct_index: 0,
        });
    }
  }
  return out;
}

// ------------------------------ CSV search paths (NEW) ------------------------------
/**
 * We try multiple likely folders & file names to find exam CSVs, so you can keep
 * files in:
 *   - server/data/exams/<slug>/exam_XX.csv
 *   - server/data/exams/<slug>/verbal_exam_XX.csv
 *   - server/data/exams/<slug>/logical_exam_XX.csv
 *   - server/data/verbals/exams/exam_XX.csv
 *   - server/seed/<slug>/exams/exam_XX.csv
 *   - server/seed/<slug>/exams/verbal_exam_XX.csv
 */
function candidateCsvPaths(slug, index) {
  const two = String(index).padStart(2, "0");
  const guessNames = [
    `exam_${two}.csv`,
    `verbal_exam_${two}.csv`,
    `logical_exam_${two}.csv`,
    `mock_${two}.csv`,
    `lr_exam_${two}.csv`,
  ];
  const roots = [
    path.join(__dirname, "data", "exams", slug),
    path.join(__dirname, "data", "exams"), // legacy root
    path.join(__dirname, "data", "verbals", "exams"),
    path.join(__dirname, "seed", slug, "exams"),
    path.join(__dirname, "seed", slug),
    path.join(__dirname, "seeds", slug, "exams"),
    path.join(__dirname, "seeds", slug),
  ];
  const out = [];
  for (const r of roots) {
    for (const name of guessNames) {
      out.push(path.join(r, name));
    }
  }
  return out;
}

async function findFirstExistingCsv(slug, index) {
  const cands = candidateCsvPaths(slug, index);
  for (const p of cands) {
    try {
      const st = await fs.stat(p).catch(() => null);
      if (st?.isFile()) return p;
    } catch {}
  }
  return null;
}

// ------------------------------ seeding per course ------------------------------
async function seedCourse(
  dbIgnored,
  { title, description, is_public = 0, slug, topicsDef, examTitlePrefix, examCount = 20, minutes = 90, freeCount = 0 },
  usersToGrant = []
) {
  const courseId = await upsertCourse(null, { title, description, is_public });

  // grant access
  for (const { id: uid } of usersToGrant) await grantAccess(null, uid, courseId, usersToGrant[0]?.id || null);

  // ensure canonical dir exists (not strictly required now, but kept)
  const courseDir = path.join(EXAMS_DIR, slug);
  await fs.mkdir(courseDir, { recursive: true }).catch(() => {});

  for (let i = 1; i <= examCount; i++) {
    const title = `${examTitlePrefix} ${String(i).padStart(2, "0")}`;
    const { exam_id, topics } = await upsertExam(null, {
      course_id: courseId,
      title,
      minutes,
      free: i <= freeCount,
      topicsDef,
    });

    const already = await countQuestions(null, exam_id);
    if (already >= 50) {
      console.log(`  ${title}: has ${already} Q — skipping insert`);
      continue;
    }

    // search widely for CSVs
    let inserted = 0;
    let rows = [];
    let csvPath = await findFirstExistingCsv(slug, i);

    try {
      if (!csvPath && slug === "soft_skills") {
        // soft-skills legacy support (server/data/exams/exam_XX.csv)
        const legacy = path.join(EXAMS_DIR, `exam_${String(i).padStart(2, "0")}.csv`);
        const st = await fs.stat(legacy).catch(() => null);
        if (st?.isFile()) csvPath = legacy;
      }

      if (csvPath) {
        rows = await loadCsv(csvPath, topicsDef);
      }
    } catch (e) {
      console.warn(`CSV read error for ${title}:`, e.message);
    }

    const pickGen = (slugName) =>
      slugName === "verbal_ability" ? genVerbal : slugName === "logical_reasoning" ? genLR : genSoft;

    if (rows.length) {
      // Ensure exactly 50 — slice or top-up evenly from groups
      let combined = rows.slice(0, 50);
      if (combined.length < 50) {
        const need = 50 - combined.length;
        const perTopicAdd = Math.max(1, Math.floor(need / topics.length));
        for (const t of topics) {
          if (combined.length >= 50) break;
          const extra = pickGen(slug)(t.slug, perTopicAdd);
          combined.push(...extra);
        }
        while (combined.length < 50) {
          const t = topics[combined.length % topics.length];
          combined.push(...pickGen(slug)(t.slug, 1));
        }
      }

      // Insert by resolved topic
      const mapTopicSlug = buildTopicSlugMapper(topicsDef);
      const byTopic = new Map();
      for (const q of combined) {
        const s = mapTopicSlug(q.topic_slug || q.topic || topicsDef[0].slug);
        if (!byTopic.has(s)) byTopic.set(s, []);
        byTopic.get(s).push(q);
      }
      for (const [slugKey, arr] of byTopic) {
        const t = topics.find((x) => x.slug === slugKey) || topics[0];
        await insertQuestions(null, exam_id, t.id, arr);
        inserted += arr.length;
      }
      console.log(`  ${title}: loaded ${inserted} Q from CSV (${path.relative(__dirname, csvPath)})`);
    } else {
      // generator fallback — ensure exactly 50 Q per exam
      const perTopic = Math.floor(50 / topics.length);
      let remaining = 50;
      for (const t of topics) {
        const n = Math.min(perTopic, remaining);
        const qs = pickGen(slug)(t.slug, n);
        await insertQuestions(null, exam_id, t.id, qs);
        inserted += qs.length;
        remaining -= n;
      }
      let idx = 0;
      while (inserted < 50) {
        const t = topics[idx % topics.length];
        const qs = pickGen(slug)(t.slug, 1);
        await insertQuestions(null, exam_id, t.id, qs);
        inserted += 1;
        idx++;
      }
      console.log(`  ${title}: generated ${inserted} sample questions`);
    }
  }

  return courseId;
}

// ------------------------------ main seed ------------------------------
async function seed() {
  await fs.mkdir(EXAMS_DIR, { recursive: true }).catch(() => {});

  // users
  const adminId = await upsertUser(null, {
    name: "Admin",
    email: "admin@softskills.pro",
    password: "J1@2e#3s0",
    role: "admin",
  });
  const u1 = await upsertUser(null, { name: "Aarav", email: "aarav@example.com", password: "pass123" });
  const u2 = await upsertUser(null, { name: "Isha", email: "isha@example.com", password: "pass123" });
  const u3 = await upsertUser(null, { name: "Rahul", email: "rahul@example.com", password: "pass123" });
  const u4 = await upsertUser(null, { name: "Neha", email: "neha@example.com", password: "pass123" });
  const grantList = [{ id: adminId }, { id: u1 }, { id: u2 }, { id: u3 }, { id: u4 }];

  // --- Soft Skills Mastery (existing/legacy) ---
  await seedCourse(
    null,
    {
      title: "Soft Skills Mastery",
      description: "20 mock tests (90Q each) with per-topic analytics.",
      is_public: 0,
      slug: "soft_skills",
      topicsDef: SOFTSKILLS_TOPICS,
      examTitlePrefix: "Soft Skills Mock Test",
      examCount: 20,
      minutes: 90,
      freeCount: 2,
    },
    grantList
  );

  // --- Verbal Ability ---
  await seedCourse(
    null,
    {
      title: "Verbal Ability",
      description:
        "Reading Comprehension, Grammar (Clauses, Tenses), Vocabulary, Para Jumbles, Cloze Test, Sentence Correction, Fill Blanks, Idioms/Phrases, One-word Substitutes, Verbal Reasoning.",
      is_public: 0,
      slug: "verbal_ability",
      topicsDef: VERBAL_TOPICS,
      examTitlePrefix: "Verbal Ability Mock Test",
      examCount: 20,
      minutes: 90,
      freeCount: 0,
    },
    grantList
  );

  // --- Logical Reasoning ---
  await seedCourse(
    null,
    {
      title: "Logical Reasoning",
      description:
        "Seating Arrangements, Puzzles, Syllogisms, Statements & Arguments, Coding–Decoding, Series, Venn Diagrams, Analytical Reasoning, Blood Relations, Direction Sense.",
      is_public: 0,
      slug: "logical_reasoning",
      topicsDef: LOGICAL_TOPICS,
      examTitlePrefix: "Logical Reasoning Mock Test",
      examCount: 20,
      minutes: 90,
      freeCount: 0,
    },
    grantList
  );

  // --- Quantitative Aptitude ---
  await seedCourse(
    null,
    {
      title: "Quantitative Aptitude",
      description:
        "Number System, Percentages, Profit & Loss, Average, Ratio & Proportion, Mixtures, Time & Work, Speed–Distance–Time, Pipes & Cisterns, Algebra, Geometry, Height & Distance, Mensuration, Co-ordinate Geometry, Permutations & Combinations, Probability, Simple & Compound Interest, Ages, Logs, Sets.",
      is_public: 0,
      slug: "quantitative_aptitude", // folder: server/data/exams/quantitative_aptitude
      topicsDef: QUANT_TOPICS,
      examTitlePrefix: "Quantitative Aptitude Mock Test",
      examCount: 20,
      minutes: 90,
      freeCount: 0,
    },
    grantList
  );

  console.log("Seeding complete.");
  // Optionally end pool in scripts
  await pool.end().catch(() => {});
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
