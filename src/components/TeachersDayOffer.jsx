// src/components/TeachersDayOffer.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EMAIL = "info@omegaskillsacademy.online";

export default function TeachersDayOffer() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Gentle delay so it feels natural
    const t = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => setShow(false);

  const subject = encodeURIComponent("Student 20% Off – Requesting Discount Code");
  const body = encodeURIComponent(
    `Hi Omega Skills Academy team,\n\nI'm a student and would like to claim the 20% discount on your programs.\n\nMy details:\n• Name:\n• College/Year:\n• Program interested in:\n\nThanks!`
  );
  const mailto = `mailto:${EMAIL}?subject=${subject}&body=${body}`;

  return (
    <AnimatePresence>
      {show && (
        <motion.aside
          initial={{ y: 40, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="
            fixed z-40
            bottom-4 right-4 
            w-[92vw] sm:w-[420px]
            rounded-2xl border border-amber-500/25
            bg-gradient-to-br from-slate-900/85 to-slate-800/75
            backdrop-blur
            shadow-[0_8px_30px_rgba(0,0,0,.35)]
            p-4 sm:p-5
            text-slate-100
          "
          role="dialog"
          aria-live="polite"
          aria-label="Students 20% discount announcement"
        >
          {/* Accent shimmer bar */}
          <div className="absolute inset-x-0 -top-[1px] h-[2px] rounded-t-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 opacity-80" />

          <div className="flex items-start gap-3">
            {/* Emoji badge */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: [0.9, 1, 0.98, 1] }}
              transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 3 }}
              className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/15 text-amber-300 select-none"
              aria-hidden
            >
              🎓
            </motion.div>

            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold leading-tight">
                Students: <span className="text-amber-300">20% off</span> on all programs
              </h3>
              <p className="mt-1 text-sm text-slate-300">
                Mail us to get your <strong>student discount code</strong>. Limited-time offer.
              </p>

              {/* CTA row */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <a
                  href={mailto}
                  onClick={dismiss}
                  className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-orange-400 transition"
                >
                  Mail us to claim
                </a>
                <button
                  onClick={dismiss}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm text-slate-200 hover:bg-slate-900/60"
                >
                  Not now
                </button>
              </div>
            </div>

            {/* Close (X) */}
            <button
              onClick={dismiss}
              className="ml-1 text-slate-400 hover:text-slate-200 transition"
              aria-label="Dismiss student discount"
            >
              ✕
            </button>
          </div>
        </motion.aside>
      )}

      {/* Mobile bottom bar helper */}
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          exit={{ opacity: 0 }}
          className="fixed inset-x-0 bottom-0 sm:hidden pointer-events-none h-20 bg-gradient-to-t from-black/40 to-transparent z-30"
          aria-hidden
        />
      )}
    </AnimatePresence>
  );
}
