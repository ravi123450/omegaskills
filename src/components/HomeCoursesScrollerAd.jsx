import React from "react";
import { Link } from "react-router-dom";
import { Users, FileText, Cloud, MessageSquareText, Calculator } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardTicker } from "@/components/ui/MarqueeTicker";


/** Ads to show in the home-page scroller */
const HOME_MOCK_ADS = [
  {
    icon: Cloud,
    title: "All-in-One Mock Bundle",
    line1: "Logical • Quant • Verbal • Soft",
    price: "₹579",
  },
  {
    icon: Users,
    title: "Logical Reasoning",
    line1: "Seating, Puzzles, Coding–Decoding…",
    price: "₹199",
  },
  {
    icon: Calculator,
    title: "Quantitative Aptitude",
    line1: "Percentages, Time & Work, Algebra, Geometry…",
    price: "₹199",
  },
  {
    icon: MessageSquareText,
    title: "Verbal Ability",
    line1: "RC, Grammar (Clauses/Tenses), Vocab, Para Jumbles…",
    price: "₹199",
  },
  {
    icon: FileText,
    title: "Soft Skills Mastery",
    line1: "20 mock tests (50Q each) • per-topic analytics",
    price: "₹199",
  },
];


function AdCard({ icon: Icon, title, line1, price }) {
  return (
    <Card className="w-72 border border-slate-800/60 bg-slate-900/40 transition hover:-translate-y-0.5 hover:border-orange-500/40">
      <CardContent className="p-5">
        {/* Header: Icon + Title + Price pill on the right */}
        <div className="mb-2 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500/15 text-orange-300">
            <Icon className="h-4 w-4" />
          </span>


          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">{title}</div>
          </div>


          {/* right-side oval price chip */}
          <span className="shrink-0 rounded-full bg-orange-500/15 px-3 py-1 text-xs font-medium text-orange-300 border border-orange-500/30">
            {price}
          </span>
        </div>


        {/* one-line desc */}
        <p className="text-sm text-slate-300/90">{line1}</p>


        {/* Login CTA (outlined orange, slate bg, white text; hover -> darker slate + black text) */}
        <div className="mt-3">
          <Button
            asChild
            className="w-full border border-orange-400 bg-slate-900/40 text-white hover:bg-slate-900/70 hover:text-orange-300"
          >
            <Link to="/login">Login to start your mock test</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


export default function HomeCoursesScrollerAd({
  title = "Student-Favorite Mock Tests",
  items = HOME_MOCK_ADS,
}) {
  const cards = items.map((it, i) => <AdCard key={i} {...it} />);


  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6">
      <h2 className="relative text-2xl md:text-3xl font-bold">
        {title}
        <span className="absolute -bottom-2 left-0 h-[2px] w-24 rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />
      </h2>


      <CardTicker className="mt-6" speed={45} repeat={3} gap="1.25rem" cards={cards} />
    </section>
  );
}



