// src/pages/Exam.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { finishAttempt, saveAnswer, startAttempt } from "@/lib/api";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor } from "lucide-react";

export default function Exam({ token }) {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState(new Map());
  const [timeLeft, setTimeLeft] = useState(0);
  const [section, setSection] = useState("All");
  const [marked, setMarked] = useState(new Set());

  const [warnOpen, setWarnOpen] = useState(false);
  const [needsFS, setNeedsFS] = useState(false);

  const timerRef = useRef(null);
  const timeOnCurrentStart = useRef(Date.now());
  const violationCountRef = useRef(0);
  const coolRef = useRef(Date.now() + 1200);
  const endingRef = useRef(false);

  const enterFullscreen = async () => {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
    } catch {}
  };
  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch {}
  };

  const persistMarked = (mSet) => {
    try {
      sessionStorage.setItem("exam_marked", JSON.stringify([...mSet]));
    } catch {}
  };
  const loadMarked = () => {
    try {
      const m = JSON.parse(sessionStorage.getItem("exam_marked") || "[]");
      setMarked(new Set(m));
    } catch {}
  };

  const safeSaveCurrent = async () => {
    const q = attempt?.questions?.[idx];
    if (!q) return;
    const chosen = answers.get(q.id);
    const spent = Math.floor((Date.now() - timeOnCurrentStart.current) / 1000);
    if (chosen == null || spent <= 0) {
      timeOnCurrentStart.current = Date.now();
      return;
    }
    try {
      await saveAnswer(
        token,
        attempt.attempt_id,
        q.id,
        String(chosen),
        Math.max(0, spent)
      );
    } catch {}
    timeOnCurrentStart.current = Date.now();
  };

  const doFinish = async (attempt_id = attempt?.attempt_id) => {
    if (!attempt_id || endingRef.current) return;
    endingRef.current = true;
    await safeSaveCurrent();
    try {
      const res = await finishAttempt(token, attempt_id);
      try {
        sessionStorage.setItem(
          "lastResult",
          JSON.stringify({ ...res, _reviewed: [...marked] })
        );
      } catch {}
      await exitFullscreen();
      navigate("/result", { state: { result: res } });
    } catch (e) {
      await exitFullscreen();
      navigate("/result", { state: { error: e.message } });
    }
  };

  useEffect(() => {
    if (!state?.exam) {
      navigate("/courses");
      return;
    }
    let unmounted = false;

    (async () => {
      try {
        const r = await startAttempt(token, state.exam.id);
        if (unmounted) return;
        setAttempt(r);
        setSection("All");

        setTimeLeft(Math.max(0, Math.floor((r.ends_at - Date.now()) / 1000)));
        timerRef.current = setInterval(() => {
          setTimeLeft((s) => {
            if (s <= 1) {
              clearInterval(timerRef.current);
              doFinish(r.attempt_id);
              return 0;
            }
            return s - 1;
          });
        }, 1000);

        loadMarked();
        await enterFullscreen();
      } catch {
        if (!unmounted) navigate("/courses");
      }
    })();

    return () => {
      unmounted = true;
      clearInterval(timerRef.current);
      exitFullscreen();
    };
  }, [state?.exam?.id, token, navigate]);

  const triggerViolation = async () => {
    if (Date.now() < coolRef.current) return;
    violationCountRef.current += 1;

    if (violationCountRef.current === 1) {
      setWarnOpen(true);
      setNeedsFS(true);
      setTimeout(() => setWarnOpen(false), 1800);
      await enterFullscreen();
      setTimeout(() => {
        if (document.fullscreenElement) {
          setNeedsFS(false);
          coolRef.current = Date.now() + 800;
        }
      }, 300);
    } else {
      await doFinish(attempt?.attempt_id);
    }
  };
  const resumeFullscreenNow = async () => {
    await enterFullscreen();
    if (document.fullscreenElement) {
      setNeedsFS(false);
      coolRef.current = Date.now() + 800;
    }
  };

  useEffect(() => {
    if (!attempt) return;

    const onFSChange = () => {
      if (document.fullscreenElement) {
        setNeedsFS(false);
        coolRef.current = Date.now() + 800;
      } else {
        triggerViolation();
      }
    };
    const onVisibility = () => {
      if (document.hidden) triggerViolation();
    };
    const onBlur = () => triggerViolation();

    // Block common back/forward keys while in exam
    const onKeyDown = (e) => {
      const k = e.key;
      // Alt+Left/Right or dedicated browser navigation keys
      const navCombo =
        (e.altKey && (k === "ArrowLeft" || k === "ArrowRight")) ||
        k === "BrowserBack" ||
        k === "BrowserForward";

      // Backspace when not in an editable field (legacy nav)
      const isEditable =
        ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName) ||
        document.activeElement?.isContentEditable;

      if (navCombo || (!isEditable && k === "Backspace")) {
        e.preventDefault();
        e.stopPropagation();
        // keep user on the same history entry
        try {
          history.pushState(null, "", window.location.href);
        } catch {}
        triggerViolation();
        return;
      }

      if (k === "Escape") triggerViolation();
      if (k?.toLowerCase() === "r") toggleReview();
    };

    document.addEventListener("fullscreenchange", onFSChange);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("fullscreenchange", onFSChange);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [attempt]); // eslint-disable-line

  /* ===== HARD BLOCK history back/forward (touchpad two-finger & back/forward buttons) ===== */
  useEffect(() => {
    if (!attempt) return;

    // Seed a lock state and re-push on popstate
    const lockHistory = () => {
      try {
        history.pushState(null, "", window.location.href);
      } catch {}
    };
    const onPopState = (e) => {
      // Immediately push back to keep URL/page in place
      lockHistory();
      // Treat as violation attempt
      triggerViolation();
    };

    // Wheel: prevent horizontal swipe gestures from becoming back/forward
    const onWheel = (e) => {
      // Only if horizontal intent dominates
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 0) {
        e.preventDefault();
      }
    };

    // Some mice send extra buttons for back/forward (button 3/4)
    const onMouseUp = (e) => {
      if (e.button === 3 || e.button === 4) {
        e.preventDefault();
        e.stopPropagation();
        lockHistory();
        triggerViolation();
      }
    };

    // Before unload — show native prompt to avoid accidental navigation
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    lockHistory();
    window.addEventListener("popstate", onPopState);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("mouseup", onMouseUp, true);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("wheel", onWheel, { passive: false });
      window.removeEventListener("mouseup", onMouseUp, true);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [attempt]); // eslint-disable-line

  const q = attempt?.questions?.[idx];

  const scrollPageTop = () =>
    requestAnimationFrame(() =>
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
    );

  const switchQuestion = async (newIdx) => {
    await safeSaveCurrent();
    setIdx(newIdx);
    timeOnCurrentStart.current = Date.now();
    scrollPageTop();
  };

  const pick = async (choice) => {
    if (!attempt || !q) return;
    setAnswers((m) => new Map(m).set(q.id, String(choice)));
    const spent = Math.floor((Date.now() - timeOnCurrentStart.current) / 1000);
    timeOnCurrentStart.current = Date.now();
    try {
      await saveAnswer(
        token,
        attempt.attempt_id,
        q.id,
        String(choice),
        Math.max(0, spent)
      );
    } catch {}
  };

  const toggleReview = () => {
    if (!q) return;
    const next = new Set(marked);
    if (next.has(q.id)) next.delete(q.id);
    else next.add(q.id);
    setMarked(next);
    persistMarked(next);
  };

  const mmss = useMemo(() => {
    const m = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(timeLeft % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  }, [timeLeft]);

  const sections = useMemo(() => {
    const raw = attempt?.exam?.config?.sections || [];
    return ["All", ...raw];
  }, [attempt]);

  const filteredIndices = useMemo(() => {
    if (!attempt?.questions) return [];
    return attempt.questions
      .map((_, i) => i)
      .filter(
        (i) => section === "All" || attempt.questions[i].section === section
      );
  }, [attempt, section]);

  if (!attempt)
    return (
      <main className="examWrap">
        <div className="card" style={{ maxWidth: 640, margin: "48px auto" }}>
          <div className="small">Starting…</div>
        </div>
        <Style />
      </main>
    );
  if (!q) return null;

  const answeredCount = [...answers.keys()].length;
  const sectionLabel =
    q.section || (q.topic_slug ? q.topic_slug.toUpperCase() : "Section");
  const topicName = q.topic_name || q.topic_slug || "Topic";
  const difficulty = q.difficulty || "";
  const isMarked = marked.has(q.id);

  return (
    <main className="examWrap">
      <Style />

      {warnOpen && (
        <div className="alert warn">
          <b>Warning:</b>&nbsp;Stay in fullscreen during the exam. Next
          violation will auto-submit.
        </div>
      )}

      {needsFS && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60">
          <Card className="w-[92vw] max-w-[520px] border border-slate-800/60 bg-slate-900">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-orange-500/20">
                <Monitor className="h-6 w-6 text-orange-300" />
              </div>
              <h2 className="text-xl font-bold">Return to Fullscreen</h2>
              <p className="mt-1 text-sm text-slate-300">
                Please continue in fullscreen. Click the button below to resume.
              </p>
              <div className="mt-4">
                <Button
                  className="bg-orange-500 text-slate-900 hover:bg-orange-400"
                  onClick={resumeFullscreenNow}
                >
                  Resume Fullscreen
                </Button>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Next violation will auto-submit and show your result.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="row between headerRow">
        <div className="headBlock">
          <span className="chip">
            <span className="chipDot" />
            Exam
          </span>
          <h1 className="examTitle" title={attempt.exam?.title}>
            {attempt.exam?.title || "Exam"}
          </h1>
        </div>

        <div className="timerRing" title="Time left">
          <span>{mmss}</span>
        </div>
      </div>

      <div className="grid2">
        <div>
          <div className="card">
            <div className="row between small dim">
              <div>
                {idx + 1}/{attempt.questions.length} — <b>{sectionLabel}</b> /{" "}
                {topicName}
                {difficulty ? ` · ${difficulty}` : ""}
              </div>
              {isMarked && (
                <span className="tag purple">
                  <span className="dot review" />
                  Marked
                </span>
              )}
            </div>

            <div className="qtext">{q.text}</div>

            <div className="opts">
              {Array.isArray(q.options) &&
                q.options.map((o, i) => {
                  const sel = answers.get(q.id) === String(o);
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`opt ${sel ? "selected" : ""}`}
                      onClick={() => pick(o)}
                    >
                      <div className={`optBullet ${sel ? "bSel" : ""}`}>
                        <span className="optLetter">
                          {String.fromCharCode(65 + i)}
                        </span>
                      </div>
                      <div className="optText">{o}</div>
                    </button>
                  );
                })}
            </div>

            <div className="row between" style={{ marginTop: 16 }}>
              <div className="row" style={{ gap: 8 }}>
                <button
                  className="btn"
                  onClick={() => switchQuestion(Math.max(0, idx - 1))}
                  disabled={idx === 0}
                >
                  Prev
                </button>

                <button
                  className={`btn ${isMarked ? "purple" : "ghost"}`}
                  onClick={toggleReview}
                  title="Shortcut: R"
                >
                  {isMarked ? "Unmark Review" : "Mark for Review"}
                </button>
              </div>

              {idx < attempt.questions.length - 1 ? (
                <button
                  className="btn"
                  onClick={() =>
                    switchQuestion(
                      Math.min(attempt.questions.length - 1, idx + 1)
                    )
                  }
                >
                  Next
                </button>
              ) : (
                <button className="btn primary" onClick={() => doFinish()}>
                  Finish
                </button>
              )}
            </div>
          </div>

          <div className="small dim" style={{ marginTop: 10 }}>
            Answered: {answeredCount} / {attempt.questions.length}
          </div>
        </div>

        <div>
          <div className="card">
            <div className="row between">
              <div className="sectionTitle">Question Palette</div>
              <SectionSelect
                value={section}
                options={sections}
                onChange={setSection}
              />
            </div>

            <div className="palette">
              {filteredIndices.map((i) => {
                const qq = attempt.questions[i];
                const answered = answers.has(qq.id);
                const isRev = marked.has(qq.id);
                const cls = [
                  i === idx ? "cur" : "",
                  isRev ? "review" : answered ? "done" : "todo",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <button
                    key={qq.id}
                    className={`pal ${cls}`}
                    onClick={() => switchQuestion(i)}
                    title={
                      isRev ? "Marked" : answered ? "Answered" : "Unanswered"
                    }
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="legend">
              <span>
                <span className="dot done" />
                Answered
              </span>
              <span>
                <span className="dot todo" />
                Unanswered
              </span>
              <span>
                <span className="dot review" />
                Marked for review
              </span>
            </div>
          </div>

          <div className="card notesCard" style={{ marginTop: 9 }}>
            <div className="sectionTitle red">Exam Notes</div>
            <p className="small redText" style={{ marginTop: 8 }}>
              Pressing <b>Esc</b> or switching apps exits fullscreen. The first
              time, you’ll see a warning and can click “Resume Fullscreen”. The
              second time, your exam will be auto-submitted.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function SectionSelect({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="dd" ref={ref}>
      <button className="ddBtn" onClick={() => setOpen((v) => !v)}>
        <span>{value}</span>
        <span className="chev">▾</span>
      </button>
      {open && (
        <div className="ddMenu">
          {options.map((opt) => (
            <button
              key={opt}
              className={`ddItem ${opt === value ? "active" : ""}`}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ========================= Styles ========================= */
function Style() {
  return (
    <style>{`
/* prevent browser back/forward swipe & pull-to-refresh side-effects */
html, body { overscroll-behavior: none; }
body { touch-action: pan-y; } /* allow vertical scroll, block horizontal pan */

/* Layout */
.examWrap { color:#e5e7eb; background:#0b1120; min-height:100vh; padding:24px 16px; touch-action: pan-y; overscroll-behavior: none; }
.grid2 { display:grid; grid-template-columns: 1fr; gap:20px; max-width:1200px; margin:0 auto; }
@media (min-width:1024px){ .grid2{ grid-template-columns: 1fr 520px; } }
.row { display:flex; align-items:center; gap:10px; }
.row.between { justify-content:space-between; }
.headerRow { max-width:1200px; margin:0 auto 16px; align-items:flex-start; }

/* Head & timer */
.headBlock { display:flex; flex-direction:column; gap:8px; }
.chip { display:inline-flex; align-items:center; gap:8px; padding:4px 12px 4px 10px; border-radius:999px;
  font-size:12px; font-weight:700; letter-spacing:.25px; color:#fdba74; background:rgba(234,88,12,.15);
  border:1px solid rgba(234,88,12,.35); width:max-content; }
.chipDot{ width:8px; height:8px; border-radius:999px; background:#f59e0b; box-shadow:0 0 0 6px rgba(245,158,11,.15); }
.examTitle { font-size:34px; line-height:1.15; font-weight:800; margin:0; letter-spacing:.2px; }

.card { background:rgba(2,6,23,.6); border:1px solid rgba(30,41,59,.75); border-radius:14px; padding:16px; box-shadow:0 8px 20px rgba(0,0,0,.2); }
.sectionTitle{ font-weight:700; font-size:16px; }
.small{ font-size:12px; }
.dim { color:#94a3b8; }

.timerRing{ position:fixed; top:28px; right:72px; width:86px; height:86px; border-radius:999px; display:grid; place-items:center;
  color:#e2e8f0; background:radial-gradient(120px 120px at 50% 40%, #0ea5e9 0%, rgba(2,6,23,.45) 55%); border:2px solid rgba(99,102,241,.35);
  box-shadow:0 0 0 6px rgba(99,102,241,.12), 0 0 44px 12px rgba(14,165,233,.15); z-index:35; }
.timerRing span{ font-variant-numeric:tabular-nums; font-weight:800; }

/* Warning */
.alert.warn{ position:fixed; left:20px; right:20px; top:76px; z-index:60;
  background:rgba(245,158,11,.15); border:1px solid rgba(245,158,11,.35);
  padding:10px 12px; border-radius:12px; color:#fde68a; }

/* Buttons */
.btn{ background:transparent; color:#e5e7eb; border:1px solid #334155; border-radius:10px; padding:9px 14px; cursor:pointer;}
.btn:hover{ border-color:#475569; background:rgba(30,41,59,.45); }
.btn:disabled{ opacity:.5; cursor:not-allowed; }
.btn.primary{ background:#f59e0b; color:#0b1120; border-color:#f59e0b; }
.btn.primary:hover{ background:#fbbf24; border-color:#fbbf24; }
.btn.ghost{ background:transparent; border-color:#374151; }
.btn.purple{ background:#7c3aed; border-color:#7c3aed; color:#fff; }
.tag{ display:inline-flex; align-items:center; gap:6px; padding:4px 8px; font-size:12px; border-radius:10px; border:1px solid #334155;}
.tag.purple{ background:rgba(124,58,237,.12); border-color:rgba(124,58,237,.35); color:#c4b5fd; }

/* Question & options */
.qtext{ margin-top:14px; line-height:1.6; font-size:16px; }
.opts{ display:grid; gap:12px; margin-top:16px; }

/* Clean single-circle bullet — kill any extra rings */
.opt{ display:flex; gap:14px; align-items:center; text-align:left; padding:14px; border:1px solid #334155; border-radius:12px;
  background:rgba(15,23,42,.6); cursor:pointer; -webkit-tap-highlight-color:transparent; }
.opt:hover{ background:rgba(15,23,42,.75); }
.opt.selected{ border-color:#f59e0b; background:rgba(245,158,11,.12); }
.opt:focus, .opt:focus-visible{ outline:none; }

/* the bullet itself */
.optBullet{ 
  display:grid; place-items:center;
  width:36px; height:36px; aspect-ratio:1/1;
  border-radius:999px; 
  border:1.5px solid #475569;
  background:none;
  box-shadow:none !important;
  outline:none !important;
  position:relative;
}
.optBullet::before, .optBullet::after{ content:none !important; }

.optBullet.bSel{ border-color:#f59e0b; }
.optLetter{ font-weight:800; font-size:14px; letter-spacing:.3px; line-height:1; }
.optText{ font-size:15px; }
.opt::before { display:none }

/* Palette – 8 per row on desktop */
.palette{ display:grid; gap:10px; margin-top:12px; grid-template-columns:repeat(6, 1fr); }
@media (min-width:1024px){ .palette{ grid-template-columns:repeat(8, 1fr);} }
.pal{ display:flex; align-items:center; justify-content:center; height:46px; min-width:46px;
  border-radius:12px; border:1px solid #334155; background:rgba(15,23,42,.6);
  font-size:16px; font-weight:800; letter-spacing:.3px; color:#e2e8f0; cursor:pointer; }
.pal.cur{ outline:2px solid rgba(245,158,11,.65); }
.pal.done{ background:rgba(34,197,94,.12); border-color:rgba(34,197,94,.35); color:#bbf7d0; }
.pal.todo{ background:rgba(148,163,184,.1); }
.pal.review{ background:rgba(124,58,237,.14); border-color:rgba(124,58,237,.45); color:#ddd6fe; }

.legend{ display:flex; gap:18px; align-items:center; margin-top:12px; color:#94a3b8; font-size:12px; }
.dot{ display:inline-block; width:10px; height:10px; border-radius:999px; margin-right:6px; }
.dot.done{ background:#22c55e; }
.dot.todo{ background:#94a3b8; }
.dot.review{ background:#a78bfa; }

/* Custom select */
.dd{ position:relative; width:200px; }
.ddBtn{ width:100%; display:flex; align-items:center; justify-content:space-between; gap:8px;
  padding:10px 12px; border-radius:12px; border:1px solid #334155; background:rgba(0,0,0,0); color:#e5e7eb; font-size:13px; }
.ddBtn:hover{ background:rgba(2,6,23,.22); }
.ddMenu{ position:absolute; top:100%; left:0; right:0; margin-top:8px; background:rgba(2,6,23,.95);
  border:1px solid #334155; border-radius:12px; padding:6px; z-index:40; box-shadow:0 10px 30px rgba(0,0,0,.35); }
.ddItem{ width:100%; text-align:left; padding:10px 10px; border-radius:10px; color:#e5e7eb; background:transparent; border:none; cursor:pointer; }
.ddItem:hover{ background:rgba(30,41,59,.6); }
.ddItem.active{ background:rgba(245,158,11,.12); color:#fde68a; border:1px solid rgba(245,158,11,.35); }
.chev{ color:#94a3b8; }

/* Notes (red) */
.notesCard{ border-color:rgba(244,63,94,.35); background:rgba(244,63,94,.08); }
.red{ color:#fecaca; }
.redText{ color:#fda4af; }

.h2{ font-size:20px; font-weight:800; margin:0; }
`}</style>
  );
}
