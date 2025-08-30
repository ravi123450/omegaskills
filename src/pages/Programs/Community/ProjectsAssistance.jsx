// src/pages/community/ProjectsAssistance.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Wrench,
  Lightbulb,
  GitBranch,
  BadgeCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useAuthFlag from "@/lib/useAuthFlag";

/* tiny atom to keep headings consistent */
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

export default function ProjectsAssistance() {
  const isAuthed = useAuthFlag();

  const helpBlocks = [
    {
      icon: <Wrench className="h-5 w-5 text-orange-300" />,
      title: "Build & Debug",
      desc: "Get unstuck with code reviews, architecture tips, and debugging support for your project stack.",
    },
    {
      icon: <GitBranch className="h-5 w-5 text-orange-300" />,
      title: "Git & Workflow",
      desc: "Branching, PR reviews, issues, and CI basics to make your project industry-ready.",
    },
    {
      icon: <Lightbulb className="h-5 w-5 text-orange-300" />,
      title: "Ideas to Execution",
      desc: "Turn a rough idea into a scoped MVP with milestones and a realistic timeline.",
    },
  ];

  const starterIdeas = [
    {
      title: "Placement Tracker App",
      desc: "React + Firebase app to track job applications, interviews, and ATS status.",
      tag: "Web • React",
    },
    {
      title: "IoT Smart Meter",
      desc: "ESP32 with MQTT + a simple dashboard; focus on data logging and alerts.",
      tag: "IoT • MQTT",
    },
    {
      title: "AWS Cost Watch",
      desc: "Lambda + CloudWatch alerts + dashboard for monthly cost trends & anomalies.",
      tag: "Cloud • AWS",
    },
    {
      title: "Resume Insights",
      desc: "Node service that extracts keywords from a JD and matches resume gaps.",
      tag: "Backend • NLP",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <section className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 md:px-6 md:pt-14">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-orange-600/20 text-orange-300 !text-base">Community</Badge>
          <Badge className="bg-slate-800/60 text-slate-200 !text-base">Projects Assistance</Badge>
        </div>

        <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
          Real projects,{" "}
          <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
            real mentorship
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-base md:text-lg text-slate-300">
          Get guided help to design, build, and ship portfolio-ready projects. Collaborate, learn
          workflows, and showcase impact.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            asChild
            className="h-11 px-4 bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black"
          >
            <Link to={isAuthed ? "/dashboard" : "/login"}>
              {isAuthed ? "Request Project Help" : "Log in to Request Help"}
            </Link>
          </Button>
          <Link
            to="/community"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-orange-300"
          >
            Visit Community <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-2 md:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Left column */}
          <div className="md:col-span-2 space-y-10">
            {/* What we help with */}
            <div>
              <SectionTitle eyebrow="What we help with">From idea to demo day</SectionTitle>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {helpBlocks.map((b) => (
                  <Card
                    key={b.title}
                    className="border-slate-800/70 bg-slate-900/40 hover:border-orange-600/50 transition-colors"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-orange-600/15 p-2">{b.icon}</div>
                        <div>
                          <div className="font-semibold text-slate-100">{b.title}</div>
                          <p className="mt-1 text-sm text-slate-300/90">{b.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Starter ideas */}
            <div>
              <SectionTitle eyebrow="Starter ideas">Pick one or pitch yours</SectionTitle>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {starterIdeas.map((i) => (
                  <Card
                    key={i.title}
                    className="border-slate-800/70 bg-slate-900/40 hover:border-orange-600/50 transition-colors"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-semibold text-slate-100">{i.title}</div>
                        <span className="rounded-md border border-slate-700/60 bg-slate-900/40 px-2 py-0.5 text-xs text-slate-300">
                          {i.tag}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-300/90">{i.desc}</p>
                      <div className="mt-3">
                        <Button
                          asChild
                          variant="secondary"
                          className="bg-slate-800 text-slate-100 hover:bg-slate-700"
                        >
                          <Link to={isAuthed ? "/dashboard" : "/login"}>
                            {isAuthed ? "Join build thread" : "Log in to join"}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div>
              <SectionTitle eyebrow="How it works">Simple flow</SectionTitle>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  { icon: <Users className="h-5 w-5 text-orange-300" />, t: "Form your squad", d: "Team up with peers & a mentor." },
                  { icon: <GitBranch className="h-5 w-5 text-orange-300" />, t: "Plan & build", d: "Scope, issues, and weekly milestones." },
                  { icon: <Sparkles className="h-5 w-5 text-orange-300" />, t: "Demo & feedback", d: "Showcase, get review, iterate." },
                ].map((f, i) => (
                  <Card key={i} className="border-slate-800/70 bg-slate-900/40 text-center">
                    <CardContent className="p-6">
                      <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl bg-orange-600/15">
                        {f.icon}
                      </div>
                      <div className="font-semibold">{f.t}</div>
                      <div className="mt-1 text-sm text-slate-300/90">{f.d}</div>
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
                    {isAuthed ? "Request Mentor" : "Log in to Request"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Right column */}
          <aside className="md:col-span-1">
            <div className="md:sticky md:top-24 space-y-4">
              <Card className="border-slate-800/70 bg-slate-900/50">
                <CardContent className="p-6">
                  <div className="mb-2">
                    <Badge className="bg-orange-600/20 text-orange-300">What’s included</Badge>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300/90">
                    {[
                      "Mentor check-ins",
                      "Code reviews & guidance",
                      "Presentation feedback",
                      "Community showcase",
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
                        {isAuthed ? "Start a Project" : "Log in to Start"}
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="secondary"
                      className="w-full text-sm bg-slate-800 text-slate-100 hover:bg-slate-700"
                    >
                      <Link to="/community">Visit Community</Link>
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
