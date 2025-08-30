// src/features/ats/scoring.js
// Rule-based ATS scoring (offline). No external libs.

const ACTION_VERBS = [
  "led","spearheaded","architected","engineered","implemented","designed","optimized","built",
  "developed","managed","directed","launched","scaled","migrated","automated","streamlined",
  "reduced","improved","boosted","drove","established","formulated","orchestrated","integrated",
  "accelerated","refactored","secured","converted","analyzed","created","delivered","mentored",
  "facilitated","collaborated","coordinated"
];

function tokenize(s){
  return (s||"").toLowerCase().match(/[a-z][a-z0-9\+\#\.]{1,}/g) || [];
}

function countRegex(text, re){
  const m = text.match(re);
  return m ? m.length : 0;
}

function unique(arr){
  return Array.from(new Set(arr));
}

function sectionPresence(text){
  const t = text.toLowerCase();
  const sections = [
    /(summary|objective)/,
    /(experience|work experience|professional experience)/,
    /(education)/,
    /(skills)/,
    /(projects?)/,
    /(certifications?|awards)/
  ];
  const found = sections.map(re => re.test(t));
  return { found, total: sections.length };
}

function contactPresence(text){
  const t = text.toLowerCase();
  const tests = [
    /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/,     // email
    /(\+?\d[\d\s\-()]{7,})/,                     // phone (basic)
    /linkedin\.com\/[a-z0-9\-_/]+/,              // LinkedIn
    /github\.com\/[a-z0-9\-_/]+/                 // GitHub
  ];
  const found = tests.map(re => re.test(t));
  return { found, total: tests.length };
}

function bulletStats(text){
  const lines = text.split(/\n/);
  const bulletLines = lines.filter(l => /^\s*[-•*]/.test(l));
  const verbBullets = bulletLines.filter(l => {
    const firstWord = (l.replace(/^\s*[-•*]\s*/, "").trim().split(/\s+/)[0]||"").toLowerCase();
    return ACTION_VERBS.includes(firstWord);
  }).length;
  return { bulletLines: bulletLines.length, verbBullets };
}

function metricStats(text){
  const numCount = countRegex(text, /\d+/g);
  const pctCount = countRegex(text, /%/g);
  return { metricsCount: numCount + pctCount };
}

function lengthScore(words){
  // Ideal ~ 450-850 words
  if(words < 250) return 2;
  if(words < 400) return 6;
  if(words <= 900) return 10;
  if(words <= 1100) return 7;
  return 4;
}

export function computeAtsScore({ resumeText, jdText="", keywords="", fileType="pdf" }){
  const text = (resumeText||"").trim();
  const words = tokenize(text);
  const wc = words.length;

  // Sections
  const sec = sectionPresence(text);
  const secFound = sec.found.filter(Boolean).length;

  // Contact
  const contact = contactPresence(text);
  const contactFound = contact.found.filter(Boolean).length;

  // Bullets & verbs
  const bullets = bulletStats(text);

  // Metrics
  const metrics = metricStats(text);

  // Keywords
  let requested = (keywords||"").split(",").map(s=>s.trim().toLowerCase()).filter(Boolean);
  if(requested.length === 0 && jdText){
    requested = unique(tokenize(jdText)).filter(w => w.length > 2).slice(0, 25);
  }
  const wordset = new Set(words);
  const matched = requested.filter(k => wordset.has(k));
  const missing = requested.filter(k => !wordset.has(k));

  // Weights
  const wSections = 25;
  const wContact  = 10;
  const wKeywords = 30;
  const wVerbs    = 10;
  const wMetrics  = 10;
  const wLength   = 10;
  const wFile     = 5;

  const sectionsScore = wSections * (secFound / sec.total);
  const contactScore  = wContact * (contactFound / contact.total);
  const keywordScore  = requested.length ? wKeywords * (matched.length / requested.length) : wKeywords * 0.5;
  const verbScore     = bullets.bulletLines ? wVerbs * (bullets.verbBullets / bullets.bulletLines) : wVerbs * 0.4;
  const metricsScore  = Math.min(metrics.metricsCount, 8) / 8 * wMetrics;
  const lengthSc      = lengthScore(wc) / 10 * wLength;
  const fileScore     = (fileType === "pdf" ? wFile : wFile * 0.6);

  let score = sectionsScore + contactScore + keywordScore + verbScore + metricsScore + lengthSc + fileScore;
  score = Math.max(0, Math.min(100, score));

  const improvements = [];
  const sectionNames = ["Summary/Objective","Experience","Education","Skills","Projects","Certifications/Awards"];
  sec.found.forEach((ok, i) => { if(!ok) improvements.push(`Add a ${sectionNames[i]} section.`); });

  const contactNames = ["professional email","phone number","LinkedIn URL","GitHub URL"];
  contact.found.forEach((ok, i) => { if(!ok) improvements.push(`Include your ${contactNames[i]}.`); });

  if(requested.length && missing.length){
    improvements.push(`Add missing JD keywords: ${missing.slice(0,8).join(", ")}.`);
  }
  if(bullets.bulletLines && bullets.verbBullets < Math.ceil(bullets.bulletLines * 0.6)){
    improvements.push("Start more bullets with strong action verbs (Led, Built, Optimized…).");
  }
  if(metrics.metricsCount < 5){
    improvements.push("Quantify impact with numbers and percentages in more bullets (e.g., +25%, -15 hrs/mo).");
  }
  if(wc < 400) improvements.push("Your resume looks short; expand with impact-driven bullets (target 450–850 words).");
  if(wc > 900) improvements.push("Your resume is long; trim to the most relevant and quantified achievements (target ≤ 850 words).");
  if(fileType !== "pdf") improvements.push("Export to PDF for stable formatting across ATS and recruiters.");

  const uniqImpro = Array.from(new Set(improvements)).slice(0, 10);

  const verdict = score >= 85 ? "Excellent — ready to apply."
    : score >= 70 ? "Good — small optimizations suggested."
    : score >= 55 ? "Fair — add keywords, metrics, and polish."
    : "Needs work — tighten sections, keywords, and quantification.";

  return {
    score,
    verdict,
    signals: {
      sectionsFound: secFound,
      sectionsTotal: sec.total,
      contactFound,
      contactTotal: contact.total,
      keywordsMatched: matched.length,
      keywordsTotal: requested.length,
      verbBullets: bullets.verbBullets,
      metricsCount: metrics.metricsCount,
      wordCount: wc
    },
    missingKeywords: missing,
    improvements: uniqImpro
  };
}
