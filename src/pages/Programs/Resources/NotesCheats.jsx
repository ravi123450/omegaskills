// src/pages/resources/NotesCheats.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Download,
  Search,
  Tags,
  Cpu,
  Cloud,
  ShieldCheck,
  Code2,
  Database,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useAuthFlag from "@/lib/useAuthFlag";
// import UpdatesTicker from "@/components/ui/UpdatesTicker";
import { PillTicker } from "@/components/ui/MarqueeTicker";




/* local atom: section title */
function SectionTitle({ children, eyebrow }) {
  return (
    <div>
      {eyebrow && (
        <div className="mb-2">
          <Badge className="bg-orange-600/20 text-orange-300">{eyebrow}</Badge>
        </div>
      )}
      <h2 className="relative text-2xl md:text-3xl font-bold">
        {children}
        <span className="absolute -bottom-2 left-0 h-[2px] w-24 rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />
      </h2>
    </div>
  );
}


/* demo data: plug in real files later */
const LIB = [
  // Cloud
  {
    id: "c1",
    cat: "Cloud",
    title: "AWS Core Services—One Pager",
    size: "214 KB",
    ext: "PDF",
  },
  {
    id: "c2",
    cat: "Cloud",
    title: "IAM Cheatsheet (Roles/Policies)",
    size: "172 KB",
    ext: "PDF",
  },
  // DSA
  {
    id: "d1",
    cat: "DSA",
    title: "Big-O & Patterns Quick Ref",
    size: "138 KB",
    ext: "PDF",
  },
  {
    id: "d2",
    cat: "DSA",
    title: "Common DP Templates",
    size: "201 KB",
    ext: "PDF",
  },
  // Security
  {
    id: "s1",
    cat: "Security",
    title: "OWASP Top-10 Summary",
    size: "126 KB",
    ext: "PDF",
  },
  {
    id: "s2",
    cat: "Security",
    title: "JWT Hardening Checklist",
    size: "96 KB",
    ext: "PDF",
  },
  // Data
  {
    id: "ds1",
    cat: "Data",
    title: "SQL Window Functions",
    size: "189 KB",
    ext: "PDF",
  },
  {
    id: "ds2",
    cat: "Data",
    title: "Pandas Playbook",
    size: "231 KB",
    ext: "PDF",
  },
  // Dev
  {
    id: "dev1",
    cat: "Dev",
    title: "Git Everyday Commands",
    size: "84 KB",
    ext: "PDF",
  },
  {
    id: "dev2",
    cat: "Dev",
    title: "HTTP Status Codes Map",
    size: "77 KB",
    ext: "PDF",
  },
];


const CATS = ["All", "Cloud", "DSA", "Security", "Data", "Dev"];


export default function NotesCheats() {
  const isAuthed = useAuthFlag();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");


  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return LIB.filter((x) => {
      if (cat !== "All" && x.cat !== cat) return false;
      if (!ql) return true;
      return (
        x.title.toLowerCase().includes(ql) || x.cat.toLowerCase().includes(ql)
      );
    });
  }, [q, cat]);


  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <section className="relative mx-auto max-w-7xl px-4 pb-8 pt-10 md:px-6 md:pt-14">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-orange-600/20 text-orange-300 !text-base">
            Resources
          </Badge>
          <Badge className="bg-slate-800/60 text-slate-200 !text-base">
            Notes & Cheat Sheets
          </Badge>
        </div>


        <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
          Concise notes,{" "}
          <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
            ready for revision
          </span>
        </h1>


        <p className="mt-4 max-w-2xl text-base md:text-lg text-slate-300">
          One-pagers and cheat sheets for Cloud, DSA, Security, SQL, Git, and
          more. Save to dashboard, download, or print before interviews.
        </p>


        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            asChild
            className="h-11 px-4 bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black"
          >
            <Link to={isAuthed ? "/dashboard" : "/login"}>
              {isAuthed ? "Save favorites to Dashboard" : "Log in to Save"}
            </Link>
          </Button>
          <Link
            to="/resources/roadmaps"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-orange-300"
          >
            Explore roadmaps <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>


      <section>
        <PillTicker
          className="mt-0 mb-5"
          speed={38}
          items={[
            "⭐ Notes are being added — stay tuned!",
            "🔒 Log in to access resources & save favorites (stars).",
          ]}
        />
      </section>


      {/* Body */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-2 md:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Left column: library */}
          <div className="md:col-span-2 space-y-6">
            {/* search + filter */}
            <Card className="border-slate-800/70 bg-slate-900/40">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-800/60 bg-slate-900/40 px-3 py-2 sm:flex-1">
                    <Search className="h-4 w-4 text-orange-300" />
                    <input
                      placeholder="Search titles (e.g., IAM, DP, Window functions)"
                      className="w-full bg-transparent text-sm text-slate-100 outline-none"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                    />
                  </div>


                  <div className="flex items-center gap-2">
                    <Tags className="h-4 w-4 text-orange-300 hidden sm:block" />
                    <select
                      value={cat}
                      onChange={(e) => setCat(e.target.value)}
                      className="rounded-xl border border-slate-800/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 outline-none"
                      aria-label="Filter by category"
                    >
                      {CATS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setQ("");
                        setCat("All");
                      }}
                      className="bg-slate-800 text-slate-100 hover:bg-slate-700"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* list */}
            <div className="grid gap-3">
              {filtered.map((doc) => (
                <Card
                  key={doc.id}
                  className="border-slate-800/70 bg-slate-900/40 hover:border-orange-600/50 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-600/15">
                          <FileText className="h-5 w-5 text-orange-300" />
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-100 truncate">
                            {doc.title}
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                            <span className="rounded-md border border-slate-700/60 bg-slate-900/40 px-2 py-0.5">
                              {doc.cat}
                            </span>
                            <span className="rounded-md border border-slate-700/60 bg-slate-900/40 px-2 py-0.5">
                              {doc.ext} • {doc.size}
                            </span>
                          </div>
                        </div>
                      </div>


                      <div className="flex gap-2">
                        <Button
                          asChild
                          variant="secondary"
                          className="bg-slate-800 text-slate-100 hover:bg-slate-700"
                        >
                          {/* TODO: swap href with real file url */}
                          <a href="#" onClick={(e) => e.preventDefault()}>
                            Preview
                          </a>
                        </Button>
                        <Button
                          asChild
                          className="bg-orange-500 text-slate-900 hover:bg-orange-400"
                        >
                          {/* TODO: swap href with real file url */}
                          <a href="#" onClick={(e) => e.preventDefault()}>
                            <Download className="mr-1 h-4 w-4" /> Download
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}


              {filtered.length === 0 && (
                <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6 text-slate-300">
                  No notes found. Try a different keyword or category.
                </div>
              )}
            </div>
          </div>


          {/* Right column: quick packs */}
          <aside className="md:col-span-1">
            <div className="md:sticky md:top-24 space-y-4">
              {/* icons row */}
              <div className="grid grid-cols-5 gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900/40 border border-slate-800/60">
                  <Cloud className="h-4 w-4 text-orange-300" />
                </span>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900/40 border border-slate-800/60">
                  <Code2 className="h-4 w-4 text-orange-300" />
                </span>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900/40 border border-slate-800/60">
                  <ShieldCheck className="h-4 w-4 text-orange-300" />
                </span>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900/40 border border-slate-800/60">
                  <Database className="h-4 w-4 text-orange-300" />
                </span>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900/40 border border-slate-800/60">
                  <Cpu className="h-4 w-4 text-orange-300" />
                </span>
              </div>


              <Card className="border-slate-800/70 bg-slate-900/50">
                <CardContent className="p-6">
                  <div className="mb-2">
                    <Badge className="bg-orange-600/20 text-orange-300">
                      Quick packs
                    </Badge>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300/90">
                    {[
                      "Cloud + Security pack (7 PDFs)",
                      "DSA + Patterns pack (5 PDFs)",
                      "SQL + Pandas pack (6 PDFs)",
                    ].map((line) => (
                      <li key={line} className="flex items-start gap-2">
                        <BadgeCheck className="h-4 w-4 text-orange-300 mt-0.5" />
                        {line}
                      </li>
                    ))}
                  </ul>


                  <div className="mt-5 grid gap-2">
                    <Button
                      asChild
                      className="w-full text-base bg-orange-500 text-slate-900 hover:bg-orange-400"
                    >
                      <Link to={isAuthed ? "/dashboard" : "/login"}>
                        {isAuthed ? "Save pack to Dashboard" : "Log in to Save"}
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="secondary"
                      className="w-full text-sm bg-slate-800 text-slate-100 hover:bg-slate-700"
                    >
                      <Link to="/resources/roadmaps">View Roadmaps</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}





