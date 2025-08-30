// src/pages/workshops/OnCampusWorkshops.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Building2, CalendarDays, Users, Clock, MapPin, ArrowRight, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useAuthFlag from "@/lib/useAuthFlag";

/* atom */
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

export default function OnCampusWorkshops() {
  const isAuthed = useAuthFlag();

  const upcoming = [
    {
      id: "c1",
      title: "IoT Bootcamp at Vardhaman College",
      date: "Oct 12–13, 2025",
      venue: "Hyderabad, INDIA",
      seats: "80",
    },
    {
      id: "c2",
      title: "AI & ML for Beginners",
      date: "Nov 1–2, 2025",
      venue: "Bangalore, INDIA",
      seats: "100",
    },
    {
      id: "c3",
      title: "Cybersecurity Crash Camp",
      date: "Nov 15–16, 2025",
      venue: "Chennai, INDIA",
      seats: "120",
    },
  ];

  const perks = [
    "Hands-on labs with mentors",
    "Peer collaboration",
    "Campus certificate",
    "Networking opportunities",
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <section className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 md:px-6 md:pt-14">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-orange-600/20 text-orange-300 !text-base">Workshops</Badge>
          <Badge className="bg-slate-800/60 text-slate-200 !text-base">On-Campus</Badge>
        </div>

        <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
          Transformative{" "}
          <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
            on-campus workshops
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-base md:text-lg text-slate-300">
          Mentor-led bootcamps hosted at colleges. Practical, collaborative, and designed for career outcomes.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            asChild
            className="h-11 px-4 bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black"
          >
            <Link to={isAuthed ? "/dashboard" : "/login"}>
              {isAuthed ? "Book a Seat" : "Log in to Book"}
            </Link>
          </Button>
          <Link
            to="/workshops"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-orange-300"
          >
            Explore all workshops <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-2 md:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Left */}
          <div className="md:col-span-2 space-y-10">
            <div>
              <SectionTitle eyebrow="Upcoming">Campus bootcamps</SectionTitle>
              <div className="mt-8 grid gap-4">
                {upcoming.map((w) => (
                  <Card
                    key={w.id}
                    className="border-slate-800/70 bg-slate-900/40 hover:border-orange-600/50 transition-colors"
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-lg font-semibold text-slate-100">{w.title}</div>
                          <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-slate-300/90">
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays className="h-4 w-4 text-orange-300" /> {w.date}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-orange-300" /> {w.venue}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-4 w-4 text-orange-300" /> {w.seats} seats
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            asChild
                            variant="secondary"
                            className="bg-slate-800 text-slate-100 hover:bg-slate-700"
                          >
                            <Link to="/workshops">Details</Link>
                          </Button>
                          <Button
                            asChild
                            className="bg-orange-500 text-slate-900 hover:bg-orange-400"
                          >
                            <Link to={isAuthed ? "/dashboard" : "/login"}>
                              {isAuthed ? "Register" : "Log in"}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Format */}
            <div>
              <SectionTitle eyebrow="Format">What to expect</SectionTitle>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  { icon: <Clock className="h-5 w-5 text-orange-300" />, t: "2-day", d: "Intensive, hands-on learning" },
                  { icon: <Users className="h-5 w-5 text-orange-300" />, t: "Team projects", d: "Peer collaboration & mentor support" },
                  { icon: <Building2 className="h-5 w-5 text-orange-300" />, t: "On campus", d: "Networking & certificates provided" },
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
            </div>
          </div>

          {/* Right */}
          <aside className="md:col-span-1">
            <div className="md:sticky md:top-24 space-y-4">
              <Card className="border-slate-800/70 bg-slate-900/50">
                <CardContent className="p-6">
                  <div className="mb-2">
                    <Badge className="bg-orange-600/20 text-orange-300">Perks</Badge>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300/90">
                    {perks.map((p) => (
                      <li key={p} className="flex items-start gap-2">
                        <BadgeCheck className="h-4 w-4 text-orange-300 mt-0.5" /> {p}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 grid gap-2">
                    <Button
                      asChild
                      className="w-full text-base bg-orange-500 text-slate-900 hover:bg-orange-400"
                    >
                      <Link to={isAuthed ? "/dashboard" : "/login"}>
                        {isAuthed ? "Book Now" : "Log in to Book"}
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="secondary"
                      className="w-full text-sm bg-slate-800 text-slate-100 hover:bg-slate-700"
                    >
                      <Link to="/workshops">All Workshops</Link>
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
