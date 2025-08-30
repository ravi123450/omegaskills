// src/features/resumeBuild/templates/index.jsx
import React from "react";
import TemplateBase from "./TemplateBase";

/**
 * Template config shape:
 * {
 *   id: string,         // e.g., "T001"
 *   key: string,        // same as id (stable)
 *   name: string,       // human-friendly name
 *   layout: "oneColumn" | "twoLeft" | "twoRight" | "photoHeader" | "sidebarIcons" | "timeline" | "minimal" | "modern" | "elegant",
 *   header: "bar" | "underline" | "pill" | "block",
 *   accent: string,     // CSS color hex
 * }
 *
 * TemplateBase reads: cfg.layout, cfg.header, cfg.accent
 */

// ---- Tunables ---------------------------------------------------------------
// Add/remove colors, headers, layouts here. With current values: 8 * 10 * 4 = 320
// The build function truncates to a limit (default 80) so you render ~50–100 quickly.

export const ACCENTS = [
  { name: "Indigo", value: "#1e40af" },
  { name: "Blue", value: "#1d4ed8" },
  { name: "Cyan", value: "#0e7490" },
  { name: "Teal", value: "#0f766e" },
  { name: "Emerald", value: "#047857" },
  { name: "Lime", value: "#3f6212" },
  { name: "Amber", value: "#b45309" },
  { name: "Rose", value: "#be123c" },
  { name: "Purple", value: "#6d28d9" },
  { name: "Slate", value: "#334155" },
];

export const HEADERS = ["bar", "underline", "pill", "block"];

/** 
 * All layouts supported by TemplateBase.
 * Note: "modern" and "elegant" fall back to the default branch (behaves like oneColumn).
 */
export const LAYOUTS = [
  "oneColumn",
  "twoLeft",
  "twoRight",
  "photoHeader",
  "sidebarIcons",
  "timeline",
  "minimal",
  "modern",
  "elegant",
];

// ---- Builder ----------------------------------------------------------------

/**
 * Generate many template configs by layout × accent × header.
 * @param {number} limit - truncate to first N results for performance (default 80).
 * @returns {Array} fresh array of configs
 */
export function buildTemplateConfigs(limit = 80) {
  const cfgs = [];
  let id = 1;

  outer: for (const layout of LAYOUTS) {
    for (const accent of ACCENTS) {
      for (const head of HEADERS) {
        const cfg = {
          id: `T${String(id).padStart(3, "0")}`,
          key: `T${String(id).padStart(3, "0")}`,
          name: prettyName(layout, accent.name, head),
          layout,
          header: head,
          accent: accent.value,
        };
        cfgs.push(cfg);
        id++;
        if (cfgs.length >= limit) break outer;
      }
    }
  }
  return cfgs;
}

/** Pretty, human-friendly name for the gallery card */
function prettyName(layout, accentName, header) {
  const layoutLabel = {
    oneColumn: "Clean • One Column",
    twoLeft: "Modern • Two Left",
    twoRight: "Elegant • Two Right",
    photoHeader: "Photo Header",
    sidebarIcons: "Sidebar • Icons",
    timeline: "Timeline",
    minimal: "Minimal • Compact",
    modern: "Modern",
    elegant: "Elegant",
  }[layout] || layout;

  const headerLabel =
    header === "bar"
      ? "bar"
      : header === "underline"
      ? "underline"
      : header === "pill"
      ? "pill"
      : "block";

  return `${layoutLabel} • ${accentName} • ${headerLabel}`;
}

/** Look up by key (id) and return a copy; fallback to first config if not found */
export function getTemplateByKey(key, limit = 80) {
  const list = buildTemplateConfigs(limit);
  const found = list.find((t) => t.key === key);
  return found ? { ...found } : { ...list[0] };
}

// ---- Optional: tiny, fast mini preview used by TemplateSelector --------------

export function TemplateMiniPreview({ cfg, font }) {
  // Lightweight demo data so the gallery stays fast
  const demoData = {
    name: "Your Name",
    title: "Job Title",
    email: "email@example.com",
    phone: "+91 00000 00000",
    location: "City, Country",
    links: ["github.com/you", "linkedin.com/in/you"],
    summary:
      "Crisp 2–3 line summary highlighting impact, strengths, and focus areas relevant to the role.",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "AWS"],
    experience: [
      {
        role: "Senior Frontend Engineer",
        company: "Zeta Labs",
        period: "2022 – Present",
        bullets: [
          "Migrated to React 18; improved TTI by 28%.",
          "Built design system components used by 5 squads.",
        ],
      },
    ],
    projects: [
      {
        name: "ResumeBuilder Pro",
        desc: "Template engine + PDF export.",
        bullets: ["Dynamic sections", "ATS-friendly output"],
      },
    ],
    education: [{ degree: "B.Tech, Computer Science", school: "IIIT", year: "2020" }],
    certifications: [{ name: "AWS Certified Developer", issuer: "Amazon", year: "2024" }],
  };

  return (
    <div
      className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-2"
      style={{ fontFamily: font, overflow: "hidden" }}
    >
      {/* Clamp height so previews stay compact */}
      <div
        style={{
          maxHeight: 240,
          overflow: "hidden",
          ["--accent"]: cfg.accent,
          ["--resume-margin"]: "12px",
          ["--resume-lineheight"]: 1.35,
        }}
      >
        <TemplateBase data={demoData} cfg={cfg} font={font} />
      </div>
    </div>
  );
}

// Keep default export for existing imports
export default buildTemplateConfigs;
