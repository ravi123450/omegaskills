// src/pages/courses/LiveCohorts.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Users,
  Clock,
  Video,
  Award,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


/* LocalStorage keys reused from workshops admin */
const WS_LIST_KEY = "live_workshops_list";


/* --- UI bits --- */
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


function Info({ icon, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-6 w-6 place-items-center rounded-md bg-orange-600/15 text-orange-300">
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </div>
  );
}


/* Hide month names like "Sep 10" -> "Starts 10" */
function startsLabel(starts) {
  if (!starts) return "Dates will be shared after registration";
  const onlyDay = String(starts).replace(/[A-Za-z]+/g, "").trim();
  return onlyDay ? `Starts ${onlyDay}` : "Dates will be shared after registration";
}


export default function LiveCohorts() {
  const [items, setItems] = useState([]);


  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(WS_LIST_KEY) || "[]");
      setItems(Array.isArray(raw) ? raw : []);
    } catch {
      setItems([]);
    }
  }, []);


  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <section className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 md:px-6 md:pt-14">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-orange-600/20 text-orange-300 !text-base">Courses</Badge>
          <Badge className="bg-slate-800/60 text-slate-200 !text-base">Live Cohorts</Badge>
        </div>


        <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
          Learn together,{" "}
          <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
            build faster
          </span>
        </h1>


        <p className="mt-4 max-w-2xl text-base md:text-lg text-slate-300">
          Instructor-led live sessions, deadlines that keep you on track, and mentor feedback
          every week. Cohort seats are limited for tight feedback loops.
        </p>


        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button className="h-11 px-4 bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black" asChild>
            <Link to="/login">Log in to Apply</Link>
          </Button>
          <Link
            to="/courses/learn"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-orange-300"
          >
            Prefer self-paced? See Learn Courses <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>


      {/* Body */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-2 md:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Left: cohorts/workshops list (from admin-configured localStorage) */}
          <div className="md:col-span-2 space-y-6">
            <SectionTitle eyebrow="Upcoming cohorts">Open for applications</SectionTitle>


            {!items.length ? (
              <Card className="mt-6 border-slate-800/70 bg-slate-900/40">
                <CardContent className="p-6 text-sm text-slate-300">
                  No live cohorts/workshops published yet. Please check back later.
                </CardContent>
              </Card>
            ) : (
              <div className="mt-6 grid gap-4">
                {items.map((w) => {
                  const duration = w.duration_weeks ? `${w.duration_weeks} weeks` : "4–6 weeks";
                  const schedule = w.schedule || "Live on Zoom · schedule shared after registration";
                  const seats = w.seats ? `${w.seats} seats` : null;
                  const features =
                    Array.isArray(w.features) && w.features.length
                      ? w.features
                      : ["Hands-on labs", "Mock exam", "Interview prep"];


                  return (
                    <Card
                      key={w.id}
                      className="border-slate-800/70 bg-slate-900/40 hover:border-orange-600/50 transition-colors"
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-orange-300" />
                              <h3 className="text-lg font-semibold">{w.title}</h3>
                            </div>


                            <div className="mt-2 grid gap-2 text-sm text-slate-300/90 sm:grid-cols-2">
                              <Info icon={<CalendarDays className="h-4 w-4" />} label={startsLabel(w.starts)} />
                              <Info icon={<Clock className="h-4 w-4" />} label={duration} />
                              {seats && <Info icon={<Users className="h-4 w-4" />} label={seats} />}
                              <Info icon={<Video className="h-4 w-4" />} label={schedule} />
                            </div>


                            <ul className="mt-3 flex flex-wrap gap-2">
                              {features.map((o) => (
                                <li
                                  key={o}
                                  className="flex items-center gap-1 rounded-md border border-slate-800/60 bg-slate-900/40 px-2 py-1 text-xs text-slate-300"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 text-orange-300" /> {o}
                                </li>
                              ))}
                            </ul>
                          </div>


                          {/* Pre-login CTA is always "Log in" */}
                          <div className="shrink-0 self-center">
                            <Button asChild className="bg-orange-500 text-slate-900 hover:bg-orange-400">
                              <Link to="/login">Log in</Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>


          {/* Right: Why cohorts (unchanged) */}
          <aside className="md:col-span-1">
            <div className="md:sticky md:top-24 space-y-4">
              <Card className="border-slate-800/70 bg-slate-900/50">
                <CardContent className="p-6">
                  <div className="mb-2">
                    <Badge className="bg-orange-600/20 text-orange-300">Why cohorts?</Badge>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300/90">
                    {[
                      "Live teaching & quick doubt-clearing",
                      "Structured deadlines to stay consistent",
                      "Weekly mentor feedback on projects",
                      "Peer learning & accountability",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-orange-300 mt-0.5" />
                        {t}
                      </li>
                    ))}
                  </ul>


                  <div className="mt-5">
                    <Button
                      asChild
                      variant="secondary"
                      className="w-full text-sm bg-slate-800 text-slate-100 hover:bg-slate-700"
                    >
                      <Link to="/contact">Prefer campus bootcamps?</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>


              <Card className="border-slate-800/70 bg-slate-900/50">
                <CardContent className="p-6">
                  <div className="mb-2">
                    <Badge className="bg-orange-600/20 text-orange-300">Certification</Badge>
                  </div>
                  <p className="text-sm text-slate-300/90">
                    Complete at least 80% of sessions and the capstone to earn a cohort completion
                    certificate.
                  </p>


                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                    <Award className="h-4 w-4 text-orange-300" />
                    Recognized by partner colleges & hiring teams
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





