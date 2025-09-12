// src/components/WorkshopImageSection.jsx
import React, { useRef, useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Camera, ArrowRight, PlayCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Import image assets (Vite will fingerprint these for production)
import img1 from "@/assets/image/1.jpg";
import img2 from "@/assets/image/2.jpg";
import img3 from "@/assets/image/3.jpg";
import img4 from "@/assets/image/4.jpg";
import img5 from "@/assets/image/5.jpg";

// Image data for carousel
const WORKSHOP_IMAGES = [
  { src: img1, caption: "Gemini flash 2.0" },
  { src: img2, caption: "Gemini flash 2.0" },
  { src: img3, caption: "Flask: Hands-on Lab" },
  { src: img4, caption: "Gemini flash 2.0" },
  { src: img5, caption: "Flask: Hands-on Lab" },
];

// Tiny helpers for animation
function useCountUp(target = 0, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf; let start = null;
    const step = (t) => {
      if (start === null) start = t;
      const p = Math.min((t - start) / duration, 1);
      setValue(Math.round(p * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

// Stats component
function Stat({ label, value, suffix = "" }) {
  const v = useCountUp(value);
  return (
    <Card className="rounded-2xl border border-slate-800/60 bg-slate-900/40">
      <CardContent className="p-4 text-center">
        <div className="text-2xl font-extrabold text-white">
          {v}{suffix}
        </div>
        <div className="text-xs uppercase tracking-wide text-slate-400">
          {label}
        </div>
      </CardContent>
    </Card>
  );
}

// Tilted image card with hover effect
function TiltCard({ src, caption, onClick }) {
  const ref = useRef(null);

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = ((y / rect.height) - 0.5) * -8; // tilt up/down
    const ry = ((x / rect.width) - 0.5) * 8;   // tilt left/right
    el.style.setProperty("--rx", `${rx}deg`);
    el.style.setProperty("--ry", `${ry}deg`);
  };

  const reset = () => {
    const el = ref.current; if (!el) return;
    el.style.setProperty("--rx", `0deg`);
    el.style.setProperty("--ry", `0deg`);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      onClick={onClick}
      className="group relative h-64 sm:h-72 md:h-80 lg:h-96 w-[78vw] sm:w-[52vw] md:w-[40vw] xl:w-[28vw] cursor-pointer overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/40 will-change-transform"
      style={{ transform: "perspective(900px) rotateX(var(--rx)) rotateY(var(--ry))" }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Continuous Ken-Burns loop */}
      <motion.img
        src={src}
        alt={caption}
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        initial={{ scale: 1.04 }}
        animate={{ scale: [1.04, 1.1, 1.04] }}
        transition={{ duration: 12, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} // fail safe
      />
      {/* overlay gradient + caption */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-60 group-hover:opacity-70 transition-opacity" />
      <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs font-medium text-amber-200">
        <Camera className="h-4 w-4" /> {caption}
      </div>
    </motion.div>
  );
}

// Cinematic horizontal carousel (auto-play, per-image dwell)
function CinematicImageCarousel({ items, pauseMs = 900, slideMs = 700 }) {
  const photos = useMemo(() => [...items, ...items], [items]);
  const trackRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const [allowTransition, setAllowTransition] = useState(true);
  const stepRef = useRef(0); // px per step

  useEffect(() => {
    const calc = () => {
      const track = trackRef.current; if (!track) return;
      const first = track.querySelector(".carousel-card");
      if (!first) return;
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.gap || styles.columnGap || "16") || 16;
      stepRef.current = first.getBoundingClientRect().width + gap;
      setAllowTransition(false);
      setIdx(0);
      requestAnimationFrame(() => setAllowTransition(true));
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer;
    const tick = () => {
      if (cancelled) return;
      setAllowTransition(true);
      setIdx((prev) => {
        const next = prev + 1;
        if (next >= items.length) {
          setTimeout(() => {
            if (cancelled) return;
            setAllowTransition(false);
            setIdx(0);
            requestAnimationFrame(() => setAllowTransition(true));
          }, slideMs);
        }
        return next;
      });
      timer = setTimeout(tick, pauseMs + slideMs);
    };
    timer = setTimeout(tick, pauseMs);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [items.length, pauseMs, slideMs]);

  const transform = `translateX(-${idx * stepRef.current}px)`;

  return (
    <div className="relative mt-8">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-slate-950 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-slate-950 to-transparent z-10" />
      <div className="overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/30">
        <div
          ref={trackRef}
          className="flex gap-4 p-3 will-change-transform"
          style={{
            transform,
            transition: allowTransition
              ? `transform ${slideMs}ms cubic-bezier(0.22,0.61,0.36,1)`
              : "none",
          }}
        >
          {photos.map((p, i) => (
            <div key={i} className="carousel-card">
              <TiltCard
                src={p.src}
                caption={p.caption}
                onClick={() => window.open(p.src, "_blank")}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Section Component for workshops
export default function WorkshopImageSection() {
  return (
    <section id="workshop-gallery" className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <h2 className="relative text-2xl md:text-3xl font-bold">
        Previous Workshops & Mentor Sessions
        <span className="absolute -bottom-2 left-0 h-[2px] w-24 rounded-full bg-gradient-to-r from-amber-500 via-amber-300 to-transparent" />
      </h2>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
        <Stat label="workshops" value={50} suffix="+" />
        <Stat label="students" value={2400} suffix="+" />
        <Stat label="partner colleges" value={12} suffix="+" />
      </div>

      {/* Auto-playing carousel */}
      <CinematicImageCarousel items={WORKSHOP_IMAGES} pauseMs={900} slideMs={700} />

      {/* CTA */}
      <div className="mt-10 text-center space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
        <Button asChild className="rounded-2xl bg-amber-500 text-slate-900 hover:bg-amber-400 py-2 px-4 sm:py-3 sm:px-6 w-full sm:w-auto">
          <Link to="/admissions" className="inline-flex items-center gap-2">
            Next Workshop coming soon <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="rounded-2xl border-slate-700 bg-slate-900/40 hover:bg-slate-900/60 text-slate-200 py-2 px-4 sm:py-3 sm:px-6 w-full sm:w-auto"
        >
          <Link to="/contact" className="inline-flex items-center gap-2">
            Invite Us On-Campus (mail to us) <PlayCircle className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
