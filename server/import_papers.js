// server/import_papers.js
// Node 18+ (ESM). Imports /papers/exam_*.csv into SQLite.

import fs from "fs";
import path from "path";
import readline from "readline";
import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

sqlite3.verbose();
const db = new sqlite3.Database(path.join(__dirname, "data.db"));

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, function (err, row) {
      if (err) return reject(err);
      resolve(row);
    });
  });
}
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, function (err, rows) {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function parseCSVLine(line) {
  // Basic CSV parser for our fields (no external deps)
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQ = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') inQ = true;
      else if (ch === ",") {
        out.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
  }
  out.push(cur);
  return out;
}

async function ensureCourse() {
  const title = "Soft Skills Mastery";
  let course = await get("SELECT * FROM courses WHERE title=?", [title]);
  if (!course) {
    await run("INSERT INTO courses(title, description) VALUES(?,?)", [
      title,
      "Soft skills aptitude+quant+reasoning+verbal+logical — 20 mocks",
    ]);
    course = await get("SELECT * FROM courses WHERE title=?", [title]);
  }
  return course.id;
}

async function ensureTopics() {
  const topics = [
    { slug: "aptitude", name: "Aptitude" },
    { slug: "quant", name: "Quantitative Aptitude" },
    { slug: "reasoning", name: "Reasoning" },
    { slug: "verbal", name: "Verbal Ability" },
    { slug: "logical", name: "Logical Thinking" },
  ];
  for (const t of topics) {
    const row = await get("SELECT id FROM topics WHERE slug=?", [t.slug]);
    if (!row) {
      await run("INSERT INTO topics(slug, name) VALUES(?,?)", [t.slug, t.name]);
    }
  }
  const rows = await all("SELECT id, slug FROM topics");
  const map = new Map();
  for (const r of rows) map.set(r.slug, r.id);
  return map;
}

async function importCSV(filePath, courseId, topicMap) {
  const fileName = path.basename(filePath);
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  let header = null;
  let examId = null;
  let examTitle = null;
  let lineNum = 0;

  const tx = () => run("BEGIN;");
  const cx = () => run("COMMIT;");
  const rx = () => run("ROLLBACK;");

  await tx();
  try {
    for await (const line of rl) {
      lineNum++;
      if (!line.trim()) continue;
      const cols = parseCSVLine(line);

      if (!header) {
        header = cols.map((h) => h.trim());
        continue;
      }

      const row = {};
      header.forEach((h, i) => (row[h] = cols[i]));
      if (!examTitle) examTitle = row.exam_title?.trim() || fileName;

      // ensure exam only once
      if (examId === null) {
        await run(
          "INSERT INTO exams(course_id, title, duration_sec) VALUES(?,?,?)",
          [courseId, examTitle, 90 * 60]
        );
        const e = await get("SELECT id FROM exams WHERE course_id=? AND title=?", [courseId, examTitle]);
        examId = e.id;
      }

      const topicId = topicMap.get((row.topic_slug || "").trim());
      if (!topicId) {
        console.warn(`Unknown topic for line ${lineNum} in ${fileName}:`, row.topic_slug);
        continue;
      }

      // insert question
      const r = await run(
        `INSERT INTO questions(topic_id, type, text, options_json, answer, explanation, difficulty, tags)
         VALUES(?,?,?,?,?,?,?,?)`,
        [
          topicId,
          (row.type || "mcq").trim(),
          (row.text || "").trim(),
          (row.options_json || "[]").trim(),
          (row.answer || "").trim(),
          (row.explanation || "").trim(),
          (row.difficulty || "mixed").trim(),
          (row.tags || "").trim(),
        ]
      );
      const qid = r.lastID;
      await run("INSERT INTO exam_questions(exam_id, question_id) VALUES(?,?)", [examId, qid]);
    }
    await cx();
    console.log("Imported", fileName, "→ exam_id:", examId);
  } catch (e) {
    await rx();
    console.error("Import failed for", fileName, e);
  }
}

(async function main() {
  const courseId = await ensureCourse();
  const topicMap = await ensureTopics();

  const dir = path.join(__dirname, "papers");
  const files = fs
    .readdirSync(dir)
    .filter((f) => /^exam_\d+\.csv$/i.test(f))
    .sort();

  if (files.length === 0) {
    console.error("No CSV files found in /server/papers. Run `node generate_papers.js` first.");
    process.exit(1);
  }

  for (const f of files) {
    await importCSV(path.join(dir, f), courseId, topicMap);
  }
  console.log("✅ All CSV papers imported.");
  process.exit(0);
})();
