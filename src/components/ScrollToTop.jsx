// src/components/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    // If URL has a hash, scroll to that element
    if (hash) {
      // wait for next paint so the new page content exists
      requestAnimationFrame(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          // fallback if element isn't found
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
      });
      return;
    }

    // No hash: always go to top on route change
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash, key]);

  return null;
}
