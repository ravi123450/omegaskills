// src/components/Footer.jsx
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  MapPin,
  Linkedin,
  Youtube,
  Instagram,
  Github,
  ArrowRight,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaWhatsapp } from "react-icons/fa";
import useAuthFlag from "@/lib/useAuthFlag";


export default function Footer() {
  const year = new Date().getFullYear();
  const [showTop, setShowTop] = useState(false);
  const [liftButtons, setLiftButtons] = useState(false);
  const footerRef = useRef(null);


  const isAuthed = useAuthFlag();


  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  useEffect(() => {
    if (!footerRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => setLiftButtons(entries[0].isIntersecting),
      { root: null, threshold: 0.1 }
    );
    obs.observe(footerRef.current);
    return () => obs.disconnect();
  }, []);


  return (
    <footer
      ref={footerRef}
      className="relative border-t border-slate-800/60 bg-transparent backdrop-blur dark:bg-slate-950"
    >
      {!isAuthed ? (
        <>
          {/* ---------- FULL FOOTER (LOGGED OUT) ---------- */}
          {/* top brand + blurb */}
          <div className="mx-auto max-w-7xl px-4 pt-10 md:px-6">
            <div className="flex flex-col items-start gap-5 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5 backdrop-blur md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-16 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-3xl font-black text-slate-900">
                  Ω
                </span>
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-white">
                    Omega Skills Academy
                  </p>
                  <p className="text-sm text-slate-400">
                    EdTech built around honesty & outcomes.
                    <br />
                    Live cohorts • On-campus bootcamps • Resume & ATS •
                    Certifications • Hackathons
                  </p>
                </div>
              </div>


              <Link
                to="/ats-scanner"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-orange-400 hover:text-black"
              >
                Explore <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>


          {/* link grid */}
          <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              <FooterCol title="Courses & Services">
                <FooterLink to="/courses/learn">Courses</FooterLink>
                <FooterLink to="/workshops/online">
                  Workshops & Events
                </FooterLink>
                <FooterLink to="/resume">Resume Tools</FooterLink>
                <FooterLink to="/cloud/cert-concierge">
                  Certifications
                </FooterLink>
                <FooterLink to="/community/projects">Community</FooterLink>
                <FooterLink to="/resources/notes">Resources</FooterLink>
              </FooterCol>


              <FooterCol title="More">
                <FooterLink to="#">FAQs</FooterLink>
                <FooterLink to="#">Blog / Insights</FooterLink>
                <FooterLink to="/login">Student Dashboard</FooterLink>
                <FooterLink to="/contact">Partnership Enquiries</FooterLink>
              </FooterCol>


              {/* Legal = compact auto-fit grid (works great for small items) */}
              <FooterCol
                title="Legal"
                listClassName="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]"
              >
                <FooterLink to="/legal/terms">Terms & Conditions</FooterLink>
                <FooterLink to="/legal/privacy-policy">
                  Privacy Policy
                </FooterLink>
                <FooterLink to="/legal/refund-policy">Refund Policy</FooterLink>
                <FooterLink to="/legal/placement-assistance">
                  Placement-Assistance Policy
                </FooterLink>
                <FooterLink to="/legal/disclaimer">Disclaimer</FooterLink>
              </FooterCol>


              {/* Contact in 2-up cards when there’s room */}
              <FooterCol
                title="Contact"
                listClassName="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]"
              >
                <FooterRow>
                  <Mail className="h-4 w-4 text-orange-300" />
                  <a
                    href="mailto:info@omegaskillsacademy.online"
                    className="text-white"
                  >
                    info@omegaskillsacademy.online
                  </a>
                </FooterRow>
                <FooterRow>
                  <MapPin className="h-4 w-4 text-orange-300" />
                  <span className="text-white">Bangalore | INDIA</span>
                </FooterRow>
              </FooterCol>


              <FooterCol title="Stay Connected">
                <FooterExt
                  href="https://www.linkedin.com/in/omegaskillsacademy/"
                  label="LinkedIn"
                  icon={<Linkedin className="h-4 w-4" />}
                />
                <FooterExt
                  href="#"
                  label="YouTube"
                  icon={<Youtube className="h-4 w-4" />}
                />
                <FooterExt
                  href="https://www.instagram.com/omegaskillsacademy/"
                  label="Instagram"
                  icon={<Instagram className="h-4 w-4" />}
                />
                <FooterExt
                  href="#"
                  label="GitHub / Projects"
                  icon={<Github className="h-4 w-4" />}
                />
              </FooterCol>
            </div>
          </div>


          {/* bottom bar */}
          <div className="border-t border-slate-800/60 bg-slate-900/40 backdrop-blur">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-slate-400 md:flex-row md:px-6">
              <div className="text-center md:text-left">
                <div className="text-slate-300">
                  © {year} Omega Skills Academy — Where Catalysts Build Careers.
                </div>
                <div>All rights reserved.</div>
              </div>


              {/* auto-fit grid on mobile; row on md+ */}
              <div className="w-full md:w-auto flex items-center justify-center md:justify-end gap-4 whitespace-nowrap overflow-x-auto">
                <Link
                  className="hover:text-slate-300"
                  to="/legal/privacy-policy"
                >
                  Privacy
                </Link>
                <Link className="hover:text-slate-300" to="/legal/terms">
                  Terms
                </Link>
                <Link
                  className="hover:text-slate-300"
                  to="/legal/refund-policy"
                >
                  Refunds
                </Link>
                <Link className="hover:text-slate-300" to="/legal/disclaimer">
                  Disclaimer
                </Link>
                <Link className="hover:text-slate-300" to="/contact">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* ---------- MINIMAL FOOTER (SIGNED IN) ---------- */}
          <div className="mx-auto max-w-7xl px-4 pt-8 md:px-6">
            <div className="flex flex-col items-start gap-5 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5 backdrop-blur md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-16 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-3xl font-black text-slate-900">
                  Ω
                </span>
                <div>
                  <p className="text-lg font-semibold text-white">
                    You’re signed in
                  </p>
                  <p className="text-sm text-slate-400">
                    Quick links for students & members.
                  </p>
                </div>
              </div>


              <div className="flex flex-wrap gap-2">
                <Link
                  to="/dashboard"
                  className="rounded-xl border border-slate-700 bg-slate-900/40 px-4 py-2 text-sm text-slate-200 hover:bg-slate-900/60"
                >
                  Dashboard
                </Link>
                <Link
                  to="/courses"
                  className="rounded-xl border border-slate-700 bg-slate-900/40 px-4 py-2 text-sm text-slate-200 hover:bg-slate-900/60"
                >
                  Courses
                </Link>
                <Link
                  to="/contact"
                  className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-orange-400 hover:text-black"
                >
                  Support
                </Link>
              </div>
            </div>
          </div>


          <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <div className="text-slate-300">
                © {year} Omega Skills Academy
              </div>
              <div className="flex gap-4">
                <Link
                  className="hover:text-slate-300"
                  to="/legal/privacy-policy"
                >
                  Privacy
                </Link>
                <Link className="hover:text-slate-300" to="/legal/terms">
                  Terms
                </Link>
                <Link className="hover:text-slate-300" to="/contact">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </>
      )}


      {/* floating buttons (common) */}
      <div
        className="pointer-events-none fixed z-[9999] flex flex-col items-center gap-3"
        style={{
          right: "calc(env(safe-area-inset-right, 0px) + 1rem)",
          bottom: `calc(env(safe-area-inset-bottom, 0px) + ${
            liftButtons ? "6rem" : "1rem"
          })`,
        }}
      >
        {/* WhatsApp Button */}
        <div className="pointer-events-auto">
          <Button
            asChild
            className="h-12 w-12 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-400"
          >
            <a
              href="https://wa.me/0000000000"
              aria-label="WhatsApp chat"
              target="_blank"
              rel="noreferrer"
            >
              <FaWhatsapp className="h-6 w-6" />
            </a>
          </Button>
        </div>


        {/* Scroll to Top Button */}
        {showTop && (
          <div className="pointer-events-auto">
            <Button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="h-12 w-12 rounded-full bg-slate-800 text-white shadow-lg hover:bg-slate-700"
              aria-label="Back to top"
            >
              <ChevronUp className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </footer>
  );
}


/* ---------- atoms ---------- */
function FooterCol({ title, children, listClassName = "" }) {
  // Default: 2-up grid on mobile, vertical from sm+
  const defaultList = "grid grid-cols-2 gap-x-4 gap-y-1 sm:block sm:space-y-1";
  return (
    <div>
      <h4 className="relative mb-3 inline-block text-sm font-semibold uppercase tracking-wide text-slate-200">
        {title}
        <span className="absolute -bottom-1 left-0 h-[2px] w-10 rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-transparent"></span>
      </h4>
      <ul className={listClassName || defaultList}>{children}</ul>
    </div>
  );
}


function FooterLink({ to, children }) {
  return (
    <li className="min-w-0">
      <Link
        to={to}
        className="block rounded-lg px-2 py-1.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
      >
        {children}
      </Link>
    </li>
  );
}


function FooterRow({ children }) {
  return (
    <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-white/10">
      {children}
    </div>
  );
}


function FooterExt({ href, label, icon }) {
  return (
    <li className="min-w-0">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
      >
        <span className="grid h-6 w-6 place-items-center rounded-md border border-slate-700/60 bg-slate-900/40 text-slate-300 group-hover:border-slate-600">
          {icon}
        </span>
        {label}
      </a>
    </li>
  );
}




