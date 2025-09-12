// src/pages/Workshops/LiveWorkshops.jsx
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, CalendarDays, Clock, Video, Link as LinkIcon } from "lucide-react";

// Access environment variables from Vite
const FORM_URL = import.meta.env.VITE_REGISTRATION_FORM_URL;

function SectionTitle({ children, eyebrow }) {
  return (
    <div>
      {eyebrow && (
        <div className="mb-2">
          <Badge className="bg-orange-600/20 text-orange-300">{eyebrow}</Badge>
        </div>
      )}
      <h2 className="relative text-2xl md:text-3xl font-extrabold">
        {children}
        <span className="absolute -bottom-2 left-0 h-[2px] w-24 rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />
      </h2>
    </div>
  );
}

export default function LiveWorkshops() {
  const [formUrl, setFormUrl] = useState("");

  useEffect(() => {
    if (FORM_URL) {
      setFormUrl(FORM_URL);
    } else {
      console.error("FORM_URL is not set in the environment variables");
    }
  }, []);

  const workshops = [
    {
      title: "Python Django & Flask Framework",
      duration: "4-6 weeks",
      tag: "Exclusive",
      caption: "Web development with Python and Flask",
      price: "₹1,499",
      link: formUrl,
      isExclusive: true,
      startDate: "October 1st",
    },
    {
      title: "Full Stack Web Development",
      duration: "4-6 weeks",
      tag: "Trending",
      caption: "Learn front-end and back-end technologies",
      price: "₹1,799",
      link: formUrl,
      isExclusive: false,
      startDate: "October 1st",
    },
    {
      title: "Cloud Computing",
      duration: "4-6 weeks",
      tag: "Exclusive",
      caption: "Master the cloud with hands-on labs",
      price: "₹1,799",
      link: formUrl,
      isExclusive: true,
      startDate: "October 1st",
    },
    {
      title: "DevOps",
      duration: "4-6 weeks",
      tag: "Trending",
      caption: "Automate and manage infrastructure",
      price: "₹1,499",
      link: formUrl,
      isExclusive: false,
      startDate: "October 1st",
    },
    {
      title: "Blockchain Technology",
      duration: "4-6 weeks",
      tag: "Exclusive",
      caption: "Build decentralized applications",
      price: "₹1,999",
      link: formUrl,
      isExclusive: true,
      startDate: "October 1st",
    },
    {
      title: "Quantum Computing",
      duration: "4-6 weeks",
      tag: "Exclusive",
      caption: "Unlock the potential of quantum computing",
      price: "₹1,999",  // Fixed price for Quantum Computing
      link: formUrl,
      isExclusive: true,
      startDate: "October 1st",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-10 md:px-6 md:pt-14">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-orange-600/20 text-orange-300">Workshops</Badge>
          <Badge className="bg-slate-800/60 text-slate-200">Exclusive Workshops</Badge>
        </div>
        <h1 className="mt-3 text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
          Exclusive Workshops for October Batch
        </h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Enroll in limited-seats workshops for Quantum Computing, Python Django, and more.
        </p>
      </section>

      {/* List of Workshops */}
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <SectionTitle eyebrow="Limited Seats">Register Now for October 1st Batch</SectionTitle>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workshops.map((workshop, index) => (
            <Card
              key={index}
              className={`relative ${
                workshop.isExclusive ? "border-amber-500/30 shadow-xl glow-effect" : "border-slate-800/60"
              } bg-slate-900/40 hover:border-orange-600/50 transition-all duration-300 ease-in-out rounded-xl overflow-hidden group`}
            >
              {/* Exclusive Tag */}
              {workshop.isExclusive && (
                <div className="absolute top-0 left-0 w-full py-1 text-center bg-gradient-to-r from-pink-500 to-amber-300 text-white font-semibold">
                  ---Exclusive---
                </div>
              )}

              {/* Price Tag at Top Right */}
              <div className="absolute top-3 right-3 bg-orange-500 text-slate-900 font-semibold rounded-full px-3 py-1 text-sm">
                {workshop.price}
              </div>

              <div
                className={`absolute inset-0 bg-gradient-to-b from-transparent to-black/40 group-hover:to-black/60 transition-all duration-300 ease-in-out`}
              />
              <CardContent className="relative p-5 z-10">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  {/* Left Content */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-orange-300" />
                      <h3 className="truncate text-lg font-semibold text-white">{workshop.title}</h3>
                    </div>
                    <div className="mt-2 grid gap-2 text-sm text-slate-300/90 sm:grid-cols-3">
                      <Info icon={<CalendarDays className="h-4 w-4" />} label={workshop.startDate} />
                      <Info icon={<Clock className="h-4 w-4" />} label={workshop.duration} />
                      <Info icon={<Video className="h-4 w-4" />} label={workshop.caption} />
                    </div>
                  </div>

                  {/* Right CTA */}
                  <div className="shrink-0 self-center">
                    <Button
                      asChild
                      className="bg-orange-500 text-slate-900 hover:bg-orange-400"
                      disabled={!formUrl}
                      title={formUrl ? "Open registration form" : "No form configured"}
                    >
                      {formUrl ? (
                        <a href={workshop.link} target="_blank" rel="noreferrer">
                          <LinkIcon className="mr-2 h-4 w-4" />
                          Register
                        </a>
                      ) : (
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
          ))}
        </div>
      </section>

      {/* Process Steps Section */}
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-amber-300">Registration Steps</h3>
          <div className="mt-3 text-lg text-slate-300">
            <span className="block">Registration → Onboarding Form → Payment → Welcome Message</span>
          </div>
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
      <span className="truncate">{label}</span>
    </div>
  );
}
