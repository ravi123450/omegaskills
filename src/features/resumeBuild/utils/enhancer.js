// src/utils/enhancer.js
// Offline, rule-based, domain-aware resume text enhancer.
// Designed to be robust for Summary / Experience / Project bullets.
// No external libraries required.

import { DOMAIN_SUGGESTIONS } from "./domains"; // adjust path if needed

// A curated list of strong action verbs used to start bullets.
const ACTION_VERBS = [
  "Led","Spearheaded","Architected","Engineered","Implemented","Designed","Optimized","Built",
  "Developed","Managed","Directed","Launched","Scaled","Migrated","Automated","Streamlined",
  "Reduced","Improved","Boosted","Drove","Established","Formulated","Orchestrated","Integrated",
  "Accelerated","Refactored","Secured","Converted"
];

// Adverbs / power words to make lines punchier.
const POWER_PHRASES = [
  "scalably","efficiently","with measurable impact","resulting in improved performance",
  "with cross-functional collaboration","for enhanced reliability","to meet SLA targets",
  "with quality-first approach","reducing operational costs","improving user satisfaction"
];

// Some common quick typo fixes and contractions expansions
const TYPOS = {
  " teh ": " the ",
  " adn ": " and ",
  " exprience": " experience",
  " experince": " experience",
  "recieve": "receive",
  "recieved": "received",
  "behaviour": "behavior",
  "utilise": "utilize",
  "dont": "don't",
  "cant": "can't",
  "wont": "won't",
  "im ": "I'm ",
  " i ": " I "
};

// If a sentence has no digits, we will append a small metric template sometimes.
const METRIC_TEMPLATES = [
  "improving performance by {p}%",
  "reducing latency by {p}%",
  "saving {h} hours per month",
  "increasing conversion by {p}%",
  "reducing failures by {p}%",
  "supporting {n}+ concurrent users"
];

function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function rnd(min,max){ return Math.floor(min + Math.random()*(max-min+1)); }

// Clean input: remove weird tokens, multiple spaces and control chars
function cleanRawText(raw){
  if(!raw) return "";
  let s = raw.replace(/\r/g, " ").replace(/\t/g, " ").replace(/\u00A0/g, " ");
  // Remove obviously garbage sequences: repeated punctuation or non-alpha heavy tokens
  s = s.replace(/[\u0000-\u001F\u007F-\u009F]/g, " "); // control chars
  s = s.replace(/[^ -~\n]+/g, " "); // non-ascii sequences (helps remove unseen garbage)
  s = s.replace(/\.{2,}/g, "."); // multiple dots
  s = s.replace(/\s{2,}/g, " ");
  s = s.trim();
  return s;
}

// Fix a few common typos and awkward words (rule-based)
function fixTypos(s){
  let out = ` ${s} `;
  for(const [k,v] of Object.entries(TYPOS)){
    const re = new RegExp(k, "gi");
    out = out.replace(re, v);
  }
  // Fix stray punctuation from OCR/user noise
  out = out.replace(/\s+([,.;:!?])/g, "$1");
  out = out.replace(/\s{2,}/g, " ");
  return out.trim();
}

// Break text into sentences reasonably (handles newlines too)
function splitSentences(text){
  if(!text) return [];
  // First treat newlines as sentence separators
  const chunks = text.split(/\n+/).map(c => c.trim()).filter(Boolean);
  const sentences = [];
  for(const chunk of chunks){
    // If chunk contains multiple sentences, split on punctuation followed by space + capital letter / end
    const parts = chunk.split(/(?<=[.!?])\s+/);
    for(const p of parts){
      const t = p.trim();
      if(t) sentences.push(t);
    }
  }
  return sentences;
}

// Return true if sentence contains a number
function hasNumber(s){ return /\d/.test(s); }

// If no numeric metric present, attach a small plausible metric (keeps as placeholder)
function maybeAddMetric(s){
  if(hasNumber(s)) return s;
  // 40% chance to add a metric template
  if(Math.random() < 0.4){
    const tpl = pick(METRIC_TEMPLATES);
    const out = tpl.replace("{p}", String(rnd(10,45))).replace("{h}", String(rnd(5,60))).replace("{n}", String(rnd(1,500)));
    // attach as parenthetical or clause
    if(s.endsWith(".")) s = s.slice(0,-1);
    return `${s}, ${out}.`;
  }
  // else, just ensure ends with period
  return s.endsWith(".") ? s : s + ".";
}

// Make sure sentence starts with a strong verb: if not, prepend one adaptively
function ensureActionStart(s){
  // If started already with a verb-ish token (heuristic: starts with uppercase verb or common verb)
  const first = s.split(/\s+/)[0] || "";
  if(new RegExp(`^(${ACTION_VERBS.join("|")})\\b`, "i").test(s)) return s;
  // If sentence begins with "Worked" / "Led" etc, keep it (some users already have good verbs)
  if(/^[A-Z][a-z]{2,}\b/.test(first) && first.length < 12 && !first.toLowerCase().startsWith("the")) {
    // probably fine — but ensure it's capitalized
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  // Otherwise choose a strong verb and prepend (keep original subject)
  const verb = pick(ACTION_VERBS);
  // If original sentence begins with "on ..." or "for ..." or "with ...", prepend "Led"
  if(/^(on|for|with)\b/i.test(s)) {
    return `${verb} ${s.charAt(0).toLowerCase()}${s.slice(1)}`;
  }
  // Prepend verb + ensure sentence case
  return `${verb} ${s.charAt(0).toLowerCase()}${s.slice(1)}`;
}

// Inject domain keywords naturally — tries to add "using X, Y" or "with X" if not already present
function injectDomainKeywords(s, domain){
  if(!domain) return s;
  const ds = DOMAIN_SUGGESTIONS[domain];
  if(!ds) return s;
  const keywords = ds.skills || [];
  if(keywords.length === 0) return s;
  // If sentence already contains some of the keywords, don't repeat
  const lower = s.toLowerCase();
  const misses = keywords.filter(k => !lower.includes(k.toLowerCase()));
  if(misses.length === 0) return s;
  // Add up to 2 keywords
  const top = misses.slice(0,2).join(", ");
  // If s already lengthy and has "using" or "with", append nothing
  if(/\b(using|with|via|by)\b/i.test(s)) return s;
  // Append phrase
  if(s.endsWith(".")) s = s.slice(0,-1);
  return `${s} — using ${top}.`;
}

// Paraphrase small sentences: expand "made website" -> "Designed and developed website"
function paraphraseShort(s){
  // Remove leading bullet markers
  let t = s.replace(/^[\-\u2022]\s*/, "");
  // If very short (<6 words), attempt to expand with template
  const ws = t.split(/\s+/).filter(Boolean);
  if(ws.length <= 6){
    const verb = pick(["Designed","Developed","Built","Implemented","Architected","Led"]);
    // keep rest capitalized properly
    t = `${verb} ${t.charAt(0).toLowerCase()}${t.slice(1)}`;
    if(!t.endsWith(".")) t += ".";
  }
  return t;
}

// Remove repeated "Demonstrated expertise..." artifacts or repeated lines
function dedupeRepeatedFragments(lines){
  const seen = new Set();
  const out = [];
  for(const l of lines){
    const normalized = l.replace(/\s+/g," ").trim().toLowerCase();
    if(normalized && !seen.has(normalized)){
      seen.add(normalized);
      out.push(l);
    }
  }
  return out;
}

// The main pipeline for enhancing a single sentence according to field & domain
function enhanceSentence(rawSentence, domain=null, field="generic"){
  if(!rawSentence || !rawSentence.trim()) return "";

  // Step 0: basic cleaning & typo fixes
  let s = cleanRawText(rawSentence);
  s = fixTypos(s);

  // Step 1: paraphrase or expand if it's short and looks like a title/fragment
  if(field === "project" || field === "experience"){
    // bullet points: expand and ensure action start
    s = paraphraseShort(s);
    s = ensureActionStart(s);
    // add metric sometimes if none
    s = maybeAddMetric(s);
    // inject domain keywords if helpful
    s = injectDomainKeywords(s, domain);
  } else if(field === "summary"){
    // Make summary more flowing: join clauses and ensure it's 1-3 sentences
    // If user provided multiple sentences, keep first 2 and enhance
    const sentences = splitSentences(s);
    // use up to 2 sentences from user, else split heuristics
    let chosen = sentences.length ? sentences.slice(0,2).join(" ") : s;
    // fix typos and ensure capitalization
    chosen = fixTypos(chosen);
    // ensure starts strong
    if(!new RegExp(`^(${ACTION_VERBS.join("|")})\\b`, "i").test(chosen)) {
      // Prepend role-like phrase if available in domain suggestions
      const domainPhrase = domain ? domain : "";
      // Rework into professional summary template
      // If user name/role absent, produce a template-like summary using domain skills
      const ds = DOMAIN_SUGGESTIONS[domain] || {};
      const kw = (ds.skills || []).slice(0,3).join(", ");
      chosen = chosen.replace(/^([a-z])/i, (m)=>m.toUpperCase());
      if(kw) {
        chosen += ` Experienced in ${kw}.`;
      }
      // Ensure ends with period
      if(!chosen.endsWith(".")) chosen += ".";
    }
    // optionally add power phrase
    if(Math.random() < 0.6){
      chosen += " Focused on delivering measurable impact and scalable solutions.";
    }
    s = chosen;
  } else {
    // generic field: polish and ensure punctuation
    s = s.charAt(0).toUpperCase() + s.slice(1);
    if(!s.endsWith(".")) s += ".";
  }

  // Final cleaning: remove accidental repeated fragments and trim
  s = s.replace(/\s{2,}/g, " ").trim();

  return s;
}

/**
 * Public API:
 * enhanceText(rawText, domain, field)
 * - rawText: string (may contain multiple lines or bullets)
 * - domain: one of keys in DOMAIN_SUGGESTIONS (optional)
 * - field: "summary" | "experience" | "project" | "generic"
 *
 * The function preserves input structure:
 * - For experience/projects (multi-block), it enhances only bullet lines, not the header line (Role @ Company | Period / ProjectName: desc).
 * - For summary, it returns an enhanced paragraph (1-3 sentences).
 */
export function enhanceText(rawText, domain=null, field="generic"){
  if(!rawText || typeof rawText !== "string") return rawText || "";

  // If summary: process as paragraph
  if(field === "summary"){
    // Combine entire rawText, split into sentences, then enhance first 1-2 lines.
    const all = cleanRawText(rawText);
    const sentences = splitSentences(all);
    const pickSentences = sentences.length ? sentences.slice(0,2) : [all];
    const enhanced = pickSentences.map(s => enhanceSentence(s, domain, "summary")).join(" ");
    // Deduplicate if repetitive
    return enhanced.replace(/\s{2,}/g, " ").trim();
  }

  // For experience/projects: input is typically blocks separated by blank lines
  const blocks = rawText.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  const enhancedBlocks = blocks.map(block => {
    // A block typically has a header line then bullet lines
    const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
    if(lines.length === 0) return "";

    // Identify header vs bullets:
    const header = lines[0];
    const rest = lines.slice(1);

    // If there are no bullets (single line), treat whole line as a description and enhance generically
    if(rest.length === 0){
      // For a single-line project or experience entry, try to parse "Name: desc" or "Role @ Company | Period"
      if(field === "project"){
        // For projects, preserve name before ":" if present
        const [name, ...descParts] = header.split(":");
        if(descParts.length > 0){
          const desc = descParts.join(":").trim();
          const enhancedDesc = enhanceSentence(desc, domain, "project");
          return `${name.trim()}: ${enhancedDesc}`;
        } else {
          // no desc, just paraphrase
          const single = enhanceSentence(header, domain, "project");
          return single;
        }
      } else if(field === "experience"){
        // Experience single-line: preserve head (role/company) if it contains '@' or '|'
        if(/@|\|/.test(header)){
          // don't alter header, but add an explanatory bullet
          const bullet = enhanceSentence("Performed role-related responsibilities", domain, "experience");
          return `${header}\n- ${bullet}`;
        } else {
          // otherwise enhance the line ordinarily
          return enhanceSentence(header, domain, "experience");
        }
      }
    }

    // If there are bullets (rest), enhance bullets only and keep header intact
    const enhancedBullets = rest.map(line => {
      // remove leading bullet markers
      const cleaned = line.replace(/^[-•\s]*/, "");
      const enhanced = enhanceSentence(cleaned, domain, field === "projects" ? "project" : "experience");
      // ensure bullet format
      return `- ${enhanced}`;
    });

    return [header, ...enhancedBullets].join("\n");
  });

  // Deduplicate repeated lines across blocks
  const finalBlocks = dedupeRepeatedFragments(enhancedBlocks);
  return finalBlocks.join("\n\n");
}
