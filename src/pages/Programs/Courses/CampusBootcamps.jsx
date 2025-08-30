// src/pages/courses/CampusBootcamps.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  MapPin,
  Users,
  CalendarRange,
  Wrench,
  BadgeCheck,
  ArrowRight,
  CheckCircle2,
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

const BOOTCAMPS = [
  {
    id: "ds-bengaluru",
    title: "Data Science Bootcamp",
    campus: "Bengaluru",
    weeks: "4 weeks",
    seats: 60,
    when: "Oct 7 – Nov 1",
    days: "Mon–Fri, 9:30 AM–1:30 PM",
    lab: "Hands-on Python, ML, projects",
  },
  {
    id: "cloud-hyd",
    title: "Cloud & DevOps Bootcamp",
    campus: "Hyderabad",
    weeks: "3 weeks",
    seats: 50,
    when: "Nov 11 – Nov 29",
    days: "Mon–Fri, 10:00 AM–2:00 PM",
    lab: "AWS labs, CI/CD, IaC",
  },
  {
    id: "iot-pune",
    title: "IoT & Embedded Bootcamp",
    campus: "Pune",
    weeks: "2 weeks",
    seats: 40,
    when: "Dec 9 – Dec 20",
    days: "Mon–Fri, 9:30 AM–1:00 PM",
    lab: "Sensors, edge devices, integrations",
  },
];

export default function CampusBootcamps() {
  const isAuthed = useAuthFlag();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <section className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 md:px-6 md:pt-14">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-orange-600/20 text-orange-300 !text-base">
            Courses
          </Badge>
          <Badge className="bg-slate-800/60 text-slate-200 !text-base">
            On-Campus Bootcamps
          </Badge>
        </div>

        <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
          Learn by{" "}
          <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
            building together
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-base md:text-lg text-slate-300">
          Intensive, mentor-led bootcamps hosted on partner campuses. Daily labs,
          peer learning, and capstone reviews designed to make you job-ready.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            asChild
            className="h-11 px-4 bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black"
          >
            <Link to={isAuthed ? "/dashboard" : "/login"}>
              {isAuthed ? "Apply for a seat" : "Log in to Apply"}
            </Link>
          </Button>
          <Link
            to="/courses/cohorts"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-orange-300"
          >
            Prefer live online? See cohorts <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-2 md:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Left: bootcamps */}
          <div className="md:col-span-2 space-y-6">
            <SectionTitle eyebrow="Upcoming batches">
              Seats are limited
            </SectionTitle>

            <div className="mt-6 grid gap-4">
              {BOOTCAMPS.map((b) => (
                <Card
                  key={b.id}
                  className="border-slate-800/70 bg-slate-900/40 hover:border-orange-600/50 transition-colors"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-orange-300" />
                          <h3 className="text-lg font-semibold">{b.title}</h3>
                        </div>

                        <div className="mt-2 grid gap-2 text-sm text-slate-300/90 sm:grid-cols-2">
                          <Info icon={<MapPin className="h-4 w-4" />} label={b.campus} />
                          <Info icon={<CalendarRange className="h-4 w-4" />} label={`${b.when} · ${b.days}`} />
                          <Info icon={<Users className="h-4 w-4" />} label={`${b.seats} seats`} />
                          <Info icon={<Wrench className="h-4 w-4" />} label={`${b.weeks} · ${b.lab}`} />
                        </div>
                      </div>

                      <div className="shrink-0">
                        <Button
                          asChild
                          className="bg-orange-500 text-slate-900 hover:bg-orange-400"
                        >
                          <Link to={isAuthed ? "/dashboard" : "/login"}>
                            {isAuthed ? "Apply" : "Log in"}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right: why on-campus */}
          <aside className="md:col-span-1">
            <div className="md:sticky md:top-24 space-y-4">
              <Card className="border-slate-800/70 bg-slate-900/50">
                <CardContent className="p-6">
                  <div className="mb-2">
                    <Badge className="bg-orange-600/20 text-orange-300">
                      Why on-campus?
                    </Badge>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300/90">
                    {[
                      "Daily hands-on lab time",
                      "High-touch mentor feedback",
                      "Peer learning & accountability",
                      "Capstone + showcase day",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-orange-300 mt-0.5" />
                        {t}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex items-center gap-2 text-sm text-slate-300">
                    <BadgeCheck className="h-4 w-4 text-orange-300" />
                    Certificates issued to eligible participants
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

function Info({ icon, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-6 w-6 place-items-center rounded-md bg-orange-600/15 text-orange-300">
        {icon}
      </span>
      <span>{label}</span>
    </div>
  );
}
