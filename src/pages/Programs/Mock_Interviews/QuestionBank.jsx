// src/pages/mock/QuestionBank.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  LibraryBig,
  Search,
  Filter,
  ListChecks,
  Code2,
  ServerCog,
  Cloud,
  ShieldCheck,
  ChevronRight,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useAuthFlag from "@/lib/useAuthFlag";

/* tiny atom (same visual as your other pages) */
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

const BANK = [
  // DSA
  { id: "d1", cat: "DSA", level: "Easy", title: "Two Sum — HashMap approach", slug: "two-sum" },
  { id: "d2", cat: "DSA", level: "Medium", title: "Longest Substring Without Repeat", slug: "longest-substring" },
  { id: "d3", cat: "DSA", level: "Medium", title: "Kth Smallest in BST", slug: "kth-smallest-bst" },
  { id: "d4", cat: "DSA", level: "Hard", title: "Minimum Window Substring", slug: "min-window-substring" },

  // System Design
  { id: "s1", cat: "System Design", level: "Medium", title: "Design URL Shortener", slug: "design-url-shortener" },
  { id: "s2", cat: "System Design", level: "Medium", title: "Design Rate Limiter", slug: "design-rate-limiter" },
  { id: "s3", cat: "System Design", level: "Hard", title: "Design Twitter (timeline + fanout)", slug: "design-twitter" },

  // Cloud
  { id: "c1", cat: "Cloud", level: "Easy", title: "VPC vs Subnet vs AZ", slug: "vpc-subnet-az" },
  { id: "c2", cat: "Cloud", level: "Medium", title: "S3 durability vs availability", slug: "s3-durability-availability" },
  { id: "c3", cat: "Cloud", level: "Medium", title: "Stateless web on AWS — reference arch", slug: "stateless-web-aws" },

  // Security
  { id: "sec1", cat: "Security", level: "Easy", title: "OWASP Top 10 — quick rundown", slug: "owasp-top10" },
  { id: "sec2", cat: "Security", level: "Medium", title: "JWT pitfalls & hardening", slug: "jwt-pitfalls" },
  { id: "sec3", cat: "Security", level: "Hard", title: "Threat model a fintech API", slug: "threat-model-fintech" },
];

const CATS = ["All", "DSA", "System Design", "Cloud", "Security"];
const LEVELS = ["All", "Easy", "Medium", "Hard"];

export default function QuestionBank() {
  const isAuthed = useAuthFlag();

  /* local filter state */
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [lvl, setLvl] = useState("All");

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return BANK.filter((item) => {
      if (cat !== "All" && item.cat !== cat) return false;
      if (lvl !== "All" && item.level !== lvl) return false;
      if (!ql) return true;
      return (
        item.title.toLowerCase().includes(ql) ||
        item.cat.toLowerCase().includes(ql) ||
        item.level.toLowerCase().includes(ql)
      );
    });
  }, [q, cat, lvl]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <section className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 md:px-6 md:pt-14">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-orange-600/20 text-orange-300 !text-base">Mock Interviews</Badge>
          <Badge className="bg-slate-800/60 text-slate-200 !text-base">Question Bank</Badge>
        </div>

        <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
          Practice from a{" "}
          <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
            curated bank
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-base md:text-lg text-slate-300">
          Topic-tagged questions for DSA, System Design, Cloud, and Security. Filter by category or difficulty and practice smart.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            asChild
            className="h-11 px-4 bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black"
          >
            <Link to={isAuthed ? "/dashboard" : "/login"}>
              {isAuthed ? "Track progress in Dashboard" : "Log in to Track"}
            </Link>
          </Button>
          <Link
            to="/mock-interviews/one-one"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-orange-300"
          >
            Book a 1:1 mock <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-2 md:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Left column: results */}
          <div className="md:col-span-2 space-y-6">
            {/* search + filters (compact for mobile) */}
            <Card className="border-slate-800/70 bg-slate-900/40">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-800/60 bg-slate-900/40 px-3 py-2 sm:flex-1">
                    <Search className="h-4 w-4 text-orange-300" />
                    <input
                      placeholder="Search by title, category or level"
                      className="w-full bg-transparent text-sm text-slate-100 outline-none"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <div className="relative">
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
                    </div>

                    <div className="relative">
                      <select
                        value={lvl}
                        onChange={(e) => setLvl(e.target.value)}
                        className="rounded-xl border border-slate-800/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 outline-none"
                        aria-label="Filter by difficulty"
                      >
                        {LEVELS.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setQ("");
                        setCat("All");
                        setLvl("All");
                      }}
                      className="bg-slate-800 text-slate-100 hover:bg-slate-700 inline-flex items-center gap-2"
                    >
                      <Filter className="h-4 w-4" /> Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* results list */}
            <div className="grid gap-3">
              {filtered.map((item) => (
                <Card
                  key={item.id}
                  className="border-slate-800/70 bg-slate-900/40 hover:border-orange-600/50 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {/* category icon */}
                          <span className="grid h-8 w-8 place-items-center rounded-lg bg-orange-600/15">
                            {item.cat === "DSA" && <Code2 className="h-4 w-4 text-orange-300" />}
                            {item.cat === "System Design" && <ServerCog className="h-4 w-4 text-orange-300" />}
                            {item.cat === "Cloud" && <Cloud className="h-4 w-4 text-orange-300" />}
                            {item.cat === "Security" && <ShieldCheck className="h-4 w-4 text-orange-300" />}
                          </span>
                          <div className="font-semibold text-slate-100 truncate">
                            {item.title}
                          </div>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          <span className="rounded-md border border-slate-700/60 bg-slate-900/40 px-2 py-0.5">
                            {item.cat}
                          </span>
                          <span className="rounded-md border border-slate-700/60 bg-slate-900/40 px-2 py-0.5">
                            {item.level}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          asChild
                          variant="secondary"
                          className="bg-slate-800 text-slate-100 hover:bg-slate-700"
                        >
                          <Link to={`/mock-interviews/question-bank/${item.slug}`}>
                            View
                          </Link>
                        </Button>
                        <Button
                          asChild
                          className="bg-orange-500 text-slate-900 hover:bg-orange-400"
                        >
                          <Link to={isAuthed ? "/dashboard" : "/login"}>
                            {isAuthed ? "Add to practice" : "Log in"}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filtered.length === 0 && (
                <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6 text-slate-300">
                  No questions found. Try changing filters.
                </div>
              )}
            </div>
          </div>

          {/* Right column: tips */}
          <aside className="md:col-span-1">
            <div className="md:sticky md:top-24 space-y-4">
              <Card className="border-slate-800/70 bg-slate-900/50">
                <CardContent className="p-6">
                  <div className="mb-2">
                    <Badge className="bg-orange-600/20 text-orange-300">Pro tips</Badge>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300/90">
                    {[
                      "Time-box each attempt (e.g., 25 mins).",
                      "Explain trade-offs out loud when practicing.",
                      "Write tests or at least edge cases.",
                      "Review solutions and re-try after 48h.",
                    ].map((p) => (
                      <li key={p} className="flex items-start gap-2">
                        <BadgeCheck className="h-4 w-4 text-orange-300 mt-0.5" />
                        {p}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 grid gap-2">
                    <Button
                      asChild
                      className="w-full text-base bg-orange-500 text-slate-900 hover:bg-orange-400"
                    >
                      <Link to={isAuthed ? "/dashboard" : "/login"}>
                        {isAuthed ? "Track Practice" : "Log in to Track"}
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="secondary"
                      className="w-full text-sm bg-slate-800 text-slate-100 hover:bg-slate-700"
                    >
                      <Link to="/mock-interviews/one-one">Book 1:1 Mock</Link>
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
