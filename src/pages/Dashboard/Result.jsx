// src/pages/Result.jsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [openAnswer, setOpenAnswer] = useState(null);

  // ---------- Load result (state first, then session) ----------
  const result = useMemo(() => {
    if (state?.result) return state.result;
    try {
      const s = sessionStorage.getItem("lastResult");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  }, [state]);

  const error = state?.error || null;

  // ---------- Error / Empty ----------
  if (error) {
    return (
      <main className="min-h-[60vh] bg-slate-950 text-slate-100">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-[90px]" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-[110px]" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-10">
          <Card className="border border-rose-600/30 bg-rose-600/10">
            <CardContent className="p-6">
              <div className="mb-3">
                <Badge className="bg-orange-600/20 text-orange-300">
                  Result
                </Badge>
              </div>
              <h2 className="mb-1 text-xl font-semibold">Result</h2>
              <p className="text-sm text-rose-200">{error}</p>
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="border-slate-700 text-slate-200 cursor-pointer transition-colors hover:text-orange-300 active:scale-[.99]"
                  onClick={() => navigate("/dashboard")}
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="min-h-[60vh] bg-slate-950 text-slate-100">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-[90px]" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-[110px]" />
        </div>

        <div className="mx-auto max-w-4xl px-4 py-10">
          <Card className="border border-slate-800/60 bg-slate-900/40">
            <CardContent className="p-6">
              <div className="mb-3">
                <Badge className="bg-orange-600/20 text-orange-300">
                  Result
                </Badge>
              </div>
              <p className="text-sm text-slate-300">No result to display.</p>
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="border-slate-700 text-slate-200 cursor-pointer transition-colors hover:text-orange-300 active:scale-[.99]"
                  onClick={() => navigate("/dashboard")}
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // ---------- Derived values ----------
  const score = Number.isFinite(result.score) ? result.score : 0; // 0..100
  const answers = Array.isArray(result.answers) ? result.answers : [];
  const total = result.total ?? answers.length;
  const correct = result.correct ?? 0;
  const attempted = answers.filter((a) =>
    Number.isInteger(a?.selected_index)
  ).length;
  const accuracy = total ? Math.round((correct / total) * 100) : 0;
  const topics = Array.isArray(result.topics) ? result.topics : [];
  const suggestions = Array.isArray(result.suggestions)
    ? result.suggestions
    : [];

  const grade =
    score >= 85
      ? "Excellent"
      : score >= 70
      ? "Strong"
      : score >= 50
      ? "Good"
      : "Keep Improving";

  const ringColor =
    score >= 85
      ? "#34d399" // emerald-400
      : score >= 70
      ? "#38bdf8" // sky-400
      : score >= 50
      ? "#f59e0b" // amber-500
      : "#fb7185"; // rose-400

  const toLetter = (i) => String.fromCharCode(65 + i);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* background blobs */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-[90px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-[110px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* ================= HERO SUMMARY ================= */}
        <Card className="overflow-hidden border border-slate-800/60 bg-slate-900/40">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 gap-0 md:grid-cols-[280px_1fr]">
              {/* Score ring */}
              <div className="grid place-items-center p-8">
                <div className="relative h-48 w-48 drop-shadow-[0_0_30px_rgba(56,189,248,0.12)]">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(${ringColor} ${
                        score * 3.6
                      }deg, rgba(255,255,255,.08) 0deg)`,
                      WebkitMask:
                        "radial-gradient(circle at center, transparent 62px, black 63px)",
                      mask: "radial-gradient(circle at center, transparent 62px, black 63px)",
                    }}
                  />
                  <div className="absolute inset-0 grid place-items-center rounded-full bg-slate-900/40 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="tabular-nums text-5xl font-extrabold">
                        {score}
                      </div>
                      <div className="text-sm text-slate-300">/ 100</div>
                    </div>
                  </div>
                  <div className="absolute inset-[-6px] rounded-full border border-slate-800/60" />
                </div>
              </div>

              {/* details */}
              <div className="p-6 md:p-8">
                <div className="mb-2">
                  <Badge className="bg-orange-600/20 text-orange-300">
                    Result
                  </Badge>
                </div>
                <h1 className="text-2xl font-extrabold md:text-3xl">
                  Your Result
                </h1>

                <div className="mt-1 inline-flex items-center rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1 text-xs font-medium">
                  {grade}
                </div>

                <p className="mt-3 text-sm text-slate-300">
                  You answered <b>{correct}</b> out of <b>{total}</b> questions
                  correctly — that’s <b>{accuracy}% accuracy</b>. Review topics
                  & explanations below.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg border border-slate-800/60 bg-slate-900/30 p-3 text-center">
                    <div className="text-xs text-slate-400">Total</div>
                    <div className="text-lg font-semibold">{total}</div>
                  </div>
                  <div className="rounded-lg border border-slate-800/60 bg-slate-900/30 p-3 text-center">
                    <div className="text-xs text-slate-400">Attempted</div>
                    <div className="text-lg font-semibold">{attempted}</div>
                  </div>
                  <div className="rounded-lg border border-slate-800/60 bg-slate-900/30 p-3 text-center">
                    <div className="text-xs text-slate-400">Correct</div>
                    <div className="text-lg font-semibold">{correct}</div>
                  </div>
                  <div className="rounded-lg border border-slate-800/60 bg-slate-900/30 p-3 text-center">
                    <div className="text-xs text-slate-400">Accuracy</div>
                    <div className="text-lg font-semibold">{accuracy}%</div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Button
                    className="bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black cursor-pointer transition-colors active:scale-[.99]"
                    onClick={() => navigate("/dashboard")}
                  >
                    Go to Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-700 text-slate-200 hover:text-orange-500 border hover:border-orange-300 cursor-pointer transition-colors active:scale-[.99]"
                    onClick={() => navigate("/courses")}
                  >
                    Explore Courses
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ================= TOPICS + SUGGESTIONS ================= */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Topic Breakdown */}
          <Card className="border border-slate-800/60 bg-slate-900/40">
            <CardContent className="p-6">
              <div className="mb-3 text-lg font-semibold">Topic Breakdown</div>
              {!topics.length ? (
                <div className="text-sm text-slate-400">
                  No topic analytics available.
                </div>
              ) : (
                <div className="space-y-3">
                  {topics.map((t, i) => {
                    const acc = Number.isFinite(t.accuracy) ? t.accuracy : 0;
                    const name =
                      t.topic_name ||
                      t.topic_slug ||
                      t.section ||
                      `Topic ${i + 1}`;
                    const tone =
                      acc >= 70
                        ? "bg-emerald-500/70"
                        : acc >= 40
                        ? "bg-amber-400/80"
                        : "bg-rose-500/80";
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{name}</div>
                          <div className="text-xs text-slate-400">
                            {t.correct ?? 0}/{t.total ?? 0} · {acc}%
                          </div>
                        </div>
                        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                          <div
                            className={`h-2 ${tone}`}
                            style={{
                              width: `${Math.max(0, Math.min(100, acc))}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Suggestions */}
          <Card className="border border-slate-800/60 bg-slate-900/40">
            <CardContent className="p-6">
              <div className="mb-3 text-lg font-semibold">Suggestions</div>
              {!suggestions.length ? (
                <div className="text-sm text-slate-300">
                  Great job! No critical weaknesses detected.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1 text-xs text-orange-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ================= ANSWERS REVIEW ================= */}
        <Card className="mt-6 border border-slate-800/60 bg-slate-900/40">
          <CardContent className="p-6">
            <div className="mb-3 text-lg font-semibold">Answers Review</div>

            {!answers.length ? (
              <div className="text-sm text-slate-400">No answers captured.</div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {answers.map((a, i) => {
                  const options = Array.isArray(a.options) ? a.options : [];

                  // selection & correctness
                  const selectedIdx = Number.isInteger(a.selected_index)
                    ? a.selected_index
                    : null;
                  const hasCorrectIdx = Number.isInteger(a.correct_index);
                  const correctIdx = hasCorrectIdx
                    ? a.correct_index
                    : typeof a.correct_text === "string"
                    ? options.findIndex(
                        (o) =>
                          String(o).trim().toLowerCase() ===
                          String(a.correct_text).trim().toLowerCase()
                      )
                    : -1;

                  const correctText =
                    typeof a.correct_text === "string"
                      ? a.correct_text
                      : correctIdx >= 0 && options[correctIdx] !== undefined
                      ? options[correctIdx]
                      : "";

                  const chosenText =
                    selectedIdx != null &&
                    selectedIdx >= 0 &&
                    selectedIdx < options.length
                      ? options[selectedIdx]
                      : null;

                  const notAnswered = selectedIdx == null;
                  const isCorrect =
                    !notAnswered &&
                    (a.is_correct === true ||
                      (hasCorrectIdx && selectedIdx === correctIdx) ||
                      (chosenText &&
                        correctText &&
                        String(chosenText).trim().toLowerCase() ===
                          String(correctText).trim().toLowerCase()));

                  const statusText = notAnswered
                    ? "Not answered"
                    : isCorrect
                    ? "Correct"
                    : "Wrong";
                  const badgeTone = notAnswered
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                    : isCorrect
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                    : "border-rose-500/40 bg-rose-500/10 text-rose-200";

                  const open = openAnswer === (a.id || i);

                  return (
                    <div
                      key={a.id || i}
                      className={`py-3 ${open ? "rounded-xl" : ""}`}
                    >
                      {/* header: index | question (flex-1) | status badge (right) */}
                      <button
                        type="button"
                        className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors cursor-pointer hover:bg-slate-800/30 hover:text-orange-400  active:scale-[.995]"
                        onClick={() => setOpenAnswer(open ? null : a.id || i)}
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-slate-700 bg-slate-900/60 text-sm font-semibold">
                          {i + 1}
                        </span>
                        <span className="flex-1 font-medium group-hover:text-orange-300">
                          {a.text}
                        </span>
                        <span
                          className={[
                            "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium",
                            badgeTone,
                          ].join(" ")}
                        >
                          {statusText}
                        </span>
                      </button>

                      {/* body */}
                      {open && (
                        <div className="mt-3 rounded-xl border border-slate-800/60 bg-slate-900/30 p-3">
                          <div className="space-y-2">
                            {options.map((opt, k) => {
                              const isChosen = selectedIdx === k;
                              const isRight = hasCorrectIdx
                                ? k === correctIdx
                                : String(opt).trim().toLowerCase() ===
                                  String(correctText).trim().toLowerCase();

                              const boxTone = isRight
                                ? "border-emerald-500/60 bg-emerald-500/10"
                                : isChosen
                                ? "border-orange-500/60 bg-orange-500/10"
                                : "border-slate-700 bg-slate-900/50";

                              return (
                                <div
                                  key={k}
                                  className={`flex items-start gap-3 rounded-lg border px-3 py-2 ${boxTone}`}
                                >
                                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-slate-600 text-sm font-semibold text-slate-300">
                                    {toLetter(k)}
                                  </div>
                                  <div className="text-sm text-slate-100">
                                    {opt}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* bumped font size here */}
                          <div className="mt-3 text-sm leading-relaxed text-slate-200">
                            <div>
                              <b>Your Answer:</b>{" "}
                              {chosenText ?? "(not answered)"}
                            </div>
                            <div>
                              <b>Correct Answer:</b> {correctText || "(n/a)"}
                            </div>
                            {a.explanation ? (
                              <div className="mt-1">
                                <b>Why:</b> {a.explanation}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6">
          <Button
            variant="outline"
            className="border-slate-700 text-slate-200 cursor-pointer transition-colors hover:text-orange-300 active:scale-[.99]"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </main>
  );
}
