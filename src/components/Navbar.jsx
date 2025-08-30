// src/components/Navbar.jsx
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  LogIn,
  GraduationCap,
  FileText,
  CalendarDays,
  Users,
  Mic,                 // ← already present; used for account menu item
  BookOpen,
  User,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthProvider";

/* ---------- data (Programs groups) ---------- */
const PROGRAM_SECTIONS = [
  {
    key: "courses",
    title: "Courses",
    icon: GraduationCap,
    items: [
      { to: "/courses/learn", label: "Learn Courses" },
      { to: "/courses/cohorts", label: "Live Cohorts" },
      { to: "/courses/campus", label: "On-Campus Bootcamps" },
      { to: "/courses/cloud", label: "Cloud Cert Concierge" },
    ],
  },
  {
    key: "resume",
    title: "Resume Builder",
    icon: FileText,
    items: [
      { to: "/ats-scanner", label: "Instant ATS Score" },
      { to: "/resume", label: "ATS Templates" },
      { to: "/mentor", label: "48h Human Review" },
    ],
  },
  {
    key: "workshops",
    title: "Workshops",
    icon: CalendarDays,
    items: [
      { to: "/workshops/online", label: "Online Workshops" },
      { to: "/workshops/campus", label: "On-Campus Workshops" },
      // { to: "/workshops/live", label: "Course Live Workshops" },
    ],
  },
  {
    key: "community",
    title: "Community",
    icon: Users,
    items: [
      { to: "/community/projects", label: "Projects Assistance" },
      { to: "/community/hackathons", label: "Hackathons" },
    ],
  },
  {
    key: "mock",
    title: "Mock Interviews",
    icon: Mic,
    items: [
      { to: "/mock-interviews/one-one", label: "1:1 Mock Sessions" },
      { to: "/mock-interviews/question-bank", label: "Question Bank" },
    ],
  },
  {
    key: "resources",
    title: "Resources",
    icon: BookOpen,
    items: [
      { to: "/resources/roadmaps", label: "Learning Roadmaps" },
      { to: "/resources/notes", label: "Notes & Cheatsheets" },
    ],
  },
];

export default function Navbar() {
  const auth = useAuth();
  const user = auth?.user ?? null;
  const isAuthed = !!user;
  const logout = auth?.logout ?? (() => {});
  const nav = useNavigate();

  const brandTarget = isAuthed ? "/dashboard" : "/";

  const [scrolled, setScrolled] = useState(false);

  // public "Programs" flyout state
  const [openMenu, setOpenMenu] = useState(false);
  const [openGroup, setOpenGroup] = useState("courses");
  const wrapRef = useRef(null);
  const hoverT = useRef(null);

  // account dropdown
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // nested Programs inside account
  const [acctProgramsOpen, setAcctProgramsOpen] = useState(false);
  const acctProgramsRef = useRef(null);

  const location = useLocation();
  const programsRoutes = [
    "/courses",
    "/resume",
    "/workshops",
    "/community",
    "/mock-interviews",
    "/resources",
  ];
  const programsActive =
    openMenu || programsRoutes.some((p) => location.pathname.startsWith(p));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close menus on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpenMenu(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
        setAcctProgramsOpen(false);
      }
      if (acctProgramsRef.current && !acctProgramsRef.current.contains(e.target)) {
        setAcctProgramsOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const menuOpenNow = () => {
    if (hoverT.current) clearTimeout(hoverT.current);
    setOpenMenu(true);
  };
  const menuCloseDelayed = () => {
    if (hoverT.current) clearTimeout(hoverT.current);
    hoverT.current = setTimeout(() => setOpenMenu(false), 140);
  };

  // underline under public trigger: only show when menu is CLOSED
  const underlineOn = !openMenu && programsActive;

  // derive username + initial + role
  const username =
    user?.name ??
    user?.fullName ??
    (user?.email ? user.email.split("@")[0] : "Account");

  const userInitial = String(username).charAt(0).toUpperCase();

  const roleRaw = (user?.role || user?.type || user?.accountType || "").toString();
  const role = roleRaw
    ? roleRaw.charAt(0).toUpperCase() + roleRaw.slice(1).toLowerCase()
    : "Student"; // fallback

  // role pill tone
  const roleTone =
    role.toLowerCase() === "admin"
      ? "bg-rose-600/20 text-rose-300 border-rose-600/30"
      : role.toLowerCase() === "developer" || role.toLowerCase() === "dev"
      ? "bg-indigo-600/20 text-indigo-300 border-indigo-600/30"
      : "bg-emerald-600/20 text-emerald-300 border-emerald-600/30"; // student/other

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/60 dark:bg-slate-950">
      {/* gradient + glass background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/10 to-transparent" />
        <div
          className={[
            "absolute inset-0 transition-all",
            scrolled ? "bg-slate-950/60 backdrop-blur-md" : "bg-transparent backdrop-blur-0",
          ].join(" ")}
        />
      </div>

      <div className="relative mx-auto flex h-16 md:h-20 max-w-7xl items-center gap-4 px-4 md:px-6 text-white">
        {/* Brand */}
        <Link to={brandTarget} className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-13 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-slate-900 text-3xl font-black shadow-sm">
            Ω
          </span>
          <span className="text-lg md:text-xl font-semibold tracking-tight">
            Omega Skills Academy
          </span>
        </Link>

        <div className="grow" />

        {/* NAV: show only when LOGGED OUT */}
        {!isAuthed && (
          <nav className="hidden md:flex items-center gap-1">
            <NavItem to="/" label="Home" end />
            <NavItem to="/about" label="About" />

            {/* NEW: direct top-level link to Mock Interviews */}
            <NavItem to="/mock-interviews/one-one" label="Mock Interviews" />

            {/* Public Programs dropdown */}
            <div
              ref={wrapRef}
              className="relative"
              onMouseEnter={menuOpenNow}
              onMouseLeave={menuCloseDelayed}
            >
              <button
                type="button"
                onClick={() => setOpenMenu((v) => !v)}
                onKeyDown={(e) => e.key === "Escape" && setOpenMenu(false)}
                className={[
                  "group relative inline-flex items-center gap-1 rounded-lg px-3 py-2 text-[15px] font-semibold tracking-tight",
                  programsActive ? "text-white" : "text-slate-100/90 hover:text-white",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60",
                ].join(" ")}
                aria-haspopup="menu"
                aria-expanded={openMenu}
              >
                Programs
                <ChevronDown
                  className={[
                    "h-4 w-4 transition-transform duration-200",
                    programsActive ? "rotate-180" : "rotate-0",
                  ].join(" ")}
                />
                <span
                  className={[
                    "pointer-events-none absolute bottom-0 left-2 h-[2px] w-10 rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-transparent transition-opacity",
                    underlineOn ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                />
              </button>

              {openMenu && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-[380px] max-w-[92vw] overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 p-2 shadow-2xl backdrop-blur-md"
                >
                  <div className="px-3 pt-1 pb-2">
                    <div className="h-0.5 w-24 rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />
                  </div>

                  <ul className="divide-y divide-white/10">
                    {PROGRAM_SECTIONS.map((sec) => (
                      <AccordionGroup
                        key={sec.key}
                        section={sec}
                        open={openGroup === sec.key}
                        onOpen={() => setOpenGroup(sec.key)}
                      />
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <NavItem to="/contact" label="Contact" />
          </nav>
        )}

        {/* AUTH AREA (visible only when logged in) */}
        {isAuthed && (
          <div className="hidden md:flex items-center gap-3">
            {/* Account dropdown with username */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => {
                  setProfileOpen((v) => !v);
                  if (profileOpen) setAcctProgramsOpen(false);
                }}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2 text-slate-200 hover:bg-slate-900/60 cursor-pointer"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                title={username}
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-orange-500/90 text-slate-900 font-bold">
                  {userInitial}
                </span>
                <span className="hidden sm:block text-sm font-semibold max-w-[160px] truncate">
                  {username}
                </span>
                <ChevronDown className="h-4 w-4 opacity-80" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 p-1 shadow-2xl backdrop-blur">
                  <MenuItem to="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>
                    Dashboard
                  </MenuItem>
                  <MenuItem to="/courses" icon={<BookOpen className="h-4 w-4" />}>
                    Mock tests
                  </MenuItem>

                  {/* Live Workshops entry */}
                  <MenuItem to="/workshops/live" icon={<CalendarDays className="h-4 w-4" />}>
                    courses Live Workshops
                  </MenuItem>

                  {/* NEW: quick link to Mock Interviews */}
                  <MenuItem to="/mock_interviews/one-one" icon={<Mic className="h-4 w-4" />}>
                    Mock Interviews
                  </MenuItem>

                   <MenuItem to="/cloud/cert-concierge" icon={<BookOpen className="h-4 w-4" />}>
                    Cloud
                  </MenuItem>

                  <MenuItem to="/friends" icon={<Users className="h-4 w-4" />}>
                    Friends
                  </MenuItem>

                  <MenuItem to="/profile" icon={<User className="h-4 w-4" />}>
                    Profile
                  </MenuItem>

                  {/* Optional Admin link */}
                  {String(role).toLowerCase() === "admin" && (
                    <MenuItem to="/admin/access" icon={<ChevronRight className="h-4 w-4" />}>
                      Admin
                    </MenuItem>
                  )}

                  {/* ---- Programs nested submenu inside Account ---- */}
                 {/* <button
                    ref={acctProgramsRef}
                    type="button"
                    onMouseEnter={() => setAcctProgramsOpen(true)}
                    onMouseLeave={() => setAcctProgramsOpen(false)}
                    onClick={() => setAcctProgramsOpen((v) => !v)}
                    className="relative mt-1 flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-md bg-orange-500/15 text-orange-300">
                        <BookOpen className="h-4 w-4" />
                      </span>
                      Programs
                    </span>
                    <ChevronRight className="h-4 w-4 opacity-80" />
                    {acctProgramsOpen && (
                      <div
                        className="absolute right-full top-0 mr-2 w-[360px] overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 p-2 shadow-2xl"
                        onMouseEnter={() => setAcctProgramsOpen(true)}
                        onMouseLeave={() => setAcctProgramsOpen(false)}
                      >
                        <div className="px-3 pt-1 pb-2">
                          <div className="h-0.5 w-24 rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />
                        </div>
                        <ul className="divide-y divide-white/10 max-h-[70vh] overflow-auto">
                          {PROGRAM_SECTIONS.map((sec) => (
                            <AccordionGroup
                              key={sec.key}
                              section={sec}
                              open={false}
                              onOpen={() => {}}
                            />
                          ))}
                        </ul>
                      </div>
                    )}
                  </button>*/}

                  <hr className="my-1 border-white/10" />

                  <button
                    onClick={() => {
                      logout();
                      setAcctProgramsOpen(false);
                      setProfileOpen(false);
                      nav("/login", { replace: true });
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10 cursor-pointer"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Role pill */}
            <span
              className={[
                "inline-flex items-center rounded-xl border px-2.5 py-1 text-xs font-semibold",
                roleTone,
              ].join(" ")}
              title={`Role: ${role}`}
            >
              {role}
            </span>
          </div>
        )}

        {/* AUTH CTAs (when logged out) */}
        {!isAuthed && (
          <div className="hidden md:flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              className="h-10 px-3 rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-orange-400"
              title="Log in"
            >
              <Link to="/login" className="flex items-center gap-1">
                <LogIn className="h-4 w-4" /> Log in
              </Link>
            </Button>
            <Button
              asChild
              className="h-10 px-4 rounded-xl bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black"
              title="Create your account"
            >
              <Link to="/signup">Sign up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

/* ---------- small atoms ---------- */
function NavItem({ to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "rounded-lg px-3 py-2 text-[15px] font-semibold tracking-tight transition-colors",
          isActive ? "text-white" : "text-slate-100/90 hover:text-white",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

function MenuItem({ to, icon, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
          isActive ? "bg-white/10 text-white" : "text-slate-200 hover:bg-white/10",
        ].join(" ")
      }
    >
      <span className="grid h-6 w-6 place-items-center rounded-md bg-orange-500/15 text-orange-300">
        {icon}
      </span>
      <span>{children}</span>
    </NavLink>
  );
}

/* Accordion group (used in public Programs and nested submenu) */
function AccordionGroup({ section, open, onOpen }) {
  const Icon = section.icon;
  return (
    <li className="select-none" onMouseEnter={onOpen}>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[14px] font-semibold tracking-tight text-slate-200 hover:bg:white/10 hover:text-white focus:bg-white/10 focus:text-white"
        aria-expanded={open}
      >
        <span className="grid h-6 w-6 place-items-center rounded-md bg-orange-500/15 text-orange-300">
          <Icon className="h-4 w-4" />
        </span>
        <span className="flex-1">{section.title}</span>
        <ChevronRight
          className={["h-4 w-4 transition-transform", open ? "rotate-90" : "rotate-0"].join(" ")}
        />
      </button>

      <div
        className={[
          "grid overflow-hidden transition-all duration-200 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-100",
        ].join(" ")}
      >
        <div className="min-h-0">
          <ul className="pb-2 pl-11 pr-2">
            {section.items.map((it) => (
              <li key={it.to}>
                <NavLink
                  to={it.to}
                  className={({ isActive }) =>
                    [
                      "block rounded-md px-2 py-1.5 text-[13px]",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-slate-200 hover:bg-white/10 hover:text-white",
                    ].join(" ")
                  }
                >
                  {it.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}
