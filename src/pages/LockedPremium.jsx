// src/components/LockedPremium.jsx
import React, { useEffect, useState } from "react";
import { Lock, Sparkles, ArrowRight, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PricingPlans from "@/pages/PricingPlans";

export default function LockedPremium() {
  const [open, setOpen] = useState(false);

  // prevent background scroll while modal open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : prev || "";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // ESC to close
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <section id="locked-premium" className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      {/* Heading */}
      <div className="text-center mb-8">
        <Lock className="mx-auto h-14 w-14 text-orange-400" />
        <h2 className="mt-4 text-2xl md:text-3xl font-extrabold">
          Unlock Premium Features
        </h2>
        <p className="mt-2 text-slate-300 text-sm md:text-base max-w-2xl mx-auto">
          Access advanced mock tests, analytics dashboard, resume builder, and mentor guidance by subscribing to our premium plans.
        </p>
      </div>

      {/* CTA row */}
      <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-2xl bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black"
        >
          View Plans <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button
          asChild
          variant="outline"
          className="rounded-2xl border-slate-700 bg-slate-900/40 hover:bg-slate-900/60 text-slate-200"
        >
          <a href="/contact">Talk to Advisor</a>
        </Button>
      </div>

      {/* Blurred teaser grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {["Smart Analytics", "Resume ATS Scanner", "Company-Specific Packs"].map(
          (feature, i) => (
            <Card
              key={i}
              className="relative overflow-hidden border border-slate-800/60 bg-slate-900/40"
            >
              <CardContent className="p-6">
                <Sparkles className="h-6 w-6 text-orange-300 mb-2" />
                <h3 className="text-lg font-semibold">{feature}</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Premium-only feature. Unlock with any paid plan.
                </p>
              </CardContent>
              <div className="absolute inset-0 backdrop-blur-[6px] bg-slate-900/40 flex items-center justify-center">
                <span className="flex items-center gap-2 text-sm font-medium text-orange-300">
                  <Lock className="h-4 w-4" /> Locked
                </span>
              </div>
            </Card>
          )
        )}
      </div>

      {/* Modal */}
      {open && (
        <div
          aria-modal="true"
          role="dialog"
          className="fixed inset-0 z-50"
          onClick={() => setOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Dialog: click stop on content */}
          <div
            className="absolute inset-0 grid place-items-center p-3 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="
                relative w-full 
                max-w-5xl 
                rounded-2xl 
                border border-slate-800/60 
                bg-slate-950
                shadow-2xl
                sm:max-h-[85vh] sm:overflow-hidden
              "
            >
              {/* Mobile header (sticky) */}
              <div className="sm:hidden sticky top-0 z-10 flex items-center justify-between border-b border-slate-800/60 bg-slate-950/95 px-4 py-3">
                <h3 className="text-sm font-semibold">Choose a Plan</h3>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800/60"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Close button (desktop) */}
              <button
                onClick={() => setOpen(false)}
                className="hidden sm:block absolute right-3 top-3 rounded-lg p-2 text-slate-300 hover:bg-slate-800/60"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Content (scrollable on small screens) */}
              <div className="max-h-[85vh] overflow-y-auto px-3 py-4 sm:px-6 sm:py-6">
                <PricingPlans />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
