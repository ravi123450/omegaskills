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
  Mic,
  BookOpen,
  User,
  LayoutDashboard,
  Menu,
  X,
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

  // Desktop: public "Programs" flyout state
  const [openMenu, setOpenMenu] = useState(false);
  const [openGroup, setOpenGroup] = useState("courses");
  const wrapRef = useRef(null);
  const hoverT = useRef(null);

  // Desktop: account dropdown
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

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

  // close menus on outside click (desktop)
  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpenMenu(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
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

  // underline under public trigger (desktop): only show when menu is CLOSED
  const underlineOn = !openMenu && programsActive;

  // derive username + initial + role
  const username =
    user?.name ??
    user?.fullName ??
    (user?.email ? user.email.split("@")[0] : "Account");
  const userInitial = String(username).charAt(0).toUpperCase();

  const roleRaw = (
    user?.role ||
    user?.type ||
    user?.accountType ||
    ""
  ).toString();
  const role = roleRaw
    ? roleRaw.charAt(0).toUpperCase() + roleRaw.slice(1).toLowerCase()
    : "Student"; // fallback
  const roleTone =
    role.toLowerCase() === "admin"
      ? "bg-rose-600/20 text-rose-300 border-rose-600/30"
      : role.toLowerCase() === "developer" || role.toLowerCase() === "dev"
      ? "bg-indigo-600/20 text-indigo-300 border-indigo-600/30"
      : "bg-emerald-600/20 text-emerald-300 border-emerald-600/30";

  /* ---------- MOBILE state ---------- */
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileGroupOpen, setMobileGroupOpen] = useState(() =>
    PROGRAM_SECTIONS.reduce((acc, s) => {
      acc[s.key] = false;
      return acc;
    }, {})
  );

  // lock body scroll when mobile menu open
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileOpen]);

  const toggleMobileGroup = (key) =>
    setMobileGroupOpen((m) => ({ ...m, [key]: !m[key] }));

  const closeMobileAll = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/60 dark:bg-slate-950">
      {/* gradient + glass background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/10 to-transparent" />
        <div
          className={[
            "absolute inset-0 transition-all",
            scrolled
              ? "bg-slate-950/60 backdrop-blur-md"
              : "bg-transparent backdrop-blur-0",
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

        {/* ---------------- MOBILE: Hamburger ---------------- */}
        <button
          className="md:hidden inline-flex items-center justify-center rounded-lg p-2 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* ---------------- DESKTOP NAV ---------------- */}
        {!isAuthed && (
          <nav className="hidden md:flex items-center gap-1">
            {/* underline enabled on these items */}
            <NavItem to="/" label="Home" end underline />
            <NavItem to="/about" label="About" underline />
            <NavItem
              to="/mock-interviews/one-one"
              label="Mock Interviews"
              underline
            />

            {/* Public Programs dropdown (unchanged) */}
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
                  programsActive
                    ? "text-white"
                    : "text-slate-100/90 hover:text-white",
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

            <NavItem to="/contact" label="Contact" underline />
          </nav>
        )}

        {isAuthed && (
          <div className="hidden md:flex items-center gap-3">
            {/* Account dropdown with username */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
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
                  <MenuItem
                    to="/dashboard"
                    icon={<LayoutDashboard className="h-4 w-4" />}
                    onSelect={() => setProfileOpen(false)}
                  >
                    Dashboard
                  </MenuItem>

                  <MenuItem
                    to="/courses"
                    icon={<BookOpen className="h-4 w-4" />}
                    onSelect={() => setProfileOpen(false)}
                  >
                    Mock tests
                  </MenuItem>

                  <MenuItem
                    to="/workshops/live"
                    icon={<CalendarDays className="h-4 w-4" />}
                    onSelect={() => setProfileOpen(false)}
                  >
                    courses Live Workshops
                  </MenuItem>

                  <MenuItem
                    to="/mock-interviews/one-one"
                    icon={<Mic className="h-4 w-4" />}
                    onSelect={() => setProfileOpen(false)}
                  >
                    Mock Interviews
                  </MenuItem>

                  <MenuItem
                    to="/cloud/cert-concierge"
                    icon={<BookOpen className="h-4 w-4" />}
                    onSelect={() => setProfileOpen(false)}
                  >
                    Cloud
                  </MenuItem>

                  <MenuItem
                    to="/friends"
                    icon={<Users className="h-4 w-4" />}
                    onSelect={() => setProfileOpen(false)}
                  >
                    Friends
                  </MenuItem>

                  <MenuItem
                    to="/profile"
                    icon={<User className="h-4 w-4" />}
                    onSelect={() => setProfileOpen(false)}
                  >
                    Profile
                  </MenuItem>

                  {String(role).toLowerCase() === "admin" && (
                    <MenuItem
                      to="/admin/access"
                      icon={<ChevronRight className="h-4 w-4" />}
                      onSelect={() => setProfileOpen(false)}
                    >
                      Admin
                    </MenuItem>
                  )}

                  <hr className="my-1 border-white/10" />

                  <button
                    onClick={() => {
                      logout();
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

      {/* ---------------- MOBILE PANEL ---------------- */}
      <div
        className={[
          "md:hidden fixed inset-x-0 top-16 z-50 origin-top overflow-y-auto overscroll-contain border-t border-slate-800/60 bg-slate-950/95 backdrop-blur transition-[max-height,opacity] duration-300",
          mobileOpen ? "max-h-[85vh] opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
        aria-hidden={!mobileOpen}
      >
        <div className="px-4 py-4 pb-[calc(env(safe-area-inset-bottom,0)+1rem)]">
          {!isAuthed ? (
            <>
              <MobileLink to="/" onClick={closeMobileAll} label="Home" />
              <MobileLink to="/about" onClick={closeMobileAll} label="About" />
              <MobileLink
                to="/mock-interviews/one-one"
                onClick={closeMobileAll}
                label="Mock Interviews"
              />

              {/* Programs accordion */}
              <div className="mt-2 rounded-xl border border-white/10 bg-white/5">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-3 text-[15px] font-semibold"
                  onClick={() => toggleMobileGroup("__programs")}
                  aria-expanded={mobileGroupOpen["__programs"] || false}
                >
                  <span className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-md bg-orange-500/15 text-orange-300">
                      <BookOpen className="h-4 w-4" />
                    </span>
                    Programs
                  </span>
                  <ChevronDown
                    className={[
                      "h-4 w-4 transition-transform",
                      mobileGroupOpen["__programs"] ? "rotate-180" : "rotate-0",
                    ].join(" ")}
                  />
                </button>

                <div
                  className={[
                    "grid overflow-hidden transition-all duration-200",
                    mobileGroupOpen["__programs"]
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-100",
                  ].join(" ")}
                >
                  <div className="min-h-0">
                    <ul className="divide-y divide-white/10">
                      {PROGRAM_SECTIONS.map((sec) => (
                        <li key={sec.key}>
                          <button
                            type="button"
                            onClick={() => toggleMobileGroup(sec.key)}
                            className="flex w-full items-center justify-between px-3 py-3 text-[14px] font-semibold text-slate-200"
                            aria-expanded={mobileGroupOpen[sec.key] || false}
                          >
                            <span className="flex items-center gap-2">
                              <span className="grid h-6 w-6 place-items-center rounded-md bg-orange-500/15 text-orange-300">
                                <sec.icon className="h-4 w-4" />
                              </span>
                              {sec.title}
                            </span>
                            <ChevronRight
                              className={[
                                "h-4 w-4 transition-transform",
                                mobileGroupOpen[sec.key]
                                  ? "rotate-90"
                                  : "rotate-0",
                              ].join(" ")}
                            />
                          </button>

                          <div
                            className={[
                              "grid overflow-hidden transition-all duration-200 ease-out",
                              mobileGroupOpen[sec.key]
                                ? "grid-rows-[1fr] opacity-100"
                                : "grid-rows-[0fr] opacity-100",
                            ].join(" ")}
                          >
                            <div className="min-h-0">
                              <ul className="pb-2 pl-12 pr-2">
                                {sec.items.map((it) => (
                                  <li key={it.to}>
                                    <NavLink
                                      to={it.to}
                                      onClick={closeMobileAll}
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
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <MobileLink
                to="/contact"
                onClick={closeMobileAll}
                label="Contact"
              />

              {/* Auth buttons */}
              <div className="mt-4 flex gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="h-10 px-3 flex-1 rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-orange-400"
                  title="Log in"
                  onClick={closeMobileAll}
                >
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-1"
                  >
                    <LogIn className="h-4 w-4" /> Log in
                  </Link>
                </Button>
                <Button
                  asChild
                  className="h-10 px-4 flex-1 rounded-xl bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black"
                  title="Create your account"
                  onClick={closeMobileAll}
                >
                  <Link to="/signup">Sign up</Link>
                </Button>
              </div>
            </>
          ) : (
            // --------- Mobile (Authed) ---------
            <>
              {/* Account summary */}
              <div className="mb-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-orange-500/90 text-slate-900 font-bold">
                    {String(username).charAt(0).toUpperCase()}
                  </span>
                  <div className="leading-tight">
                    <div className="text-sm font-semibold">{username}</div>
                    <div
                      className={[
                        "mt-1 inline-flex items-center rounded-xl border px-2 py-0.5 text-[11px] font-semibold",
                        roleTone,
                      ].join(" ")}
                    >
                      {role}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="h-9 px-3 rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-orange-400"
                  onClick={() => {
                    closeMobileAll();
                    nav("/dashboard");
                  }}
                >
                  Dashboard
                </Button>
              </div>

              {/* Quick links */}
              <MobileLink
                to="/courses"
                onClick={closeMobileAll}
                label="Mock tests"
              />
              <MobileLink
                to="/workshops/live"
                onClick={closeMobileAll}
                label="courses Live Workshops"
              />
              <MobileLink
                to="/mock-interviews/one-one"
                onClick={closeMobileAll}
                label="Mock Interviews"
              />
              <MobileLink
                to="/cloud/cert-concierge"
                onClick={closeMobileAll}
                label="Cloud"
              />
              <MobileLink
                to="/friends"
                onClick={closeMobileAll}
                label="Friends"
              />
              <MobileLink
                to="/profile"
                onClick={closeMobileAll}
                label="Profile"
              />

              {/* NEW: Admin link on mobile when role is admin */}
              {String(role).toLowerCase() === "admin" && (
                <MobileLink
                  to="/admin/access"
                  onClick={closeMobileAll}
                  label="Admin"
                />
              )}

              {/* Sign out */}
              <button
                onClick={() => {
                  logout();
                  closeMobileAll();
                  nav("/login", { replace: true });
                }}
                className="mt-4 flex w-full items-center justify-center rounded-xl bg-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/15"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* ---------- small atoms ---------- */
function NavItem({ to, label, end, underline = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "group relative rounded-lg px-3 py-2 text-[15px] font-semibold tracking-tight transition-colors",
          isActive ? "text-orange-400" : "text-slate-100/90 hover:text-white",
        ].join(" ")
      }
    >
      {/* label */}
      <span>{label}</span>

      {/* slim underline (only for desktop items with underline=true) */}
      {underline && (
        <span
          className={[
            "pointer-events-none absolute left-3 right-3 -bottom-0.5 h-[2px] origin-left rounded-full",
            "bg-gradient-to-r from-orange-500 via-amber-400 to-transparent",
            "transition-transform duration-200",
            "scale-x-0 group-hover:scale-x-100",
          ].join(" ")}
        />
      )}
    </NavLink>
  );
}

function MenuItem({ to, icon, children, onSelect }) {
  return (
    <NavLink
      to={to}
      onClick={() => {
        if (typeof onSelect === "function") onSelect();
      }}
      className={({ isActive }) =>
        [
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
          isActive
            ? "bg-white/10 text-white"
            : "text-slate-200 hover:bg-white/10",
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

/* Desktop accordion group (public Programs flyout) */
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
          className={[
            "h-4 w-4 transition-transform",
            open ? "rotate-90" : "rotate-0",
          ].join(" ")}
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

/* Mobile link item */
function MobileLink({ to, onClick, label }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "block w-full rounded-xl px-3 py-3 text-[15px] font-semibold",
          isActive
            ? "bg-white/10 text-white"
            : "text-slate-200 hover:bg-white/10 hover:text-white",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

