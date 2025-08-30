import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useAuthFlag from "@/lib/useAuthFlag";
import {
  Cloud,
  Rocket,
  CalendarDays,
  CreditCard,
  ClipboardList,
  BadgeCheck,
  GraduationCap,
  Headphones,
  ShieldCheck,
  BookOpen,
  ExternalLink,
  Target,
  Trophy,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

/* -------------------- ENV + URL helpers -------------------- */
const DEFAULT_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfnedyz4BxAKC9IwgUvoCKwCFrDWoVQeEWohLXCmOCK8KS79Q/viewform";

/* Prefer Vite var; gracefully support CRA var; else default */
const ENV_FORM_URL =
  (typeof import.meta !== "undefined" && import.meta?.env?.VITE_CLOUD_COURSES_FORM_URL) ||
  (typeof process !== "undefined" && process?.env?.REACT_APP_CLOUD_COURSES_FORM_URL) ||
  "";

function isHttpUrl(u) {
  try {
    const x = new URL(u);
    return x.protocol === "http:" || x.protocol === "https:";
  } catch {
    return false;
  }
}
const BASE_FORM_URL = isHttpUrl(ENV_FORM_URL) ? ENV_FORM_URL : DEFAULT_FORM_URL;

function buildFormHref(plan = "general") {
  try {
    const u = new URL(BASE_FORM_URL);
    u.searchParams.set("plan", plan);
    return u.toString();
  } catch {
    return DEFAULT_FORM_URL;
  }
}

/* -------------------- tiny atoms -------------------- */
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

function BookButton({ plan = "general", label = "Get Started", big = false, full = false }) {
  const href = useMemo(() => buildFormHref(plan), [plan]);
  const cls =
    "bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black " +
    (big ? "h-11 px-5 " : "") +
    (full ? "w-full " : "");
  return (
    <Button asChild className={cls} title="Open booking form">
      <a href={href} target="_blank" rel="noreferrer">
        {label} <ExternalLink className="ml-2 h-4 w-4" />
      </a>
    </Button>
  );
}

/* -------------------- page -------------------- */
export default function CloudCertPlans() {
  const isAuthed = useAuthFlag();

  const tracks = useMemo(
    () => [
      { name: "AWS", path: "Foundational → Associate → Professional" },
      { name: "Azure", path: "Fundamentals → Admin/Dev → Architect" },
      { name: "GCP", path: "Associate → Professional" },
    ],
    []
  );

  const roadmap = useMemo(
    () => [
      {
        title: "Foundation (1–2 weeks)",
        points: [
          "Cloud basics & shared responsibility",
          "Compute/Storage/Network overview",
          "IAM & pricing fundamentals",
        ],
        icon: <BookOpen className="h-5 w-5 text-orange-300" />,
      },
      {
        title: "Core services (2–4 weeks)",
        points: [
          "Hands-on with provider services",
          "Architecture & cost awareness",
          "Security by default",
        ],
        icon: <ShieldCheck className="h-5 w-5 text-orange-300" />,
      },
      {
        title: "Guided tasks (ongoing)",
        points: [
          "Free-tier / cloud shell exercises",
          "Reference app + diagram",
          "1-pager “what I built”",
        ],
        icon: <ClipboardList className="h-5 w-5 text-orange-300" />,
      },
      {
        title: "Mocks & review (1–2 weeks)",
        points: ["Timed mock tests", "Weak-area drills", "1:1 doubt clearing (add-on)"],
        icon: <Target className="h-5 w-5 text-orange-300" />,
      },
      {
        title: "Voucher & schedule (30–60 mins)",
        points: ["Buy exam voucher", "Book date/time (Pearson VUE)", "Verify ID requirements"],
        icon: <CalendarDays className="h-5 w-5 text-orange-300" />,
      },
      {
        title: "Exam-day kit (2 days before)",
        points: ["Checklist & gotchas", "Time strategy", "Logistics ready"],
        icon: <Trophy className="h-5 w-5 text-orange-300" />,
      },
      {
        title: "Post-exam",
        points: ["Share result & next steps", "Badge social template", "Roadmap to next level/role"],
        icon: <Rocket className="h-5 w-5 text-orange-300" />,
      },
    ],
    []
  );

  const packages = useMemo(
    () => [
      {
        slug: "starter",
        name: "Starter",
        tag: "Self-serve",
        popular: false,
        accent: "border-slate-800/70 bg-slate-900/50",
        pitch:
          "For independent learners who want a clear path + mocks. All selections and purchase are completed in the form.",
        features: ["Certification roadmap", "Study resources list", "Mock tests access", "Community support"],
        cta: "Get Starter",
      },
      {
        slug: "concierge",
        name: "Concierge",
        tag: "Most popular",
        popular: true,
        accent: "border-orange-600/50 bg-orange-600/10",
        pitch:
          "End-to-end guidance: plan, accountability, voucher & scheduling. Choose add-ons in the form.",
        features: [
          "Everything in Starter",
          "Orientation call",
          "Weekly accountability",
          "Voucher & scheduling help",
          "Exam-day checklist",
        ],
        cta: "Book Concierge",
      },
      {
        slug: "pro",
        name: "Pro",
        tag: "Career-ready",
        popular: false,
        accent: "border-slate-800/70 bg-slate-900/50",
        pitch:
          "Best for speed + polish. Adds 1:1s and job-ready extras. Final inclusions are chosen in the form.",
        features: ["Everything in Concierge", "1:1 mentor hours (x4)", "Resume/LinkedIn makeover", "Interview coaching"],
        cta: "Upgrade to Pro",
      },
    ],
    []
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-10 pb-8 md:px-6 md:pt-14">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-orange-600/20 text-orange-300 !text-base">Cloud</Badge>
          <Badge className="bg-slate-800/60 text-slate-200 !text-base">Cert Concierge</Badge>
        </div>

        <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
          End-to-end help from{" "}
          <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
            picking the cert to booking your exam
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-base md:text-lg text-slate-300">
          AWS • Azure • GCP — guided study plans, mock tests, voucher purchase, scheduling, and exam-day prep.
          No hosted labs; we use vendor free-tier & cloud shells. All selections and payment are completed in the form.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <BookButton plan="hero" label="Get Started" big />
          <Link
            to=""
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-orange-300"
          >
            Practice with Question Bank coming soon<ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Left column */}
          <div className="md:col-span-2 space-y-10">
            {/* Tracks */}
            <div>
              <SectionTitle eyebrow="Tracks">Choose your cloud</SectionTitle>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {tracks.map((t) => (
                  <Card key={t.name} className="border-slate-800/70 bg-slate-900/40 hover:border-orange-600/40 transition-colors">
                    <CardContent className="p-5 text-center">
                      <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl bg-orange-600/15">
                        <Cloud className="h-5 w-5 text-orange-300" />
                      </div>
                      <div className="font-semibold">{t.name}</div>
                      <p className="mt-1 text-sm text-slate-300/90">{t.path}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Roadmap */}
            <div>
              <SectionTitle eyebrow="Roadmap">Your path to the badge</SectionTitle>
              <div className="mt-6 space-y-3">
                {roadmap.map((step, i) => (
                  <Card key={i} className="border-slate-800/70 bg-slate-900/40">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-600/15">
                          {step.icon}
                        </div>
                        <div>
                          <div className="font-semibold">
                            {i + 1}. {step.title}
                          </div>
                          <ul className="mt-1 grid gap-1 pl-4 text-sm text-slate-300/90 list-disc">
                            {step.points.map((p) => (
                              <li key={p}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div>
              <SectionTitle eyebrow="Concierge">How it works</SectionTitle>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  { t: "Enrol & pay", d: "Secure checkout is inside the form.", i: <CreditCard className="h-5 w-5 text-orange-300" /> },
                  { t: "Orientation call", d: "Pick the cert + timeline with a mentor.", i: <Headphones className="h-5 w-5 text-orange-300" /> },
                  { t: "Study plan + accountability", d: "Weekly targets, check-ins & nudges.", i: <ClipboardList className="h-5 w-5 text-orange-300" /> },
                  { t: "Mock tests", d: "Timed exams + explanations.", i: <GraduationCap className="h-5 w-5 text-orange-300" /> },
                  { t: "Voucher & scheduling", d: "We guide you to buy & book the exam.", i: <CalendarDays className="h-5 w-5 text-orange-300" /> },
                  { t: "Exam-day support (+ retake plan)", d: "Checklist, last-mile tips, and a retake plan if needed.", i: <BadgeCheck className="h-5 w-5 text-orange-300" /> },
                ].map((x) => (
                  <Card key={x.t} className="border-slate-800/70 bg-slate-900/40">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-600/15">{x.i}</div>
                        <div>
                          <div className="font-semibold">{x.t}</div>
                          <p className="mt-1 text-sm text-slate-300/90">{x.d}</p>
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
              {/* Packages (no prices shown; all handled in form) */}
              <Card className="border-slate-800/70 bg-slate-900/50">
                <CardContent className="p-6">
                  <div className="mb-2">
                    <Badge className="bg-orange-600/20 text-orange-300">Packages</Badge>
                  </div>

                  <div className="space-y-4">
                    {packages.map((p) => (
                      <div
                        key={p.slug}
                        className={[
                          "rounded-2xl border p-4",
                          p.accent,
                          p.popular ? "shadow-[0_0_0_1px_rgba(251,146,60,.35)]" : "",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-lg">{p.name}</div>
                          <span
                            className={[
                              "rounded-full border px-2 py-0.5 text-xs",
                              p.popular
                                ? "border-orange-600/40 bg-orange-600/15 text-orange-300"
                                : "border-slate-700/60 bg-slate-900/40 text-slate-300",
                            ].join(" ")}
                          >
                            {p.tag}
                          </span>
                        </div>

                        <div className="mt-1 text-sm text-slate-300/90">{p.pitch}</div>

                        <ul className="mt-3 space-y-1 text-sm">
                          {p.features.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-slate-200">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 text-orange-300" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-4">
                          <BookButton full plan={p.slug} label={p.cta} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-4 text-xs text-slate-400">
                    All selections and payment are completed in the secure form.
                  </p>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card className="border-slate-800/70 bg-slate-900/50">
                <CardContent className="p-6">
                  <div className="mb-2">
                    <Badge className="bg-slate-800/60 text-slate-200">Good to know</Badge>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300/90">
                    <li className="flex items-start gap-2">
                      <ShieldCheck className="mt-0.5 h-4 w-4 text-orange-300" />
                      We don’t host paid labs; use vendor free-tier & cloud shells.
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="mt-0.5 h-4 w-4 text-orange-300" />
                      Flexible timelines; we’ll adapt to your schedule.
                    </li>
                    <li className="flex items-start gap-2">
                      <Headphones className="mt-0.5 h-4 w-4 text-orange-300" />
                      Priority support for Concierge & Pro.
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>

        {/* Final CTA */}
        <div className="mt-12 rounded-2xl border border-slate-800/70 bg-slate-900/40 p-6 text-center">
          <h3 className="text-xl font-bold">Ready to earn your cloud badge?</h3>
          <p className="mt-2 text-slate-300">
            Pick a package now — we’ll help you plan, practice, purchase the voucher, and schedule the exam.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <BookButton plan="cta-bottom" label="Book / Buy now" big />
            
          </div>
        </div>
      </section>
    </main>
  );
}
