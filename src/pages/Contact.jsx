// src/pages/Contact.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  PhoneCall,
  Mail,
  MessageCircleMore,
  Users,
  GraduationCap,
  Building2,
  LifeBuoy,
  ArrowRight,
  Quote,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/* ----- local atoms (kept simple & consistent with your system) ----- */
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

export default function Contact() {
  const quotes = [
    "Omega Skills Academy helped me build confidence and land my first internship.",
    "The resume builder is so simple yet powerful — it got me noticed by top recruiters.",
    "Workshops here are not just lectures; they’re career accelerators.",
    "Hackathons gave me the chance to solve real industry problems and showcase my skills.",
    "The cloud certification concierge made AWS prep simple and stress-free. I cleared my exam on the first attempt.",
  ];

  const stats = [
    { label: "learners supported", value: "2400+" },
    { label: "workshops delivered", value: "85+" },
    { label: "partner colleges", value: "32+" },
  ];

  const chips = [
    {
      to: "/admissions",
      icon: <GraduationCap className="h-5 w-5 text-orange-300" />,
      title: "Admissions",
      desc: "Questions about joining a cohort or workshop.",
    },
    {
      to: "/partnerships",
      icon: <Building2 className="h-5 w-5 text-orange-300" />,
      title: "Partnerships",
      desc: "Colleges & companies looking to collaborate.",
    },
    {
      to: "/support",
      icon: <LifeBuoy className="h-5 w-5 text-orange-300" />,
      title: "Support",
      desc: "Resume tools, login help, cert concierge, registrations.",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top header / breadcrumb */}
      <section className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 md:px-6 md:pt-14">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-orange-600/20 text-orange-300 !text-base">
            Contact Us — Omega Skills Academy
          </Badge>
        </div>

        <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
          Real Voices,{" "}
          <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
            Real Growth
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-base md:text-lg text-slate-300">
          Our students and partners share their journeys with Omega Skills
          Academy.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            asChild
            variant="outline"
            className="h-10 px-3 border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-900/60"
          >
            <Link to="/contact">Get in Touch</Link>
          </Button>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-8 md:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Left column: testimonials + quick links + success */}
          <div className="md:col-span-2 space-y-10">
            {/* Testimonials */}
            <div>
              <SectionTitle eyebrow="Testimonials">
                Student Stories
              </SectionTitle>

              <div className="mt-9 grid gap-4 sm:grid-cols-2">
                {quotes.map((q, i) => (
                  <Card
                    key={i}
                    className="border-slate-800/70 bg-slate-900/40 hover:border-orange-600/50 transition-colors"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-orange-600/15 p-2">
                          <Quote className="h-4 w-4 text-orange-300" />
                        </div>
                        <p className="text-sm leading-relaxed text-slate-200">
                          “{q}”
                        </p>
                      </div>
                      <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
                        <Star className="h-3 w-3" />
                        <span>Verified story</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 mb-15">
                <Link
                  to="/testimonials"
                  className="inline-flex items-center gap-2 text-sm font-medium text-orange-300 hover:text-orange-200"
                >
                  Read More Stories
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Get in touch chips */}
            <div>
              <SectionTitle eyebrow="Get in Touch">
                We’re here to help
              </SectionTitle>
              <p className="mt-9 text-base text-slate-300/90">
                We’re here to support students, colleges, and partners.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {chips.map((c) => (
                  <Link
                    key={c.title}
                    to={c.to}
                    className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4 hover:border-orange-600/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 text-slate-200">
                      {c.icon}
                      <span className="font-semibold">{c.title}</span>
                    </div>
                    <p className="mt-1 text-base text-slate-300/90">{c.desc}</p>
                  </Link>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  className="text-base bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black"
                >
                  <Link to="/support">Contact Support</Link>
                </Button>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-orange-300"
                >
                  Contact us today
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Quick contact lines */}
              <div className="mt-6 grid gap-3 sm:grid-cols-3 mb-15">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Mail className="h-4 w-4 text-orange-300" />
                  <span>support@omegaskills.com</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <PhoneCall className="h-4 w-4 text-orange-300" />
                  <span>+91-XXXXXXXXXX</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <MessageCircleMore className="h-4 w-4 text-orange-300" />
                  <span>Chat with us on the site</span>
                </div>
              </div>
            </div>

            {/* Dedicated Support */}
            <div>
              <SectionTitle eyebrow="Dedicated Support">
                Quick, clear, honest
              </SectionTitle>
              <p className="mt-6 max-w-3xl text-base text-slate-300/90">
                Our team typically responds within 24 hours. Whether you are a
                student looking to upskill, a college planning a bootcamp, or a
                company interested in partnerships, Omega Skills Academy ensures
                quick, clear, and honest communication.
              </p>
            </div>

            {/* Stay Connected */}
            <div>
              <SectionTitle eyebrow="Stay Connected">
                Follow & join
              </SectionTitle>
              <p className="mt-6 text-base text-slate-300/90">
                Follow us on LinkedIn, YouTube, Instagram for updates on
                workshops and success stories. Join our student community for
                peer-to-peer discussions, Q&A sessions, and networking
                opportunities.
              </p>
              <div className="mt-4 flex flex-wrap gap-3 mb-15">
                <Button
                  variant="secondary"
                  className="text-sm bg-slate-800 text-slate-100 hover:bg-orange-500 hover:text-black cursor-pointer"
                >
                  LinkedIn
                </Button>
                <Button
                  variant="secondary"
                  className="text-sm bg-orange-500 text-slate-100 hover:bg-orange-400 hover:text-black cursor-pointer"
                >
                  YouTube
                </Button>
                <Button
                  variant="secondary"
                  className="text-sm bg-slate-800 text-slate-100 hover:bg-orange-500 hover:text-black cursor-pointer"
                >
                  Instagram
                </Button>
                <Button
                  asChild
                  className="text-sm bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black cursor-pointer"
                >
                  <Link to="/community">Join Community</Link>
                </Button>
              </div>
            </div>

            {/* Success Stories at a Glance */}
            <div>
              <SectionTitle eyebrow="Success Stories at a Glance">
                Outcomes that matter
              </SectionTitle>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {stats.map((s) => (
                  <Card
                    key={s.label}
                    className="border-slate-800/70 bg-slate-900/40 text-center"
                  >
                    <CardContent className="p-6">
                      <div className="text-3xl font-extrabold tracking-tight text-orange-300">
                        {s.value}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                        {s.label}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-3">
                <Button
                  asChild
                  className="text-base bg-orange-500 text-slate-900 hover:bg-orange-400 "
                >
                  <Link to="/testimonials">Explore More Success Stories</Link>
                </Button>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white"
                >
                  Connect with us
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right column: sticky contact card */}
          <aside className="md:col-span-1">
            <div className="md:sticky md:top-24">
              <Card className="border-slate-800/70 bg-slate-900/50">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <Badge className="bg-orange-600/20 text-orange-300">
                      Contact Details
                    </Badge>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-orange-300" />
                      <span className="text-slate-200">
                        support@omegaskills.com
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <PhoneCall className="h-4 w-4 text-orange-300" />
                      <span className="text-slate-200">+91-XXXXXXXXXX</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MessageCircleMore className="h-4 w-4 text-orange-300" />
                      <span className="text-slate-200">
                        Live chat available
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2">
                    <Button
                      asChild
                      className="w-full text-base  bg-slate-800 text-slate-100 hover:bg-slate-700"
                    >
                      <Link to="/support">Contact Support</Link>
                    </Button>
                    <Button
                      asChild
                      variant="secondary"
                      className="w-full text-sm  bg-orange-500 text-slate-900 hover:bg-orange-400"
                    >
                      <Link to="/admissions">Talk to Admissions</Link>
                    </Button>
                    <Button
                      asChild
                      variant="secondary"
                      className="w-full text-sm bg-slate-800 text-slate-100 hover:bg-slate-700"
                    >
                      <Link to="/partnerships">Partner with Us</Link>
                    </Button>
                  </div>

                  <div className="mt-6 rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
                    <p className="text-xs text-slate-300/90">
                      Prefer email? We typically respond within{" "}
                      <span className="font-semibold text-slate-200">
                        24 hours
                      </span>
                      .
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
                <div className="flex items-center gap-2 text-slate-200">
                  <Users className="h-4 w-4 text-orange-300" />
                  <span className="text-sm font-semibold">
                    Student Community
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-300/90">
                  Join peer discussions, Q&A, and networking.
                </p>
                <div className="mt-3">
                  <Button
                    asChild
                    className="w-full text-sm bg-orange-500 text-slate-900 hover:bg-orange-400"
                  >
                    <Link to="/community">Join Community</Link>
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
