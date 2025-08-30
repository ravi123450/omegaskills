// src/pages/courses/LearnCourses.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// API: public list (no auth). If you don't have this yet, add getCoursesPublic in api.js.
import { getCoursesPublic } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Lock, LockOpen } from "lucide-react";

function SectionTitle({ children, eyebrow }) {
  return (
    <div>
      {eyebrow && (
        <div className="mb-2">
          <Badge className="bg-orange-600/20 text-orange-300">{eyebrow}</Badge>
        </div>
      )}
      <h2 className="relative text-2xl md:text-3xl font-bold">
        {children}
        <span className="absolute -bottom-2 left-0 h-[2px] w-24 rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />
      </h2>
    </div>
  );
}

export default function LearnCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const list = await getCoursesPublic(); // ← retrieves from backend
        if (!mounted) return;
        setCourses(Array.isArray(list) ? list : []);
      } catch {
        if (mounted) setCourses([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* HERO */}
      <section className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 md:px-6 md:pt-14">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-orange-600/20 text-orange-300 !text-base">Courses</Badge>
          <Badge className="bg-slate-800/60 text-slate-200 !text-base">Learn Courses</Badge>
        </div>

        <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
          Learn industry-aligned{" "}
          <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
            courses
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-base md:text-lg text-slate-300">
          Flexible online modules for beginners, intermediates, and advanced learners.
          Each course is project-driven, mentor-supported, and updated for industry.
        </p>

        <div className="mt-6 flex gap-3">
          <Button asChild className="bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black">
            <Link to="/login">Log in to Enroll</Link>
          </Button>
          <Link
            to="/courses/cohorts"
            className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-orange-300"
          >
            Explore Live Cohorts <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* COURSES FROM BACKEND + LOGIN CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <SectionTitle eyebrow="Popular tracks">Choose your path</SectionTitle>

        {loading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-slate-800/70 bg-slate-900/40">
                <CardContent className="p-6 space-y-3">
                  <div className="h-24 w-full rounded-lg bg-slate-800/50 animate-pulse" />
                  <div className="h-5 w-2/3 rounded bg-slate-800/50 animate-pulse" />
                  <div className="h-4 w-4/5 rounded bg-slate-800/50 animate-pulse" />
                  <div className="h-9 w-20 rounded bg-slate-800/50 animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <Card
                key={c.id}
                className="border-slate-800/70 bg-slate-900/40 hover:border-orange-600/50 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-xl bg-orange-600/15 p-2">
                      {c.is_public ? (
                        <LockOpen className="h-5 w-5 text-emerald-300" />
                      ) : (
                        <Lock className="h-5 w-5 text-rose-300" />
                      )}
                    </div>
                    <div className="font-semibold text-lg">{c.title}</div>
                  </div>

                  <p className="text-sm text-slate-300/90">
                    {c.description || "Curated content with per-topic analytics."}
                  </p>

                  {/* Just a login button per course */}
                  <Button asChild className="mt-4 bg-orange-500 text-slate-900 hover:bg-orange-400">
                    <Link to="/login">Log in</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}

            {courses.length === 0 && (
              <Card className="border-slate-800/70 bg-slate-900/40">
                <CardContent className="p-6 text-sm text-slate-300">
                  No courses available yet.
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
