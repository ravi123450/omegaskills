// src/features/resumeBuild/TemplateSelector.jsx
import React, { useMemo, useState } from "react";
import TemplateBase from "./templates/TemplateBase";
import { buildTemplateConfigs, TemplateMiniPreview } from "./templates";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, LayoutTemplate, Sparkles, Search } from "lucide-react";

/* --- Local SAMPLE for fallback preview --- */
const SAMPLE = {
  name: "Alex Morgan",
  title: "Software Engineer",
  email: "alex.morgan@example.com",
  phone: "+91 98765 43210",
  location: "Hyderabad, IN",
  links: ["github.com/alexm", "linkedin.com/in/alexm"],
  summary:
    "Full-stack engineer with 4+ years building reliable web apps. Passionate about performance, DX, and clean architecture.",
  skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "AWS", "CI/CD", "Testing"],
  experience: [
    {
      role: "Senior Frontend Engineer",
      company: "Zeta Labs",
      period: "2022 – Present",
      bullets: [
        "Led migration to React 18 + hooks; improved TTI by 28%.",
        "Built design system components adopted across 5 squads.",
        "A/B tests delivered +14% conversion.",
      ],
    },
    {
      role: "Full-Stack Developer",
      company: "NovaWorks",
      period: "2020 – 2022",
      bullets: [
        "Node.js microservices; failure rate -40%.",
        "PostgreSQL indexing & cache cut query time -65%.",
        "Cypress e2e stability improved.",
      ],
    },
  ],
  projects: [
    {
      name: "ResumeBuilder Pro",
      desc: "Open-source builder with 30+ templates & PDF export.",
      bullets: ["Dynamic template engine", "AI text suggestions", "ATS-friendly output"],
    },
  ],
  education: [{ degree: "B.Tech, Computer Science", school: "IIIT Hyderabad", year: "2020" }],
};

export default function TemplateSelector({ font, onClose, onPick, limit }) {
  const all = useMemo(() => {
    const arr = (typeof limit === "number" ? buildTemplateConfigs(limit) : buildTemplateConfigs()) || [];
    return arr.map((t, i) => ({
      ...t,
      __key: t.key ?? t.id ?? t.name ?? `tpl-${i}`,
    }));
  }, [limit]);

  const [query, setQuery] = useState("");
  const [activeKey, setActiveKey] = useState(all[0]?.__key);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((t) => {
      const name = t.name ? String(t.name).toLowerCase() : "";
      const layout = t.layout ? String(t.layout).toLowerCase() : "";
      const header = t.header ? String(t.header).toLowerCase() : "";
      return name.includes(q) || layout.includes(q) || header.includes(q);
    });
  }, [all, query]);

  const hasMini =
    typeof TemplateMiniPreview === "function" ||
    (TemplateMiniPreview && typeof TemplateMiniPreview.default === "function");
  const Mini = hasMini ? (TemplateMiniPreview.default || TemplateMiniPreview) : null;

  const choose = () => {
    const chosen = all.find((t) => t.__key === activeKey) || all[0];
    if (chosen) onPick({ ...chosen });
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal container */}
      <div className="absolute inset-0 mx-auto flex max-w-7xl items-start justify-center p-4 md:p-8">
        <Card className="relative w-full max-h-[92vh] overflow-hidden border-slate-800/60 bg-slate-900/60 backdrop-blur-xl shadow-xl rounded-2xl">
          <CardContent className="p-4 md:p-6 h-full flex flex-col">
            {/* Header (sticky) */}
            <div className="sticky top-0 z-10 -mx-4 -mt-4 bg-slate-900/80 px-4 pt-4 pb-3 md:-mx-6 md:px-6 border-b border-slate-800/60 backdrop-blur">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-1">
                    <Badge className="bg-orange-600/20 text-orange-300">Template Gallery</Badge>
                  </div>
                  <h3 className="text-xl font-bold text-white md:text-2xl">Pick a style & layout</h3>
                  <p className="mt-1 text-sm text-slate-300/90">
                    Live mini-previews below match header style, layout and accent.
                  </p>
                </div>

                {/* Search + Close */}
                <div className="flex w-full items-center gap-2 md:w-auto">
                  <div className="relative w-full md:w-72">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      className="w-full rounded-xl border border-slate-800/60 bg-slate-900/40 py-2 pl-9 pr-3 text-sm text-slate-100 outline-none focus:border-orange-600"
                      placeholder="Search templates…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") choose();
                      }}
                    />
                  </div>
                  <Button
                    variant="secondary"
                    className="bg-slate-800 text-slate-100 hover:bg-slate-700 cursor-pointer hover:text-orange-500"
                    onClick={onClose}
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Scrollable grid region */}
            <div className="flex-1 min-h-0 mt-4">
              <div
                className="max-h-[72vh] overflow-y-auto pr-2 custom-scrollbar"
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((cfg) => {
                    const selected = activeKey === cfg.__key;
                    return (
                      <button
                        key={cfg.__key}
                        className={[
                          "group text-left rounded-2xl border bg-slate-900/40 backdrop-blur transition",
                          selected
                            ? "border-orange-600/60 ring-2 ring-orange-500/40"
                            : "border-slate-800/60 hover:-translate-y-0.5 hover:border-orange-600/50",
                        ].join(" ")}
                        onClick={() => setActiveKey(cfg.__key)}
                        title={`Select ${cfg.name ?? "Template"}`}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="flex items-center justify-between px-4 pt-4">
                          <div className="flex items-center gap-2 text-orange-300">
                            <LayoutTemplate className="h-4 w-4" />
                            <span className="text-sm font-semibold">
                              {cfg.name ?? "Untitled"}
                            </span>
                          </div>
                          <Badge className="bg-slate-800 text-slate-300">
                            {cfg.layout ?? "custom"}
                          </Badge>
                        </div>

                        <div className="p-3">
                          {Mini ? (
                            <Mini cfg={cfg} font={font} />
                          ) : (
                            <div
                              className="scaleMini"
                              style={{ ["--accent"]: cfg.accent, fontFamily: font }}
                            >
                              <TemplateBase data={SAMPLE} cfg={cfg} font={font} />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between px-4 pb-4">
                          <span className="text-xs text-slate-400">
                            Header:{" "}
                            <strong className="text-slate-300">
                              {cfg.header ?? "default"}
                            </strong>
                          </span>
                          <span
                            className="inline-flex h-5 w-5 rounded-full border"
                            style={{
                              background: cfg.accent || "transparent",
                              borderColor: "rgba(255,255,255,.16)",
                            }}
                            title={`Accent: ${cfg.accent ?? "none"}`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer (sticky) */}
            <div className="sticky bottom-0 z-10 -mx-4 -mb-4 bg-slate-900/80 px-4 pb-4 pt-3 md:-mx-6 md:pb-6 md:px-6 border-t border-slate-800/60 backdrop-blur">
              <div className="mt-0 flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400">
                  Pro tip: Try different headers (<span className="text-slate-200">bar</span>,{" "}
                  <span className="text-slate-200">underline</span>,{" "}
                  <span className="text-slate-200">pill</span>,{" "}
                  <span className="text-slate-200">block</span>) with the same layout.
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    className="bg-slate-800 text-slate-100 hover:bg-slate-700"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black"
                    onClick={choose}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Use This Template
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
