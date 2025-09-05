import React, { useEffect, useMemo, useState } from "react";


/**
 * UpdatesTicker – Omega-styled single-line marquee (right→left)
 * Props:
 *  - items: string[]
 *  - repeat: number         // how many times to repeat items in one track
 *  - speed: number          // seconds for one pass
 *  - gap: string            // CSS length between pills
 *  - pauseOnHover: boolean
 *  - startPaused: boolean
 *  - showHint: boolean      // small hint row above
 *  - className: string
 */
export default function UpdatesTicker({
  items = [" "],
  repeat = 6,
  speed = 22,
  gap = "0.8rem",
  pauseOnHover = true,
  startPaused = false,
  showHint = true,
  className = "",
}) {
  const [paused, setPaused] = useState(startPaused);
  const [reverse, setReverse] = useState(false);


  // Build a filled track: [items] repeated N times
  const trackItems = useMemo(() => {
    const base = Array.isArray(items) ? items : [String(items)];
    const out = [];
    for (let i = 0; i < Math.max(1, repeat); i++) out.push(...base);
    return out;
  }, [items, repeat]);


  // Space => pause/play (ignore when typing)
  useEffect(() => {
    const onKey = (e) => {
      const t = (e.target.tagName || "").toLowerCase();
      if (t === "input" || t === "textarea") return;
      if (e.code === "Space") {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);


  return (
    <div
      className={[
        "ticker relative w-full overflow-hidden rounded-2xl",
        "bg-slate-900/40 border border-slate-800/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
        pauseOnHover ? "hover:paused" : "",
        paused ? "paused" : "",
        reverse ? "reverse" : "",
        className,
      ].join(" ")}
      style={{ "--gap": gap, "--dur": `${speed}s` }}
      onDoubleClick={() => setReverse((r) => !r)}
      role="status"
      aria-live="polite"
      aria-label="Site updates"
      title="Double-click to reverse • Press Space to pause/play"
    >
      {showHint && (
        <div className="px-3 py-2 text-[12px] text-slate-400 flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-orange-500/80" />
          Double-click to reverse • Press <kbd className="rounded bg-slate-800/80 px-1">Space</kbd> to pause
        </div>
      )}


      {/* single horizontal rail with two identical tracks for seamless loop */}
      <div className="rail">
        <ul className="track" aria-hidden={false}>
          {trackItems.map((m, i) => (
            <li key={`a-${i}`} className="pill">
              {m}
            </li>
          ))}
        </ul>
        <ul className="track" aria-hidden>
          {trackItems.map((m, i) => (
            <li key={`b-${i}`} className="pill">
              {m}
            </li>
          ))}
        </ul>
      </div>


      <style>{`
        /* rail = single line */
        .ticker .rail{
          display:flex;
          align-items:center;
          gap: var(--gap);
          overflow:hidden;
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
                  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
        }
        .ticker ul{ margin:8; padding:0; list-style:none; }
        .ticker .track{
          display:flex;
          align-items:center;
          gap: var(--gap);
          flex-shrink:0;
          min-width:100%;
          animation: scroll var(--dur) linear infinite;
        }
        /* RTL flow */
        @keyframes scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(calc(-100% - var(--gap))); }
        }
        /* chip/pill look – matches your page badges/buttons */
        .ticker .pill{
          display:inline-flex;
          align-items:center;
          white-space:nowrap;
          padding:.5rem .9rem;
          border-radius:9999px;
          background: rgba(2,6,23,.55);             /* slate-950/55 */
          color:#e5e7eb;                              /* slate-200 */
          border:1px solid rgba(30,41,59,.6);        /* slate-800/60 */
          box-shadow: 0 0 0 1px rgba(234,88,12,.35); /* subtle orange ring */
          font-size:.9rem;
        }
        /* controls */
        .ticker.paused .track{ animation-play-state: paused !important; }
        .ticker.reverse .track{ animation-direction: reverse !important; }
        .ticker.hover\\:paused:hover .track{ animation-play-state: paused; }


        @media (prefers-reduced-motion: reduce){
          .ticker .track{ animation-play-state: paused !important; }
        }
      `}</style>
    </div>
  );
}


// NOT IN USE BUT REQUIRED //





