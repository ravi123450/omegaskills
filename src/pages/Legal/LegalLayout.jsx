import React from "react";
import { Link } from "react-router-dom";
import { Shield, ScrollText, FileText, Handshake, Package, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


/* ---- local atoms to mirror your Contact page styling ---- */
export function SectionTitle({ children, eyebrow }) {
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


/** Shared layout so all legal pages match the site's dark-slate + orange look */
export default function LegalLayout({ title, icon = <Shield />, children, updated }) {
  const updatedStr = new Date(updated || Date.now()).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });


  // small helper to render the top icon pill nicely
  const IconWrap = ({ children }) => (
    <div className="rounded-xl bg-orange-600/15 p-2 text-orange-300">{children}</div>
  );


  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* hero */}
      <section className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 md:px-6 md:pt-14">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-orange-600/20 text-orange-300 !text-base">Legal — Omega Skills Academy</Badge>
        </div>


        <div className="mt-4 flex items-center gap-3">
          <IconWrap>{icon}</IconWrap>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">
            <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
        </div>


        <p className="mt-3 max-w-2xl text-base md:text-lg text-slate-300">
          Please read this page carefully. It explains how we operate, protect your data, and handle
          purchases for our cohorts, workshops, and tools.
        </p>


        <p className="mt-2 text-sm text-slate-400">Last updated: {updatedStr}</p>


        {/* quick nav pills */}
        <div className="mt-6 flex flex-wrap gap-2">
          <Link to="/legal/terms" className="rounded-full border border-slate-800 bg-slate-900/40 px-3 py-1 text-sm hover:border-orange-600/50">
            <div className="inline-flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-orange-300" /> Terms
            </div>
          </Link>
          <Link to="/legal/privacy-policy" className="rounded-full border border-slate-800 bg-slate-900/40 px-3 py-1 text-sm hover:border-orange-600/50">
            <div className="inline-flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-300" /> Privacy
            </div>
          </Link>
          <Link to="/legal/refund-policy" className="rounded-full border border-slate-800 bg-slate-900/40 px-3 py-1 text-sm hover:border-orange-600/50">
            <div className="inline-flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-300" /> Refunds
            </div>
          </Link>
          <Link to="/legal/placement-assistance" className="rounded-full border border-slate-800 bg-slate-900/40 px-3 py-1 text-sm hover:border-orange-600/50">
            <div className="inline-flex items-center gap-2">
              <Handshake className="h-4 w-4 text-orange-300" /> Placement-Assistance
            </div>
          </Link>
          <Link to="/legal/shipping-delivery" className="rounded-full border border-slate-800 bg-slate-900/40 px-3 py-1 text-sm hover:border-orange-600/50">
            <div className="inline-flex items-center gap-2">
              <Package className="h-4 w-4 text-orange-300" /> Shipping
            </div>
          </Link>
        </div>
      </section>


      {/* content + sticky help card */}
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="md:col-span-2 space-y-10">{children}</div>


          <aside className="md:col-span-1">
            <div className="md:sticky md:top-24">
              <Card className="border-slate-800/70 bg-slate-900/50">
                <CardContent className="p-6">
                  <SectionTitle eyebrow="Need help?">Talk to us</SectionTitle>
                  <p className="mt-4 text-sm text-slate-300/90">
                    Have questions about refunds, privacy, or cohorts? We respond within{" "}
                    <span className="font-semibold text-slate-200">24 hours</span>.
                  </p>
                  <div className="mt-5 grid gap-2">
                    <Button asChild className="w-full text-base bg-orange-500 text-slate-900 hover:bg-orange-400">
                      <Link to="/contact">Contact Support</Link>
                    </Button>
                    <Button asChild variant="secondary" className="w-full text-sm bg-slate-800 text-slate-100 hover:bg-slate-700">
                      <a href="mailto:support@omegaskillsacademy.online">Email us</a>
                    </Button>
                  </div>


                  <div className="mt-6 rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
                    <div className="flex items-start gap-3">
                      <Quote className="h-4 w-4 text-orange-300" />
                      <p className="text-xs text-slate-300/90">
                        “Clear policies build trust. We keep things simple, fair, and transparent.”
                      </p>
                    </div>
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





