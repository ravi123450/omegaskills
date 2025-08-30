// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDashboard, myAttempts, getCourses, getExams } from "@/lib/api";
// If you have an auth context, this will work; otherwise greeting falls back.
import { useAuth } from "@/context/AuthProvider";

/* ---------- Small UI atoms (styled like About.jsx) ---------- */
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
      </h2>
    </div>
  );
}

function Pill({ children, tone = "default" }) {
  const toneClass =
    tone === "ok"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
      : tone === "warn"
      ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
      : tone === "bad"
      ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
      : "border-slate-800/60 bg-slate-900/40 text-slate-200";
  return (
    <span
      className={`inline-flex items-center rounded-xl border px-3 py-1.5 text-sm ${toneClass}`}
    >
      {children}
    </span>
  );
}

/* ---------- Page ---------- */
export default function Dashboard({ token }) {
  // Optional auth (for the greeting)
  let displayName = "";
  try {
    const auth = typeof useAuth === "function" ? useAuth() : null;
    const session = auth?.auth ?? auth ?? {};
    displayName =
      session?.user?.name ??
      session?.name ??
      session?.user?.fullName ??
      session?.profile?.name ??
      (session?.user?.email ? session.user.email.split("@")[0] : "") ??
      "";
  } catch {
    // ignore — we'll keep displayName as ""
  }

  // State (kept from your current working version)
  const [weak, setWeak] = useState([]);
  const [sug, setSug] = useState([]);
  const [hist, setHist] = useState([]);

  const [courses, setCourses] = useState([]);
  const [entitled, setEntitled] = useState({}); // courseId -> boolean
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Attempts pagination
  const PER_PAGE = 10;
  const [page, setPage] = useState(0);

  const navigate = useNavigate();

  /* ---------- Load dashboard summary + attempts ---------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const d = await getDashboard(token);
        if (!cancelled) {
          setWeak(d?.weaknesses || []);
          setSug(d?.suggestions || []);
        }
      } catch {}
      try {
        const h = await myAttempts(token);
        if (!cancelled) {
          setHist(Array.isArray(h) ? h : []);
          setPage(0);
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  /* ---------- Load courses + entitlement ---------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingCourses(true);
        const list = await getCourses(token);
        if (cancelled) return;
        const safe = Array.isArray(list) ? list : [];
        setCourses(safe);

        const ent = {};
        await Promise.all(
          safe.map(async (c) => {
            try {
              await getExams(token, c.id); // 200 => has access
              ent[c.id] = true;
            } catch {
              ent[c.id] = false; // 403 => locked
            }
          })
        );
        if (!cancelled) setEntitled(ent);
      } finally {
        if (!cancelled) setLoadingCourses(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Keep page valid when hist changes
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(hist.length / PER_PAGE));
    if (page > totalPages - 1) setPage(totalPages - 1);
  }, [hist, page]);

  /* ---------- Helpers ---------- */
  const friendlyDate = (ms) => {
    if (!ms) return "";
    const d = new Date(ms);
    return d.toLocaleString();
  };

  const titleCase = (s = "") => s.replace(/\b\w/g, (c) => c.toUpperCase());

  const gotoCourse = (courseId) => {
    navigate("/courses", { state: { openCourseId: courseId } });
  };

  const totalPages = Math.max(1, Math.ceil(hist.length / PER_PAGE));
  const pagedAttempts = useMemo(
    () => hist.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE),
    [hist, page]
  );

  const entitledCourses = useMemo(
    () => courses.filter((c) => entitled[c.id]),
    [courses, entitled]
  );

  /* ---------- UI ---------- */
  return (
    <div className="scroll-smooth bg-slate-950 text-white selection:bg-orange-300 selection:text-slate-900">
      {/* soft background accents */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-[90px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-[110px]" />
      </div>

      {/* Header / Hero */}
      <section className="mx-auto max-w-7xl px-4 pb-6 pt-8 md:px-6 md:pt-12">
        <Badge className="bg-orange-600/20 text-orange-300">Dashboard</Badge>

        <h1 className="mt-3 text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
          Welcome back{displayName ? `, ${displayName}` : ""}!!
        </h1>

        <p className="mt-3 max-w-2xl text-base text-slate-300">
          Track your progress, review weak topics, and jump back into your
          courses.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Pill>Practice Daily</Pill>
          <Pill>Analyze Weak Topics</Pill>
          <Pill>Compete with Friends</Pill>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 md:px-6">
        {/* Grid: Left (Attempts) / Right (Suggestions + Topics) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Previous Attempts */}
          <Card className="border border-slate-800/60 bg-slate-900/40">
            <CardContent className="p-5">
              <SectionTitle>Previous Attempts</SectionTitle>

              {!hist.length ? (
                <p className="mt-2 text-sm text-slate-400">
                  No attempts yet. Start a mock test to see history.
                </p>
              ) : (
                <>
                  <div className="mt-2 divide-y divide-slate-800/60">
                    {pagedAttempts.map((h) => (
                      <div
                        key={h.id}
                        className="flex items-center justify-between py-3"
                      >
                        <div className="flex items-start gap-3">
                          <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-orange-600/20 px-2 text-sm font-semibold text-orange-300">
                            {Math.max(0, h.score ?? 0)}
                          </span>
                          <div>
                            <div className="font-medium">{h.exam_title}</div>
                            <div className="text-xs text-slate-400">
                              {friendlyDate(h.started_at)}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400">
                          {h.score ?? 0} / 100
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pager */}
                  <div className="mt-4 flex items-center justify-between">
                    <Button
                      variant="outline"
                      className="border-slate-700 text-slate-200 hover:text-black cursor-pointer"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      ← Prev
                    </Button>
                    <div className="text-xs text-slate-400">
                      Page {page + 1} / {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      className="border-slate-700 text-slate-200 hover:text-black cursor-pointer disabled:cursor-not-allowed"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages - 1, p + 1))
                      }
                      disabled={page >= totalPages - 1}
                    >
                      Next →
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Right column: Suggestions + Topics */}
          <div className="flex flex-col gap-6">
            <Card className="border border-slate-800/60 bg-slate-900/40">
              <CardContent className="p-5">
                <SectionTitle>Suggestions</SectionTitle>
                <ul className="mt-8 list-disc space-y-2 pl-5 text-sm text-slate-200">
                  {(sug.length
                    ? sug
                    : [
                        "Practice daily and review explanations of wrong answers.",
                      ]
                  ) // fallback
                    .map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-slate-800/60 bg-slate-900/40">
              <CardContent className="p-5">
                <SectionTitle>Topics to Improve</SectionTitle>
                {!weak.length ? (
                  <p className="mt-5 text-sm text-slate-400">
                    No data yet. Finish a mock test to see topic analysis.
                  </p>
                ) : (
                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {weak.map((w, i) => (
                      <div
                        key={w.section || w.topic_name || i}
                        className="rounded-lg border border-slate-800/60 bg-slate-900/30 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <Pill
                            tone={
                              (w.accuracy ?? 0) >= 70
                                ? "ok"
                                : (w.accuracy ?? 0) >= 40
                                ? "warn"
                                : "bad"
                            }
                          >
                            {w.accuracy ?? 0}%
                          </Pill>
                        </div>
                        <div className="mt-2 font-medium">
                          {titleCase(w.section || w.topic_name || "Topic")}
                        </div>
                        <div className="text-xs text-slate-400">
                          {w.correct ?? 0}/{w.total ?? 0} correct
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Your Courses */}
        <div className="mt-10">
          <SectionTitle>Your Courses</SectionTitle>

          {loadingCourses ? (
            <Card className="mt-3 border border-slate-800/60 bg-slate-900/40">
              <CardContent className="p-5">
                <div className="space-y-3">
                  <div className="h-4 w-1/3 rounded bg-slate-800/50" />
                  <div className="h-4 w-11/12 rounded bg-slate-800/50" />
                  <div className="h-4 w-8/12 rounded bg-slate-800/50" />
                </div>
              </CardContent>
            </Card>
          ) : entitledCourses.length === 0 ? (
            <Card className="mt-3 border border-slate-800/60 bg-slate-900/40">
              <CardContent className="p-5 text-sm text-slate-300">
                No entitled courses yet. Ask your coordinator/admin for access.
              </CardContent>
            </Card>
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {entitledCourses.map((c, idx) => (
                <Card
                  key={c.id}
                  className="group overflow-hidden border border-slate-800/60 bg-slate-900/40 transition hover:bg-slate-900/60"
                >
                  <CardContent className="p-5">
                    <div className="mb-3 h-24 w-full rounded-lg bg-gradient-to-br from-slate-800/60 to-slate-900/60" />
                    <h3 className="text-base font-semibold">{c.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {c.description ||
                        "Curated content with per-topic analytics."}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <Pill tone="ok">Entitled</Pill>
                      <Button
                        size="sm"
                        className="cursor-pointer bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black"
                        onClick={() => gotoCourse(c.id)}
                        aria-label={`Open ${c.title}`}
                        title="Open course"
                      >
                        Open
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
