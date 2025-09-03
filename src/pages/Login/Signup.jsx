// src/pages/Signup.jsx
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Check, X } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import FormError from "@/components/FormError";
import { passwordRules, passwordIsStrong, emailIsValid } from "@/lib/validation";

export default function Signup() {
  const auth = useAuth();
  if (!auth) return null;
  const { signup } = auth;

  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const checklist = useMemo(
    () => passwordRules.map((r) => ({ label: r.label, ok: r.test(password) })),
    [password]
  );

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    if (!name.trim()) return setErr("Please enter your name.");
    if (!emailIsValid(email)) return setErr("Please enter a valid email address.");
    if (!passwordIsStrong(password)) return setErr("Please create a stronger password that meets all requirements.");

    setLoading(true);
    try {
      // Start OTP signup (does NOT create the account yet)
      const res = await signup(name.trim(), email.trim(), password);

      // If server enforces OTP (recommended): go to verify screen
      if (res?.otp_required && res?.pending_id) {
        nav(`/verify-otp?pid=${encodeURIComponent(res.pending_id)}${res.email_masked ? `&email=${encodeURIComponent(res.email_masked)}` : ""}`, { replace: true });
        return;
      }

      // Fallback (dev mode without OTP)
      nav("/account-created", { replace: true });
    } catch (e) {
      const msg = e?.message || "Could not create account. Please try again.";
      setErr(msg.includes("already") ? "That email is already registered. Try logging in." : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="scroll-smooth bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center selection:bg-orange-300 selection:text-slate-900">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-[90px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-[110px]" />
      </div>

      <motion.main initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md px-4">
        <Card className="border border-slate-800/60 bg-slate-900/40 backdrop-blur">
          <CardContent className="p-8">
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge className="bg-orange-600/20 text-orange-300">Create account</Badge> IN
              <Badge className="bg-orange-600/20 text-orange-300">Ω Omega Skills Academy</Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
              Start your <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">Journey</span>
            </h1>
            <p className="mt-3 text-sm text-slate-300">Sign up to access live cohorts, workshops, resume tools, and more.</p>

            <form onSubmit={onSubmit} className="mt-6 grid gap-5" noValidate>
              <label className="text-sm text-slate-300">
                Name
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-800/60 bg-slate-900/40 px-3 focus-within:border-orange-600/50">
                  <User className="h-4 w-4 text-orange-300" />
                  <input autoComplete="name" className="w-full bg-transparent py-3 text-slate-100 outline-none" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              </label>

              <label className="text-sm text-slate-300">
                Email
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-800/60 bg-slate-900/40 px-3 focus-within:border-orange-600/50">
                  <Mail className="h-4 w-4 text-orange-300" />
                  <input type="email" autoComplete="email" className="w-full bg-transparent py-3 text-slate-100 outline-none" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </label>

              <label className="text-sm text-slate-300">
                Password
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-800/60 bg-slate-900/40 px-3 focus-within:border-orange-600/50">
                  <Lock className="h-4 w-4 text-orange-300" />
                  <input type={showPassword ? "text" : "password"} autoComplete="new-password" className="w-full bg-transparent py-3 text-slate-100 outline-none" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? "Hide password" : "Show password"} className="text-slate-400 hover:text-orange-300 focus:outline-none">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <ul className="mt-3 space-y-1">
                  {checklist.map((item) => (
                    <li key={item.label} className="flex items-center gap-2 text-xs">
                      {item.ok ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <X className="h-3.5 w-3.5 text-slate-500" />}
                      <span className={item.ok ? "text-emerald-300" : "text-slate-400"}>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </label>

              <FormError message={err} />

              <Button type="submit" size="lg" disabled={loading} className="bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black font-semibold cursor-pointer">
                {loading ? "Creating..." : "Create account"} {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <p className="mt-6 text-sm text-slate-300">
              Already have an account? <Link to="/login" className="text-orange-300 hover:text-orange-200 underline">Log in</Link>
            </p>
          </CardContent>
        </Card>
      </motion.main>
    </div>
  );
}
