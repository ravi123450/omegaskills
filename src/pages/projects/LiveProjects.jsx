// src/pages/projects/LiveProjects.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

/* ---------- Load numbered screenshots (Vite glob) ---------- */
const imported = import.meta.glob("@/assets/images/*.png", { eager: true });
const toNum = (p) => {
  const m = /\/(\d+)\.png$/i.exec(p);
  return m ? parseInt(m[1], 10) : NaN;
};
const SHOTS = Object.fromEntries(
  Object.entries(imported)
    .map(([p, m]) => [toNum(p), m.default])
    .filter(([n]) => Number.isFinite(n))
);
/* Exactly 3 images per project starting at N */
const trio = (start) => [SHOTS[start], SHOTS[start + 1], SHOTS[start + 2]].filter(Boolean);

/* -------------------- Projects -------------------- */
const PROJECTS = [
  {
    id: "nuv0la",
    title: "Nuv0la – Fitness Food Delivery",
    desc:
      "Subscription fitness meals (MERN). Plans, auth, cart, payments. Deployed on AWS.",
    stack: ["MERN", "MongoDB", "React", "Node.js", "AWS"],
    href: "https://nuv0la.online",
    images: trio(1), // 1,2,3
    badge: "AWS + MERN",
  },
  {
    id: "resume-screener",
    title: "Resume Screener (NLP)",
    desc:
      "ATS scoring vs JD, keyword gap insights, exportable feedback.",
    stack: ["Python", "spaCy", "Scikit-learn", "Streamlit"],
    href: "/projects/resume-screener",
    images: trio(4), // 4,5,6
    badge: "AI / NLP",
  },
  {
    id: "retail-forecast",
    title: "Retail Sales Forecasting",
    desc:
      "Prophet time-series for multi-store trends; dashboards for seasonality & promos.",
    stack: ["Python", "Pandas", "Prophet", "Matplotlib"],
    href: "/projects/retail-forecast",
    images: trio(7), // 7,8,9
    badge: "Data Science",
  },
];

/* ---------- Reusable Project Card ---------- */
function ProjectCard({ p, activeIdx }) {
  return (
    <div className="relative w-full sm:max-w-xl md:max-w-2xl mx-auto">
      <div className="fx-border" />
      <Card className="fx-card">
        <CardContent className="p-4 md:p-4">
          {/* Slideshow area */}
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-[#0c111b] ring-1 ring-white/10">
            {p.images.length ? (
              p.images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`${p.title} ${i + 1}`}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-600 ease-out ${
                    i === activeIdx ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))
            ) : (
              <div className="grid h-full w-full place-items-center text-white/50">
                No images
              </div>
            )}
            <span className="gloss" />
          </div>

          {/* Content */}
          <div className="mt-3 title">
            <h3 className="text-sm md:text-base font-semibold leading-snug">{p.title}</h3>
            <Badge className="stack-badge text-[10px]">{p.badge}</Badge>
          </div>
          <p className="mt-2 text-xs md:text-sm text-white/75">{p.desc}</p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {p.stack.map((s) => (
              <span key={s} className="pill text-[10px] px-2 py-0.5">
                {s}
              </span>
            ))}
          </div>

          <div className="mt-3 flex justify-end">
            {p.href.startsWith("http") ? (
              <a
                href={p.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-fuchsia-400/40 bg-fuchsia-500/20 px-2.5 py-1 text-xs font-medium text-fuchsia-100 hover:bg-fuchsia-500/30"
              >
                View <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <Link
                to={p.href}
                className="inline-flex items-center gap-1 rounded-full border border-fuchsia-400/40 bg-fuchsia-500/20 px-2.5 py-1 text-xs font-medium text-fuchsia-100 hover:bg-fuchsia-500/30"
              >
                View <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------- Spotlight Auto-Carousel ---------- */
function SpotlightShowcase({ projects, imageMs = 2500, slideMs = 300 }) {
  const [projIdx, setProjIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [sliding, setSliding] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      const imgs = projects[projIdx]?.images?.length || 0;
      if (imgIdx < imgs - 1) {
        setImgIdx((i) => i + 1);
      } else {
        setSliding(true);
        setTimeout(() => {
          setProjIdx((p) => (p + 1) % projects.length);
          setImgIdx(0);
          setSliding(false);
        }, slideMs);
      }
    }, imageMs);
    return () => clearInterval(t);
  }, [projects, projIdx, imgIdx, imageMs, slideMs]);

  const current = projects[projIdx];

  return (
    <div className="relative mx-auto w-full sm:max-w-xl md:max-w-2xl">
      <div
        className={`transition-transform duration-300 ease-out ${
          sliding ? "-translate-x-2 opacity-90" : "translate-x-0 opacity-100"
        }`}
      >
        <ProjectCard p={current} activeIdx={imgIdx} />
      </div>

      <div className="mt-4 flex justify-center gap-1.5">
        {projects.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setProjIdx(i);
              setImgIdx(0);
            }}
            className={`h-1.5 w-4 rounded-full transition ${
              i === projIdx ? "bg-white" : "bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------- Page -------------------- */
export default function LiveProjects() {
  return (
    <main className="text-white bg-[#0a0d14]">
      <style>{`
        :root{
          --glass: rgba(255,255,255,0.05);
          --stroke: rgba(255,255,255,0.12);
          --shine: linear-gradient(100deg, transparent 0%, rgba(255,255,255,.12) 45%, transparent 60%);
        }
        .fx-card { position: relative; border-radius: 20px; background: var(--glass); border: 1px solid var(--stroke); backdrop-filter: saturate(120%) blur(8px); transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease; will-change: transform; }
        .fx-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.18); box-shadow: 0 14px 40px -18px rgba(0,0,0,0.6); }
        .fx-border { position: absolute; inset: -1px; border-radius: 22px; background: conic-gradient(from 220deg, #a855f7, #22d3ee, #fff0, #a855f7); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; padding: 1px; opacity: .18; pointer-events: none; filter: blur(0.2px); animation: spin 8s linear infinite; }
        @keyframes spin { to { transform: rotate(1turn); } }

        .gloss { position: absolute; inset: 0; border-radius: 16px; mix-blend-mode: screen; background: var(--shine); transform: translateX(-120%); transition: transform .9s ease; pointer-events: none; opacity: .35; }
        .fx-card:hover .gloss { transform: translateX(120%); }

        .title { display:flex; align-items:flex-start; justify-content:space-between; gap:.75rem; }
        .stack-badge{ background: rgba(56,189,248,.16); color:#bffaff; border:1px solid rgba(125,211,252,.35); }
        .pill{ display:inline-block; font-size:11px; padding:.25rem .5rem; border-radius:999px; background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); color:rgba(255,255,255,.85); }

        .bg-flare{ position:absolute; inset:0; pointer-events:none; overflow:hidden; }
        .bg-flare::before, .bg-flare::after{ content:""; position:absolute; filter: blur(60px); opacity:.18; }
        .bg-flare::before{ width:420px; height:420px; left:-120px; top:-80px; background: radial-gradient(circle at 30% 30%, #a855f7, transparent 60%); }
        .bg-flare::after{ width:380px; height:380px; right:-100px; top:20%; background: radial-gradient(circle at 70% 30%, #22d3ee, transparent 60%); }
      `}</style>

      <div className="bg-flare" />

      <section className="mx-auto max-w-7xl px-4 pt-10 md:px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
          Projects & Testimonials
        </div>
        <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight">Showcase</h1>
        <p className="mt-2 max-w-2xl text-white/70">
            “Our clients are happy with our projects. These are our basic testimonials. 
              If you need any, contact us or login to our website.”
        </p>

        {/* Spotlight auto-carousel */}
        <div className="mt-10">
          <SpotlightShowcase projects={PROJECTS} />
        </div>
      </section>
    </main>
  );
}
