// src/pages/courses/CloudCertConcierge.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  Cloud,
  BrainCircuit,
  ClipboardList,
  CheckCircle2,
  GraduationCap,
  CalendarClock,
  BookOpen,
  MessageSquare,
  Award,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useAuthFlag from "@/lib/useAuthFlag";

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

const TRACKS = [
  {
    id: "aws-sa",
    provider: "AWS",
    title: "Solutions Architect – Associate",
    includes: ["Study plan & tracker", "Hands-on labs", "2x mock exams"],
  },
  {
    id: "azure-admin",
    provider: "Azure",
    title: "Administrator (AZ-104)",
    includes: ["Services map", "Labs & notes", "Interview prep"],
  },
  {
    id: "gcp-ace",
    provider: "GCP",
    title: "Associate Cloud Engineer",
    includes: ["Deployments", "Monitoring", "Final review"],
  },
];

export default function CloudCertConcierge() {
  const isAuthed = useAuthFlag();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <section className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 md:px-6 md:pt-14">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-orange-600/20 text-orange-300 !text-base">Courses</Badge>
          <Badge className="bg-slate-800/60 text-slate-200 !text-base">Cloud Cert Concierge</Badge>
        </div>

        <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
          Pass your{" "}
          <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
            cloud certification
          </span>{" "}
          faster
        </h1>

        <p className="mt-4 max-w-2xl text-base md:text-lg text-slate-300">
          A guided pathway for AWS, Azure, and GCP certs — personal study plan,
          weekly checkpoints, curated labs, and exam rehearsal. No fluff, only what matters.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            asChild
            className="h-11 px-4 bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black"
          >
            <Link to={isAuthed ? "/dashboard" : "/login"}>
              {isAuthed ? "Get my plan" : "Log in to start"}
            </Link>
          </Button>
          <Link
            to="/courses/cohorts"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-orange-300"
          >
            Prefer live coaching? See cohorts <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Left: how concierge works */}
          <div className="md:col-span-2 space-y-8">
            <SectionTitle eyebrow="How it works">Concierge workflow</SectionTitle>

            <div className="grid gap-4 sm:grid-cols-2">
              <Step
                icon={<ClipboardList className="h-5 w-5" />}
                title="1. Diagnostic & plan"
                desc="We assess your background and generate a 3–6 week plan with milestones."
              />
              <Step
                icon={<BookOpen className="h-5 w-5" />}
                title="2. Curated material"
                desc="Labs, notes, and short videos mapped to each exam domain."
              />
              <Step
                icon={<CalendarClock className="h-5 w-5" />}
                title="3. Weekly reviews"
                desc="Quick mentor check-ins to unblock and maintain momentum."
              />
              <Step
                icon={<BrainCircuit className="h-5 w-5" />}
                title="4. Mock exams"
                desc="Timed mocks & explanations to close gaps before your real exam."
              />
              <Step
                icon={<MessageSquare className="h-5 w-5" />}
                title="5. Doubt support"
                desc="Discussion thread for questions, mistakes, and tricky services."
              />
              <Step
                icon={<GraduationCap className="h-5 w-5" />}
                title="6. Exam day ready"
                desc="Final review checklist, tips, and scheduling guidance."
              />
            </div>

            <SectionTitle eyebrow="Pick a track">AWS · Azure · GCP</SectionTitle>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {TRACKS.map((t) => (
                <Card
                  key={t.id}
                  className="border-slate-800/70 bg-slate-900/40 hover:border-orange-600/50 transition-colors"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <Cloud className="h-4 w-4 text-orange-300" />
                      <h3 className="text-lg font-semibold">
                        {t.provider} — {t.title}
                      </h3>
                    </div>
                    <ul className="mt-3 space-y-2 text-sm text-slate-300/90">
                      {t.includes.map((x) => (
                        <li key={x} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-orange-300 mt-0.5" />
                          {x}
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      className="mt-4 bg-orange-500 text-slate-900 hover:bg-orange-400"
                    >
                      <Link to={isAuthed ? "/dashboard" : "/login"}>
                        {isAuthed ? "Add to my plan" : "Log in to continue"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right: outcomes */}
          <aside className="md:col-span-1">
            <div className="md:sticky md:top-24 space-y-4">
              <Card className="border-slate-800/70 bg-slate-900/50">
                <CardContent className="p-6">
                  <div className="mb-2">
                    <Badge className="bg-orange-600/20 text-orange-300">
                      Outcomes
                    </Badge>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300/90">
                    {[
                      "Clear plan with weekly checkpoints",
                      "Hands-on labs mapped to exam domains",
                      "2x mocks with explanations",
                      "Confidence on exam day",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-orange-300 mt-0.5" />
                        {t}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                    <Award className="h-4 w-4 text-orange-300" />
                    Certificate issued on successful completion of the plan
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

function Step({ icon, title, desc }) {
  return (
    <Card className="border-slate-800/70 bg-slate-900/40">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-orange-600/15 text-orange-300">
            {icon}
          </span>
          <div>
            <div className="font-semibold">{title}</div>
            <p className="text-sm text-slate-300/90">{desc}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
