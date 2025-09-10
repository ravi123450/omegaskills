// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Rocket,
  GraduationCap,
  Users,
  Briefcase,
  ShieldCheck,
  BookOpen,
  Trophy,
  Cloud,
  FileText,
  Sparkles,
  ArrowRight,
  PhoneCall,
  CalendarDays,
  Newspaper,
  LifeBuoy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone } from "lucide-react";
import HomeCoursesScrollerAd from "@/components/HomeCoursesScrollerAd";
import TeachersDayOffer from "../components/TeachersDayOffer";
import LiveProjects from "./projects/LiveProjects";


/** ---------- helpers & data ---------- */


const usp = [
  {
    icon: <Rocket className="h-5 w-5" />,
    title: "Live, not recorded",
    desc: "Interactive, mentor-led cohorts—ask, practice, get feedback.",
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: "On-campus bootcamps",
    desc: "Hands-on college workshops + micro-hackathons with certificates.",
  },
  {
    icon: <FileText className="h-5 w-5" />,
    title: "ATS resume tools",
    desc: "Instant score + expert review + clean templates.",
  },
  {
    icon: <Cloud className="h-5 w-5" />,
    title: "Cloud cert concierge",
    desc: "Payment → slot → prep → exam day—end-to-end support.",
  },
  {
    icon: <Trophy className="h-5 w-5" />,
    title: "Projects & hackathons",
    desc: "Portfolio-ready challenges with mentor feedback.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Transparent",
    desc: "No fake placement promises.",
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "Resume & ATS tools",
    desc: "Built-in keyword parsing & templates.",
  },
];


const offerings = [
  {
    icon: <GraduationCap className="h-6 w-6" />,
    title: "Live Cohorts",
    desc: "Small-group, interactive classes led by mentors.",
    href: "/courses/cohorts",
    tag: "Live",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "On-Campus Bootcamps",
    desc: "Skill workshops, resume clinics & mini-hackathons.",
    href: "/courses/campus",
    tag: "On-campus",
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Resume & ATS Tools",
    desc: "Upload → instant ATS score → templates & review.",
    href: "/resume",
    tag: "Tools",
  },
  {
    icon: <Cloud className="h-6 w-6" />,
    title: "Cloud Certification Concierge",
    desc: "AWS/GCP/Azure logistics, prep plan & mock tests.",
    href: "/courses/cloud",
    tag: "Concierge",
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Projects Assistance",
    desc: "Minor/Major projects with code reviews & viva prep.",
    href: "/community/projects",
    tag: "Practice",
  },
  {
    icon: <Trophy className="h-6 w-6" />,
    title: "Hackathons",
    desc: "Real challenges, prizes, and recruiter-ready proof.",
    href: "/community/hackathons",
    tag: "Challenge",
  },
];


const faqs = [
  {
    q: "Do you guarantee placements?",
    a: "No. We prepare you with skills, portfolio, resume, and interview practice—no false promises.",
  },
  {
    q: "Are sessions recorded?",
    a: "We are live-first. Recordings may be provided for revision when appropriate.",
  },
  {
    q: "Can you run a workshop at our college?",
    a: "Yes. We offer on-campus bootcamps & hackathons. Contact us for dates and agenda.",
  },
  {
    q: "How does the ATS score work?",
    a: "We parse your CV like recruiters’ systems and return a score with fix-suggestions. Optional human review is available.",
  },
];


// Simple number animation hook
function useCountUp(target, duration = 1500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}


function SectionTitle({ children }) {
  return (
    <h2 className="relative text-2xl md:text-3xl font-bold">
      {children}
      <span className="absolute -bottom-2 left-0 h-[2px] w-24 rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />
    </h2>
  );
}


/** ---------- page ---------- */


export default function OmegaHomePage() {
  const [progress, setProgress] = useState(0);


  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      setProgress((h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  const statStudents = useCountUp(2400);
  const statWorkshops = useCountUp(85);
  const statColleges = useCountUp(32);


  // Quick message form state
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [sending, setSending] = useState(false);


  function handleQuickMessageSubmit(e) {
    e.preventDefault();
    if (!contactEmail || !contactMsg) {
      alert("Please enter your email and a message.");
      return;
    }
    setSending(true);


    const to = "info@omegaskillsacademy.online";
    const subject = encodeURIComponent(
      "Quick message from Omega Skills Academy site"
    );
    const body = encodeURIComponent(`From: ${contactEmail}\n\n${contactMsg}`);
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;


    setTimeout(() => setSending(false), 600);
  }


  return (
    <div className="scroll-smooth bg-slate-950 text-white dark:bg-slate-950 dark:text-slate-100 selection:bg-orange-300 selection:text-slate-900">
      {/* Scroll progress bar */}
      <div
        className="fixed left-0 top-0 z-[60] h-1 bg-orange-500 transition-[width]"
        style={{ width: `${progress}%` }}
      />
     <TeachersDayOffer />

      {/* Background blobs */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-[90px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-[110px]" />
      </div>


      {/* Hero */}
      <section
        id="home"
        className="relative mx-auto max-w-7xl px-4 pb-12 pt-10 md:px-6 md:pt-13"
      >
        <div className="grid items-center gap-10 md:grid-cols-[1.2fr,1fr]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-orange-600/20 text-orange-300 hover:bg-orange-600/20">
                Live • On-Campus • Concierge
              </Badge>
              <Badge className="bg-orange-600/20 text-orange-300 hover:bg-orange-600/20">
                Where Catalysts Build Careers
              </Badge>
            </div>


            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
              Empowering{" "}
              <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
                Skills
              </span>
              . Building{" "}
              <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
                Futures
              </span>
              .
            </h1>

          
            <p className="mt-4 max-w-2xl text-base md:text-lg text-slate-300">
              Become career-ready with our live cohorts, on-campus bootcamps,
              resume tools, hackathons, and certification guidance. We provide
              the skills, innovation, and honest opportunities to help you shape
              your future.
            </p>


            {/* CTA rows with paired buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-8">
              {/* Row A */}
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  size="lg"
                  className="bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black rounded-2xl"
                >
                  <Link to="/admissions" className="flex items-center gap-2">
                    Join Free Workshop <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-10 px-3 rounded-2xl border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-900/60"
                >
                  <Link to="/admissions" className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" /> Enroll
                  </Link>
                </Button>
              </div>


              {/* Row B */}
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  size="lg"
                  className="bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black rounded-2xl"
                >
                  <Link to="/programs">Explore Programs</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-10 px-3 rounded-2xl border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-900/60"
                >
                  <Link
                    to="/community/hackathons"
                    className="flex items-center gap-1"
                  >
                    <CalendarDays className="h-4 w-4" /> Events
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* Student-Favorite Mock Tests*/}
      <HomeCoursesScrollerAd />


      {/* What Makes Us Different */}
      <section id="why" className="mx-auto max-w-7xl pb-9 px-4 py-9 md:px-6">
        <SectionTitle>What Makes Us Different</SectionTitle>
        <div className="mt-6 grid gap-8 md:grid-cols-3">
          {usp.map((u, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="mb-3 inline-flex items-center gap-2 text-orange-300">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/15">
                      {u.icon}
                    </span>
                    <span className="text-sm font-semibold">{u.title}</span>
                  </div>
                  <p className="text-sm text-slate-300/90">{u.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
  {/* Live Projects — Interactive */}
<LiveProjects/>


      {/* Our Core Offerings */}
      <section
        id="offerings"
        className="mx-auto max-w-7xl pb-9 px-4 py-9 md:px-6"
      >
        <div className="mb-6 flex items-end justify-between">
          <SectionTitle>Our Core Offerings</SectionTitle>
          <Button
            asChild
            className="hidden sm:inline-flex bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black rounded-2xl"
          >
            <Link to="/courses/learn">Enroll Now</Link>
          </Button>
        </div>


        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offerings.map((o, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.03 }}
              className="group rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5 backdrop-blur transition hover:-translate-y-0.5 hover:border-orange-600/50 hover:bg-slate-900/60"
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/15 text-orange-300">
                  {o.icon}
                </div>
                <Badge className="bg-slate-800 text-slate-300 hover:bg-slate-800">
                  {o.tag}
                </Badge>
              </div>
              <h3 className="text-base font-semibold text-white">{o.title}</h3>
              <p className="mt-1 text-sm text-slate-300/90">{o.desc}</p>
              <div className="mt-4 inline-flex items-center text-sm text-orange-300">
                <Link to={o.href} className="inline-flex items-center">
                  Learn More <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>


      {/* Impact in Numbers */}
      <section className="border-y border-slate-800/60 bg-slate-900/30 mt-9">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
          <SectionTitle>Impact in Numbers</SectionTitle>
          <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-3">
            <Stat label="learners supported" value={statStudents} suffix="+" />
            <Stat
              label="workshops delivered"
              value={statWorkshops}
              suffix="+"
            />
            <Stat label="partner colleges" value={statColleges} suffix="+" />
          </div>
        </div>
      </section>


      {/* Upcoming Workshops */}
      <section id="workshops" className="mx-auto max-w-7xl px-4 py-19 md:px-6">
        <div className="mb-12 flex items-end justify-between">
          <SectionTitle>Upcoming Workshops</SectionTitle>
          <Button
            asChild
            variant="outline"
            className="hidden md:inline-flex rounded-2xl border-slate-700 bg-slate-900/40 hover:bg-slate-900/60 hover:text-orange-400"
          >
            <Link to="/contact">Request Full Schedule</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <WorkshopCard
            title="Full-Stack Web Bootcamp"
            date="Sep 05"
            duration="4 weeks"
            price="Free Demo"
            invert
          />
          <WorkshopCard
            title="Data Science Starter"
            date="Sep 12"
            duration="4 weeks"
            price="Free Demo"
          />
          <WorkshopCard
            title="GCP Associate Prep"
            date="Sep 19"
            duration="3 weeks"
            price="Free Demo"
            invert
          />
        </div>
      </section>


      {/* Resume & ATS Tools */}
      <section id="resume" className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <SectionTitle>Resume & ATS Tools</SectionTitle>
            <p className="mt-5 text-sm text-slate-300">
              Upload CV for instant ATS parsing & keyword score. Access
              templates optimised for screening, plus optional human review in
              48 hours.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                asChild
                className="rounded-2xl bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black"
              >
                <Link to="/ats-scanner" className="flex items-center gap-2">
                  Get ATS Score
                </Link>
              </Button>
              <Button
                variant="outline"
                className="rounded-2xl border-slate-700 hover:text-orange-400"
              >
                <Link to="/mentor" className="flex items-center gap-2">
                  Submit for Review
                </Link>
              </Button>
              <Button className="rounded-2xl bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black">
                <Link to="/resume" className="flex items-center gap-2">
                  Build Resume
                </Link>
              </Button>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <ul className="space-y-3 text-sm text-slate-300/90">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-orange-400" />{" "}
                  Instant parsing & keyword match
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-orange-400" />{" "}
                  Score with fix-suggestions
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-orange-400" />{" "}
                  Templates optimised for ATS scanners
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-orange-400" />{" "}
                  Optional expert human review in 48h
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>


      {/* Cloud Certification Concierge */}
      <section id="cert" className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <Card className="order-last md:order-first">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-orange-300">
                <Cloud className="h-5 w-5" />
                <span className="text-sm font-semibold">
                  Cloud Certification Concierge
                </span>
              </div>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-300/90">
                <li>Choose exam & date</li>
                <li>We handle payment & scheduling</li>
                <li>Personalised prep plan + mock tests</li>
                <li>Exam-day reminders & checklist</li>
                <li>Post-exam guidance</li>
              </ol>
            </CardContent>
          </Card>


          <div>
            <SectionTitle>Cloud Certs, Simplified</SectionTitle>
            <p className="mt-7 text-sm text-slate-300">
              Focus on learning—we’ll handle logistics, reminders, and readiness
              checks for GCP, AWS & Azure.
            </p>


            {/* FIX: responsive width, keep same pill styling */}
            <div className="mt-8">
              <Button className="w-full sm:w-auto !text-base font-semibold rounded-2xl bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black">
                <Link to="/courses/cloud" className="flex items-center gap-2">
                  Talk to an Advisor
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      
      {/* Projects & Hackathons */}
      <section id="projects" className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <SectionTitle>Projects & Hackathons</SectionTitle>
        <p className="mt-8 text-sm text-slate-300">
          Build portfolio-ready projects and compete in real-world challenges.
        </p>
<div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Button
            variant="outline"
            className="w-full sm:w-auto rounded-2xl border-slate-700 hover:text-orange-400"
          >
            <Link to="/community/projects" className="flex items-center gap-2">
              Start Project
            </Link>
          </Button>


          <Button className="w-full sm:w-auto rounded-2xl bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black">
            <Link
              to="/community/hackathons"
              className="flex items-center gap-2"
            >
              Join Hackathon
            </Link>
          </Button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <ProjectCard
            title="Data Science Project — Resume Screener (NLP)"
            tag="Data Science"
          />
          <ProjectCard
            title="E-commerce Analytics Project — Major Data Project"
            tag="Data"
            invert
          />
          <ProjectCard title="Hackathon — Cloud FinOps Challenge" tag="Cloud" />
        </div>


       
      </section>


      {/* FAQs */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <SectionTitle>Frequently Asked Questions</SectionTitle>
        <p className="mt-10 text-sm text-slate-300">
          Quick answers to the most common queries.
        </p>
        <div className="mt-5 grid gap-3">
          {faqs.map((f, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4 hover:border-orange-600/50"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold text-white marker:hidden">
                <span className="inline-flex items-center gap-2">{f.q}</span>
              </summary>
              <p className="mt-2 text-sm text-slate-300/90">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-4">
          <Button
            asChild
            variant="outline"
            className="rounded-2xl border-slate-700 bg-slate-900/40 hover:bg-slate-900/60 hover:text-orange-400"
          >
            <Link to="/faqs">More FAQs</Link>
          </Button>
        </div>
      </section>


      {/* Contact */}
      <section
        id="contact"
        className="mx-auto max-w-7xl px-4 pb-16 pt-6 md:px-6"
      >
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <SectionTitle>Get in touch</SectionTitle>
            <p className="mt-8 text-sm text-slate-300">
              We typically respond within 24 hours.
            </p>


            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Link
                to="/admissions"
                className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4 hover:border-orange-600/50"
              >
                <div className="flex items-center gap-3 text-slate-200">
                  <PhoneCall className="h-5 w-5 text-orange-300" /> Admissions
                </div>
                <p className="mt-1 text-sm text-slate-300/90">
                  Questions about joining a cohort or workshop.
                </p>
              </Link>


              <Link
                to="/partnerships"
                className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4 hover:border-orange-600/50"
              >
                <div className="flex items-center gap-3 text-slate-200">
                  <Newspaper className="h-5 w-5 text-orange-300" /> Partnerships
                </div>
                <p className="mt-1 text-sm text-slate-300/90">
                  Colleges & companies—let’s collaborate.
                </p>
              </Link>


              <Link
                to="/support"
                className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4 hover:border-orange-600/50"
              >
                <div className="flex items-center gap-3 text-slate-200">
                  <LifeBuoy className="h-5 w-5 text-orange-300" /> Support
                </div>
                <p className="mt-1 text-sm text-slate-300/90">
                  Resume tools, login help, certification concierge.
                </p>
              </Link>
            </div>
          </div>


          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-white">
                Quick message
              </h3>
              <form
                onSubmit={handleQuickMessageSubmit}
                className="mt-3 grid gap-3"
              >
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="rounded-2xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm outline-none focus:border-orange-600"
                  placeholder="Your email"
                />
                <textarea
                  rows={4}
                  required
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  className="rounded-2xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm outline-none focus:border-orange-600"
                  placeholder="How can we help?"
                />
                <Button
                  type="submit"
                  disabled={sending}
                  className="rounded-2xl bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {sending ? "Sending..." : "Send"}
                </Button>


                {/* Contact details below message box */}
                <ContactLine
                  icon={Mail}
                  href="mailto:info@omegaskillsacademy.online"
                >
                  info@omegaskillsacademy.online
                </ContactLine>
                


                <ContactFormCTA />
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}


/** ---------- atoms ---------- */


function Stat({ label, value, suffix = "" }) {
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5 text-center">
      <div className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
        {value}
        {suffix}
      </div>
      <div className="mt-1 text-xs text-slate-400 capitalize">{label}</div>
    </div>
  );
}


function WorkshopCard({ title, date, duration, price, invert = false }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <Badge
            className={
              invert
                ? "bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black"
                : "bg-slate-800 text-slate-300 hover:bg-slate-800 hover:text-black"
            }
          >
            {date}
          </Badge>
          <span className="text-xs text-slate-400">{duration}</span>
        </div>
        <h3 className="mt-3 text-base font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-slate-300/90">{price}</p>
        <div className="mt-4">
          <Button
            asChild
            className={
              "w-full " +
              (invert
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-black rounded-2xl"
                : "bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black rounded-2xl")
            }
          >
            <Link to="/admissions">Enroll</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


function ProjectCard({ title, tag, invert = false }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <Badge
            className={
              invert
                ? "bg-orange-500 text-slate-900 hover:bg-orange-400"
                : "bg-slate-800 text-slate-300 hover:bg-slate-800"
            }
          >
            {tag}
          </Badge>
          <Briefcase className="h-4 w-4 text-orange-300" />
        </div>
        <h3 className="mt-3 text-base font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-slate-300/90">
          Portfolio-ready deliverables with mentor feedback.
        </p>
        <div className="mt-4">
          <Button
            asChild
            className={
              "w-full " +
              (invert
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-2xl"
                : "bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black rounded-2xl")
            }
          >
            <Link to="/workshops/online">Enroll</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


function ContactLine({ icon: Icon, href, children }) {
  const Tag = href ? "a" : "div";
  return (
    <Tag
      href={href}
      className="group mt-2 flex items-center gap-2 text-sm text-slate-300 hover:text-white"
    >
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-orange-500/15 text-orange-300">
        <Icon className="h-4 w-4" />
      </span>
      <span className="underline decoration-transparent group-hover:decoration-white/30">
        {children}
      </span>
    </Tag>
  );
}


function ContactFormCTA() {
  return (
    <div className="mt-0 w-full text-center">
      <Button
        asChild
        className="w-full h-12 rounded-2xl bg-slate-800/55 text-black hover:bg-orange-400/55 hover:text-white"
      >
        <Link to="/contact" className="flex items-center justify-center gap-2">
          Contact Form <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}




