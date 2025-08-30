// src/pages/community/Hackathons.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Users,
  Lightbulb,
  CalendarDays,
  ArrowRight,
  BadgeCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useAuthFlag from "@/lib/useAuthFlag";

/* atom for section titles */
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

export default function Hackathons() {
  const isAuthed = useAuthFlag();

  const upcoming = [
    {
      id: "h1",
      title: "Omega Skills National Hackathon",
      date: "Dec 6–7, 2025",
      theme: "AI • Cloud • IoT",
      prize: "₹50,000",
    },
    {
      id: "h2",
      title: "Cybersecurity CTF Challenge",
      date: "Jan 18–19, 2026",
      theme: "Security • Networks",
      prize: "₹30,000",
    },
  ];

  const whyJoin = [
    {
      icon: <Users className="h-5 w-5 text-orange-300" />,
      title: "Team Collaboration",
      desc: "Work in squads, simulate industry workflows, and learn agile execution.",
    },
    {
      icon: <Lightbulb className="h-5 w-5 text-orange-300" />,
      title: "Innovative Ideas",
      desc: "Pitch solutions to real-world problems and build MVPs fast.",
    },
    {
      icon: <Trophy className="h-5 w-5 text-orange-300" />,
      title: "Recognition & Prizes",
      desc: "Win cash prizes, certificates, and recruiter attention.",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <section className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 md:px-6 md:pt-14">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-orange-600/20 text-orange-300 !text-base">
            Community
          </Badge>
          <Badge className="bg-slate-800/60 text-slate-200 !text-base">
            Hackathons
          </Badge>
        </div>

        <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
          Competitive,{" "}
          <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
            mentor-led hackathons
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-base md:text-lg text-slate-300">
          Join coding marathons to solve real problems, build MVPs, and network
          with peers, mentors, and recruiters.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            asChild
            className="h-11 px-4 bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black"
          >
            <Link to={isAuthed ? "/dashboard" : "/login"}>
              {isAuthed ? "Register for Hackathon" : "Log in to Register"}
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

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-2 md:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Left */}
          <div className="md:col-span-2 space-y-10">
            {/* Upcoming hackathons */}
            <div>
              <SectionTitle eyebrow="Upcoming">Get ready to compete</SectionTitle>
              <div className="mt-8 grid gap-4">
                {upcoming.map((h) => (
                  <Card
                    key={h.id}
                    className="border-slate-800/70 bg-slate-900/40 hover:border-orange-600/50 transition-colors"
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-lg font-semibold text-slate-100">{h.title}</div>
                          <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-slate-300/90">
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays className="h-4 w-4 text-orange-300" /> {h.date}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Sparkles className="h-4 w-4 text-orange-300" /> {h.theme}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Trophy className="h-4 w-4 text-orange-300" /> {h.prize}
                            </span>
                          </div>
                        </div>

                        <Button
                          asChild
                          className="bg-orange-500 text-slate-900 hover:bg-orange-400"
                        >
                          <Link to={isAuthed ? "/dashboard" : "/login"}>
                            {isAuthed ? "Register" : "Log in"}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Why join */}
            <div>
              <SectionTitle eyebrow="Why join">Hack, learn, grow</SectionTitle>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {whyJoin.map((f) => (
                  <Card
                    key={f.title}
                    className="border-slate-800/70 bg-slate-900/40 text-center"
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
              <div className="mt-6">
                <Button
                  asChild
                  className="text-base bg-orange-500 text-slate-900 hover:bg-orange-400"
                >
                  <Link to={isAuthed ? "/dashboard" : "/login"}>
                    {isAuthed ? "Join Hackathon" : "Log in to Join"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <aside className="md:col-span-1">
            <div className="md:sticky md:top-24 space-y-4">
              <Card className="border-slate-800/70 bg-slate-900/50">
                <CardContent className="p-6">
                  <div className="mb-2">
                    <Badge className="bg-orange-600/20 text-orange-300">
                      Benefits
                    </Badge>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300/90">
                    {[
                      "Certificates & prizes",
                      "Mentor-led problem solving",
                      "Recruiter visibility",
                      "Portfolio-ready projects",
                    ].map((p) => (
                      <li key={p} className="flex items-start gap-2">
                        <BadgeCheck className="h-4 w-4 text-orange-300 mt-0.5" />
                        {p}
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
