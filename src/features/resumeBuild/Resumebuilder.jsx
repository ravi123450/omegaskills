// src/features/resumeBuild/resumebuilder.jsx
import React, { useCallback, useMemo, useRef, useState } from "react";
import ResumeForm, { FONT_OPTIONS } from "./ResumeForm";
import ResumePreview from "./ResumePreview";
import TemplateSelector from "./TemplateSelector";
import { buildTemplateConfigs } from "./templates";
import { Link } from "react-router-dom";
import { useReactToPrint } from "react-to-print";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LayoutTemplate, FileText, ArrowRight, Sparkles } from "lucide-react";

import "./resume.css";

/* ---------- local atoms ---------- */
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

/* ---------- builder ---------- */
const DEFAULT_CFG = buildTemplateConfigs()[0];

export default function ResumeBuilder() {
  const [font, setFont] = useState(FONT_OPTIONS[0]);
  const [cfg, setCfg] = useState(DEFAULT_CFG);
  const [data, setData] = useState({});
  const [openGallery, setOpenGallery] = useState(false);
  const [margin, setMargin] = useState(24);
  const [lineHeight, setLineHeight] = useState(1.4);

  const handleData = useCallback((d) => setData(d), []);
  const parsedData = useMemo(() => data, [data]);

  // --- print setup (v3 API) ---
  const resumeRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: data?.name ? `${data.name} - Resume` : "Resume",
    removeAfterPrint: true,
    pageStyle: `
      @page { size: A4; margin: 16mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .resumePage { box-shadow: none !important; }
        a[href]::after { content: "" !important; }
      }
    `,
  });

  return (
    <div className="scroll-smooth bg-slate-950 text-white selection:bg-orange-300 selection:text-slate-900 min-h-screen">
      {/* background blobs */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-[90px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-[110px]" />
      </div>

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 pb-8 pt-10 md:px-6 md:pt-14">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-orange-600/20 text-orange-300 !text-base">
            Resume Builder
          </Badge>
        </div>

        <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
          Build a clean,{" "}
          <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
            ATS-friendly
          </span>{" "}
          resume in minutes.
        </h1>
        <p className="mt-3 max-w-2xl text-base md:text-lg text-slate-300">
          Choose from 30+ verified templates, fill out the form, and preview
          your resume live. Export high-quality PDFs that pass ATS scanners and
          impress recruiters.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {/* Choose Template */}
          <Button
            size="lg"
            className="bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black flex items-center"
            onClick={() => setOpenGallery(true)}
          >
            <LayoutTemplate className="mr-2 h-5 w-5" />
            Choose Template
          </Button>

          {/* Open ATS Scanner */}
          <Button
            asChild
            size="lg"
            variant="outline"
            className="flex items-center gap-2 border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-900/60 hover:border-orange-400"
          >
            <Link
              to="/ats-scanner"
              className="flex items-center justify-center gap-2 px-6"
            >
              Open ATS Scanner
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Main grid */}
      <section className="mx-auto max-w-8xl px-4 pb-16 md:px-6">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 items-start">
          {/* LEFT: Form */}
          <Card className="border-slate-800/60 bg-slate-900/40 backdrop-blur">
            <CardContent className="p-4 md:p-6">
              <div className="mb-3 flex items-center justify-between">
                <SectionTitle eyebrow="Step 1">Enter Your Details</SectionTitle>
                <span className="hidden md:inline-flex items-center gap-2 rounded-xl border border-orange-300 bg-slate-900/40 px-3 py-1.5 text-sm text-slate-300">
                  <Sparkles className="h-4 w-4 text-orange-300" /> Live Preview
                </span>
              </div>

              <ResumeForm
                onData={handleData}
                font={font}
                setFont={setFont}
                cfg={cfg}
                setOpenGallery={setOpenGallery}
                margin={margin}
                setMargin={setMargin}
                lineHeight={lineHeight}
                setLineHeight={setLineHeight}
              />
            </CardContent>
          </Card>

          {/* RIGHT: Preview */}
          <Card className="border-slate-800/60 bg-slate-900/40 backdrop-blur">
            <CardContent className="p-4 md:p-6">
              <div className="mb-3 flex items-center justify-between">
                <SectionTitle eyebrow="Step 2">Preview & Export</SectionTitle>
                <span className="hidden md:inline-flex items-center gap-2 rounded-xl border border-orange-300 bg-slate-900/40 px-3 py-1.5 text-sm text-slate-300">
                  {cfg?.name || "Selected Template"}
                </span>
              </div>

              <div className="relative rounded-2xl border border-slate-800/60 bg-slate-900/40 p-2 mt-8">
                {/* Attach the print ref to an element that wraps the preview */}
                <div ref={resumeRef}>
                  <ResumePreview
                    data={parsedData}
                    cfg={cfg}
                    font={font}
                    margin={margin}
                    lineHeight={lineHeight}
                    onOpenGallery={() => setOpenGallery(true)}
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  className="bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black cursor-pointer"
                  onClick={handlePrint}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
                <Button
                  variant="secondary"
                  className="bg-slate-800 text-slate-100 hover:bg-slate-700 cursor-pointer hover:text-orange-300"
                  onClick={() => setOpenGallery(true)}
                >
                  <LayoutTemplate className="mr-2 h-4 w-4 text-orange-300" />
                  Switch Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Tips */}
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <Card>
          <CardContent className="p-5">
            <div className="mb-2 inline-flex items-center gap-2 text-orange-300">
              <Sparkles className="h-5 w-5" />
              <span className="text-base font-semibold">Quick Tips</span>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2 text-base text-slate-300/90">
              <li>1. One page is ideal unless you have 5+ years of experience.</li>
              <li>
                2. Use action verbs and quantify impact (e.g., “improved accuracy
                by 23%”).
              </li>
              <li>
                3. Match keywords from the job description; then run the ATS
                Scanner.
              </li>
              <li>
                4. Export as PDF and keep filenames clean (e.g.,
                yourname_resume.pdf).
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {openGallery && (
        <TemplateSelector
          font={font}
          onClose={() => setOpenGallery(false)}
          onPick={(c) => {
            setCfg(c);
            setOpenGallery(false);
          }}
        />
      )}
    </div>
  );
}
