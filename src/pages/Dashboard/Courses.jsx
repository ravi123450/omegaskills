// src/pages/Courses.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCourses, getExams } from "@/lib/api";


// UI (shadcn)
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import TeachersDayOffer from "../../components/TeachersDayOffer";


// Icons
import { BookOpen, Clock, Layers, Lock, LockOpen } from "lucide-react";


/* ---------------- Razorpay Payment Button helper ---------------- */
function PaymentButtonForm({ paymentButtonId, className }) {
  const formRef = useRef(null);


  useEffect(() => {
    if (!formRef.current) return;


    // Remove any leftover script (hot reload or re-renders)
    const prev = formRef.current.querySelector(
      "script[src*='checkout.razorpay.com/v1/payment-button.js']"
    );
    if (prev) prev.remove();


    // Create and append Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/payment-button.js";
    script.async = true;
    script.setAttribute("data-payment_button_id", paymentButtonId);


    // Optional: customize button label via data attributes
    // script.setAttribute("data-button_text", "Enroll Now");


    formRef.current.appendChild(script);


    return () => {
      // Clean up on unmount
      script.remove();
    };
  }, [paymentButtonId]);


  // Stop click bubbling so card onClick doesn't trigger when user clicks the pay button
  const stopCardClick = (e) => e.stopPropagation();


  return (
    <form
      ref={formRef}
      onClick={stopCardClick}
      className={className}
      // You can add hidden inputs here if your Razorpay setup needs them.
    />
  );
}


export default function Courses({ token }) {
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);


  const [activeCourse, setActiveCourse] = useState(null);
  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [error, setError] = useState("");


  const navigate = useNavigate();
  const location = useLocation();
  const openCourseId = location?.state?.openCourseId ?? null;


  // NEW: ref to the mock tests section
  const mockRef = useRef(null);


  // helper to scroll to the mock tests section smoothly
  const scrollToMocks = () => {
    requestAnimationFrame(() => {
      if (mockRef.current) {
        mockRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };


  // Load courses
  useEffect(() => {
    (async () => {
      try {
        const list = await getCourses(token);
        setCourses(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingCourses(false);
      }
    })();
  }, [token]);


  // Auto-open course
  useEffect(() => {
    if (!openCourseId || !courses?.length) return;
    const target = courses.find((c) => String(c.id) === String(openCourseId));
    if (target) openCourse(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openCourseId, courses]);


  // Open a course and fetch its exams
  const openCourse = async (course) => {
    setActiveCourse(course);
    setExams([]);
    setError("");
    setLoadingExams(true);


    scrollToMocks();


    try {
      const list = await getExams(token, course.id);
      setExams(Array.isArray(list) ? list : []);
    } catch (e) {
      const msg = e?.data?.error || e.message || "Failed to load mock tests.";
      setError(msg);
    } finally {
      setLoadingExams(false);
      scrollToMocks();
    }
  };


  const startExam = (exam) => {
    if (!exam) return;
    try {
      sessionStorage.setItem("pendingExam", JSON.stringify(exam));
    } catch {}
    navigate("/exam", { state: { exam } });
  };


  const questionsLabel = (ex) =>
    ex?.num_questions ? `${ex.num_questions} Questions` : "90 Questions";


  // ⬅️ Put your real Razorpay Payment Button ID here
  const PAYMENT_BUTTON_ID = "pl_RC4fYVag9khclc";


  return (
    <main className="bg-slate-950 text-slate-100 min-h-[70vh]">
      {/* Background blobs */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-[90px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-[110px]" />
      </div>


      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* HERO */}
        <div className="mb-6">
          <Badge className="bg-orange-600/20 text-orange-300">Mock tests</Badge>
          <h1 className="mt-2 text-3xl font-extrabold">Placement &amp; Mock Tests</h1>
          <p className="mt-2 text-sm text-slate-300">
            Placement Preparation Mock Tests
          </p>
        </div>
          

        {/* COURSES GRID */}
        <div className="mt-6">
          <h2 className="mb-4 text-xl font-bold md:text-2xl">Available Mock tests</h2>


          {loadingCourses ? (
            <Card className="border border-slate-800/60 bg-slate-900/40">
              <CardContent className="space-y-3 p-6">
                <div className="h-5 w-1/3 animate-pulse rounded bg-slate-800/50" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-800/50" />
                <div className="h-4 w-2/4 animate-pulse rounded bg-slate-800/50" />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* ---------- STATIC ALL-IN-ONE BUNDLE CARD (added) ---------- */}
              <Card className="border border-amber-500/30 bg-gradient-to-br from-slate-900/60 to-slate-900/30">
                <CardContent className="p-5">
                  <div className="mb-4 h-24 w-full rounded-lg bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-pink-500/20" />
                  <h3 className="text-base font-semibold md:text-lg">
                    All-in-One Mock Test Bundle
                  </h3>
                  <p className="mt-1 text-sm text-slate-300">
                    Includes <b>Logical Reasoning</b>, <b>Quantitative Aptitude</b>,{" "}
                    <b>Verbal Ability</b>, and <b>Soft Skills Mastery</b>.
                  </p>


                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge className="bg-slate-800/60 text-slate-200">Logical Reasoning</Badge>
                    <Badge className="bg-slate-800/60 text-slate-200">Quantitative Aptitude</Badge>
                    <Badge className="bg-slate-800/60 text-slate-200">Verbal Ability</Badge>
                    <Badge className="bg-slate-800/60 text-slate-200">Soft Skills Mastery</Badge>
                  </div>


                  {/* Standalone Razorpay button for bundle (exact snippet) */}
                
               <div className="mt-3">
  <a
    href="https://pages.razorpay.com/omegaskills1"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-block rounded bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-lg hover:from-green-400 hover:to-emerald-500 transition-all duration-200"
    onClick={(e) => e.stopPropagation()}
  >
    Buy Course
  </a>
</div>


                </CardContent>
              </Card>
              {/* ---------- END STATIC BUNDLE CARD ---------- */}


              {courses.map((c) => (
                <Card
                  key={c.id}
                  className="cursor-pointer border border-slate-800/60 bg-slate-900/40 transition hover:bg-slate-900/60"
                  onClick={() => openCourse(c)}
                >
                  <CardContent className="p-5">
                    <div className="mb-4 h-24 w-full rounded-lg bg-gradient-to-br from-slate-800/60 to-slate-900/60" />
                    <h3 className="text-base font-semibold md:text-lg">{c.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {c.description || "Curated content with per-topic analytics."}
                    </p>


                    <div className="mt-4 flex items-center justify-between">
                      <span
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs border"
                        title={c.is_public ? "Public" : "Private"}
                        style={{ borderColor: "rgba(148,163,184,0.4)" }}
                      >
                        {c.is_public ? (
                          <>
                            <LockOpen className="h-3.5 w-3.5 text-emerald-300" />
                            <span className="text-slate-200">Public</span>
                          </>
                        ) : (
                          <>
                            <Lock className="h-3.5 w-3.5 text-rose-300" />
                            <span className="text-slate-200">Private</span>
                          </>
                        )}
                      </span>


                      <Button
                        size="sm"
                        type="button"
                        className="cursor-pointer bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCourse(c);
                        }}
                      >
                        Open
                      </Button>
                    </div>


                    {/* Razorpay Payment Button (renders inside this form) */}
                     <div className="mt-3">
  <a
    href="https://rzp.io/rzp/omegaskills"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-block rounded bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-lg hover:from-green-400 hover:to-emerald-500 transition-all duration-200"
    onClick={(e) => e.stopPropagation()}
  >
    Buy Course
  </a>
</div>
                  </CardContent>
                </Card>
              ))}


              {courses.length === 0 && (
                <Card className="border border-slate-800/60 bg-slate-900/40">
                  <CardContent className="p-5 text-sm text-slate-300">
                    No courses available yet.
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>


        {/* SELECTED COURSE & EXAMS */}
        {activeCourse && (
          <div ref={mockRef} className="mt-10">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold md:text-xl">
                {activeCourse.title} — Mock Tests
              </h2>
              <span className="text-xs text-slate-400">
                {loadingExams ? "Loading…" : (exams?.length || 0) + " tests"}
              </span>
            </div>


            {loadingExams && (
              <Card className="border border-slate-800/60 bg-slate-900/40">
                <CardContent className="space-y-2 p-5">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-800/50" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-800/50" />
                </CardContent>
              </Card>
            )}


            {!loadingExams && error && (
              <Card className="border border-rose-600/30 bg-rose-600/10">
                <CardContent className="p-4 text-sm text-rose-200">
                  {error}{" "}
                  {error.toLowerCase().includes("access") && (
                    <span className="text-rose-300/90">
                      &nbsp;Ask your coordinator/admin for access.
                    </span>
                  )}
                </CardContent>
              </Card>
            )}


            {!loadingExams && !error && (
              <>
                {!exams || exams.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No mock tests available in this course.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {exams.map((ex) => (
                      <Card
                        key={ex.id}
                        className="border border-slate-800/60 bg-slate-900/40 transition hover:bg-slate-900/60"
                      >
                        <CardContent className="p-5">
                          <div className="mb-2 flex items-start gap-2">
                            <BookOpen className="mt-0.5 h-4 w-4 opacity-80" />
                            <h3 className="text-base font-semibold !text-orange-300">
                              {ex.title}
                            </h3>
                          </div>


                          <div className="mb-3 text-sm text-slate-300">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-4 w-4 opacity-80" />
                              Duration:&nbsp;
                              <b>{Math.round((ex.duration_sec || 0) / 60)} mins</b>
                            </span>
                          </div>


                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200">
                              <Layers className="h-3.5 w-3.5 opacity-80" />
                              {questionsLabel(ex)}
                            </span>


                            <Button
                              size="sm"
                              type="button"
                              className="cursor-pointer border !border-orange-400 bg-slate-500/10 text-slate-900 hover:bg-orange-400 hover:text-black !hover:bg-orange-500"
                              onClick={() => startExam(ex)}
                            >
                              Start
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}





