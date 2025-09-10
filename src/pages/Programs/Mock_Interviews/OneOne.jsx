// src/pages/mock/OneOne.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthProvider";
import {
  Timer,
  Target,
  UserRoundCheck,
  BadgeCheck,
  CalendarDays,
  ExternalLink,
} from "lucide-react";
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

export default function OneOne() {
  const auth = useAuth?.();
  const isAuthed = !!(auth?.user || auth?.token || auth?.auth_token);

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formUrl, setFormUrl] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoading(true);
        const list = await getMockSlotsPublic();
        if (!cancel) setSlots(Array.isArray(list) ? list : []);
      } catch {
        if (!cancel) setSlots([]);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    const ENV_URL = import.meta?.env?.VITE_MOCK_INTERVIEWS_FORM_URL || "";
    setFormUrl(ENV_URL);
  }, []);
  const bookingHref =
    formUrl && /^https?:\/\//i.test(formUrl) ? formUrl : undefined;

  const grouped = useMemo(() => {
    const m = new Map();
    for (const s of slots) {
      const key = (s.track || "GENERAL").toUpperCase();
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(s);
    }
    const order = [
      "DSA",
      "SYSTEM DESIGN",
      "BEHAVIORAL",
      "SOFT SKILLS",
      "GENERAL",
    ];
    const out = new Map();
    for (const k of order) if (m.has(k)) out.set(k, m.get(k));
    for (const [k, v] of m.entries()) if (!out.has(k)) out.set(k, v);
    return out;
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

  /* ---------- NEW: Packages for Mock Interviews (₹199 / ₹349 / ₹599) ---------- */
  const packages = useMemo(
    () => [
      {
        slug: "basic",
        name: "Basic",
        price: "₹199",
        popular: false,
        accent: "border-slate-800/70 bg-slate-900/50",
        pitch: "Single 1:1 mock with quick feedback. Best to try the format.",
        features: ["1 session (30–40 min)", "10–15 min feedback", "Action plan"],
        cta: "Choose Basic",
      },
      {
        slug: "standard",
        name: "Standard",
        price: "₹349",
        popular: true,
        accent: "border-orange-600/50 bg-orange-600/10",
        pitch:
          "Two mocks for depth + iteration. Improve between sessions with a concrete plan.",
        features: [
          "2 sessions",
          "Detailed rubric & notes",
          "Follow-up resources",
        ],
        cta: "Choose Standard",
      },
      {
        slug: "pro",
        name: "Pro",
        price: "₹599",
        popular: false,
        accent: "border-slate-800/70 bg-slate-900/50",
        pitch:
          "Three sessions + polish. Includes final review to be interview-ready.",
        features: [
          "3 sessions",
          "Comms & strategy coaching",
          "Final readiness review",
        ],
        cta: "Choose Pro",
      },
    ],
    []
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-10 pb-6 md:px-6 md:pt-14">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-orange-600/20 text-orange-300 !text-base">
            Mock Interviews
          </Badge>
          <Badge className="bg-slate-800/60 text-slate-200 !text-base">
            1:1 Sessions
          </Badge>
        </div>

        <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
          Nail interviews with{" "}
          <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
            1:1 mentor sessions
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-base md:text-lg text-slate-300">
          Practice real interview rounds with mentors. Get precise, actionable
          feedback and a plan to improve.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3 flex-nowrap">
          <BookButton bookingHref={bookingHref} big />
          <Link
            to=""
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-orange-300"
          >
            Practice with Question Bank coming soon
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M9 18l6-6-6-6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
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
                  <Card
                    key={f.title}
                    className="border-slate-800/70 bg-slate-900/40 text-center hover:border-orange-600/40 transition-colors"
                  >
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

            {/* Availability */}
            <div>
              <SectionTitle eyebrow="Availability">Sample slots</SectionTitle>

              {loading && (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Card
                      key={i}
                      className="border-slate-800/70 bg-slate-900/40"
                    >
                      <CardContent className="p-5">
                        <div className="h-5 w-32 rounded bg-slate-800/60 animate-pulse" />
                        <div className="mt-3 h-4 w-60 rounded bg-slate-800/60 animate-pulse" />
                        <div className="mt-6 h-9 w-28 rounded bg-slate-800/60 animate-pulse" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!loading && slots.length === 0 && (
                <Card className="mt-8 border-slate-800/70 bg-slate-900/40">
                  <CardContent className="p-6 text-sm text-slate-300">
                    Slots will be posted soon. Check back later.
                  </CardContent>
                </Card>
              )}

              {!loading && slots.length > 0 && (
                <div className="mt-8 space-y-6">
                  {Array.from(grouped.entries()).map(([track, list]) => (
                    <SlotSection
                      key={track}
                      track={track}
                      list={list}
                      bookingHref={bookingHref}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* What you get */}
            <div>
              <SectionTitle eyebrow="What you get">
                Clear, specific feedback
              </SectionTitle>
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

          {/* Right column */}
          <aside className="md:col-span-1">
            <div className="md:sticky md:top-24 space-y-4">
              <Card className="border-slate-800/70 bg-slate-900/50">
                <CardContent className="p-6">
                  <div className="mb-2">
                    <Badge className="bg-orange-600/20 text-orange-300">
                      Includes
                    </Badge>
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
                    <BookButton bookingHref={bookingHref} />
                    <Button
                      asChild
                      variant="secondary"
                      className="w-full text-sm bg-slate-800 text-slate-100 hover:bg-slate-700"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* NEW: Packages card */}
              <Card className="border-slate-800/70 bg-slate-900/50">
                <CardContent className="p-6">
                  <div className="mb-2">
                    <Badge className="bg-orange-600/20 text-orange-300">
                      Packages
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {packages.map((p) => (
                      <div
                        key={p.slug}
                        className={[
                          "rounded-2xl border p-4",
                          p.accent,
                          p.popular ? "shadow-[0_0_0_1px_rgba(251,146,60,.35)]" : "",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-lg">{p.name}</div>
                          <span
                            className={[
                              "rounded-full border px-2 py-0.5 text-xs",
                              p.popular
                                ? "border-orange-600/40 bg-orange-600/15 text-orange-300"
                                : "border-slate-700/60 bg-slate-900/40 text-slate-300",
                            ].join(" ")}
                          >
                            {p.price}
                          </span>
                        </div>

                        <div className="mt-1 text-sm text-slate-300/90">{p.pitch}</div>

                        <ul className="mt-3 space-y-1 text-sm">
                          {p.features.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-slate-200">
                              <BadgeCheck className="mt-0.5 h-4 w-4 text-orange-300" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-4">
                          {bookingHref ? (
                            <Button
                              asChild
                              className="w-full bg-orange-500 text-slate-900 hover:bg-orange-400"
                              title="Open booking form"
                            >
                              <a href={bookingHref} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2">
                                {p.cta} <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          ) : (
                            <span className="inline-flex w-full items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/15 px-3 py-2 text-xs font-semibold text-orange-200">
                              Booking form coming soon
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-4 text-xs text-slate-400">
                    All selections and payment are completed in the secure form.
                  </p>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>

        {/* Final CTA */}
        <div className="mt-12 rounded-2xl border border-slate-800/70 bg-slate-900/40 p-6 text-center">
          <h3 className="text-xl font-bold">Ready to earn your cloud badge?</h3>
          <p className="mt-2 text-slate-300">
            Pick a package now — we’ll help you plan, practice, purchase the voucher, and schedule the exam.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <BookButton bookingHref={bookingHref} big />
            <Link
              to={isAuthed ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              {isAuthed ? "See plan in Dashboard" : "Log in"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------- pieces ---------- */
function SlotSection({ track, list, bookingHref }) {
  return (
    <div className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-4">
      <div className="text-[11px] font-semibold tracking-wider text-slate-400">
        {track}
      </div>
      <div className="mt-3 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {list.slice(0, 9).map((s) => (
          <SlotCard key={String(s.id)} s={s} bookingHref={bookingHref} />
        ))}
      </div>
    </div>
  );
}

/* FLEX-BASED CARD — calendar full-width, notes wrap, CTA under notes */
function SlotCard({ s, bookingHref }) {
  const disabled = !bookingHref;

  return (
    <div className="rounded-xl border border-slate-800/60 bg-gradient-to-br from-slate-900/70 to-slate-900/40 p-5 shadow-[0_0_0_1px_rgba(15,23,42,0.4)] hover:border-orange-600/40 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* LEFT: info stack */}
        <div className="min-w-0 flex-1">
          {/* Time row */}
          <div className="flex w-full items-start gap-2 rounded-lg bg-slate-900/80 px-3 py-2 min-h-[2.5rem] ring-1 ring-inset ring-slate-700">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-orange-600/15 text-orange-300">
              <CalendarDays className="h-4 w-4" />
            </span>
            <span className="block font-semibold text-sm leading-tight whitespace-normal break-words">
              {s.day_label} • {s.time_label} {s.tz}
            </span>
          </div>

          {/* Meta chips */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            <span className="rounded-full bg-slate-800/60 px-2 py-0.5">
              {s.mode || "Online"}
            </span>
            <span className="rounded-full bg-slate-800/60 px-2 py-0.5">
              {s.capacity} seat{s.capacity > 1 ? "s" : ""}
            </span>
          </div>

          {/* Notes block */}
          {s.notes ? (
            <div className="mt-2 w-full rounded-lg bg-slate-800/50 px-3 py-2 text-[12px] leading-snug text-slate-300/90 whitespace-pre-line break-words">
              {s.notes}
            </div>
          ) : null}

          {/* CTA under notes */}
          <div className="mt-3">
            {disabled ? (
              <span className="inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/15 px-3 py-1 text-xs font-semibold text-orange-200">
                Coming soon
              </span>
            ) : (
              <Button
                asChild
                className="h-9 px-4 bg-orange-500 text-slate-900 hover:bg-orange-400"
                title="Open booking form"
              >
                <a
                  href={bookingHref}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  Book
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BookButton({ bookingHref, big = false }) {
  const disabled = !bookingHref;
  if (disabled) {
    return (
      <Button
        className={
          (big ? "h-11 px-4" : "w-full") +
          " bg-orange-500/30 text-orange-200 cursor-not-allowed"
        }
        disabled
      >
        Booking form coming soon
      </Button>
    );
  }
  return (
    <Button
      asChild
      className={
        "bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black " +
        (big ? "h-11 px-4" : "w-full")
      }
    >
      <a
        href={bookingHref}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2"
      >
        Book a Session
        <ExternalLink className="h-4 w-4" />
      </a>
    </Button>
  );
}
