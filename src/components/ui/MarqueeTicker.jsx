import React, { useEffect, useMemo, useState } from "react";


/* ---------- Core rail (shared) ---------- */
function MarqueeRail({
  children,
  repeat = 3,          // duplicates the child set inside a single track
  speed = 25,          // seconds per pass (bigger = slower)
  gap = "1.25rem",
  pauseOnHover = true,
  startPaused = false,
  className = "",
  ariaLabel = "Marquee rail",
}) {
  const [paused, setPaused] = useState(startPaused);
  const [reverse, setReverse] = useState(false);


  // Space => pause/play (ignore when typing)
  useEffect(() => {
    const onKey = (e) => {
      const t = (e.target.tagName || "").toLowerCase();
      if (t === "input" || t === "textarea") return;
      if (e.code === "Space") { e.preventDefault(); setPaused(p => !p); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);


  // duplicate the children N times to fill the track
  const track = useMemo(
    () => Array.from({ length: Math.max(1, repeat) }).map((_, i) => (
      <React.Fragment key={i}>{children}</React.Fragment>
    )),
    [children, repeat]
  );


  return (
    <div
      className={[
        "marq ticker relative w-full overflow-hidden rounded-2xl",
        "bg-slate-900/40 border border-slate-800/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
        pauseOnHover ? "hover:paused" : "",
        paused ? "paused" : "",
        reverse ? "reverse" : "",
        className,
      ].join(" ")}
      style={{ "--gap": gap, "--dur": `${speed}s` }}
      onDoubleClick={() => setReverse(r => !r)}
      role="region"
      aria-label={ariaLabel}
      title="Double-click to reverse • Press Space to pause/play"
    >
      <div className="rail">
        <div className="track">{track}</div>
        <div className="track" aria-hidden>{track}</div>
      </div>


      <style>{`
        /* single horizontal rail */
        .ticker .rail{
          display:flex;
          align-items:center;
          gap: var(--gap);
          overflow:hidden;
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
                  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
        }
        .ticker ul{ margin:0; padding:0; list-style:none; }
        .ticker .track{
          display:flex;
          align-items:center;
          gap: var(--gap);
          flex-shrink:0;
          min-width:100%;
          animation: scroll var(--dur) linear infinite;
        }
        @keyframes scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(calc(-100% - var(--gap))); }
        }
        .ticker.paused  .track{ animation-play-state: paused !important; }
        .ticker.reverse .track{ animation-direction: reverse !important; }
        .ticker.hover\\:paused:hover .track{ animation-play-state: paused; }


        @media (prefers-reduced-motion: reduce){
          .ticker .track{ animation-play-state: paused !important; }
        }
      `}</style>
    </div>
  );
}


/* ---------- Pills renderer (Notes page) — FINAL VERSION ---------- */
export function PillTicker({
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


/* ---------- Cards renderer (Home page) ---------- */
/* ---------- Cards renderer (Home page) ---------- */
export function CardTicker({
  cards = [],
  repeat = 3,
  speed = 49,
  gap = "1.25rem",
  pauseOnHover = true,
  startPaused = false,
  className = "",
  showHint = true,
  ariaLabel = "Cards marquee",


  /* NEW controls (cards only) */
  railHeight = 220,           // px or any CSS length (e.g. '15rem')
  itemWidth = 288,            // px or any CSS length (e.g. '20rem'); 288px ≈ w-72
  fadeEdges = true,           // keep the gradient fade on the sides
}) {
  // Normalize lengths
  const _railH = typeof railHeight === "number" ? `${railHeight}px` : railHeight;
  const _itemW = typeof itemWidth === "number" ? `${itemWidth}px` : itemWidth;


  return (
    <div className={["card-ticker", className].join(" ")}>
      {showHint && (
        <div className="px-3 py-2 text-[12px] text-slate-400 flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-orange-500/80" />
          Double-click to reverse • Press <kbd className="rounded bg-slate-800/80 px-1">Space</kbd> to pause
        </div>
      )}


      {/* Local CSS overrides ONLY for card scroller */}
      <style>{`
        .card-ticker .rail {
          min-height: ${_railH};
          height: ${_railH};
          ${fadeEdges ? "" : "-webkit-mask-image:none !important; mask-image:none !important;"}
        }
        .card-ticker .track {
          min-height: ${_railH};
          height: ${_railH};
        }
        .card-ticker .item-wrap {
          width: ${_itemW};
        }
      `}</style>


      <MarqueeRail
        repeat={repeat}
        speed={speed}
        gap={gap}
        pauseOnHover={pauseOnHover}
        startPaused={startPaused}
        ariaLabel={ariaLabel}
        /* Do NOT change PillTicker styles; this classname scopes to card version only */
        className=""
      >
        {cards.map((node, i) => (
          <div key={`card-${i}`} className="item-wrap shrink-0">
            {node}
          </div>
        ))}
      </MarqueeRail>
    </div>
  );
}




/* ---------- Back-compat default: UpdatesTicker = PillTicker ---------- */
export default PillTicker;





