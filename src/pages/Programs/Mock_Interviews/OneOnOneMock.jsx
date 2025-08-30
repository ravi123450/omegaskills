// src/pages/mock/OneOnOneMock.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Timer,
  Target,
  UserRoundCheck,
  ArrowRight,
  BadgeCheck,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useAuthFlag from "@/lib/useAuthFlag";
import { getMockSlotsPublic } from "@/lib/api";

/* ---------- tiny atom ---------- */
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

/* ---------- page ---------- */
export default function OneOnOneMock() {
  const isAuthed = useAuthFlag();

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // load public sample slots
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = await getMockSlotsPublic();
        setSlots(Array.isArray(list) ? list : []);
      } catch {
        setSlots([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // group by track (DSA / SYSTEM DESIGN / BEHAVIORAL / etc.)
  const grouped = useMemo(() => {
    const m = new Map();
    for (const s of slots) {
      const key = (s.track || "GENERAL").toUpperCase();
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(s);
    }
    // keep deterministic order: DSA, SYSTEM DESIGN, BEHAVIORAL, then others
    const desired = ["DSA", "SYSTEM DESIGN", "BEHAVIORAL"];
    const ordered = new Map();
    for (const k of desired) if (m.has(k)) ordered.set(k, m.get(k));
    for (const [k, v] of m.entries()) if (!ordered.has(k)) ordered.set(k, v);
    return ordered;
  }, [slots]);

  const formats = [
    {
      icon: <Timer className="h-5 w-5 text-orange-300" />,
      title: "45–60 mins live",
      desc: "Structured interview with timed rounds and quick debrief.",
    },
    {
      icon: <Target className="h-5 w-5 text-orange-300" />,
      title: "Role-focused",
      desc: "DSA, System Design, Cloud, Security, or Behavioral — you pick.",
    },
    {
      icon: <UserRoundCheck className="h-5 w-5 text-orange-300" />,
      title: "Mentor feedback",
      desc: "Specific strengths, gaps, and improvement actions.",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <section className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 md:px-6 md:pt-14">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-orange-600/20 text-orange-300 !text-base">Mock Interviews</Badge>
          <Badge className="bg-slate-800/60 text-slate-200 !text-base">1:1 Sessions</Badge>
        </div>

        <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
          Nail interviews with{" "}
          <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
            1:1 mentor sessions
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-base md:text-lg text-slate-300">
          Practice real interview rounds with mentors. Get precise, actionable feedback and a
          focused action plan to improve fast.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            asChild
            className="h-11 px-4 bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black"
          >
            <Link to={isAuthed ? "/dashboard" : "/login"}>
              {isAuthed ? "Book a Session" : "Log in to Book"}
            </Link>
          </Button>
          <Link
            to="/mock-interviews/question-bank"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-orange-300"
          >
            Practice with Question Bank <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-2 md:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Left column */}
          <div className="md:col-span-2 space-y-10">
            {/* Formats */}
            <div>
              <SectionTitle eyebrow="Formats">Choose your focus</SectionTitle>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {formats.map((f) => (
                  <Card key={f.title} className="border-slate-800/70 bg-slate-900/40 text-center">
                    <CardContent className="p-6">
                      <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl bg-orange-600/15">
                        {f.icon}
                      </div>
                      <div className="font-semibold">{f.title}</div>
                      <p className="mt-1 text-sm text-slate-300/90">{f.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Availability (dynamic) */}
            <div>
              <SectionTitle eyebrow="Availability">Sample slots</SectionTitle>

              {/* Loading state */}
              {loading && (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="border-slate-800/70 bg-slate-900/40">
                      <CardContent className="p-5">
                        <div className="h-5 w-28 rounded bg-slate-800/60" />
                        <div className="mt-3 h-4 w-56 rounded bg-slate-800/60" />
                        <div className="mt-6 h-9 w-24 rounded bg-slate-800/60" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!loading && slots.length === 0 && (
                <Card className="mt-8 border-slate-800/70 bg-slate-900/40">
                  <CardContent className="p-6 text-sm text-slate-300">
                    Slots will be posted soon. Check back later.
                  </CardContent>
                </Card>
              )}

              {/* Grouped tracks */}
              {!loading && slots.length > 0 && (
                <div className="mt-8 space-y-6">
                  {Array.from(grouped.entries()).map(([track, list]) => (
                    <SlotSection key={track} track={track} list={list} isAuthed={isAuthed} />
                  ))}
                </div>
              )}
            </div>

            {/* What you get */}
            <div>
              <SectionTitle eyebrow="What you get">Clear, specific feedback</SectionTitle>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  "Role-based questions & patterns",
                  "Communication & problem-solving feedback",
                  "Score rubric and next steps",
                  "Follow-up resource links",
                ].map((p) => (
                  <Card key={p} className="border-slate-800/70 bg-slate-900/40">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-2 text-sm text-slate-300/90">
                        <BadgeCheck className="h-4 w-4 text-orange-300 mt-0.5" />
                        {p}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right column (sticky) */}
          <aside className="md:col-span-1">
            <div className="md:sticky md:top-24 space-y-4">
              <Card className="border-slate-800/70 bg-slate-900/50">
                <CardContent className="p-6">
                  <div className="mb-2">
                    <Badge className="bg-orange-600/20 text-orange-300">Includes</Badge>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300/90">
                    {[
                      "30–40 min interview",
                      "10–15 min feedback",
                      "Action plan",
                      "Optional re-book",
                    ].map((x) => (
                      <li key={x} className="flex items-start gap-2">
                        <BadgeCheck className="h-4 w-4 text-orange-300 mt-0.5" />
                        {x}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 grid gap-2">
                    <Button
                      asChild
                      className="w-full text-base bg-orange-500 text-slate-900 hover:bg-orange-400"
                    >
                      <Link to={isAuthed ? "/dashboard" : "/login"}>
                        {isAuthed ? "Book Now" : "Log in to Book"}
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="secondary"
                      className="w-full text-sm bg-slate-800 text-slate-100 hover:bg-slate-700"
                    >
                      <Link to="/mock-interviews/question-bank">Question Bank</Link>
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

/* ---------- pieces ---------- */
function SlotSection({ track, list, isAuthed }) {
  return (
    <div className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-4">
      <div className="text-xs tracking-wide text-slate-400">{track}</div>
      <div className="mt-2 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.slice(0, 6).map((s) => (
          <SlotCard key={s.id} s={s} isAuthed={isAuthed} />
        ))}
      </div>
    </div>
  );
}

function SlotCard({ s, isAuthed }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-900/60 px-4 py-3">
      <div className="min-w-0">
        <div className="font-semibold truncate">
          {s.day_label} • {s.time_label} {s.tz}
        </div>
        <div className="text-xs text-slate-400">
          {s.mode} • {s.capacity} seat{s.capacity > 1 ? "s" : ""}
        </div>
      </div>
      <Button
        asChild
        className="h-9 px-4 shrink-0 bg-orange-500 text-slate-900 hover:bg-orange-400"
        title={isAuthed ? "Book this slot" : "Log in to book"}
      >
        <Link to={isAuthed ? "/dashboard" : "/login"}>
          {isAuthed ? (
            "Book"
          ) : (
            <span className="inline-flex items-center gap-1">
              <LogIn className="h-4 w-4" /> Log in
            </span>
          )}
        </Link>
      </Button>
    </div>
  );
}
