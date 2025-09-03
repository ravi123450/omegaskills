// server/scripts/seed_verbal_ability.js
// Usage:
//   node server/scripts/seed_verbal_ability.js             -> only writes CSVs (20 files, 50 Q each)
//   node server/scripts/seed_verbal_ability.js --seed-db   -> also seeds your SQLite (server/data.db)

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";
sqlite3.verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------- config ----------------------------
const OUT_DIR = path.join(__dirname, "..see/verbal_ability");
const COURSE_TITLE = "Verbal Ability";
const COURSE_DESC =
  "Comprehensive Verbal Ability: Reading Comprehension, Grammar, Vocabulary, Para Jumbles, Cloze, Sentence Correction, Fill Blanks, Idioms/Phrases, One-word Substitutes, Verbal Reasoning.";
const EXAMS_COUNT = 20;
const QUESTIONS_PER_EXAM = 50;
const DURATION_MIN = 60;
const DB_PATH = path.join(__dirname, "../data.db");

// ---------------------------- utils ----------------------------
const rnd = (n) => Math.floor(Math.random() * n);
const shuffle = (a) => a.map(v => [Math.random(), v]).sort((x,y)=>x[0]-y[0]).map(([,v])=>v);

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function csvEscape(s) { const str = String(s ?? ""); return /[",\n]/.test(str) ? `"${str.replace(/"/g,'""')}"` : str; }
function toCSV(rows, headers) {
  const head = headers.join(",");
  const lines = rows.map(r => headers.map(h => csvEscape(r[h])).join(","));
  return [head, ...lines].join("\n");
}

// Helpers to draw WITHOUT replacement per exam
function drawNoRep(arr, usedSet) {
  const free = arr.map((_,i)=>i).filter(i=>!usedSet.has(i));
  if (!free.length) return null;
  const ix = free[rnd(free.length)];
  usedSet.add(ix);
  return arr[ix];
}
function normKey(q) {
  // normalize by topic + text only (options can be in different order)
  return (q.topic + "::" + q.text)
    .toLowerCase()
    .replace(/\s+/g," ")
    .trim();
}
function uniquePush(bucket, q, seen) {
  const key = normKey(q);
  if (seen.has(key)) return false;
  seen.add(key);
  bucket.push(q);
  return true;
}

// ---------------------------- topic registry ----------------------------
const TOPICS = [
  { name: "Reading Comprehension", slug: "rc", section: "Verbal Ability" },
  { name: "Grammar", slug: "grammar", section: "Verbal Ability" },
  { name: "Vocabulary", slug: "vocabulary", section: "Verbal Ability" },
  { name: "Para Jumbles", slug: "para-jumbles", section: "Verbal Ability" },
  { name: "Cloze Test", slug: "cloze-test", section: "Verbal Ability" },
  { name: "Sentence Correction", slug: "sentence-correction", section: "Verbal Ability" },
  { name: "Fill in the Blanks", slug: "fill-blanks", section: "Verbal Ability" },
  { name: "Idioms & Phrases", slug: "idioms", section: "Verbal Ability" },
  { name: "One-word Substitutes", slug: "one-word", section: "Verbal Ability" },
  { name: "Verbal Reasoning", slug: "verbal-reasoning", section: "Verbal Ability" },
];

// ---------------------------- content pools (expanded) ----------------------------
const SYN_ANT_PAIRS = [
  { base: "abundant", syn: "plentiful", ant: "scarce" },
  { base: "candid", syn: "frank", ant: "evasive" },
  { base: "arduous", syn: "difficult", ant: "easy" },
  { base: "benevolent", syn: "kind", ant: "malicious" },
  { base: "concise", syn: "brief", ant: "verbose" },
  { base: "diligent", syn: "hardworking", ant: "lazy" },
  { base: "eloquent", syn: "persuasive", ant: "inarticulate" },
  { base: "frugal", syn: "thrifty", ant: "extravagant" },
  { base: "impartial", syn: "neutral", ant: "biased" },
  { base: "prudent", syn: "careful", ant: "reckless" },
  { base: "vivid", syn: "clear", ant: "dull" },
  { base: "tranquil", syn: "calm", ant: "agitated" },
  { base: "meticulous", syn: "precise", ant: "careless" },
  { base: "succinct", syn: "concise", ant: "wordy" },
  { base: "amiable", syn: "friendly", ant: "hostile" },
];

const DISTRACTORS = [
  "colorful","massive","infrequent","peculiar","trivial","obsolete","meagre","luminous",
  "tedious","elusive","swift","boisterous","cumbersome","coarse","ardent","brisk","sturdy","docile","vague","harsh",
];

const ONE_WORD = [
  { clue: "A person who loves books", ans: "Bibliophile" },
  { clue: "A person who talks too much", ans: "Loquacious" },
  { clue: "One who does something for the first time", ans: "Pioneer" },
  { clue: "A speech delivered without preparation", ans: "Impromptu" },
  { clue: "A government by a few", ans: "Oligarchy" },
  { clue: "A cure for all diseases", ans: "Panacea" },
  { clue: "A handwriting expert", ans: "Graphologist" },
  { clue: "One who believes pleasure is the highest good", ans: "Hedonist" },
  { clue: "One who eats human flesh", ans: "Cannibal" },
  { clue: "One who studies ancient things", ans: "Archaeologist" },
];

const IDIOMS = [
  { id: "Once in a blue moon", mean: "Very rarely" },
  { id: "Beat around the bush", mean: "Avoid the main topic" },
  { id: "Break the ice", mean: "Make people feel more comfortable" },
  { id: "Hit the sack", mean: "Go to sleep" },
  { id: "Spill the beans", mean: "Reveal a secret" },
  { id: "On the fence", mean: "Undecided" },
  { id: "In a nutshell", mean: "In brief" },
  { id: "Costs an arm and a leg", mean: "Very expensive" },
  { id: "Bite the bullet", mean: "Face a difficult situation" },
  { id: "Call it a day", mean: "Stop working on something" },
];

// Instead of 5, create procedural Grammar stems to avoid repeats
const GRAMMAR_VERBS = [
  { base: "go", third: "goes", past: "went", prog: "going", perf: "gone" },
  { base: "finish", third: "finishes", past: "finished", prog: "finishing", perf: "finished" },
  { base: "play", third: "plays", past: "played", prog: "playing", perf: "played" },
  { base: "start", third: "starts", past: "started", prog: "starting", perf: "started" },
  { base: "have", third: "has", past: "had", prog: "having", perf: "had" },
  { base: "do", third: "does", past: "did", prog: "doing", perf: "done" },
  { base: "arrive", third: "arrives", past: "arrived", prog: "arriving", perf: "arrived" },
  { base: "plan", third: "plans", past: "planned", prog: "planning", perf: "planned" },
  { base: "contain", third: "contains", past: "contained", prog: "containing", perf: "contained" },
  { base: "review", third: "reviews", past: "reviewed", prog: "reviewing", perf: "reviewed" },
];

const CORRECTION_PAIRS = [
  { wrong: "Each of the boys have a pen.", right: "Each of the boys has a pen." },
  { wrong: "She do not like tea.", right: "She does not like tea." },
  { wrong: "He is senior than me.", right: "He is senior to me." },
  { wrong: "Neither of the two are correct.", right: "Neither of the two is correct." },
  { wrong: "The sceneries here are beautiful.", right: "The scenery here is beautiful." },
  { wrong: "He is living here since 2010.", right: "He has been living here since 2010." },
  { wrong: "I am knowing the answer.", right: "I know the answer." },
  { wrong: "These kind of mistakes are common.", right: "This kind of mistake is common." },
  { wrong: "Less students attended the class.", right: "Fewer students attended the class." },
  { wrong: "Neither Ram nor Shyam are here.", right: "Neither Ram nor Shyam is here." },
];

const REASONING_SNIPPETS = [
  { stmt: "All poets are dreamers. Some dreamers are teachers.",
    q: "Which conclusion follows?",
    options: ["Some poets may be teachers.","All dreamers are poets.","No teacher is a poet.","Some teachers are not dreamers."],
    correct: 0
  },
  { stmt: "No apples are blue. Some fruits are apples.",
    q: "Which conclusion follows?",
    options: ["Some fruits are not blue.","All fruits are blue.","Some apples are blue.","No fruits are blue."],
    correct: 0
  },
  { stmt: "Some books are heavy. All heavy things sink.",
    q: "Which conclusion follows?",
    options: ["Some books may sink.","All books sink.","No book sinks.","Books are never heavy."],
    correct: 0
  },
  { stmt: "All athletes are disciplined. No undisciplined person is a leader.",
    q: "Which conclusion follows?",
    options: ["Some leaders are athletes.","All leaders are athletes.","Athletes cannot be leaders.","A disciplined person can be a leader."],
    correct: 3
  }
];

// 5 RC passages (3 Q each)
const RC_PASSAGES = [
  {
    para: "The city introduced a weekly car-free hour on major roads to encourage walking and cycling. Local shops reported higher footfall, while residents noted clearer air and a calmer soundscape.",
    qa: [
      { q: "Primary purpose of the measure?", options: ["Reduce noise","Encourage active travel","Lower taxes","Increase tourism"], a: 1 },
      { q: "Immediate effect on shops?", options: ["Lower sales","No change","Higher footfall","Closed early"], a: 2 },
      { q: "Residents mainly noticed:", options: ["More traffic","Clearer air","Longer commutes","Heavier rainfall"], a: 1 },
    ]
  },
  {
    para: "A small library launched a 'take-a-book, leave-a-book' shelf. Over time, readers curated the shelf with diverse titles, and the habit built a friendly ritual around sharing stories.",
    qa: [
      { q: "The shelf policy was:", options: ["Paid borrowing","Members-only","Take & leave","No returns"], a: 2 },
      { q: "Result of the initiative?", options: ["Less diversity","Fewer visits","Hostile debates","Friendly ritual"], a: 3 },
      { q: "Who curated the shelf?", options: ["Publishers","Librarians only","Readers","Sponsors"], a: 2 },
    ]
  },
  {
    para: "An urban farm turned unused rooftops into vegetable patches. Volunteers learned soil care and irrigation, and nearby schools used the site for hands-on lessons about food systems.",
    qa: [
      { q: "What did rooftops become?", options:["Solar fields","Vegetable patches","Playgrounds","Parking"], a:1 },
      { q: "Who learned soil care?", options:["Tourists","Volunteers","Vendors","Police"], a:1 },
      { q: "Schools used the site for:", options:["Sports","Food-system lessons","Parking","Cafeterias"], a:1 }
    ]
  },
  {
    para: "A science museum scheduled short 'demo hours' where staff explained one concept with simple props. Visitors stayed longer at these stations and reported better understanding.",
    qa: [
      { q: "What are 'demo hours'?", options:["Long lectures","Snack breaks","Short concept demos","Movie shows"], a:2 },
      { q: "Visitor behavior:", options:["Left quickly","Stayed longer","Avoided stations","Ignored staff"], a:1 },
      { q: "Effect on understanding:", options:["Worse","No change","Better","Unknown"], a:2 }
    ]
  },
  {
    para: "A coastal town mapped its flood-prone lanes and installed raised walkways for the rainy season. The plan kept markets open and allowed emergency services to navigate safely.",
    qa: [
      { q: "Why raised walkways?", options:["Decoration","Festival","Rainy-season access","Tourism"], a:2 },
      { q: "Markets:", options:["Closed often","Stayed open","Moved inland","Were demolished"], a:1 },
      { q: "Emergency services could:", options:["Avoid the town","Navigate safely","Only use boats","Do nothing"], a:1 }
    ]
  }
];

// 3 Cloze passages
const CLOZE_PASSAGES = [
  {
    text: "Good writing {1} from clear thinking. When ideas are {2}, sentences become {3} and the message {4}. With practice, writers {5} their craft and {6} their audience with clarity and {7}.",
    keys: [
      { correct: "flows", wrong: ["fly","flew","flown"] },
      { correct: "ordered", wrong: ["ordering","orders","order"] },
      { correct: "precise", wrong: ["precisely","precision","precis"] },
      { correct: "lands", wrong: ["lend","lands on","landing"] },
      { correct: "hone", wrong: ["hone in","hone up","honed"] },
      { correct: "serve", wrong: ["service","serves","served"] },
      { correct: "effect", wrong: ["affect","effective","effects"] },
    ]
  },
  {
    text: "The committee {1} to publish its findings after all data {2}. While the summary is {3}, the full report {4} technical details that {5} careful reading and {6}.",
    keys: [
      { correct: "plans", wrong: ["plan","planned","planning"] },
      { correct: "arrives", wrong: ["arrive","arrived","arriving"] },
      { correct: "accessible", wrong: ["access","accessed","accessing"] },
      { correct: "contains", wrong: ["contain","contained","containing"] },
      { correct: "require", wrong: ["requires","required","requiring"] },
      { correct: "review", wrong: ["reviewed","reviews","reviewing"] },
    ]
  },
  {
    text: "When teams {1} goals early, they {2} momentum. Regular check-ins {3} issues quickly, {4} delays. Clear roles {5} confusion and {6} ownership across members.",
    keys: [
      { correct: "set", wrong: ["sets","setting","settle"] },
      { correct: "build", wrong: ["built","builds","building"] },
      { correct: "surface", wrong: ["surfaced","surfaces","surfacing"] },
      { correct: "reducing", wrong: ["reduce","reduces","reduced"] },
      { correct: "reduce", wrong: ["reduces","reducing","reduced"] },
      { correct: "increase", wrong: ["increases","increasing","increased"] },
    ]
  },
];

// ---------------------------- generators ----------------------------
function mcq(options, correctIdx) {
  const opts = options.slice();
  return { options: opts, correct: correctIdx };
}

function genSynonym(pair) {
  const wrongs = shuffle(DISTRACTORS).slice(0,3);
  const options = shuffle([pair.syn, ...wrongs]);
  const correct = options.indexOf(pair.syn);
  return {
    text: `Choose the synonym of “${pair.base}”.`,
    topic: "Vocabulary",
    ...mcq(options, correct),
    explanation: `“${pair.syn}” means nearly the same as “${pair.base}”.`,
  };
}

function genAntonym(pair) {
  const wrongs = shuffle(DISTRACTORS).slice(0,3);
  const options = shuffle([pair.ant, ...wrongs]);
  const correct = options.indexOf(pair.ant);
  return {
    text: `Choose the antonym of “${pair.base}”.`,
    topic: "Vocabulary",
    ...mcq(options, correct),
    explanation: `“${pair.ant}” is the opposite of “${pair.base}”.`,
  };
}

function genOneWord(it) {
  const wrongs = shuffle(ONE_WORD.map(x => x.ans).filter(x => x !== it.ans)).slice(0,3);
  const options = shuffle([it.ans, ...wrongs]);
  return {
    text: `One-word substitute: ${it.clue}`,
    topic: "One-word Substitutes",
    ...mcq(options, options.indexOf(it.ans)),
    explanation: `${it.ans} fits the description.`,
  };
}

function genIdiom(it) {
  const wrongs = shuffle(IDIOMS.map(x => x.mean).filter(x => x !== it.mean)).slice(0,3);
  const options = shuffle([it.mean, ...wrongs]);
  return {
    text: `Meaning of the idiom: “${it.id}”`,
    topic: "Idioms & Phrases",
    ...mcq(options, options.indexOf(it.mean)),
    explanation: `“${it.id}” means “${it.mean}”.`,
  };
}

// Procedural grammar/tense generator — builds many unique stems
function genTenseFillProc() {
  const subjects = [
    { s: "I", form: "base" }, { s: "You", form: "base" }, { s: "We", form: "base" }, { s: "They", form: "base" },
    { s: "She", form: "third" }, { s: "He", form: "third" }, { s: "The team", form: "third" }, { s: "The committee", form: "third" }
  ];
  const t = GRAMMAR_VERBS[rnd(GRAMMAR_VERBS.length)];
  const subj = subjects[rnd(subjects.length)];

  const templates = [
    { base: `${subj.s} ____ to the market every Sunday.`, correct: subj.form==="third" ? t.third : t.base, wrong: [t.base, t.prog, t.perf].filter(x=>x!==(subj.form==="third"?t.third:t.base)).slice(0,3) },
    { base: `They ____ the task by 6 PM yesterday.`, correct: t.past, wrong: [t.base, t.third, t.prog].slice(0,3) },
    { base: `${subj.s} ____ the project next week.`, correct: "will " + t.base, wrong: [t.starts||t.third||"starts", `${t.base}`, `${t.perf}`].map(x=>String(x)) },
    { base: `We ____ dinner when he arrived.`, correct: "were " + t.prog, wrong: ["are " + t.prog, "had " + t.perf, "have " + t.perf] },
  ];
  const it = templates[rnd(templates.length)];
  const opts = Array.from(new Set([it.correct, ...it.wrong])).slice(0,4); // dedupe
  const options = shuffle(opts);
  return {
    text: it.base.replace("____", "_____"),
    topic: "Grammar",
    ...mcq(options, options.indexOf(it.correct)),
    explanation: `Correct tense is “${it.correct}”.`,
  };
}

function genCorrection(it) {
  const opts = shuffle([it.right, it.wrong, it.wrong.replace(/\s+/, "  "), it.right.toLowerCase()]);
  return {
    text: "Choose the grammatically correct sentence:",
    topic: "Sentence Correction",
    ...mcq(opts, opts.indexOf(it.right)),
    explanation: `Correct form: “${it.right}”.`,
  };
}

function genReasoning(it) {
  return {
    text: `${it.stmt}\n${it.q}`,
    topic: "Verbal Reasoning",
    ...mcq(it.options, it.correct),
    explanation: "Basic syllogism/logic.",
  };
}

function genRCSet(p) {
  return p.qa.map(({ q, options, a }) => ({
    text: `Passage:\n${p.para}\n\nQ: ${q}`,
    topic: "Reading Comprehension",
    ...mcq(options, a),
    explanation: "Answer follows directly from the passage.",
  }));
}

function genParaJumble(baseSet) {
  const s = baseSet; // array of 4 sentences A-D
  const sentences = shuffle(s);
  const choices = ["ABCD","ACBD","BACD","CABD","BCAD","CBAD"];
  const correctOrder = "ABCD"; // intended logical flow of the base set
  const opts = shuffle(choices);
  const correct = opts.indexOf(correctOrder);
  return {
    text: `Arrange the parts to form a coherent paragraph:\n${sentences.join("\n")}`,
    topic: "Para Jumbles",
    ...mcq(opts, correct >= 0 ? correct : 0),
    explanation: "Overview → details → activity → close.",
  };
}

const PARA_BASES = [
  ["A. The festival drew visitors from many cities.","B. Stalls offered regional snacks and handicrafts.","C. Local musicians performed throughout the day.","D. The park was decorated with lights and banners."],
  ["A. The workshop began with a quick warm-up.","B. Teams formed around shared interests.","C. Mentors guided the brainstorming.","D. By evening, prototypes were shown."],
  ["A. The museum opened a new wing.","B. Interactive exhibits drew children.","C. Volunteers explained the science.","D. Visitors left with curiosity sparked."],
  ["A. The school launched a recycling drive.","B. Students designed posters.","C. Bins were placed across campus.","D. Waste reduced within weeks."],
  ["A. The city planted trees along sidewalks.","B. Shade made walking pleasant.","C. Birds returned to the area.","D. Residents organized weekend cleanups."],
];

function genFillBlank() {
  const stems = [
    { s: "He is known ____ his honesty.", c: "for", w: ["to","by","with"] },
    { s: "She insisted ____ paying the bill.", c: "on", w: ["at","to","for"] },
    { s: "This problem is tough, ____ we can solve it together.", c: "but", w: ["and","so","or"] },
    { s: "The train arrives ____ 7 a.m.", c: "at", w: ["on","in","by"] },
    { s: "She is good ____ mathematics.", c: "at", w: ["in","with","for"] },
    { s: "We look forward ____ your reply.", c: "to", w: ["for","at","on"] },
  ];
  const it = stems[rnd(stems.length)];
  const options = shuffle([it.c, ...it.w]);
  return {
    text: it.s.replace("____", "_____"),
    topic: "Fill in the Blanks",
    ...mcq(options, options.indexOf(it.c)),
    explanation: `The correct preposition/conjunction is “${it.c}”.`,
  };
}

function genClozeSet(p) {
  const text = p.text;
  const out = [];
  p.keys.forEach((slot, i) => {
    const num = i + 1;
    const options = shuffle([slot.correct, ...slot.wrong.slice(0,3)]);
    out.push({
      text: `Cloze Passage:\n${text}\n\nFill {${num}}:`,
      topic: "Cloze Test",
      ...mcq(options, options.indexOf(slot.correct)),
      explanation: "Use context to choose the best fit.",
    });
  });
  return out;
}

// ---------------------------- per-exam builder (no duplicates) ----------------------------
function buildExamQuestions() {
  const q = [];
  const seen = new Set(); // per-exam de-dup by text+topic

  // track per-pool used indices (no repetition inside a single exam)
  const usedRC = new Set();
  const usedCloze = new Set();
  const usedSyn = new Set();
  const usedAnt = new Set();
  const usedOne = new Set();
  const usedIdi = new Set();
  const usedCor = new Set();
  const usedReason = new Set();
  const usedPara = new Set();

  // 6 RC (2 passages × 3 Q each) – ensure different passages
  for (let i=0;i<2;i++){
    const p = drawNoRep(RC_PASSAGES, usedRC) || RC_PASSAGES[rnd(RC_PASSAGES.length)];
    for (const item of genRCSet(p)) uniquePush(q, item, seen);
  }

  // 8 Cloze (one passage ~6-7 blanks + top-ups)
  const cp = drawNoRep(CLOZE_PASSAGES, usedCloze) || CLOZE_PASSAGES[rnd(CLOZE_PASSAGES.length)];
  const clozeItems = genClozeSet(cp);
  for (const item of clozeItems) uniquePush(q, item, seen);
  while (q.filter(x=>x.topic==="Cloze Test").length < 8) {
    uniquePush(q, genFillBlank(), seen); // safe fallback to reach 8 language items
  }

  // Vocab/Idioms/One-word: ~14 (no rep)
  for (let i=0;i<6;i++){
    const pair = drawNoRep(SYN_ANT_PAIRS, usedSyn) || SYN_ANT_PAIRS[rnd(SYN_ANT_PAIRS.length)];
    uniquePush(q, genSynonym(pair), seen);
  }
  for (let i=0;i<4;i++){
    const pair = drawNoRep(SYN_ANT_PAIRS, usedAnt) || SYN_ANT_PAIRS[rnd(SYN_ANT_PAIRS.length)];
    uniquePush(q, genAntonym(pair), seen);
  }
  for (let i=0;i<2;i++){
    const it = drawNoRep(ONE_WORD, usedOne) || ONE_WORD[rnd(ONE_WORD.length)];
    uniquePush(q, genOneWord(it), seen);
  }
  for (let i=0;i<2;i++){
    const it = drawNoRep(IDIOMS, usedIdi) || IDIOMS[rnd(IDIOMS.length)];
    uniquePush(q, genIdiom(it), seen);
  }

  // Grammar & Sentence Correction: ~14
  for (let i=0;i<7;i++) uniquePush(q, genTenseFillProc(), seen);
  for (let i=0;i<7;i++){
    const it = drawNoRep(CORRECTION_PAIRS, usedCor) || CORRECTION_PAIRS[rnd(CORRECTION_PAIRS.length)];
    uniquePush(q, genCorrection(it), seen);
  }

  // Para Jumbles: 2 (different bases)
  for (let i=0;i<2;i++){
    const base = drawNoRep(PARA_BASES, usedPara) || PARA_BASES[rnd(PARA_BASES.length)];
    uniquePush(q, genParaJumble(base), seen);
  }

  // Verbal Reasoning: 2 (no rep)
  for (let i=0;i<2;i++){
    const it = drawNoRep(REASONING_SNIPPETS, usedReason) || REASONING_SNIPPETS[rnd(REASONING_SNIPPETS.length)];
    uniquePush(q, genReasoning(it), seen);
  }

  // Fill Blanks top-ups to reach exactly 50 (guaranteed unique by seen-set)
  while (q.length < QUESTIONS_PER_EXAM) uniquePush(q, genFillBlank(), seen);

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
  const file = path.join(OUT_DIR, `verbal_exam_${String(examIndex).padStart(2,"0")}.csv`);
  fs.writeFileSync(file, csv, "utf-8");
  return file;
}

// ---------------------------- optional DB seed ----------------------------
async function seedDB(allExams) {
  console.log("Seeding SQLite DB…", DB_PATH);
  const db = new sqlite3.Database(DB_PATH);
  const run = (sql, p=[]) => new Promise((res, rej) => db.run(sql, p, function(err){ err?rej(err):res(this); }));
  const get = (sql, p=[]) => new Promise((res, rej) => db.get(sql, p, (err,row)=> err?rej(err):res(row)));

  try {
    let course = await get("SELECT id FROM courses WHERE title = ?", [COURSE_TITLE]);
    if (!course) {
      const r = await run("INSERT INTO courses(title, description, cover, is_public) VALUES(?,?,?,?)",
        [COURSE_TITLE, COURSE_DESC, null, 1]);
      course = { id: r.lastID };
    }

    // create one exam per file
    for (let ex=1; ex<=EXAMS_COUNT; ex++){
      const title = `Verbal Ability Test #${String(ex).padStart(2,"0")}`;
      const examRow = await run("INSERT INTO exams(course_id, title, duration_sec, config_json) VALUES(?,?,?,?)",
        [course.id, title, DURATION_MIN*60, JSON.stringify({})]);
      const examId = examRow.lastID;

      const qs = allExams[ex-1];
      for (const qq of qs) {
        const r = await run(
          `INSERT INTO questions(text, type, options_json, correct_index, explanation, difficulty, topic_id, exam_id)
           VALUES(?,?,?,?,?,?,NULL,?)`,
          [qq.text, "mcq", JSON.stringify(qq.options), qq.correct, qq.explanation||"", "mixed", examId]
        );
        const qid = r.lastID;
        await run("INSERT INTO exam_questions(exam_id, question_id) VALUES(?,?)", [examId, qid]);
      }
      console.log(`Seeded exam ${ex} -> ${title}`);
    }
    console.log("DB seed complete.");
  } catch (e) {
    console.error("DB seed error:", e.message);
  } finally {
    db.close();
  }
}

// ---------------------------- main ----------------------------
(async function main() {
  ensureDir(OUT_DIR);
  const allExams = [];
  for (let i=1;i<=EXAMS_COUNT;i++){
    const qs = buildExamQuestions();
    allExams.push(qs);
    const file = writeCSVForExam(i, qs);
    console.log(`Wrote ${file}`);
  }
  if (process.argv.includes("--seed-db")) await seedDB(allExams);
  console.log(`Done. Created ${EXAMS_COUNT} CSV files with ${QUESTIONS_PER_EXAM} unique questions each (no duplicates per exam).`);
})();
