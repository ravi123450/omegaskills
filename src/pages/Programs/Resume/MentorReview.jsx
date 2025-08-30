// src/pages/MentorReview.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Clock,
  MessageSquare,
  ShieldCheck,
  UploadCloud,
  BadgeCheck,
  Star,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useAuthFlag from "@/lib/useAuthFlag";

/* ----- tiny atom (kept local so you can drop-in easily) ----- */
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

export default function MentorReview() {
  const isAuthed = useAuthFlag();

  const features = [
    {
      icon: <BadgeCheck className="h-5 w-5 text-orange-300" />,
      title: "ATS Optimization",
      desc: "We align your resume to role-specific keywords without keyword stuffing.",
    },
    {
      icon: <MessageSquare className="h-5 w-5 text-orange-300" />,
      title: "Actionable Feedback",
      desc: "Line-by-line suggestions on structure, bullet points, and impact.",
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-orange-300" />,
      title: "Mentor-reviewed",
      desc: "Reviewed by industry mentors in data, cloud, IoT, and security.",
    },
    {
      icon: <Clock className="h-5 w-5 text-orange-300" />,
      title: "48-hour Turnaround",
      desc: "Standard reviews delivered within two working days.",
    },
  ];

  const steps = [
    {
      step: "1",
      title: "Upload your resume",
      desc: "PDF or DOCX preferred. Add a target role or JD if available.",
      icon: <UploadCloud className="h-5 w-5 text-orange-300" />,
    },
    {
      step: "2",
      title: "Mentor review",
      desc: "We annotate, restructure, and optimize for ATS & readability.",
      icon: <FileText className="h-5 w-5 text-orange-300" />,
    },
    {
      step: "3",
      title: "Get edits within 48h",
      desc: "Receive a reviewed file with suggestions and a quick summary.",
      icon: <Clock className="h-5 w-5 text-orange-300" />,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <section className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 md:px-6 md:pt-14">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-orange-600/20 text-orange-300 !text-base">
            Resume Builder
          </Badge>
          <Badge className="bg-slate-800/60 text-slate-200 !text-base">
            48h Human Review
          </Badge>
        </div>

        <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
          Human-led resume review,
          <span className="ml-2 bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
            delivered in 48h
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-base md:text-lg text-slate-300">
          Get mentor feedback, ATS improvements, and clear edits to strengthen interviews & shortlists.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            asChild
            className="h-11 px-4 bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black"
          >
            <Link to={isAuthed ? "/dashboard" : "/login"}>
              {isAuthed ? "Request a Review" : "Log in to Request Review"}
            </Link>
          </Button>
          <Link
            to="/ats-scanner"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-orange-300"
          >
            Try Instant ATS Score
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-2 md:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Left (main) */}
          <div className="md:col-span-2 space-y-10">
            {/* What you get */}
            <div>
              <SectionTitle eyebrow="What you’ll get">Stronger resume, fast</SectionTitle>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {features.map((f) => (
                  <Card
                    key={f.title}
                    className="border-slate-800/70 bg-slate-900/40 hover:border-orange-600/50 transition-colors"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-orange-600/15 p-2 shrink-0">{f.icon}</div>
                        <div>
                          <div className="font-semibold text-slate-100">{f.title}</div>
                          <p className="mt-1 text-sm text-slate-300/90">{f.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div>
              <SectionTitle eyebrow="How it works">Simple 3-step process</SectionTitle>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {steps.map((s) => (
                  <Card
                    key={s.step}
                    className="border-slate-800/70 bg-slate-900/40 text-center"
                  >
                    <CardContent className="p-6">
                      <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl bg-orange-600/15">
                        {s.icon}
                      </div>
                      <div className="text-sm uppercase tracking-wide text-slate-400">
                        Step {s.step}
                      </div>
                      <div className="mt-1 font-semibold">{s.title}</div>
                      <p className="mt-1 text-sm text-slate-300/90">{s.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-6">
                <Button
                  asChild
                  className="text-base bg-orange-500 text-slate-900 hover:bg-orange-400"
                >
                  <Link to={isAuthed ? "/dashboard" : "/login"}>
                    {isAuthed ? "Start Review" : "Log in to Start"}
                  </Link>
                </Button>
              </div>
            </div>

            {/* FAQs */}
            <div>
              <SectionTitle eyebrow="FAQs">Good to know</SectionTitle>
              <div className="mt-6 grid gap-4">
                <Card className="border-slate-800/70 bg-slate-900/40">
                  <CardContent className="p-5">
                    <div className="font-semibold">What file types do you support?</div>
                    <p className="mt-1 text-sm text-slate-300/90">
                      PDF or DOCX preferred. Include the target role/JD for best results.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-slate-800/70 bg-slate-900/40">
                  <CardContent className="p-5">
                    <div className="font-semibold">Do you rewrite my resume?</div>
                    <p className="mt-1 text-sm text-slate-300/90">
                      We provide edits and suggestions you can accept, plus clear examples for bullets and sections.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-slate-800/70 bg-slate-900/40">
                  <CardContent className="p-5">
                    <div className="font-semibold">How fast is the 48h promise?</div>
                    <p className="mt-1 text-sm text-slate-300/90">
                      Within two working days for standard reviews. For urgent timelines, contact support.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Right (sidebar) */}
          <aside className="md:col-span-1">
            <div className="md:sticky md:top-24 space-y-4">
              <Card className="border-slate-800/70 bg-slate-900/50">
                <CardContent className="p-6">
                  <div className="mb-2">
                    <Badge className="bg-orange-600/20 text-orange-300">Included</Badge>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300/90">
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-orange-300 mt-0.5" />
                      ATS keyword & formatting suggestions
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-orange-300 mt-0.5" />
                      Bullet restructuring & impact metrics
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-orange-300 mt-0.5" />
                      Summary of key fixes
                    </li>
                  </ul>

                  <div className="mt-5 grid gap-2">
                    <Button
                      asChild
                      className="w-full text-base bg-orange-500 text-slate-900 hover:bg-orange-400"
                    >
                      <Link to={isAuthed ? "/dashboard" : "/login"}>
                        {isAuthed ? "Request a Review" : "Log in to Request"}
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="secondary"
                      className="w-full text-sm bg-slate-800 text-slate-100 hover:bg-slate-700"
                    >
                      <Link to="/ats-scanner">Run ATS Scan</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-800/70 bg-slate-900/40">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-orange-300" />
                    <div className="text-sm font-semibold">Tip</div>
                  </div>
                  <p className="mt-2 text-xs text-slate-300/90">
                    Attach your target JD for better keyword alignment and measurable bullet points.
                  </p>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
