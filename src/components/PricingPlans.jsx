import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight, TrendingUp, Users2, Brain, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PriceTicker } from "@/components/ui/MarqueeTicker";

// ------------------------ Razorpay placeholders (replace) ------------------------
const PAY = {
  kickstart_monthly: "https://rzp.io/rzp/0sb1",
  kickstart_yearly: "https://rzp.io/rzp/osb2",
  growth_monthly: "https://rzp.io/rzp/klOgUd4",
  growth_yearly: "https://rzp.io/rzp/ossi2",
  pro_monthly: "https://rzp.io/rzp/osi3",
  pro_yearly: "https://rzp.io/rzp/osi4",
};

// ------------------------ Tracking helper ------------------------
function buildPayUrl(base, { plan, billing }) {
  try {
    const url = new URL(base);
    url.searchParams.set("utm_source", "omega_site");
    url.searchParams.set("utm_medium", "pricing_card");
    url.searchParams.set("utm_campaign", "buy_click");
    url.searchParams.set("utm_plan", plan);
    url.searchParams.set("utm_billing", billing);
    return url.toString();
  } catch (_) {
    return base;
  }
}

// ------------------------ Tiny atoms ------------------------
function Feature({ children }) {
  return (
    <li className="flex items-start gap-2 text-sm text-slate-300">
      <span className="mt-1 grid h-5 w-5 place-items-center rounded-md bg-amber-500/15 text-amber-300">
        <Check className="h-3.5 w-3.5" />
      </span>
      <span>{children}</span>
    </li>
  );
}

function PlanButtons({ planKey, monthlyHref, yearlyHref }) {
  const monthlyUrl = useMemo(() => buildPayUrl(monthlyHref, { plan: planKey, billing: "monthly" }), [monthlyHref, planKey]);
  const yearlyUrl = useMemo(() => buildPayUrl(yearlyHref, { plan: planKey, billing: "yearly" }), [yearlyHref, planKey]);

  return (
    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
      <Button asChild className="rounded-2xl bg-amber-500 text-slate-900 hover:bg-amber-400">
        <a href={monthlyUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center justify-center gap-2">
          <span>Buy Monthly</span>
          <ArrowRight className="h-4 w-4" />
        </a>
      </Button>
      <Button asChild variant="outline" className="rounded-2xl border-slate-700 bg-slate-900/40 text-slate-100 hover:bg-slate-900/60 hover:text-amber-300">
        <a href={yearlyUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center justify-center gap-2">
          <span>Buy Yearly</span>
          <ArrowRight className="h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}

function Ribbon() {
  return (
    <div className="pointer-events-none absolute -top-3 left-3 z-10">
      <Badge className="bg-amber-500 text-slate-900 shadow-md">Most Popular</Badge>
    </div>
  );
}

// ------------------------ Ticker content ------------------------
const TICKER_ITEMS = [
  { icon: Sparkles, text: "Smart Analytics: strengths • weaknesses • percentile • next 3 topics" },
  { icon: Users2, text: "Peer Leaderboards & Friend Battles — weekly competitions" },
  { icon: TrendingUp, text: "Company-Specific Packs: TCS, Infosys, Wipro, Accenture, Cognizant" },
  { icon: Brain, text: "Mentor Roadmaps • Resume ATS • Mock Interviews" },
];

function TickerCard({ icon: Icon, text }) {
  return (
    <Card className="w-80 border border-slate-800/60 bg-slate-900/40">
      <CardContent className="flex items-center gap-3 p-4">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/15 text-amber-300">
          <Icon className="h-4 w-4" />
        </span>
        <div className="truncate text-sm text-slate-200">{text}</div>
      </CardContent>
    </Card>
  );
}

// ------------------------ Main component ------------------------
export default function PricingPlans() {
  const tickerCards = useMemo(() => TICKER_ITEMS.map((t, i) => <TickerCard key={i} {...t} />), []);

  return (
    <section id="plans" className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <h2 className="relative text-2xl md:text-3xl font-bold">
        Placement Ready Plans
        <span className="absolute -bottom-2 left-0 h-[2px] w-24 rounded-full bg-gradient-to-r from-amber-500 via-amber-300 to-transparent" />
      </h2>

      {/* Auto-scroller like HomeCoursesScrollerAd */}
      <PriceTicker
        className="mt-6"
        speed={100}
        repeat={9}
        gap="1rem"
        cards={tickerCards}
        railHeight="110px !important"
        itemWidth="320px !important"
        fadeEdges={false}
      />

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Kickstart */}
        <Card className="relative rounded-2xl border border-amber-500/20 bg-slate-950/60 shadow-xl backdrop-blur">
          <CardContent className="p-6 flex flex-col h-full justify-between">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/15 text-amber-300">
                  <Brain className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-white">Starter – Kickstart</h3>
                  <p className="text-xs text-slate-400">Best for 2nd & 3rd year students</p>
                </div>
              </div>

              <ul className="space-y-2">
                <Feature>Company-Specific Mock Tests</Feature>
                <Feature>Leaderboards & Friend Battles</Feature>
                <Feature>Weekly Group Doubt Sessions</Feature>
                <Feature>Resume ATS Scanner (1/month)</Feature>
                <Feature>Roadmap PDFs</Feature>
                <Feature><span className="font-semibold">Smart Analytics Dashboard</span></Feature>
                <Feature>Mini Project Ideas Library</Feature>
              </ul>
            </div>

            <div className="mt-6">
              <div className="mb-3 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-2">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">Monthly</div>
                  <div className="text-xl font-extrabold text-white">₹199</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-2">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">Yearly</div>
                  <div className="text-xl font-extrabold text-white">₹1,499</div>
                </div>
              </div>
              <PlanButtons planKey="kickstart" monthlyHref={PAY.kickstart_monthly} yearlyHref={PAY.kickstart_yearly} />
            </div>
          </CardContent>
        </Card>

        {/* Growth */}
        <Card className="relative rounded-2xl border border-amber-500/40 bg-slate-950/60 shadow-xl ring-1 ring-amber-500/30 backdrop-blur">
          <Ribbon />
          <CardContent className="p-6 flex flex-col h-full justify-between">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/15 text-amber-300">
                  <TrendingUp className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-white">Growth – Crack Placements</h3>
                  <p className="text-xs text-slate-400">Best for final-year students</p>
                </div>
              </div>

              <ul className="space-y-2">
                <Feature>Everything in Kickstart</Feature>
                <Feature>Unlimited ATS Resume Scans</Feature>
                <Feature>Company-Specific Packs</Feature>
                <Feature>1:1 Resume Review with Mentor</Feature>
                <Feature>2 Mock Interviews</Feature>
                <Feature>Personalized Mentor Roadmap</Feature>
                <Feature>Premium Leaderboard</Feature>
                <Feature><span className="font-semibold">Smart Analytics – Advanced</span></Feature>
                <Feature>Project Playbooks</Feature>
              </ul>
            </div>

            <div className="mt-6">
              <div className="mb-3 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-2">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">Monthly</div>
                  <div className="text-xl font-extrabold text-white">₹549</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-2">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">Yearly</div>
                  <div className="text-xl font-extrabold text-white">₹3,999</div>
                </div>
              </div>
              <PlanButtons planKey="growth" monthlyHref={PAY.growth_monthly} yearlyHref={PAY.growth_yearly} />
            </div>
          </CardContent>
        </Card>

        {/* Pro */}
        <Card className="relative rounded-2xl border border-amber-500/20 bg-slate-950/60 shadow-xl backdrop-blur">
          <CardContent className="p-6 flex flex-col h-full justify-between">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/15 text-amber-300">
                  <Trophy className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-white">Pro – Get Hired</h3>
                  <p className="text-xs text-slate-400">For MNC & product roles</p>
                </div>
              </div>

              <ul className="space-y-2">
                <Feature>Everything in Crack Placements</Feature>
                <Feature>1:1 Dedicated Mentor</Feature>
                <Feature>Unlimited Mock Interviews</Feature>
                <Feature><span className="font-semibold">Full Placement Assistance</span></Feature>
                <Feature>Priority Doubt Support</Feature>
                <Feature>Exclusive Workshops</Feature>
                <Feature>Placement Readiness Certificate</Feature>
                <Feature>Build-Your-Portfolio Program</Feature>
                <Feature><span className="font-semibold">Smart Analytics – Pro</span></Feature>
              </ul>
            </div>

            <div className="mt-6">
              <div className="mb-3 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-2">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">Monthly</div>
                  <div className="text-xl font-extrabold text-white">₹999</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-2">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">Yearly</div>
                  <div className="text-xl font-extrabold text-white">₹9,999</div>
                </div>
              </div>
              <PlanButtons planKey="pro" monthlyHref={PAY.pro_monthly} yearlyHref={PAY.pro_yearly} />
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">
        Need help choosing? <Link to="/contact" className="underline decoration-white/20 hover:text-amber-300">Talk to an advisor</Link>
      </p>
    </section>
  );
}
