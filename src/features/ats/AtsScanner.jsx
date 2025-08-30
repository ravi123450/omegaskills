// src/features/ats/AtsScanner.jsx
import React, { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Upload,
  FileText,
  FileType2,
  Gauge,
  Layers,
  Sparkles,
} from "lucide-react";

// ----- PDF.js worker (Vite-friendly) -----
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// ----- Rule-based ATS scoring (modular) -----
import { computeAtsScore } from "./scoring"; // <-- create file per section 2

// ----- Small shared section title (same vibe as Home.jsx) -----
function SectionTitle({ children }) {
  return (
    <h2 className="relative text-xl md:text-2xl font-bold">
      {children}
      <span className="absolute -bottom-2 left-0 h-[2px] w-24 rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />
    </h2>
  );
}

export default function AtsScanner() {
  // ------- UI state -------
  const [fileUrl, setFileUrl] = useState("");
  const [fileMeta, setFileMeta] = useState({ name: "", ext: "" });
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [note, setNote] = useState("");

  const previewRef = useRef(null);
  const setNoteOnce = (msg) => setNote((prev) => (prev === msg ? prev : msg));

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  // ------- PDF text extraction -------
  async function extractPdfText(file, maxPages = 8) {
    const data = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data,
      useWorkerFetch: false,
      isEvalSupported: false,
    });
    const pdf = await loadingTask.promise;

    let text = "";
    const pages = Math.min(pdf.numPages, maxPages);
    for (let p = 1; p <= pages; p++) {
      const page = await pdf.getPage(p);
      const tc = await page.getTextContent();
      const pageText = tc.items
        .map((it) => (it && it.str ? it.str : ""))
        .join(" ");
      text += pageText + "\n";
    }
    return text
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  // ------- Upload handling -------
  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const ext = (f.name.split(".").pop() || "").toLowerCase();
    const url = URL.createObjectURL(f);
    setFileUrl(url);
    setFileMeta({ name: f.name, ext });
    setResult(null);
    setProgress(0);

    if (ext === "txt" || ext === "md") {
      const t = await f.text();
      setResumeText(t);
      setNoteOnce("Loaded plain text from file.");
    } else if (ext === "pdf") {
      setNoteOnce("Extracting text from PDF…");
      try {
        const text = await extractPdfText(f, 10);
        if (text) {
          setResumeText(text);
          setNoteOnce("Extracted text from PDF automatically.");
        } else {
          setResumeText("");
          setNoteOnce(
            "PDF has no selectable text (likely a scan). Paste your resume text below for best accuracy."
          );
        }
      } catch (err) {
        console.error("PDF extract error:", err);
        setResumeText("");
        setNoteOnce(
          "PDF extraction failed. Paste your resume text below for best accuracy."
        );
      }
    } else {
      setNoteOnce(
        "Preview loaded. For ATS analysis, upload .pdf or .txt/.md for best results."
      );
    }
  };

  // ------- Scan with animated progress -------
  const runScan = () => {
    if (!fileUrl && !resumeText.trim()) {
      alert("Upload a file or paste resume text first.");
      return;
    }
    setScanning(true);
    setProgress(0);
    setResult(null);

    const t0 = Date.now();
    const timer = setInterval(
      () => setProgress((p) => (p < 95 ? p + 3 : p)),
      60
    );

    // Compute score synchronously (rule-based)
    const r = computeAtsScore({
      resumeText,
      jdText: jobText,
      keywords: "",
      fileType: (fileMeta.ext || "").toLowerCase(),
    });

    const elapsed = Date.now() - t0;
    const minAnim = 1200;
    const wait = elapsed < minAnim ? minAnim - elapsed : 0;

    setTimeout(() => {
      clearInterval(timer);
      setProgress(100);
      setTimeout(() => {
        setResult(r);
        setScanning(false);
      }, 280);
    }, wait);
  };

  const isPdf = fileMeta.ext === "pdf";

  return (
    <div className="scroll-smooth bg-slate-950 text-white dark:bg-slate-950 dark:text-slate-100 selection:bg-orange-300 selection:text-slate-900 min-h-screen">
      {/* Background blobs (same vibe as Home.jsx) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-[90px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-[110px]" />
      </div>

      {/* Page header */}
      <section className="mx-auto max-w-7xl px-4 pt-10 md:px-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge className="bg-orange-600/20 text-orange-300">ATS Tool</Badge>
          <Badge className="bg-orange-600/20 text-orange-300">
            Free • Client-Side
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
            Resume{" "}
            <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
              Scanner
            </span>
          </h1>

          <Button
            onClick={() => (window.location.href = "/resume")}
            className="bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black cursor-pointer"
          >
            Improve in Resume Builder <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <p className="mt-3 text-base text-slate-300 max-w-3xl">
          Upload your CV to get an instant ATS score, keyword coverage against a
          JD, and clear improvements—no external APIs.
        </p>
      </section>

      {/* Main grid */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 items-start">
          {/* LEFT: Preview */}
          <Card className="border-slate-800/60 bg-slate-900/40 backdrop-blur">
            <CardContent className="h-full p-4 md:p-6">
              <div className="mb-8 flex items-center justify-between">
                <SectionTitle>Preview</SectionTitle>
                <span className="text-sm text-slate-400 truncate max-w-[60%]">
                  {fileMeta.name || "No file selected"}
                </span>
              </div>

              <div className="relative rounded-2xl border border-slate-800/60 bg-slate-900/40 mt-36">
                {/* Preview area */}
                <div className="overflow-hidden rounded-2xl h-[600px]">
                  {fileUrl ? (
                    isPdf ? (
                      <embed
                        src={fileUrl + "#toolbar=0&navpanes=0"}
                        type="application/pdf"
                        className="w-full h-[560px] bg-slate-900"
                      />
                    ) : (
                      <iframe
                        title="preview"
                        src={fileUrl}
                        className="w-full h-[560px] bg-slate-900"
                      />
                    )
                  ) : (
                    <div className="grid h-[420px] place-items-center text-center text-slate-400">
                      <div>
                        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-orange-500/15 text-orange-300">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div className="font-semibold text-white">
                          Upload a resume
                        </div>
                        <div className="mt-1 text-base">
                          PDF shows embedded preview • TXT/MD show as text
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Scan overlay */}
                {scanning && (
                  <div className="absolute inset-0 rounded-2xl bg-black/50 backdrop-blur-sm overflow-hidden">
                    <div className="absolute inset-0 animate-[scanLinesMove_1.8s_linear_infinite] [background-image:repeating-linear-gradient(180deg,rgba(96,165,250,0.10)_0px,rgba(96,165,250,0.10)_1px,transparent_1px,transparent_7px)] mix-blend-screen" />
                    <div className="absolute left-0 right-0 h-36 -translate-y-[120%] animate-[scanBarSweep_2.8s_ease-in-out_infinite] [background:linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(34,211,238,0.18)_45%,rgba(34,211,238,0.35)_50%,rgba(34,211,238,0.18)_55%,rgba(0,0,0,0)_100%)] shadow-[0_0_32px_8px_rgba(34,211,238,0.18)] mix-blend-screen" />
                    <div className="absolute inset-0 animate-[scanSlide_1.6s_linear_infinite] [background-image:repeating-linear-gradient(90deg,rgba(37,99,235,0.12)_0_14px,rgba(37,99,235,0.04)_14px_28px)]" />
                    <div className="absolute left-0 right-0 top-4 px-4">
                      <div className="text-white font-bold">
                        Scanning resume…
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full border border-white/20 bg-white/10">
                        <div
                          className="h-full bg-gradient-to-r from-blue-400 to-cyan-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {note && (
                <div className="mt-2 text-base text-slate-400">{note}</div>
              )}
            </CardContent>
          </Card>

          {/* RIGHT: Controls + Results */}
          <div className="flex flex-col gap-6">
            <Card className="border-slate-800/60 bg-slate-900/40 backdrop-blur">
              <CardContent className="p-5">
                <SectionTitle>1) Upload or Paste</SectionTitle>

                <div className="mt-4 grid gap-3">
                  <label className="text-sm text-slate-400">
                    Upload .pdf / .txt / .md
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-800/60 bg-slate-900/40 px-3 py-2 ">
                    <div className="flex items-center gap-2 rounded-xl border font-bold border-slate-800/60 hover:bg-slate-900/40 bg-amber-600 px-3 py-3 cursor-pointer hover:border-orange-500/60">
                      <Upload className="h-6 w-6 text-orange-300" />
                      <span className="text-base text-slate-200">
                        Choose file
                      </span>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.txt,.md"
                      onChange={onFile}
                      className="hidden"
                    />
                  </label>

                  <label className="mt-2 text-sm text-slate-400">
                    Or paste resume text
                  </label>
                  <textarea
                    rows={8}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder={
                      isPdf
                        ? "We auto-extracted your PDF text above. If it looks incomplete, paste your resume text here."
                        : "Paste your resume text here if the preview isn't text."
                    }
                    className="w-full rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 text-sm text-slate-100 outline-none focus:border-orange-600"
                  />

                  <label className="mt-3 text-base text-orange-300">
                    Job Description (optional)
                  </label>
                  <textarea
                    rows={6}
                    value={jobText}
                    onChange={(e) => setJobText(e.target.value)}
                    placeholder="Paste the JD to check keyword match (boosts score accuracy)."
                    className="w-full rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 text-sm text-slate-100 outline-none focus:border-orange-600"
                  />

                  <div className="mt-4">
                    <Button
                      onClick={runScan}
                      disabled={scanning}
                      className="w-full bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black"
                    >
                      {scanning ? "Scanning…" : "Scan Now"}
                      {!scanning && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800/60 bg-slate-900/40 backdrop-blur">
              <CardContent className="p-5">
                <div className="mb-6 flex items-center justify-between">
                  <SectionTitle>2) Result</SectionTitle>
                  <Badge className="bg-slate-800 text-orange-300 hover:bg-slate-800">
                    <Gauge className="mr-1 h-3 w-3" />
                    Instant
                  </Badge>
                </div>

                {result ? (
                  <div className="grid gap-4">
                    {/* Score row */}
                    <div className="flex items-center gap-4">
                      <ScoreDonut value={Math.round(result.score)} />
                      <div>
                        <div className="text-base font-bold text-orange-300">
                          ATS Score
                        </div>
                        <div className="text-sm text-slate-400">
                          Sections{" "}
                          {Math.round(
                            (result.signals.sectionsFound /
                              result.signals.sectionsTotal) *
                              20
                          )}
                          /20 · Contact{" "}
                          {Math.round(
                            (result.signals.contactFound /
                              result.signals.contactTotal) *
                              10
                          )}
                          /10 · Keywords{" "}
                          {result.signals.keywordsTotal
                            ? Math.round(
                                (result.signals.keywordsMatched /
                                  result.signals.keywordsTotal) *
                                  30
                              )
                            : 15}
                          /30 · Verbs ~
                          {Math.min(result.signals.verbBullets, 10)}/10 ·
                          Metrics ~{Math.min(result.signals.metricsCount, 10)}
                          /10 · Length ~?/10 · File 5/5
                        </div>
                        <div className="mt-1 text-sm text-orange-300">
                          {result.verdict}
                        </div>
                      </div>
                    </div>

                    {/* Improvements */}
                    <div>
                      <div className="mb-2 text-lg font-semibold text-orange-300">
                        Top Improvements
                      </div>
                      <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300/90">
                        {result.improvements.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Missing keywords */}
                    {result.missingKeywords?.length ? (
                      <div>
                        <div className="mb-1 text-lg font-semibold text-white">
                          JD Keyword Coverage
                        </div>
                        <div className="text-xs text-slate-400">
                          Missing examples:{" "}
                          {result.missingKeywords.slice(0, 12).join(", ")}
                        </div>
                      </div>
                    ) : null}

                    <div className="pt-2">
                      <Button
                        onClick={() => (window.location.href = "/resume")}
                        variant="outline"
                        className="border-slate-700 bg-slate-900/40 hover:bg-slate-900/60 hover:text-orange-400 cursor-pointer"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Improve this in Resume Builder
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid place-items-center rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 text-center">
                    <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-orange-500/15 text-orange-300">
                      <Layers className="h-6 w-6" />
                    </div>
                    <div className="text-base text-slate-300">
                      No result yet. Upload your resume & run the scan.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Page footer hint */}
      <section className="mx-auto max-w-7xl px-4 pb-12 md:px-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-base text-slate-300">
                Tip: Export resumes as{" "}
                <span className="font-semibold text-orange-300">PDF</span> for
                the best parsing and stable formatting in ATS.
              </div>
              <Button
                onClick={() => (window.location.href = "/resume")}
                className="bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black cursor-pointer"
              >
                Build / Edit Resume <FileType2 className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Keyframes used by the scanning overlay */}
      <style>{`
        @keyframes scanSlide { 0% { transform: translateX(-30%); } 100% { transform: translateX(30%); } }
        @keyframes scanLinesMove { 0% { background-position-y: 0; } 100% { background-position-y: -7px; } }
        @keyframes scanBarSweep { 0% { transform: translateY(-120%); } 100% { transform: translateY(120%); } }
      `}</style>
    </div>
  );
}

/* ---------- Score Donut (Tailwind-friendly SVG) ---------- */
function ScoreDonut({ value = 0 }) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = 48;
  const stroke = 7;
  const norm = radius * 2 * Math.PI;
  const offset = norm - (clamped / 100) * norm;
  const color =
    clamped >= 80
      ? "#16a34a"
      : clamped >= 60
      ? "#2563eb"
      : clamped >= 40
      ? "#d97706"
      : "#e11d48";

  return (
    <div className="relative h-[110px] w-[110px]">
      <svg width={110} height={110}>
        <circle
          r={radius}
          cx={55}
          cy={55}
          fill="transparent"
          stroke="#e5e7eb"
          strokeWidth={stroke}
        />
        <circle
          r={radius}
          cx={55}
          cy={55}
          fill="transparent"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={norm}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 600ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-slate-100">
        <div className="text-2xl mt-5 font-extrabold">{clamped}</div>
        <div className="text-[10px] mb-5 opacity-75">out of 100</div>
      </div>
    </div>
  );
}
