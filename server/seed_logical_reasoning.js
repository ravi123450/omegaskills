// server/seed_logical_reasoning.js
// Usage:
//   node server/seed_logical_reasoning.js
//     -> writes 20 CSVs (50 Q each) to ../data/exams/logical_reasoning
//   node server/seed_logical_reasoning.js --seed-db
//     -> also seeds your SQLite DB (server/data.db)

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";
sqlite3.verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------- config ----------------------------
const OUT_DIR = path.resolve(__dirname, "../data/exams/logical_reasoning");
const COURSE_TITLE = "Logical Reasoning";
const COURSE_DESC =
  "Seating Arrangements, Puzzles, Syllogisms, Statements & Arguments, Coding–Decoding, Series, Venn Diagrams, Analytical Reasoning, Blood Relations, Direction Sense.";
const EXAMS_COUNT = 20;
const QUESTIONS_PER_EXAM = 50;
const DURATION_MIN = 60;
const DB_PATH = path.resolve(__dirname, "../data.db");

// Global de-dup across exams (by topic+text)
const AVOID_GLOBAL_REPEATS = true;

// ---------------------------- utils ----------------------------
const rnd = (n) => Math.floor(Math.random() * n);
const pick = (arr) => arr[rnd(arr.length)];
const shuffle = (a) => a.map(v => [Math.random(), v]).sort((x,y)=>x[0]-y[0]).map(([,v])=>v);

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function csvEscape(s) { const str = String(s ?? ""); return /[",\n]/.test(str) ? `"${str.replace(/"/g,'""')}"` : str; }
function toCSV(rows, headers) {
  const head = headers.join(",");
  const lines = rows.map(r => headers.map(h => csvEscape(r[h])).join(","));
  return [head, ...lines].join("\n");
}
function mcq(options, correctIdx) { return { options: options.slice(), correct: correctIdx }; }
function normKey(q) { return (q.topic + "::" + q.text).toLowerCase().replace(/\s+/g," ").trim(); }

// Small helpers
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// ---------------------------- topic names (for CSV/UI) ----------------------------
const TOPIC = {
  SEATING: "Seating Arrangements",
  PUZZLES: "Puzzles",
  SYLLOGISM: "Syllogisms",
  STATEMENTS: "Statements & Arguments",
  CODING: "Coding–Decoding",
  SERIES: "Series",
  VENN: "Venn Diagrams",
  ANALYTICAL: "Analytical Reasoning",
  BLOOD: "Blood Relations",
  DIRECTION: "Direction Sense",
};

// ---------------------------- generators ----------------------------

// ---- Seating Arrangements (row, facing North) ----
function genSeating() {
  const n = 6 + 2 * rnd(2); // 6 or 8
  const people = LETTERS.slice(0, n);
  const order = shuffle(people.slice()); // left -> right
  const askType = rnd(3);
  let qText, correct, options;

  if (askType === 0) {
    const x = pick(order);
    const idx = order.indexOf(x);
    const k = 1 + rnd(2); // 1 or 2 to the right
    const tgt = idx + k < order.length ? order[idx + k] : null;
    if (!tgt) return genSeating(); // regenerate if out of bounds
    qText = `In a row of ${n} people facing North, the left-to-right order is:\n${order.join(", ")}.\nWho sits ${k === 1 ? "immediately" : `${k} seats`} to the right of ${x}?`;
    options = shuffle([tgt, ...shuffle(people.filter(p => p!==tgt)).slice(0,3)]);
    correct = options.indexOf(tgt);
  } else if (askType === 1) {
    const x = pick(order), y = pick(order.filter(p=>p!==x));
    const leftIdx = Math.min(order.indexOf(x), order.indexOf(y));
    const rightIdx = Math.max(order.indexOf(x), order.indexOf(y));
    if (rightIdx - leftIdx !== 2) {
      // force them to have someone between; if not, rebuild with controlled positions
      const arr = shuffle(people.slice());
      const A = arr[0], B = arr[1], C = arr[2];
      const base = [A, C, B, ...arr.slice(3)];
      qText = `In a row of ${n} people facing North, the left-to-right order is:\n${base.join(", ")}.\nWho sits between ${A} and ${B}?`;
      options = shuffle([C, ...shuffle(people.filter(p => p !== C)).slice(0,3)]);
      correct = options.indexOf(C);
    } else {
      const between = order[leftIdx+1];
      qText = `In a row of ${n} people facing North, the left-to-right order is:\n${order.join(", ")}.\nWho sits between ${x} and ${y}?`;
      options = shuffle([between, ...shuffle(people.filter(p => p !== between)).slice(0,3)]);
      correct = options.indexOf(between);
    }
  } else {
    const end = rnd(2) ? "left" : "right";
    const ans = end === "left" ? order[0] : order[order.length-1];
    qText = `In a row of ${n} people facing North, the left-to-right order is:\n${order.join(", ")}.\nWho is at the extreme ${end} end?`;
    options = shuffle([ans, ...shuffle(people.filter(p => p !== ans)).slice(0,3)]);
    correct = options.indexOf(ans);
  }

  return {
    text: qText,
    topic: TOPIC.SEATING,
    ...mcq(options, correct),
    explanation: "Read the fixed order carefully and map the required position."
  };
}

// ---- Puzzles (stack/line order queries) ----
function genPuzzle() {
  const n = 5 + rnd(2); // 5 or 6 boxes
  const labels = LETTERS.slice(0, n);
  const stack = shuffle(labels.slice());
  const askTop = rnd(2) === 0;
  let qText, ans;

  if (askTop) {
    const pos = 1 + rnd(2); // 1 or 2 from top
    ans = stack[stack.length - pos];
    qText = `Boxes ${labels.join(", ")} are stacked from bottom to top as:\n${stack.join(" < ")} (left is bottom, right is top).\nWhich box is ${pos === 1 ? "on the top" : `the ${pos}nd from the top`}?`;
  } else {
    const pos = 1 + rnd(2); // 1 or 2 from bottom
    ans = stack[pos - 1];
    qText = `Boxes ${labels.join(", ")} are stacked from bottom to top as:\n${stack.join(" < ")} (left is bottom, right is top).\nWhich box is ${pos === 1 ? "at the bottom" : `the ${pos}nd from the bottom`}?`;
  }
  const options = shuffle([ans, ...shuffle(labels.filter(x=>x!==ans)).slice(0,3)]);
  return {
    text: qText,
    topic: TOPIC.PUZZLES,
    ...mcq(options, options.indexOf(ans)),
    explanation: "Trace positions carefully from the declared bottom/top."
  };
}

// ---- Syllogisms (parametric nouns) ----
const NOUNS = ["poets","teachers","artists","doctors","players","leaders","drivers","singers","readers","students","engineers","gardeners","pilots","chefs","dancers","scientists"];
function genSyllogism() {
  // Template: All X are Y. Some Y are Z. -> Some X may be Z (follows).
  const X = pick(NOUNS), Y = pick(NOUNS.filter(w=>w!==X)), Z = pick(NOUNS.filter(w=>w!==X && w!==Y));
  const stmt = `All ${X} are ${Y}. Some ${Y} are ${Z}.`;
  const q = "Which conclusion follows?";
  const options = [
    `Some ${X} may be ${Z}.`,
    `All ${Z} are ${X}.`,
    `No ${X} is ${Z}.`,
    `Some ${Z} are ${X}.`
  ];
  const correct = 0;
  return {
    text: `${stmt}\n${q}`,
    topic: TOPIC.SYLLOGISM,
    ...mcq(options, correct),
    explanation: "From All X⊆Y and Some Y∩Z ≠ ∅, it is possible (may be) that Some X are Z."
  };
}

// ---- Statements & Arguments ----
function genStatementsArguments() {
  const themes = [
    {
      stmt: "Should public transport fares be reduced in big cities?",
      A1: "Yes, it will reduce private vehicle usage and congestion.",
      A2: "No, it will burden the government budget heavily.",
      correct: 2 // Both strong
    },
    {
      stmt: "Should school homework be abolished for primary classes?",
      A1: "Yes, children should spend time on play and social skills.",
      A2: "No, homework builds a routine and responsibility.",
      correct: 2
    },
    {
      stmt: "Should shops be allowed to open 24/7?",
      A1: "Yes, it increases convenience and economic activity.",
      A2: "No, it may exploit workers and increase operational costs.",
      correct: 2
    },
    {
      stmt: "Should single-use plastics be banned?",
      A1: "Yes, they cause long-term environmental damage.",
      A2: "No, they are cheaper and convenient for consumers.",
      correct: 0 // Only I is strong
    }
  ];
  const t = pick(themes);
  const variants = [
    "Only Argument I is strong",
    "Only Argument II is strong",
    "Both I and II are strong",
    "Neither I nor II is strong",
  ];
  return {
    text: `Statement: ${t.stmt}\nArguments:\nI. ${t.A1}\nII. ${t.A2}\nWhich is strong?`,
    topic: TOPIC.STATEMENTS,
    ...mcq(variants, t.correct),
    explanation: "Judge relevance, breadth and impact; avoid personal bias."
  };
}

// ---- Coding–Decoding (sum of alphabet positions) ----
const alphaPos = (w) => w.toUpperCase().split("").reduce((s,ch)=>s+("ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(ch)+1),0);
function genCoding() {
  // Show one mapping, ask another
  const words = ["CAT","DOG","CODE","LOGIC","BRAIN","QUIZ","MATH","SERIES","PUZZLE","ARRAY","STACK","QUEUE"];
  const given = pick(words);
  const ask = pick(words.filter(w=>w!==given));
  const givenVal = alphaPos(given);
  const askVal = alphaPos(ask);
  const distract = Array.from(new Set([askVal + 1, askVal - 1, askVal + 2, askVal - 2]))
                        .filter(x=>x>0).slice(0,3);
  const options = shuffle([askVal, ...distract]).map(String);
  return {
    text: `In a certain code, the value of a word is the sum of its letter positions (A=1, B=2, ...).\nIf "${given}" is written as ${givenVal}, what is "${ask}" written as?`,
    topic: TOPIC.CODING,
    ...mcq(options, options.indexOf(String(askVal))),
    explanation: "Add alphabet positions of letters in the word."
  };
}

// ---- Series (AP/GP/alternating) ----
function genSeries() {
  const type = rnd(3);
  let seq = [], next, explanation;
  if (type === 0) {
    // AP
    const a = 5 + rnd(10), d = 2 + rnd(6), len = 5;
    for (let i=0;i<len;i++) seq.push(a + i*d);
    next = a + len*d;
    explanation = `Arithmetic progression with common difference ${d}.`;
  } else if (type === 1) {
    // GP
    const a = 2 + rnd(5), r = 2 + rnd(3), len = 5;
    for (let i=0;i<len;i++) seq.push(a * (r**i));
    next = a * (r**len);
    explanation = `Geometric progression with ratio ${r}.`;
  } else {
    // Alternating +p, -q
    const a = 10 + rnd(10), p = 3 + rnd(4), q = 1 + rnd(3);
    seq = [a, a+p, a+p-q, a+2*p-q, a+2*p-2*q];
    next = a+3*p-2*q;
    explanation = `Alternating +${p}, -${q}.`;
  }
  const opts = Array.from(new Set([next, next+1, next-1, next+2])).slice(0,4);
  const options = shuffle(opts.map(String));
  return {
    text: `Find the next number: ${seq.join(", ")} , ?`,
    topic: TOPIC.SERIES,
    ...mcq(options, options.indexOf(String(next))),
    explanation
  };
}

// ---- Venn Diagrams (two-set counts) ----
function genVenn() {
  const total = 80 + rnd(31);    // 80..110
  const tea = 30 + rnd(31);      // 30..60
  const coffee = 25 + rnd(31);   // 25..55
  const both = Math.max(5, Math.min(tea, coffee) - (5 + rnd(10))); // ensure feasible overlap
  const qType = rnd(3);
  let qText, ans;

  if (qType === 0) {
    ans = tea - both;
    qText = `In a group of ${total} people, ${tea} like Tea, ${coffee} like Coffee, and ${both} like both.\nHow many like only Tea?`;
  } else if (qType === 1) {
    ans = coffee - both;
    qText = `In a group of ${total} people, ${tea} like Tea, ${coffee} like Coffee, and ${both} like both.\nHow many like only Coffee?`;
  } else {
    ans = tea + coffee - both;
    qText = `In a group of ${total} people, ${tea} like Tea, ${coffee} like Coffee, and ${both} like both.\nHow many like at least one of Tea or Coffee?`;
  }
  const options = shuffle([ans, ans+2, Math.max(0,ans-2), ans+1]).map(String);
  return {
    text: qText,
    topic: TOPIC.VENN,
    ...mcq(options, options.indexOf(String(ans))),
    explanation: "Use inclusion–exclusion: only Tea = Tea−Both; only Coffee = Coffee−Both; at least one = Tea+Coffee−Both."
  };
}

// ---- Analytical Reasoning (simple data comparison) ----
function genAnalytical() {
  const names = shuffle(["Aman","Bela","Chirag","Dia","Eshan"]).slice(0,3);
  const scores = shuffle([65+rnd(21), 65+rnd(21), 65+rnd(21)]); // 65..85
  // Ensure distinct by small adjustments
  for (let i=1;i<3;i++) if (scores[i]===scores[i-1]) scores[i]++;
  const arr = names.map((n,i)=>({n, s:scores[i]})).sort((x,y)=>y.s-x.s);
  const qType = rnd(2);
  let question, ans;
  if (qType === 0) {
    question = "Who scored the highest?";
    ans = arr[0].n;
  } else {
    question = "Who scored the second highest?";
    ans = arr[1].n;
  }
  const options = shuffle(arr.map(x=>x.n));
  return {
    text: `In a test, the scores are:\n${names[0]}=${scores[0]}, ${names[1]}=${scores[1]}, ${names[2]}=${scores[2]}.\n${question}`,
    topic: TOPIC.ANALYTICAL,
    ...mcq(options, options.indexOf(ans)),
    explanation: "Compare the given numbers."
  };
}

// ---- Blood Relations ----
function genBloodRelations() {
  // Template family of 3-4 people
  const males = ["Arun","Bharat","Chetan","Deep","Eshan"];
  const females = ["Anita","Bhavya","Chitra","Divya","Esha"];
  const F = pick(females), M = pick(males.filter(x=>x!==F));
  const S = pick(males.filter(x=>x!==M));
  const D = pick(females.filter(x=>x!==F));
  const type = rnd(2);
  let text, ans;

  if (type === 0) {
    text = `${S} is the son of ${M}. ${D} is the sister of ${S}. How is ${D} related to ${M}?`;
    ans = "Daughter";
  } else {
    text = `${F} is the mother of ${S}. ${M} is the husband of ${F}. How is ${M} related to ${S}?`;
    ans = "Father";
  }
  const options = shuffle([ans, "Mother", "Brother", "Uncle"]);
  return {
    text,
    topic: TOPIC.BLOOD,
    ...mcq(options, options.indexOf(ans)),
    explanation: "Map roles carefully from the statements."
  };
}

// ---- Direction Sense ----
function genDirection() {
  // Moves on grid, ask final direction from start
  let x=0, y=0;
  const steps = [2+rnd(5), 2+rnd(5), 2+rnd(5)];
  // N-E-S/W random pattern
  const dirs = shuffle(["North","East","South","West"]).slice(0,3);
  for (let i=0;i<3;i++) {
    const d = dirs[i], k = steps[i];
    if (d==="North") y += k;
    if (d==="South") y -= k;
    if (d==="East")  x += k;
    if (d==="West")  x -= k;
  }
  const dx = x, dy = y;
  let ansDir = "Same place";
  if (dx===0 && dy>0) ansDir="North";
  else if (dx===0 && dy<0) ansDir="South";
  else if (dy===0 && dx>0) ansDir="East";
  else if (dy===0 && dx<0) ansDir="West";
  else if (dx>0 && dy>0) ansDir="North-East";
  else if (dx<0 && dy>0) ansDir="North-West";
  else if (dx>0 && dy<0) ansDir="South-East";
  else if (dx<0 && dy<0) ansDir="South-West";

  const candidates = ["North","South","East","West","North-East","North-West","South-East","South-West","Same place"];
  const options = shuffle([ansDir, ...shuffle(candidates.filter(c=>c!==ansDir)).slice(0,3)]);
  const stepsText = dirs.map((d,i)=>`${steps[i]} units ${d}`).join(", then ");
  return {
    text: `A person starts from a point, walks ${stepsText}. In which direction is the person from the starting point now?`,
    topic: TOPIC.DIRECTION,
    ...mcq(options, options.indexOf(ansDir)),
    explanation: "Resolve x/y displacement and convert to compass direction."
  };
}

// ---------------------------- exam builder ----------------------------
function buildExamQuestions(globalSeen) {
  const q = [];
  const seen = new Set();
  const seenAll = globalSeen || new Set();

  const tryPush = (maker, maxTries = 20) => {
    for (let t=0; t<maxTries; t++) {
      const item = maker();
      const key = normKey(item);
      if (seen.has(key)) continue;
      if (AVOID_GLOBAL_REPEATS && seenAll.has(key)) continue;
      seen.add(key);
      seenAll.add(key);
      q.push(item);
      return true;
    }
    return false;
  };

  // Distribution (sum = 50)
  const plan = [
    [TOPIC.SEATING, 6, genSeating],
    [TOPIC.PUZZLES, 6, genPuzzle],
    [TOPIC.SYLLOGISM, 6, genSyllogism],
    [TOPIC.STATEMENTS, 6, genStatementsArguments],
    [TOPIC.CODING, 6, genCoding],
    [TOPIC.SERIES, 8, genSeries],
    [TOPIC.VENN, 4, genVenn],
    [TOPIC.ANALYTICAL, 4, genAnalytical],
    [TOPIC.BLOOD, 2, genBloodRelations],
    [TOPIC.DIRECTION, 2, genDirection],
  ];

  for (const [, count, maker] of plan) {
    for (let i=0;i<count;i++) tryPush(maker);
  }

  // Safety top-up (shouldn't trigger)
  let guard = 0;
  while (q.length < QUESTIONS_PER_EXAM && guard < 1000) {
    tryPush(genSeries); // series has high variance; use as filler
    guard++;
  }

  return q.slice(0, QUESTIONS_PER_EXAM);
}

// ---------------------------- CSV writer ----------------------------
function writeCSVForExam(examIndex, questions) {
  ensureDir(OUT_DIR);
  const rows = questions.map((qq, i) => ({
    id: i + 1,
    text: qq.text,
    type: "mcq",
    options_json: JSON.stringify(qq.options),
    correct_index: qq.correct,
    explanation: qq.explanation || "",
    topic: qq.topic,
    difficulty: "mixed",
  }));
  const headers = ["id","text","type","options_json","correct_index","explanation","topic","difficulty"];
  const csv = toCSV(rows, headers);
  const file = path.join(OUT_DIR, `logical_exam_${String(examIndex).padStart(2,"0")}.csv`);
  fs.writeFileSync(file, csv, "utf-8");
  return file;
}

// ---------------------------- optional DB seed ----------------------------
async function seedDB(allExams) {
  console.log("Seeding SQLite DB…", DB_PATH);
  const db = new sqlite3.Database(DB_PATH);
  const run = (sql, p=[]) => new Promise((res, rej) => db.run(sql, p, function(err){ err?rej(err):res(this); }));
  const get = (sql, p=[]) => new Promise((res, rej) => db.get(sql, p, (err,row)=> err?rej(err):res(row)));

  // tag so question text is unique even if generators collide
  const tagForDB = (ex, i) => `\n[LR ex${String(ex).padStart(2,"0")} q${String(i+1).padStart(2,"0")}]`;

  try {
    let course = await get("SELECT id FROM courses WHERE title = ?", [COURSE_TITLE]);
    if (!course) {
      const r = await run("INSERT INTO courses(title, description, cover, is_public) VALUES(?,?,?,?)",
        [COURSE_TITLE, COURSE_DESC, null, 1]);
      course = { id: r.lastID };
    }

    for (let ex=1; ex<=EXAMS_COUNT; ex++){
      const title = `Logical Reasoning Test #${String(ex).padStart(2,"0")}`;

      const examRow = await run(
        "INSERT OR IGNORE INTO exams(course_id, title, duration_sec, config_json) VALUES(?,?,?,?)",
        [course.id, title, DURATION_MIN*60, JSON.stringify({})]
      );
      let examId = examRow.lastID;
      if (!examId) {
        const row = await get("SELECT id FROM exams WHERE course_id=? AND title=?", [course.id, title]);
        examId = row?.id;
      }
      if (!examId) throw new Error("Failed to create or find exam row");

      await run("BEGIN");
      try {
        const qs = allExams[ex-1];
        for (let i=0; i<qs.length; i++) {
          const qq = qs[i];
          const textForDB = qq.text + tagForDB(ex, i);
          const r = await run(
            `INSERT INTO questions(text, type, options_json, correct_index, explanation, difficulty, topic_id, exam_id)
             VALUES(?,?,?,?,?,?,NULL,?)`,
            [textForDB, "mcq", JSON.stringify(qq.options), qq.correct, qq.explanation||"", "mixed", examId]
          );
          const qid = r.lastID;
          await run("INSERT INTO exam_questions(exam_id, question_id) VALUES(?,?)", [examId, qid]);
        }
        await run("COMMIT");
        console.log(`Seeded exam ${ex} -> ${title}`);
      } catch (err) {
        await run("ROLLBACK");
        console.error(`Exam ${ex} failed:`, err.message);
      }
    }

    console.log("DB seed complete.");
  } catch (e) {
    console.error("DB seed error (outer):", e.message);
  } finally {
    db.close();
  }
}

// ---------------------------- main ----------------------------
(async function main() {
  console.log("OUT_DIR:", OUT_DIR);
  ensureDir(OUT_DIR);

  const globalSeen = new Set();
  const allExams = [];

  for (let i=1;i<=EXAMS_COUNT;i++){
    const qs = buildExamQuestions(AVOID_GLOBAL_REPEATS ? globalSeen : null);
    allExams.push(qs);
    const file = writeCSVForExam(i, qs);
    console.log(`Wrote ${file} (${qs.length} Q)`);
  }

  if (process.argv.includes("--seed-db")) await seedDB(allExams);
  console.log(`Done. Created ${EXAMS_COUNT} CSV files with ${QUESTIONS_PER_EXAM} questions each.`);
})();
