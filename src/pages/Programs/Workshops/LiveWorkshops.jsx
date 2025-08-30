// src/pages/Workshops/LiveWorkshops.jsx
import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  CalendarDays,
  Clock,
  Users,
  Video,
  Link as LinkIcon,
  CheckCircle2,
} from "lucide-react";

/* localStorage keys */
const WS_LIST_KEY = "live_workshops_list";
const WS_FORM_KEY = "live_workshops_form_url";

/* small section title helper (matches cohorts look) */
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

/* remove month names from a short "Sep 10" style string */
function startsLabel(starts) {
  if (!starts) return "Dates will be shared after registration";
  // strip month words; keep digits and separators
  const onlyDay = String(starts).replace(/[A-Za-z]+/g, "").trim();
  return onlyDay ? `Starts ${onlyDay}` : "Dates will be shared after registration";
}

export default function LiveWorkshops() {
  const [items, setItems] = useState([]);
  const [formUrl, setFormUrl] = useState("");

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(WS_LIST_KEY) || "[]");
      setItems(Array.isArray(raw) ? raw : []);
    } catch {
      setItems([]);
    }
    setFormUrl(localStorage.getItem(WS_FORM_KEY) || "");
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-10 md:px-6 md:pt-14">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-orange-600/20 text-orange-300">Workshops</Badge>
          <Badge className="bg-slate-800/60 text-slate-200">Live Workshops</Badge>
        </div>
        <h1 className="mt-3 text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
          Course Live Workshops
        </h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Instructor-led sessions with hands-on work. One simple registration form for all
          workshops.
        </p>
      </section>

      {/* List */}
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <SectionTitle eyebrow="Live">Open for registration</SectionTitle>

        {!items.length ? (
          <Card className="mt-6 border-slate-800/60 bg-slate-900/40">
            <CardContent className="p-6 text-sm text-slate-300">
              No live workshops published yet. Please check back later.
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 grid gap-4">
            {items.map((w) => {
              const duration =
                w.duration_weeks ? `${w.duration_weeks} weeks` : "4–6 weeks";
              const schedule =
                w.schedule || "Live on Zoom · schedule shared after registration";
              const features =
                Array.isArray(w.features) && w.features.length
                  ? w.features
                  : ["Hands-on labs", "Mock exam"];

              return (
                <Card
                  key={w.id}
                  className="border-slate-800/70 bg-slate-900/40 hover:border-orange-600/50 transition-colors"
                >
                  <CardContent className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      {/* left content */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-orange-300" />
                          <h3 className="truncate text-lg font-semibold">{w.title}</h3>
                          <Badge className="ml-1 bg-rose-600/20 text-rose-300">Live</Badge>
                        </div>

                        {/* compact info row */}
                        <div className="mt-2 grid gap-2 text-sm text-slate-300/90 sm:grid-cols-3">
                          <Info
                            icon={<CalendarDays className="h-4 w-4" />}
                            label={startsLabel(w.starts)}
                          />
                          <Info icon={<Clock className="h-4 w-4" />} label={duration} />
                          <Info icon={<Video className="h-4 w-4" />} label={schedule} />
                          {w.seats ? (
                            <Info icon={<Users className="h-4 w-4" />} label={`${w.seats} seats`} />
                          ) : null}
                        </div>

                        {/* features chips */}
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {features.map((f) => (
                            <li
                              key={f}
                              className="flex items-center gap-1 rounded-md border border-slate-800/60 bg-slate-900/40 px-2 py-1 text-xs text-slate-300"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-orange-300" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* right CTA */}
                      <div className="shrink-0 self-center">
                        <Button
                          asChild
                          className="bg-orange-500 text-slate-900 hover:bg-orange-400"
                          disabled={!formUrl}
                          title={formUrl ? "Open registration form" : "No form configured"}
                        >
                          {formUrl ? (
                            <a href={formUrl} target="_blank" rel="noreferrer">
                              <LinkIcon className="mr-2 h-4 w-4" />
                              Register
                            </a>
                          ) : (
                            // graceful fallback keeps layout stable
                            <span className="inline-flex items-center">
                              <LinkIcon className="mr-2 h-4 w-4" />
                              Register
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        
      </section>
    </main>
  );
}

/* small info atom, same style as LiveCohorts */
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
