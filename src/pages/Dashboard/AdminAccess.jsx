// src/pages/AdminAccess.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import {
  getCourses,
  grantAccessBulk,
  createCourse,
  deleteCourse,
  // mock interviews api
  getMockSlots,
  createMockSlot,
  deleteMockSlot,
  toggleMockSlot,
} from "@/lib/api";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Users,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  Loader2,
  ChevronDown,
  CalendarDays,
  Trash2,
  Link as LinkIcon,
  Save,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

export default function AdminAccess({ token }) {
  // --------- Auth fallback ----------
  const auth = useAuth?.();
  const authToken =
    token ??
    auth?.token ??
    auth?.auth_token ??
    auth?.auth?.token ??
    auth?.auth?.auth_token ??
    auth?.user?.token ??
    undefined;

  // --------- Data state ----------
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadErr, setLoadErr] = useState("");
  const [selectOpen, setSelectOpen] = useState(false);

  // selection
  const [course, setCourse] = useState("");

  // bulk access
  const [emails, setEmails] = useState("");
  const parsedList = useMemo(
    () =>
      Array.from(
        new Set(
          emails
            .split(/\s|,|;/)
            .map((e) => e.trim().toLowerCase())
            .filter(Boolean)
        )
      ),
    [emails]
  );
  const [submittingAccess, setSubmittingAccess] = useState(false);
  const [accessMsg, setAccessMsg] = useState("");
  const [accessErr, setAccessErr] = useState("");

  // create course
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState("");
  const [createErr, setCreateErr] = useState("");

  // delete course
  const [deletingId, setDeletingId] = useState(null);

  // --------- Load courses ----------
  async function loadCourses() {
    setLoadErr("");
    try {
      setLoadingCourses(true);
      const list = await getCourses(authToken);
      setCourses(Array.isArray(list) ? list : []);
    } catch (e) {
      setLoadErr(e?.message || "Failed to fetch courses.");
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingCourses(true);
        const list = await getCourses(authToken);
        if (!cancelled) setCourses(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!cancelled) setLoadErr(e?.message || "Failed to fetch courses.");
      } finally {
        if (!cancelled) setLoadingCourses(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authToken]);

  // --------- Create course ----------
  async function onCreate() {
    setCreateMsg("");
    setCreateErr("");

    if (!title.trim()) {
      setCreateErr("Please enter a course title.");
      return;
    }

    setCreating(true);
    try {
      const created = await createCourse(authToken, {
        title: title.trim(),
        description: desc.trim(),
        is_public: !!isPublic,
      });

      setCourses((prev) => [created, ...(Array.isArray(prev) ? prev : [])]);
      setTitle("");
      setDesc("");
      setIsPublic(false);
      setCreateMsg("Course created");
    } catch (e) {
      setCreateErr(e?.message || "Could not create course.");
    } finally {
      setCreating(false);
    }
  }

  // --------- DELETE course (Admin) ----------
  async function onRemoveCourse(id) {
    if (!id) return;
    const target = courses.find((c) => String(c.id) === String(id));
    const name = target?.title || "this course";
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;

    setDeletingId(id);
    setLoadErr("");
    try {
      await deleteCourse(authToken, id);
      setCourses((prev) => prev.filter((c) => String(c.id) !== String(id)));
      if (String(course) === String(id)) setCourse("");
    } catch (e) {
      setLoadErr(e?.message || "Failed to delete course.");
    } finally {
      setDeletingId(null);
    }
  }

  // --------- Grant bulk access ----------
  async function submitAccess() {
    setAccessMsg("");
    setAccessErr("");

    if (!course) {
      setAccessErr("Please select a course.");
      return;
    }
    if (parsedList.length === 0) {
      setAccessErr("Please enter at least one valid email.");
      return;
    }

    setSubmittingAccess(true);
    try {
      await grantAccessBulk(authToken, course, parsedList);
      setAccessMsg(
        `Access granted to ${parsedList.length} ${parsedList.length === 1 ? "email" : "emails"}`
      );
      setEmails("");
    } catch (e) {
      setAccessErr(e?.message || "Grant access failed.");
    } finally {
      setSubmittingAccess(false);
    }
  }

  /* -------------------- Live Workshops (localStorage) -------------------- */
  const WS_LIST_KEY = "live_workshops_list";
  const WS_FORM_KEY = "live_workshops_form_url";

  const [wsTitle, setWsTitle] = useState("");
  const [wsDesc, setWsDesc] = useState("");
  const [wsDate, setWsDate] = useState("");
  const [wsList, setWsList] = useState([]);
  const [wsFormUrl, setWsFormUrl] = useState("");
  const [wsMsg, setWsMsg] = useState("");
  const [wsErr, setWsErr] = useState("");

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(WS_LIST_KEY) || "[]");
      setWsList(Array.isArray(raw) ? raw : []);
    } catch {
      setWsList([]);
    }
    setWsFormUrl(localStorage.getItem(WS_FORM_KEY) || "");
  }, []);

  const persistWsList = (next) => {
    try {
      localStorage.setItem(WS_LIST_KEY, JSON.stringify(next));
      setWsList(next);
      setWsMsg("Workshops updated.");
      setWsErr("");
    } catch {
      setWsErr("Could not save workshops.");
      setWsMsg("");
    }
  };

  const persistFormUrl = () => {
    try {
      localStorage.setItem(WS_FORM_KEY, wsFormUrl.trim());
      setWsMsg("Registration form link saved.");
      setWsErr("");
    } catch {
      setWsErr("Could not save form link.");
      setWsMsg("");
    }
  };

  const addWorkshop = () => {
    setWsMsg("");
    setWsErr("");
    if (!wsTitle.trim()) {
      setWsErr("Please enter a workshop title.");
      return;
    }
    const item = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: wsTitle.trim(),
      description: wsDesc.trim(),
      date: wsDate.trim(),
    };
    const next = [item, ...wsList];
    persistWsList(next);
    setWsTitle("");
    setWsDesc("");
    setWsDate("");
  };

  const removeWorkshop = (id) => {
    const next = wsList.filter((w) => w.id !== id);
    persistWsList(next);
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-[70vh]">
      {/* background blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-[90px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-[110px]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">
        {/* header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge className="bg-orange-600/20 text-orange-300">Admin</Badge>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold">
              Admin — Courses & Access
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Create courses, remove courses, and grant access in bulk to enrolled students.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="border-slate-700 text-slate-200 hover:bg-slate-800 cursor-pointer"
              onClick={loadCourses}
              disabled={loadingCourses}
            >
              {loadingCourses ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing…
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </div>

        {/* ----- Create Course Card ----- */}
        <Card className="mb-6 border border-slate-800/60 bg-slate-900/40">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Badge className="bg-slate-700/50 text-slate-300 border border-orange-500">
                Create
              </Badge>
              <h2 className="text-lg font-semibold">Create a new course</h2>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-200">
                  Title
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-orange-500"
                  placeholder="Course title (e.g., Data Science Bootcamp)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <label className="inline-flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-orange-500"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                  />
                  Public course
                </label>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium text-slate-200">
                Description <span className="text-slate-400">(optional)</span>
              </label>
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-orange-500"
                rows={4}
                placeholder="Short description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Button
                className="bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black cursor-pointer"
                onClick={onCreate}
                disabled={creating}
              >
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Course
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="border-slate-700 text-slate-200 hover:bg-slate-800 cursor-pointer"
                onClick={loadCourses}
                disabled={loadingCourses}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh list
              </Button>
            </div>

            {(createMsg || createErr) && (
              <div className="mt-4">
                {createMsg && (
                  <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-600/30 bg-emerald-600/15 px-3 py-2 text-sm text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{createMsg}</span>
                  </div>
                )}
                {createErr && (
                  <div className="inline-flex items-center gap-2 rounded-lg border border-rose-600/30 bg-rose-600/15 px-3 py-2 text-sm text-rose-300">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{createErr}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ----- Manage Courses (list + remove) ----- */}
        <Card className="mb-6 border border-slate-800/60 bg-slate-900/40">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Badge className="bg-slate-700/50 text-slate-300 border border-orange-600">
                Manage
              </Badge>
              <h2 className="text-lg font-semibold">Courses</h2>
            </div>

            {loadErr && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-rose-600/30 bg-rose-600/15 px-3 py-2 text-sm text-rose-300">
                <AlertTriangle className="h-4 w-4" />
                <span>{loadErr}</span>
              </div>
            )}

            {loadingCourses ? (
              <div className="mt-4 text-sm text-slate-400">Loading courses…</div>
            ) : courses.length === 0 ? (
              <div className="mt-4 text-sm text-slate-300">No courses yet.</div>
            ) : (
              <div className="mt-4 divide-y divide-slate-800/60">
                {courses.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-orange-300" />
                        <span className="font-medium">{c.title}</span>
                        <span
                          className={[
                            "ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
                            c.is_public
                              ? "border-emerald-600/30 bg-emerald-600/15 text-emerald-300"
                              : "border-slate-600/40 bg-slate-700/20 text-slate-300",
                          ].join(" ")}
                        >
                          {c.is_public ? "Public" : "Private"}
                        </span>
                      </div>
                      {c.description && (
                        <div className="mt-1 max-w-[60ch] truncate text-sm text-slate-400">
                          {c.description}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        className="border-rose-600/40 text-rose-300 hover:bg-rose-600/10 cursor-pointer"
                        onClick={() => onRemoveCourse(c.id)}
                        disabled={deletingId === c.id}
                        title="Remove course"
                      >
                        {deletingId === c.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ----- NEW: Bulk Access Card ----- */}
        <Card className="mb-6 border border-slate-800/60 bg-slate-900/40">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Badge className="bg-slate-700/50 text-slate-300 border border-orange-600">
                Access
              </Badge>
              <h2 className="text-lg font-semibold">Bulk access for a course</h2>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-200">
                  Course
                </label>
                <div className="relative mt-1">
                  <select
                    className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-orange-500"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    onBlur={() => setSelectOpen(false)}
                    onClick={() => setSelectOpen((s) => !s)}
                  >
                    <option value="">Select…</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} {c.is_public ? "(Public)" : "(Private)"}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 ${selectOpen ? "opacity-70" : "opacity-50"}`}
                  />
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-200">
                  Student Emails
                  <span className="text-slate-400"> (comma/space/newline separated)</span>
                </label>
                <textarea
                  className="mt-1 h-[92px] w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-orange-500"
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  placeholder="alice@example.com, bob@example.com&#10;charlie@example.com"
                />
              </div>
            </div>

            <div className="mt-2 text-xs text-slate-400">
              {parsedList.length > 0
                ? `Detected ${parsedList.length} unique email${parsedList.length === 1 ? "" : "s"}.`
                : "Paste one or more student emails."}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Button
                className="bg-orange-500 text-slate-900 hover:bg-orange-400 cursor-pointer"
                onClick={submitAccess}
                disabled={!course || parsedList.length === 0 || submittingAccess}
              >
                {submittingAccess ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Granting…
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Grant Access
                  </>
                )}
              </Button>
            </div>

            {(accessMsg || accessErr) && (
              <div className="mt-3">
                {accessMsg && (
                  <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-600/30 bg-emerald-600/15 px-3 py-2 text-sm text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{accessMsg}</span>
                  </div>
                )}
                {accessErr && (
                  <div className="inline-flex items-center gap-2 rounded-lg border border-rose-600/30 bg-rose-600/15 px-3 py-2 text-sm text-rose-300">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{accessErr}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ==================== 1:1 Mock Interviews (Admin) ==================== */}
        <Card className="mt-6 border border-slate-800/60 bg-slate-900/40">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Badge className="bg-slate-700/50 text-slate-300 border border-orange-500">
                Mock Interviews
              </Badge>
              <h2 className="text-lg font-semibold">1:1 Mock Sessions — Slots</h2>
            </div>
            <p className="mt-1 text-sm text-slate-300">
              Add interview slots (any track name). These appear on the public page
              <b> “1:1 Mock Interviews”</b>. You can also set a global Google Form link
              used as the booking link on that page.
            </p>

            <MockAdminForm authToken={authToken} />
          </CardContent>
        </Card>

        {/* ==================== Live Workshops Admin (no backend) ==================== */}
        <Card className="mt-6 border border-slate-800/60 bg-slate-900/40">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Badge className="bg-slate-700/50 text-slate-300 border border-orange-500">
                Workshops
              </Badge>
              <h2 className="text-lg font-semibold">
                Course Live Workshops (no backend)
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-300">
              Add live workshop entries and a single Google Form link used for all
              registrations. These appear for users in <b>Dashboard → Course Live Workshops</b>.
            </p>

            {/* Global Form URL */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-200">
                Google Form URL (applies to all workshops)
              </label>
              <div className="mt-2 flex items-center gap-2">
                <LinkIcon className="h-4 w-4 opacity-70" />
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-orange-500"
                  placeholder="https://docs.google.com/forms/..."
                  value={wsFormUrl}
                  onChange={(e) => setWsFormUrl(e.target.value)}
                />
                <Button
                  className="bg-orange-500 text-slate-900 hover:bg-orange-400"
                  onClick={persistFormUrl}
                  title="Save form URL"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>

            {/* Add workshop */}
            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-200">
                  Workshop Title
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-orange-500"
                  placeholder="e.g., Data Science with Python"
                  value={wsTitle}
                  onChange={(e) => setWsTitle(e.target.value)}
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-200">
                  Date & Time (optional)
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-orange-500"
                  placeholder="e.g., 25 Oct, 7:00–8:30 PM"
                  value={wsDate}
                  onChange={(e) => setWsDate(e.target.value)}
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-200">
                  Description (optional)
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-orange-500"
                  placeholder="Short description"
                  value={wsDesc}
                  onChange={(e) => setWsDesc(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-3">
              <Button
                className="bg-orange-500 text-slate-900 hover:bg-orange-400"
                onClick={addWorkshop}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Workshop
              </Button>
            </div>

            {(wsMsg || wsErr) && (
              <div className="mt-4">
                {wsMsg && (
                  <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-600/30 bg-emerald-600/15 px-3 py-2 text-sm text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{wsMsg}</span>
                  </div>
                )}
                {wsErr && (
                  <div className="inline-flex items-center gap-2 rounded-lg border border-rose-600/30 bg-rose-600/15 px-3 py-2 text-sm text-rose-300">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{wsErr}</span>
                  </div>
                )}
              </div>
            )}

            {/* Current list */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {wsList.length === 0 ? (
                <Card className="border-slate-800/60 bg-slate-900/30">
                  <CardContent className="p-4 text-sm text-slate-300">
                    No workshops added yet.
                  </CardContent>
                </Card>
              ) : (
                wsList.map((w) => (
                  <Card key={w.id} className="border-slate-800/60 bg-slate-900/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-orange-300" />
                            <div className="font-semibold">{w.title}</div>
                          </div>
                          {w.date && (
                            <div className="mt-1 flex items-center gap-2 text-xs text-slate-300">
                              <CalendarDays className="h-4 w-4" />
                              <span>{w.date}</span>
                            </div>
                          )}
                          {w.description && (
                            <div className="mt-1 text-sm text-slate-300/90">
                              {w.description}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          className="border-slate-700 text-slate-200 hover:bg-slate-800"
                          onClick={() => removeWorkshop(w.id)}
                          title="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ==================== Mock Interviews Admin sub-component ==================== */
function MockAdminForm({ authToken }) {
  // global form link (localStorage)
  const MOCK_FORM_KEY = "mock_interviews_form_url";
  const [formUrl, setFormUrl] = useState("");
  const [formMsg, setFormMsg] = useState("");
  const [formErr, setFormErr] = useState("");

  useEffect(() => {
    setFormUrl(localStorage.getItem(MOCK_FORM_KEY) || "");
  }, []);

  const saveFormUrl = () => {
    try {
      localStorage.setItem(MOCK_FORM_KEY, formUrl.trim());
      setFormMsg("Booking Form URL saved.");
      setFormErr("");
      setTimeout(() => setFormMsg(""), 1500);
    } catch {
      setFormErr("Could not save form URL.");
      setFormMsg("");
    }
  };

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // form fields
  const [track, setTrack] = useState("DSA"); // now free text
  const [day, setDay] = useState("Fri");
  const [timeRange, setTimeRange] = useState("7:30–8:30 PM");
  const [tz, setTz] = useState("IST");
  const [mode, setMode] = useState("Live on Zoom");
  const [capacity, setCapacity] = useState(1);
  const [notes, setNotes] = useState("");

  const [creating, setCreating] = useState(false);
  const [workingId, setWorkingId] = useState(null);

  async function load() {
    setErr("");
    try {
      setLoading(true);
      const list = await getMockSlots(authToken);
      setSlots(Array.isArray(list) ? list : []);
    } catch (e) {
      setErr(e?.message || "Failed to load slots");
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  async function onCreate() {
    setErr("");
    if (!track.trim() || !day.trim() || !timeRange.trim()) {
      setErr("Please fill track, day and time.");
      return;
    }
    setCreating(true);
    try {
      const created = await createMockSlot(authToken, {
        track: track.trim(),
        day_label: day.trim(),
        time_label: timeRange.trim(),
        tz: tz.trim(),
        mode: mode.trim(),
        capacity: Number(capacity) || 1,
        notes,
        is_active: true,
      });
      setSlots((p) => [created, ...p]);
      setNotes("");
    } catch (e) {
      setErr(e?.message || "Failed to create slot");
    } finally {
      setCreating(false);
    }
  }

  async function onDelete(id) {
    if (!window.confirm("Delete this slot?")) return;
    setWorkingId(id);
    try {
      await deleteMockSlot(authToken, id);
      setSlots((p) => p.filter((s) => s.id !== id));
    } catch (e) {
      setErr(e?.message || "Delete failed");
    } finally {
      setWorkingId(null);
    }
  }

  async function onToggle(id) {
    setWorkingId(id);
    try {
      const r = await toggleMockSlot(authToken, id);
      setSlots((p) =>
        p.map((s) => (s.id === id ? { ...s, is_active: r.is_active } : s))
      );
    } catch (e) {
      setErr(e?.message || "Toggle failed");
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <>
      {/* Global booking form URL */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-200">
          Booking Google Form URL (applies to all mock interviews)
        </label>
        <div className="mt-2 flex items-center gap-2">
          <LinkIcon className="h-4 w-4 opacity-70" />
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-orange-500"
            placeholder="https://docs.google.com/forms/..."
            value={formUrl}
            onChange={(e) => setFormUrl(e.target.value)}
          />
          <Button className="bg-orange-500 text-slate-900 hover:bg-orange-400" onClick={saveFormUrl}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
        {(formMsg || formErr) && (
          <div className="mt-2 text-sm">
            {formMsg && (
              <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-600/30 bg-emerald-600/15 px-3 py-1 text-emerald-300">
                <CheckCircle2 className="h-4 w-4" /> {formMsg}
              </span>
            )}
            {formErr && (
              <span className="inline-flex items-center gap-2 rounded-lg border border-rose-600/30 bg-rose-600/15 px-3 py-1 text-rose-300">
                <AlertTriangle className="h-4 w-4" /> {formErr}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Add form */}
      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-slate-200">Track</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none"
            placeholder="e.g., DSA / System Design / Behavioral / DevOps..."
            value={track}
            onChange={(e) => setTrack(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200">Day</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none"
            placeholder="Fri"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200">Time</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none"
            placeholder="7:30–8:30 PM"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200">Timezone</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none"
            placeholder="IST"
            value={tz}
            onChange={(e) => setTz(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200">Mode</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none"
            placeholder="Live on Zoom"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200">Capacity</label>
          <input
            type="number"
            min={1}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-slate-200">
            Notes <span className="text-slate-400">(optional)</span>
          </label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none"
            placeholder="Any extra info"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-3">
        <Button
          className="bg-orange-500 text-slate-900 hover:bg-orange-400"
          onClick={onCreate}
          disabled={creating}
        >
          {creating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <PlusCircle className="mr-2 h-4 w-4" />
          )}
          Add Slot
        </Button>
      </div>

      {err && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-rose-600/30 bg-rose-600/15 px-3 py-2 text-sm text-rose-300">
          <AlertTriangle className="h-4 w-4" />
          <span>{err}</span>
        </div>
      )}

      {/* Slots list */}
      <div className="mt-6 grid grid-cols-1 gap-3">
        {loading ? (
          <Card className="border-slate-800/60 bg-slate-900/30">
            <CardContent className="p-4 text-sm text-slate-300">Loading…</CardContent>
          </Card>
        ) : slots.length === 0 ? (
          <Card className="border-slate-800/60 bg-slate-900/30">
            <CardContent className="p-4 text-sm text-slate-300">No slots yet.</CardContent>
          </Card>
        ) : (
          slots.map((s) => (
            <Card key={s.id} className="border-slate-800/60 bg-slate-900/30">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs tracking-wide text-slate-400">{s.track}</div>
                    <div className="text-base font-semibold">
                      {s.day_label} • {s.time_label} {s.tz}
                    </div>
                    <div className="text-xs text-slate-400">
                      {s.mode} • {s.capacity} seat{s.capacity > 1 ? "s" : ""}
                      {s.notes ? ` • ${s.notes}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="border-slate-700 text-slate-200 hover:bg-slate-800"
                      onClick={() => onToggle(s.id)}
                      disabled={workingId === s.id}
                      title={s.is_active ? "Make inactive" : "Make active"}
                    >
                      {s.is_active ? (
                        <ToggleRight className="mr-2 h-4 w-4 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="mr-2 h-4 w-4 text-slate-400" />
                      )}
                      {s.is_active ? "Active" : "Inactive"}
                    </Button>
                    <Button
                      variant="outline"
                      className="border-rose-600/40 text-rose-300 hover:bg-rose-600/10"
                      onClick={() => onDelete(s.id)}
                      disabled={workingId === s.id}
                    >
                      {workingId === s.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
