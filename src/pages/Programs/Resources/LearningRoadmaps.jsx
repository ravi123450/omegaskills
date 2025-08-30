// src/pages/resources/LearningRoadmaps.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  Map,
  Route,
  BookOpen,
  Cpu,
  Cloud,
  ShieldCheck,
  Wifi,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useAuthFlag from "@/lib/useAuthFlag";

/* tiny atom for section titles */
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

export default function LearningRoadmaps() {
  const isAuthed = useAuthFlag();

  const tracks = [
    {
      id: "ds",
      icon: <Cpu className="h-5 w-5 text-orange-300" />,
      title: "Data Science & ML",
      duration: "12–16 weeks",
      bullets: [
        "Python, Numpy/Pandas",
        "EDA & Visualization",
        "ML algorithms & MLOps basics",
        "Capstone with real dataset",
      ],
    },
    {
      id: "cloud",
      icon: <Cloud className="h-5 w-5 text-orange-300" />,
      title: "Cloud (AWS-centric)",
      duration: "10–12 weeks",
      bullets: [
        "VPC, IAM, EC2, S3",
        "RDS & serverless (Lambda)",
        "IaC foundations (Terraform)",
        "Deploy a production stack",
      ],
    },
    {
      id: "sec",
      icon: <ShieldCheck className="h-5 w-5 text-orange-300" />,
      title: "Cybersecurity",
      duration: "10–12 weeks",
      bullets: [
        "Networking & Linux",
        "OWASP & threat modeling",
        "SIEM & blue-team basics",
        "CTF-style project",
      ],
    },
    {
      id: "iot",
      icon: <Wifi className="h-5 w-5 text-orange-300" />,
      title: "IoT Foundations",
      duration: "8–10 weeks",
      bullets: [
        "ESP32 & sensors",
        "MQTT & cloud ingestion",
        "Dashboards & alerts",
        "Campus demo build",
      ],
    },
  ];

  const phases = [
    {
      title: "Phase 1 — Core",
      desc: "Lay down the basics with structured theory and mini check-ins.",
    },
    {
      title: "Phase 2 — Practice",
      desc: "Guided assignments with increasing difficulty and review cycles.",
    },
    {
      title: "Phase 3 — Projects",
      desc: "Build a real-world capstone with a clear problem statement.",
    },
    {
      title: "Phase 4 — Interview",
      desc: "Mock interviews + resume polish aligned to your track.",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <section className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 md:px-6 md:pt-14">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-orange-600/20 text-orange-300 !text-base">Resources</Badge>
          <Badge className="bg-slate-800/60 text-slate-200 !text-base">Learning Roadmaps</Badge>
        </div>

        <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
          Step-by-step{" "}
          <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
            learning paths
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-base md:text-lg text-slate-300">
          Beginner to job-ready plans for Cloud, Data Science, IoT, and Security. Includes
          milestones, projects, and interview prep.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            asChild
            className="h-11 px-4 bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black"
          >
            <Link to={isAuthed ? "/dashboard" : "/login"}>
              {isAuthed ? "Add roadmap to Dashboard" : "Log in to Save"}
            </Link>
          </Button>
          <Link
            to="/resources"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-orange-300"
          >
            Explore all resources <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-2 md:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Left column */}
          <div className="md:col-span-2 space-y-10">
            {/* Featured tracks */}
            <div>
              <SectionTitle eyebrow="Tracks">Choose a roadmap</SectionTitle>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {tracks.map((t) => (
                  <Card
                    key={t.id}
                    className="border-slate-800/70 bg-slate-900/40 hover:border-orange-600/50 transition-colors"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-600/15">
                            {t.icon}
                          </span>
                          <div>
                            <div className="font-semibold text-slate-100">
                              {t.title}
                            </div>
                            <div className="text-xs uppercase tracking-wide text-slate-400">
                              {t.duration}
                            </div>
                          </div>
                        </div>

                        <Button
                          asChild
                          className="bg-orange-500 text-slate-900 hover:bg-orange-400"
                        >
                          <Link to={isAuthed ? "/dashboard" : "/login"}>
                            {isAuthed ? "Use this plan" : "Log in"}
                          </Link>
                        </Button>
                      </div>

                      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                        {t.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-2 text-sm text-slate-300/90">
                            <BadgeCheck className="h-4 w-4 text-orange-300 mt-0.5" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Phases */}
            <div>
              <SectionTitle eyebrow="Method">Roadmap phases</SectionTitle>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {phases.map((p) => (
                  <Card key={p.title} className="border-slate-800/70 bg-slate-900/40">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-orange-600/15 p-2">
                          <Route className="h-5 w-5 text-orange-300" />
                        </div>
                        <div>
                          <div className="font-semibold">{p.title}</div>
                          <p className="mt-1 text-sm text-slate-300/90">{p.desc}</p>
                        </div>
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
              {/* Quick start card */}
              <Card className="border-slate-800/70 bg-slate-900/50">
                <CardContent className="p-6">
                  <div className="mb-2">
                    <Badge className="bg-orange-600/20 text-orange-300">Quick start</Badge>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300/90">
                    {[
                      "Pick a track that matches your goals",
                      "Commit to 8–10 hrs/week",
                      "Do one mini-project/week",
                      "Review progress every Sunday",
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
                        {isAuthed ? "Add to Dashboard" : "Log in to Save"}
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="secondary"
                      className="w-full text-sm bg-slate-800 text-slate-100 hover:bg-slate-700"
                    >
                      <Link to="/resources/notes">Notes & Cheat Sheets</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Helpful links */}
              <Card className="border-slate-800/70 bg-slate-900/50">
                <CardContent className="p-6">
                  <div className="mb-2">
                    <Badge className="bg-orange-600/20 text-orange-300">Helpful</Badge>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300/90">
                    {[
                      "Use the Question Bank weekly",
                      "Attend an online workshop monthly",
                      "Try a campus bootcamp for acceleration",
                      "Book a 1:1 mock before interviews",
                    ].map((x) => (
                      <li key={x} className="flex items-start gap-2">
                        <BadgeCheck className="h-4 w-4 text-orange-300 mt-0.5" />
                        {x}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
