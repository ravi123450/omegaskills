// src/pages/About.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  GraduationCap,
  Users,
  FileText,
  Cloud,
  Trophy,
  ShieldCheck,
   Quote,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LockedPremium from "../pages/LockedPremium";


/* ----- local atoms (kept simple & consistent with your system) ----- */
function SectionTitle({ children, eyebrow }) {
  return (
    <div>
      {eyebrow && (
        <div className="mb-2">
          <Badge className="bg-orange-600/20 text-orange-300">
            {eyebrow}
          </Badge>
        </div>
      )}
      <h2 className="relative text-2xl md:text-3xl font-bold">
        {children}
        <span className="absolute -bottom-2 left-0 h-[2px] w-24 rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />
      </h2>
    </div>
  );
}


function Point({ icon: Icon, children }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-md bg-orange-500/15 text-orange-300">
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-sm text-slate-300/90">{children}</span>
    </li>
  );
}


function Pill({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-xl border border-slate-800/60 bg-slate-900/40 px-3 py-1.5 text-sm text-slate-200">
      <Icon className="h-4 w-4 text-orange-300" />
      {children}
    </span>
  );
}


/* ----- page ----- */
export default function About() {
  return (
    <div className="scroll-smooth bg-slate-950 text-white dark:bg-slate-950 dark:text-slate-100 selection:bg-orange-300 selection:text-slate-900">
      {/* soft background accents */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-[90px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-[110px]" />
      </div>


      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 md:px-6 md:pt-14">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-orange-600/20 text-orange-300 !text-base">
            About Us — 'Ω' Omega Skills Academy
          </Badge>
        </div>
    

        <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
          Built on{" "}
          <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
            Honesty
          </span>
          , driven by{" "}
          <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
            Outcomes
          </span>
          .
        </h1>


        <p className="mt-4 max-w-2xl text-base md:text-lg text-slate-300">
          We bridge the gap between classroom theory and real-world employability by delivering
          live learning, career tools, and opportunities. No false promises — only real skills you
          can learn, practice, build, and showcase.
        </p>


        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black">
            <Link to="/programs" className="flex items-center gap-2">
              Explore Programs <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-10 px-3 border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-900/60"
          >
            <Link to="/contact">Partner with Us</Link>
          </Button>
        </div>
      </section>

   <LockedPremium/>
      {/* Who We Are */}
      <section className="mx-auto max-w-7xl px-4 py-9 md:px-6" id="who-we-are">
        <SectionTitle eyebrow="Who We Are">An Outcome-Driven EdTech</SectionTitle>
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-[1.2fr,1fr]">
              <div>
                <p className="text-base text-slate-300/90">
                  Ω Omega Skills Academy is built on honesty, innovation, and student success.
                  We exist to turn knowledge into employability through mentor-led learning and
                  real-world practice.
                </p>
                <p className="mt-3 text-sm text-slate-300/90">
                  Our approach is simple: no false promises, only real skills. Every program
                  helps you <span className="text-white font-semibold">learn, practice, build, and showcase</span>.
                </p>


                <div className="mt-4 flex flex-wrap gap-2">
                  <Pill icon={GraduationCap}>Live Cohorts</Pill>
                  <Pill icon={Users}>On-Campus Bootcamps</Pill>
                  <Pill icon={FileText}>Resume & ATS Tools</Pill>
                  <Pill icon={Cloud}>Cloud Cert Concierge</Pill>
                  <Pill icon={Trophy}>Projects & Hackathons</Pill>
                </div>
              </div>


              {/* Quick principles card */}
              <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5">
                <ul className="space-y-3">
                  <Point icon={ShieldCheck}>Transparent: no fake placement guarantees.</Point>
                  <Point icon={Sparkles}>Live, not recorded: interactive, mentor-led sessions.</Point>
                  <Point icon={Trophy}>Hands-on: projects, feedback, and honest growth.</Point>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>


      {/* Mission */}
      <section className="mx-auto max-w-7xl px-4 py-9 md:px-6" id="mission">
        <SectionTitle eyebrow="Our Mission">Empower Career-Ready Learners</SectionTitle>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-6 text-base text-slate-300/90">
              At Omega Skills Academy, we believe skills are the true currency of the future.
              We empower students to become career-ready through live learning, hands-on practice,
              and guided mentorship — always rooted in transparency and outcomes.
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <ul className="list-none space-y-2">
                <Point icon={GraduationCap}>
                  Mentor-led, interactive cohorts focused on learning by doing.
                </Point>
                <Point icon={Users}>
                  College partnerships for bootcamps, resume clinics, and hackathons.
                </Point>
                <Point icon={FileText}>
                  Resume & ATS tools, certification guidance, and project experience.
                </Point>
                <Point icon={ShieldCheck}>
                  Supportive community with honesty at the core — no fake guarantees.
                </Point>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>


      {/* Why We Exist */}
      <section className="mx-auto max-w-7xl px-4 py-9 md:px-6" id="why">
        <SectionTitle eyebrow="Why We Exist">We Chose a Different Path</SectionTitle>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: ShieldCheck, text: "No false placement guarantees — just real skill-building." },
            { icon: Sparkles, text: "No passive lectures — every session is interactive and practical." },
            { icon: Trophy, text: "No shortcuts — we focus on projects, feedback, and honest growth." },
          ].map((item, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5 backdrop-blur transition hover:-translate-y-0.5 hover:border-orange-600/50 hover:bg-slate-900/60"
            >
              <div className="flex items-center gap-2 text-orange-300">
                <item.icon className="h-5 w-5" />
                <span className="text-sm font-semibold">Principle {i + 1}</span>
              </div>
              <p className="mt-2 text-sm text-slate-300/90">{item.text}</p>
            </div>
          ))}
        </div>
      </section>


      {/* What We Do */}
      <section className="mx-auto max-w-7xl px-4 py-9 md:px-6" id="what-we-do">
        <SectionTitle eyebrow="What We Do">Programs & Services</SectionTitle>


        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Live Cohorts",
              desc: "Mentor-led classes to learn, practice, and get real-time feedback.",
              icon: GraduationCap,
              to: "/courses/cohorts",
              tag: "Live",
            },
            {
              title: "On-Campus Bootcamps",
              desc: "Intensive skill workshops with resume clinics & mini-hackathons.",
              icon: Users,
              to: "/courses/campus",
              tag: "On-campus",
            },
            {
              title: "Resume & ATS Tools",
              desc: "Instant ATS score, clean templates, and expert CV support.",
              icon: FileText,
              to: "/resume",
              tag: "Tools",
            },
            {
              title: "Cloud Cert Concierge",
              desc: "End-to-end support for AWS, GCP, and Azure certifications.",
              icon: Cloud,
              to: "/courses/cloud",
              tag: "Concierge",
            },
            {
              title: "Projects & Hackathons",
              desc: "Real-world challenges to build portfolio-ready work.",
              icon: Trophy,
              to: "/community/projects",
              tag: "Challenge",
            },
          ].map((o, i) => (
            <Card key={i} className="group">
              <CardContent className="p-5">
                <div className="mb-2 flex items-center gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/15 text-orange-300">
                    <o.icon className="h-5 w-5" />
                  </span>
                  <Badge className="bg-slate-800 text-slate-300">{o.tag}</Badge>
                </div>
                <h3 className="text-base font-semibold text-white">{o.title}</h3>
                <p className="mt-1 text-sm text-slate-300/90">{o.desc}</p>
                <div className="mt-4 inline-flex items-center text-sm text-orange-300">
                  <Link to={o.to} className="inline-flex items-center gap-1">
                    Learn More <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>


      {/* Vision & Values */}
      <section className="mx-auto max-w-7xl px-4 py-9 md:px-6" id="vision-values">
        <div className="grid gap-6 md:grid-cols-[1.05fr,1fr]">
          <Card>
            <CardContent className="p-6">
              <SectionTitle eyebrow="Our Vision">Outcomes, Not Hype</SectionTitle>
              <p className="mt-4 text-base text-slate-300/90">
                To create a generation of students who are career-ready, adaptable, and empowered
                through skill-based education that focuses on outcomes — not hype.
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-800/40 px-3 py-1.5 text-white">
                “Empowering Skills. Building Futures.”
              </div>
            </CardContent>
          </Card>


          <Card>
            <CardContent className="p-6">
              <SectionTitle eyebrow="Our Values">How We Operate</SectionTitle>
              <ul className="mt-6 space-y-2 text-sm text-slate-300/90">
                <Point icon={ShieldCheck}><strong>Transparency</strong> — We never promise what we can’t deliver.</Point>
                <Point icon={ShieldCheck}><strong>Integrity</strong> — Every student matters; every skill is earned.</Point>
                <Point icon={Sparkles}><strong>Innovation</strong> — We adapt to industry needs with cutting-edge learning.</Point>
                <Point icon={Users}><strong>Support</strong> — From resume reviews to exam-day checklists, we walk with you.</Point>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>


      {/* Team */}
      <section className="mx-auto max-w-7xl px-4 py-9 md:px-6" id="team">
        <SectionTitle eyebrow="Our Team">Educators, Mentors, Practitioners</SectionTitle>
        <Card className="mt-6">
          <CardContent className="p-6 text-base text-slate-300/90">
            We’re educators, industry professionals, and student mentors who believe in teaching by doing.
            From guiding first projects to preparing for global certifications, we walk every step with our learners —
            young, adaptive, and deeply connected to the student experience.
          </CardContent>
        </Card>
      </section>
     


      {/* Partners */}
      <section className="mx-auto max-w-7xl px-4 py-9 md:px-6" id="partners">
        <SectionTitle eyebrow="Our Partners">Collaboration Network</SectionTitle>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-orange-300">
                <Users className="h-5 w-5" />
                <span className="text-base font-semibold">Colleges & Universities</span>
              </div>
              <p className="mt-2 text-base text-slate-300/90">
                Campus bootcamps, hackathons, and skill-building workshops.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-orange-300">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-base font-semibold">Industry Experts</span>
              </div>
              <p className="mt-2 text-base text-slate-300/90">
                Mentorship for projects, certifications, and career readiness.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-orange-300">
                <Sparkles className="h-5 w-5" />
                <span className="text-base font-semibold">Communities & Startups</span>
              </div>
              <p className="mt-2 text-base text-slate-300/90">
                Spaces where innovation, networking, and opportunities thrive.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>


      {/* What Change We Make */}
      <section className="mx-auto max-w-7xl px-4 py-9 md:px-6" id="impact">
        <SectionTitle eyebrow="What Change We Make">Education → Outcomes</SectionTitle>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            "Preparing students to face interviews with confidence.",
            "Helping colleges boost employability through bootcamps & hackathons.",
            "Supporting learners beyond courses — with resume tools, certifications, and mentoring.",
          ].map((text, i) => (
            <div key={i} className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5">
              <p className="text-base text-slate-300/90">{text}</p>
            </div>
          ))}
        </div>
      </section>


      {/* Punchlines / Quotations */}
      <section className="mx-auto max-w-7xl px-4 py-9 md:px-6" id="quotes">
        <SectionTitle>What We Believe</SectionTitle>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            "Skills are the currency of the future.",
            "We don’t just teach. We transform.",
            "Education should not stop at classrooms — it should open doors.",
            "Where Catalysts Build Careers.",
          ].map((q, i) => (
            <blockquote
              key={i}
              className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5 text-slate-200"
            >
              <div className="mb-2 inline-flex items-center gap-2">
              <Quote className="mb-2 h-4 w-4 text-orange-300" />
              <span className="text-base">{q}</span>
              </div>
            </blockquote>
          ))}
        </div>
      </section>


      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-2 md:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black">
            <Link to="/programs" className="flex items-center gap-2">
              Explore Programs <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-10 px-3 border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-900/60 hover:text-orange-500 cursor-pointer"
          >
            <Link to="/contact">Talk to an Advisor</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}





