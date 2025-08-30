// server/generate_papers.js
// Node 18+ (ESM)
// Generates 20 CSV files: papers/exam_01.csv ... exam_20.csv (90 Q each)

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_DIR = path.join(__dirname, "papers");
fs.mkdirSync(OUT_DIR, { recursive: true });

// ---------- helpers ----------
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
const shuffle = (rng, arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const esc = (s) => {
  // CSV escape
  const str = String(s ?? "");
  if (str.includes('"') || str.includes(",") || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// ---------- Topic Generators ----------
function genAptitude(rng) {
  const kind = pick(rng, ["percent", "ratio", "average", "profitloss"]);
  if (kind === "percent") {
    const x = 5 + Math.floor(rng() * 46);
    const y = 100 + Math.floor(rng() * 401);
    const ans = Math.round((x / 100) * y);
    const options = shuffle(rng, [ans, ans + 5, ans - 5, ans + 10]).map(String);
    return {
      topic_slug: "aptitude",
      type: "mcq",
      text: `What is ${x}% of ${y}?`,
      options,
      answer: String(ans),
      explanation: `${x}% of ${y} = (${x}/100)×${y} = ${ans}.`,
      difficulty: "mixed",
      tags: "percentage,aptitude",
    };
  }
  if (kind === "ratio") {
    const a = 2 + Math.floor(rng() * 8),
      b = 2 + Math.floor(rng() * 8),
      total = 100 + Math.floor(rng() * 401);
    const partA = Math.round(total * (a / (a + b)));
    const options = shuffle(rng, [partA, partA + 5, partA - 5, partA + 10]).map(String);
    return {
      topic_slug: "aptitude",
      type: "mcq",
      text: `In ratio ${a}:${b}, what is A's share out of total ${total}?`,
      options,
      answer: String(partA),
      explanation: `Share = total×a/(a+b) = ${total}×(${a}/${a + b}) = ${partA}.`,
      difficulty: "mixed",
      tags: "ratio,aptitude",
    };
  }
  if (kind === "average") {
    const n = 4 + Math.floor(rng() * 4);
    const vals = Array.from({ length: n }, () => 10 + Math.floor(rng() * 90));
    const avg = Math.round(vals.reduce((a, c) => a + c, 0) / n);
    const options = shuffle(rng, [avg, avg + 2, avg - 2, avg + 4]).map(String);
    return {
      topic_slug: "aptitude",
      type: "mcq",
      text: `Find the average of [${vals.join(", ")}].`,
      options,
      answer: String(avg),
      explanation: `Average = sum/count.`,
      difficulty: "mixed",
      tags: "average,aptitude",
    };
  }
  // profit/loss
  const cp = 100 + Math.floor(rng() * 901),
    p = 5 + Math.floor(rng() * 31);
  const sp = Math.round(cp * (1 + p / 100));
  const options = shuffle(rng, [sp, sp + 10, sp - 10, sp + 20]).map(String);
  return {
    topic_slug: "aptitude",
    type: "mcq",
    text: `An item with CP ₹${cp} sold at ${p}% profit. What is SP (₹)?`,
    options,
    answer: String(sp),
    explanation: `SP = CP×(1 + p/100) = ${cp}×(1+${p}/100) = ${sp}.`,
    difficulty: "mixed",
    tags: "profit-loss,aptitude",
  };
}

function genQuant(rng) {
  const kind = pick(rng, ["taw", "si", "spd", "perm"]);
  if (kind === "taw") {
    const A = 6 + Math.floor(rng() * 6),
      B = 8 + Math.floor(rng() * 7);
    const together = (A * B) / (A + B);
    const t = Number(together.toFixed(1));
    const options = shuffle(rng, [t, t + 1, t - 1, t + 0.5]).map(String);
    return {
      topic_slug: "quant",
      type: "mcq",
      text: `A completes work in ${A} days, B in ${B} days. Together, how many days?`,
      options,
      answer: String(t),
      explanation: `Time = AB/(A+B).`,
      difficulty: "mixed",
      tags: "time&work,quant",
    };
  }
  if (kind === "si") {
    const P = 1000 + Math.floor(rng() * 4000),
      R = 5 + Math.floor(rng() * 11),
      T = 1 + Math.floor(rng() * 4);
    const si = Math.round((P * R * T) / 100);
    const options = shuffle(rng, [si, si + 50, si - 50, si + 100]).map(String);
    return {
      topic_slug: "quant",
      type: "mcq",
      text: `Simple Interest on ₹${P} at ${R}% p.a. for ${T} years is?`,
      options,
      answer: String(si),
      explanation: `SI = (PRT)/100.`,
      difficulty: "mixed",
      tags: "simple-interest,quant",
    };
  }
  if (kind === "spd") {
    const d = 100 + Math.floor(rng() * 401),
      t = 2 + Math.floor(rng() * 5);
    const spd = Math.round(d / t);
    const options = shuffle(rng, [spd, spd + 5, spd - 5, spd + 10]).map(String);
    return {
      topic_slug: "quant",
      type: "mcq",
      text: `A train covers ${d} km in ${t} hours. Average speed (km/h)?`,
      options,
      answer: String(spd),
      explanation: `Speed = Distance/Time.`,
      difficulty: "mixed",
      tags: "speed-distance,quant",
    };
  }
  const n = 4 + Math.floor(rng() * 4);
  const ans = factorial(n);
  const options = shuffle(rng, [ans, ans / 2, ans + n, ans - 1].map((x) => String(Math.max(1, Math.round(x)))));
  return {
    topic_slug: "quant",
    type: "mcq",
    text: `Number of permutations of ${n} different objects taken all at a time:`,
    options,
    answer: String(ans),
    explanation: `${n}! permutations.`,
    difficulty: "mixed",
    tags: "permutations,quant",
  };
}
function factorial(n) {
  let p = 1;
  for (let i = 2; i <= n; i++) p *= i;
  return p;
}

function genReasoning(rng) {
  const kind = pick(rng, ["series", "analogy", "blood", "direction"]);
  if (kind === "series") {
    const start = 2 + Math.floor(rng() * 6);
    const d = 2 + Math.floor(rng() * 5);
    const seq = [start, start + d, start + 2 * d, start + 3 * d];
    const next = start + 4 * d;
    const options = shuffle(rng, [next, next + d, next - 2, next + 2]).map(String);
    return {
      topic_slug: "reasoning",
      type: "mcq",
      text: `Find the next term: ${seq.join(", ")}, __`,
      options,
      answer: String(next),
      explanation: `Arithmetic progression with d=${d}.`,
      difficulty: "mixed",
      tags: "series,reasoning",
    };
  }
  if (kind === "analogy") {
    const pair = pick(rng, [
      ["Cat : Kitten :: Dog : ?", "Puppy"],
      ["Doctor : Hospital :: Teacher : ?", "School"],
      ["Bird : Nest :: Bee : ?", "Hive"],
    ]);
    const options = shuffle(rng, [pair[1], "Kennel", "Clinic", "Classroom"]);
    return {
      topic_slug: "reasoning",
      type: "mcq",
      text: `Analogy — ${pair[0]}`,
      options,
      answer: pair[1],
      explanation: `Maintain relationship pattern.`,
      difficulty: "mixed",
      tags: "analogy,reasoning",
    };
  }
  if (kind === "blood") {
    const options = shuffle(rng, ["Mother", "Father", "Grandfather", "Aunt"]);
    return {
      topic_slug: "reasoning",
      type: "mcq",
      text: `A is the mother of B. B is the father of C. How is A related to C?`,
      options,
      answer: "Grandmother",
      explanation: "A → B → C, so A is C's grandmother (not in options? prefer 'Grandmother').",
      difficulty: "mixed",
      tags: "blood-relations,reasoning",
    };
  }
  // directions (basic)
  const options = shuffle(rng, ["North", "South", "East", "West"]);
  return {
    topic_slug: "reasoning",
    type: "mcq",
    text: `A walks 3km North, then 4km East, then 3km South. Which direction from start?`,
    options,
    answer: "East",
    explanation: "Net displacement is 4km towards East.",
    difficulty: "mixed",
    tags: "direction,reasoning",
  };
}

function genVerbal(rng) {
  const kind = pick(rng, ["syn", "ant", "fitb", "error"]);
  if (kind === "syn") {
    const pairs = [
      ["abundant", "plentiful"],
      ["concise", "brief"],
      ["diligent", "hardworking"],
      ["prudent", "wise"],
      ["vivid", "bright"],
    ];
    const [w, s] = pick(rng, pairs);
    const distractors = ["rare", "lengthy", "careless", "neutral"];
    const options = shuffle(rng, [s, ...shuffle(rng, distractors).slice(0, 3)]);
    return {
      topic_slug: "verbal",
      type: "mcq",
      text: `Choose the synonym of "${w}".`,
      options,
      answer: s,
      explanation: `"${s}" is closest in meaning to "${w}".`,
      difficulty: "mixed",
      tags: "synonym,verbal",
    };
  }
  if (kind === "ant") {
    const pairs = [
      ["augment", "reduce"],
      ["obscure", "clear"],
      ["hostile", "friendly"],
      ["scarce", "plentiful"],
      ["fragile", "robust"],
    ];
    const [w, a] = pick(rng, pairs);
    const distractors = ["increase", "hidden", "aggressive", "delicate"];
    const options = shuffle(rng, [a, ...shuffle(rng, distractors).slice(0, 3)]);
    return {
      topic_slug: "verbal",
      type: "mcq",
      text: `Choose the antonym of "${w}".`,
      options,
      answer: a,
      explanation: `"${a}" is opposite in meaning to "${w}".`,
      difficulty: "mixed",
      tags: "antonym,verbal",
    };
  }
  if (kind === "fitb") {
    const sentences = [
      ["I will ____ the feedback.", "consider", ["consider", "consist", "consume", "compose"]],
      ["She has a ____ interest in physics.", "keen", ["keen", "keel", "kean", "keenly"]],
    ];
    const [t, ans, opts] = pick(rng, sentences);
    return {
      topic_slug: "verbal",
      type: "mcq",
      text: t,
      options: shuffle(rng, opts),
      answer: ans,
      explanation: `Correct usage is "${ans}".`,
      difficulty: "mixed",
      tags: "grammar,verbal",
    };
  }
  const sentence = "He don't likes playing.";
  const options = shuffle(rng, ["He doesn't like playing.", "He don't like playing.", "He doesn't likes playing.", "He do not likes playing."]);
  return {
    topic_slug: "verbal",
    type: "mcq",
    text: `Choose the correct sentence: "${sentence}"`,
    options,
    answer: "He doesn't like playing.",
    explanation: "Subject-verb agreement with 'doesn't like'.",
    difficulty: "mixed",
    tags: "sentence-correction,verbal",
  };
}

function genLogical(rng) {
  const kind = pick(rng, ["syl", "coding", "truefalse"]);
  if (kind === "syl") {
    const stmt = "All apples are fruits. Some fruits are red. Therefore, some apples are red.";
    const options = shuffle(rng, ["True", "False", "Cannot say", "None"]);
    return {
      topic_slug: "logical",
      type: "mcq",
      text: `${stmt} (True/False/Cannot say)`,
      options,
      answer: "Cannot say",
      explanation: "Conclusion is not guaranteed.",
      difficulty: "mixed",
      tags: "syllogism,logical",
    };
  }
  if (kind === "coding") {
    const options = shuffle(rng, ["N", "M", "O", "P"]);
    return {
      topic_slug: "logical",
      type: "mcq",
      text: `In a code language, if A=Z, B=Y, ... (reverse alphabet), what is the code for "M"?`,
      options,
      answer: "N",
      explanation: "Reverse mapping: M(13) ↔ N(14).",
      difficulty: "mixed",
      tags: "coding-decoding,logical",
    };
  }
  const options = shuffle(rng, ["True", "False", "Cannot say", "Probably"]);
  return {
    topic_slug: "logical",
    type: "mcq",
    text: `Statement: "Most engineers enjoy math." Conclusion: "Rahul is an engineer; therefore he enjoys math."`,
    options,
    answer: "Cannot say",
    explanation: "Generalization doesn't guarantee individual truth.",
    difficulty: "mixed",
    tags: "logic,logical",
  };
}

const TOPIC_ORDER = ["aptitude", "quant", "reasoning", "verbal", "logical"];
const GEN_MAP = {
  aptitude: genAptitude,
  quant: genQuant,
  reasoning: genReasoning,
  verbal: genVerbal,
  logical: genLogical,
};

function genQuestionByTopic(rng, topic_slug) {
  return GEN_MAP[topic_slug](rng);
}

// ---------- Write 20 CSVs ----------
(async function main() {
  for (let i = 1; i <= 20; i++) {
    const rng = mulberry32(1000 + i * 17);
    const outPath = path.join(OUT_DIR, `exam_${String(i).padStart(2, "0")}.csv`);
    const fd = fs.openSync(outPath, "w");
    // CSV header
    fs.writeSync(
      fd,
      [
        "exam_title",               // Soft Skills Mastery — Mock 01, etc.
        "topic_slug",               // aptitude|quant|reasoning|verbal|logical
        "type",                     // mcq
        "text",                     // question text
        "options_json",             // ["A","B","C","D"]
        "answer",                   // exact string
        "explanation",              // explanation text
        "difficulty",               // mixed
        "tags"                      // comma tags
      ].join(",") + "\n"
    );

    const examTitle = `Soft Skills Mastery — Mock ${String(i).padStart(2, "0")}`;

    // 90 questions: 18 per topic
    for (const topic of TOPIC_ORDER) {
      for (let k = 0; k < 18; k++) {
        const q = genQuestionByTopic(rng, topic);
        const row = [
          esc(examTitle),
          esc(q.topic_slug),
          esc(q.type),
          esc(q.text),
          esc(JSON.stringify(q.options)),
          esc(q.answer),
          esc(q.explanation),
          esc(q.difficulty || "mixed"),
          esc(q.tags || ""),
        ].join(",");
        fs.writeSync(fd, row + "\n");
      }
    }
    fs.closeSync(fd);
    console.log("Wrote", outPath);
  }
  console.log("✅ Generated 20 CSV papers in /server/papers");
})();
