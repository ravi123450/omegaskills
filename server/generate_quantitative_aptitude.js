// server/scripts/generate_quantitative_aptitude.js
// Usage:
//   node server/scripts/generate_quantitative_aptitude.js
//
// Writes 20 CSVs with 50 MCQs each to:
//   server/data/exams/quantitative_aptitude/exam_XX.csv

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------- config ----------------------------
const OUT_DIR = path.resolve(__dirname, "../data/exams/quantitative_aptitude");
const EXAMS_COUNT = 20;
const QUESTIONS_PER_EXAM = 50;

const TOPICS = [
  { slug: "number_system",           name: "Number System" },
  { slug: "percentages",             name: "Percentages" },
  { slug: "profit_loss",             name: "Profit & Loss" },
  { slug: "average",                 name: "Average" },
  { slug: "ratio_proportion",        name: "Ratio & Proportion" },
  { slug: "mixtures",                name: "Mixtures" },
  { slug: "time_work",               name: "Time & Work" },
  { slug: "sdt",                     name: "Speed–Distance–Time" },
  { slug: "pipes_cisterns",          name: "Pipes & Cisterns" },
  { slug: "algebra",                 name: "Algebra" },
  { slug: "geometry",                name: "Geometry" },
  { slug: "height_distance",         name: "Height & Distance" },
  { slug: "mensuration",             name: "Mensuration" },
  { slug: "coordinate_geometry",     name: "Co-ordinate Geometry" },
  { slug: "permutations_combinations", name: "Permutations & Combinations" },
  { slug: "probability",             name: "Probability" },
  { slug: "interest",                name: "Simple & Compound Interest" },
  { slug: "ages",                    name: "Ages" },
  { slug: "logs",                    name: "Logs" },
  { slug: "sets",                    name: "Sets" },
];

// ---------------------------- utils ----------------------------
function ensureDir(p){ fs.mkdirSync(p, { recursive: true }); }
function rndInt(a, b){ return a + Math.floor(Math.random() * (b - a + 1)); }
function shuffle(arr){ return arr.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]); }
function gcd(a,b){ while(b){ [a,b] = [b, a%b]; } return Math.abs(a); }
function lcm(a,b){ return Math.abs(a*b)/gcd(a,b); }
function fact(n){ let r=1; for(let i=2;i<=n;i++) r*=i; return r; }
function nCr(n,r){ if(r<0||r>n) return 0; r=Math.min(r,n-r); let num=1,den=1; for(let i=1;i<=r;i++){ num*= (n-r+i); den*=i; } return Math.round(num/den); }
function toCSV(rows, headers){
  const esc = (s)=>{ const str=String(s??""); return /[",\n]/.test(str)?`"${str.replace(/"/g,'""')}"`:str; };
  return [headers.join(","), ...rows.map(r => headers.map(h=>esc(r[h])).join(","))].join("\n");
}
function mcq(text, options, correct_index, explanation="", topicName=""){
  return {
    text, type:"mcq",
    options_json: JSON.stringify(options),
    correct_index,
    explanation,
    topic: topicName,
    difficulty: "mixed",
  };
}

// ---------------------------- per-topic generators ----------------------------
const G = {
  number_system(){
    const a=rndInt(6,24), b=rndInt(6,24);
    const ans = lcm(a,b);
    const opts = shuffle([ans, ans- a%3 || ans-2, ans+2, ans-1].map(x=>String(x)));
    return mcq(`Find LCM of ${a} and ${b}.`, opts, opts.indexOf(String(ans)), "", "Number System");
  },
  percentages(){
    const x=rndInt(20,90), y=rndInt(50,200);
    const ans = +( (x/y)*100 ).toFixed(2);
    const opts = shuffle([ans, +( (y/x)*100 ).toFixed(2), +(ans+5).toFixed(2), +(ans-5).toFixed(2)].map(String));
    return mcq(`${x} is what percent of ${y}?`, opts, opts.indexOf(String(ans)), "", "Percentages");
  },
  profit_loss(){
    const cp=rndInt(100,900), p=rndInt(5,35);
    const sp = +(cp*(1+p/100)).toFixed(2);
    const opts=shuffle([sp, +(cp*(1-p/100)).toFixed(2), sp+10, sp-10].map(String));
    return mcq(`Cost price = ₹${cp}, Profit = ${p}%. Find selling price.`, opts, opts.indexOf(String(sp)), "", "Profit & Loss");
  },
  average(){
    const a=rndInt(10,50), b=rndInt(10,50), c=rndInt(10,50), d=rndInt(10,50);
    const ans = +(((a+b+c+d)/4).toFixed(2));
    const opts = shuffle([ans, ans+1, ans-1, +(((a+b+c)/3).toFixed(2))].map(String));
    return mcq(`Find average of ${a}, ${b}, ${c}, ${d}.`, opts, opts.indexOf(String(ans)), "", "Average");
  },
  ratio_proportion(){
    const m=rndInt(2,9), n=rndInt(2,9), S=rndInt(100,400);
    const p1 = +(S*(m/(m+n))).toFixed(2);
    const p2 = +(S*(n/(m+n))).toFixed(2);
    const opts = shuffle([p1, p2, S/2, S].map(String));
    return mcq(`Divide ₹${S} in the ratio ${m}:${n}. Share of first person?`, opts, opts.indexOf(String(p1)), "", "Ratio & Proportion");
  },
  mixtures(){
    const A=rndInt(10,30), B=rndInt(40,70);
    const ans = +(((A+B)/2).toFixed(2));
    const opts = shuffle([ans, A, B, +(ans+5).toFixed(2)].map(String));
    return mcq(`Equal volumes of ${A}% and ${B}% salt solutions are mixed. Final concentration?`, opts, opts.indexOf(String(ans)), "Weighted average of equal volumes is mean.", "Mixtures");
  },
  time_work(){
    const a=rndInt(6,12), b=rndInt(8,15);
    const ans = +((a*b)/(a+b)).toFixed(2);
    const opts = shuffle([ans, a+b, Math.max(a,b), Math.min(a,b)].map(String));
    return mcq(`A can finish in ${a} days, B in ${b} days. In how many days together?`, opts, opts.indexOf(String(ans)), "1/T=1/a+1/b", "Time & Work");
  },
  sdt(){
    const s=rndInt(30,80), t=rndInt(2,6);
    const d=s*t;
    const opts = shuffle([d, s+t, d+10, d-10].map(String));
    return mcq(`A car at ${s} km/h for ${t} h covers how many km?`, opts, opts.indexOf(String(d)), "", "Speed–Distance–Time");
  },
  pipes_cisterns(){
    const a=rndInt(6,12), b=rndInt(8,15);
    const ans = +((a*b)/(a+b)).toFixed(2);
    const opts = shuffle([ans, a+b, a*b, Math.max(a,b)].map(String));
    return mcq(`Two pipes fill a tank in ${a} min and ${b} min. Together time? (min)`, opts, opts.indexOf(String(ans)), "Same as Work.", "Pipes & Cisterns");
  },
  algebra(){
    const A=rndInt(2,9), B=rndInt(3,15), C=rndInt(10,50); // Ax + B = C
    const x = +(((C-B)/A).toFixed(2));
    const opts = shuffle([x, x+1, x-1, (C+B)/A].map(String));
    return mcq(`Solve: ${A}x + ${B} = ${C}. Find x.`, opts, opts.indexOf(String(x)), "", "Algebra");
  },
  geometry(){
    const ang1=rndInt(30,70), ang2=rndInt(30,70), ang3 = 180-ang1-ang2;
    const ans = ang3;
    const opts = shuffle([ans, 180-ang1, 180-ang2, 90].map(String));
    return mcq(`In a triangle, two angles are ${ang1}° and ${ang2}°. Find the third angle.`, opts, opts.indexOf(String(ans)), "", "Geometry");
  },
  height_distance(){
    const d=rndInt(10,50); // 45° → height = distance
    const ans = d;
    const opts = shuffle([ans, d*2, Math.round(d/2), d+5].map(String));
    return mcq(`At 45° elevation, a tower is seen from ${d} m away. Height of tower?`, opts, opts.indexOf(String(ans)), "tan45°=1 → h=d", "Height & Distance");
  },
  mensuration(){
    const r=rndInt(7,14);
    const ans = Math.round((22/7)*r*r);
    const opts = shuffle([ans, 2*(22/7)*r, (22/7)*2*r*r, ans+22].map(v=>String(Math.round(v))));
    return mcq(`Area of circle (r=${r} cm), use π=22/7.`, opts, opts.indexOf(String(ans)), "", "Mensuration");
  },
  coordinate_geometry(){
    const x1=rndInt(0,5), y1=rndInt(0,5);
    const dx=rndInt(3,6), dy=rndInt(4,8); // try to hit Pythagorean-ish
    const x2=x1+dx, y2=y1+dy;
    const ans = Math.hypot(dx,dy);
    const round = (n)=>Number.isInteger(n)?n:+n.toFixed(2);
    const opts = shuffle([ans, Math.abs(dx)+Math.abs(dy), Math.max(dx,dy), Math.min(dx,dy)].map(v=>String(round(v))));
    return mcq(`Distance between (${x1},${y1}) and (${x2},${y2}).`, opts, opts.indexOf(String(round(ans))), "", "Co-ordinate Geometry");
  },
  permutations_combinations(){
    const n=rndInt(5,9), r=rndInt(2,4);
    const ans = nCr(n,r);
    const opts = shuffle([ans, fact(n)/(fact(n-r)), nCr(n,r-1), ans+3].map(v=>String(Math.round(v))));
    return mcq(`How many combinations: ${n}C${r}?`, opts, opts.indexOf(String(ans)), "", "Permutations & Combinations");
  },
  probability(){
    // die prime probability = 3/6 = 1/2
    const primes=[2,3,5];
    const ans = "1/2";
    const opts = shuffle([ans,"1/3","2/3","1/6"]);
    return mcq(`A fair die is rolled. Probability of a prime number?`, opts, opts.indexOf(ans), "", "Probability");
  },
  interest(){
    const P=rndInt(1000,5000), r=rndInt(5,12), t=2;
    const SI = Math.round(P*r*t/100);
    const CI = Math.round(P*Math.pow(1+r/100,t) - P);
    const opts = shuffle([String(SI), String(CI), String(SI+100), String(SI-50)]);
    return mcq(`Simple Interest on ₹${P} at ${r}% p.a. for ${t} years?`, opts, opts.indexOf(String(SI)), "", "Simple & Compound Interest");
  },
  ages(){
    const m=rndInt(2,5), n=rndInt(2,5), sum=rndInt(30,60);
    const A = Math.round(sum*m/(m+n));
    const opts=shuffle([A, sum-A, A+2, A-2].map(String));
    return mcq(`Sum of ages = ${sum}. Ratio ${m}:${n}. Elder's age?`, opts, opts.indexOf(String(A)), "", "Ages");
  },
  logs(){
    const k=[1,2,3,4][rndInt(0,3)];
    const ans=String(k);
    const opts=shuffle([ans,String(k+1),String(k-1),"0"]);
    return mcq(`Evaluate: log₁₀(10^${k}).`, opts, opts.indexOf(ans), "", "Logs");
  },
  sets(){
    const A=rndInt(20,40), B=rndInt(15,35), both=rndInt(5,Math.min(15,A-5,B-5));
    const U = A + B - both;
    const opts = shuffle([U, A+B, both, A-B].map(String));
    return mcq(`In a class, ${A} like Maths, ${B} like Science, ${both} like both. How many like at least one?`, opts, opts.indexOf(String(U)), "n(A∪B)=A+B−both", "Sets");
  },
};

// Round-robin topic pickers
const TOPIC_ORDER = TOPICS.map(t=>t.name);

// ---------------------------- exam builder ----------------------------
function buildExam(){
  const rows = [];
  // 2 per topic → 40
  for (const t of TOPIC_ORDER){
    for (let i=0;i<2;i++){
      rows.push(genOne(t));
    }
  }
  // top-up to 50
  while (rows.length < QUESTIONS_PER_EXAM){
    const t = TOPIC_ORDER[rndInt(0, TOPIC_ORDER.length-1)];
    rows.push(genOne(t));
  }
  // shape rows for CSV
  return rows.map((q, i)=>({
    id: i+1,
    text: q.text,
    type: "mcq",
    options_json: q.options_json,
    correct_index: q.correct_index,
    explanation: q.explanation || "",
    topic: q.topic,
    difficulty: "mixed",
  }));
}

function genOne(topicName){
  // map name → generator key
  switch (topicName){
    case "Number System": return G.number_system();
    case "Percentages": return G.percentages();
    case "Profit & Loss": return G.profit_loss();
    case "Average": return G.average();
    case "Ratio & Proportion": return G.ratio_proportion();
    case "Mixtures": return G.mixtures();
    case "Time & Work": return G.time_work();
    case "Speed–Distance–Time": return G.sdt();
    case "Pipes & Cisterns": return G.pipes_cisterns();
    case "Algebra": return G.algebra();
    case "Geometry": return G.geometry();
    case "Height & Distance": return G.height_distance();
    case "Mensuration": return G.mensuration();
    case "Co-ordinate Geometry": return G.coordinate_geometry();
    case "Permutations & Combinations": return G.permutations_combinations();
    case "Probability": return G.probability();
    case "Simple & Compound Interest": return G.interest();
    case "Ages": return G.ages();
    case "Logs": return G.logs();
    case "Sets": return G.sets();
    default: return G.percentages();
  }
}

// ---------------------------- main ----------------------------
(function main(){
  ensureDir(OUT_DIR);
  const headers = ["id","text","type","options_json","correct_index","explanation","topic","difficulty"];

  for (let i=1;i<=EXAMS_COUNT;i++){
    const rows = buildExam();
    const csv = toCSV(rows, headers);
    const file = path.join(OUT_DIR, `exam_${String(i).padStart(2,"0")}.csv`);
    fs.writeFileSync(file, csv, "utf8");
    console.log(`Wrote ${file} (${rows.length} Q)`);
  }
  console.log("Done generating Quantitative Aptitude CSVs.");
})();
