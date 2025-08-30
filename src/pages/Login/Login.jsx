// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import FormError from "@/components/FormError";
import { emailIsValid } from "@/lib/validation";

export default function Login() {
  const auth = useAuth();
  if (!auth) return null;
  const { login } = auth;

  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from?.pathname || "/dashboard";
  const resetSuccess = loc.state?.resetSuccess;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    if (!emailIsValid(email))
      return setErr("Please enter a valid email address.");
    if (!password) return setErr("Please enter your password.");

    setLoading(true);
    try {
      await login(email.trim(), password);
      if (!localStorage.getItem("auth_token")) {
        localStorage.setItem("auth_token", "session");
      }
      window.dispatchEvent(new Event("auth-changed"));
      nav(from, { replace: true });
    } catch (e) {
      const msg = e?.message || "Login failed. Please try again.";
      setErr(
        /invalid/i.test(msg)
          ? "Invalid email or password. Please try again."
          : msg
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="scroll-smooth bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center selection:bg-orange-300 selection:text-slate-900">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-[90px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-[110px]" />
      </div>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md px-4"
      >
        <Card className="border border-slate-800/60 bg-slate-900/40 backdrop-blur">
          <CardContent className="p-8">
            {/* Step 3: success banner after password reset */}
            {resetSuccess && (
              <div className="mb-4 rounded-xl border border-emerald-600/40 bg-emerald-900/30 p-3 text-sm text-emerald-200">
                Password reset successful. Please log in with your new password.
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-orange-600/20 text-orange-300">
                Welcome back
              </Badge>{" "}
              TO
              <Badge className="bg-orange-600/20 text-orange-300">
                Ω Omega Skills Academy
              </Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
              Log in to{" "}
              <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
                Your Future
              </span>
            </h1>
            <p className="mt-3 text-sm text-slate-300">
              Access your dashboard, workshops, and resume tools.
            </p>

            <form onSubmit={onSubmit} className="mt-6 grid gap-5" noValidate>
              <label className="text-sm text-slate-300">
                Email
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-800/60 bg-slate-900/40 px-3 focus-within:border-orange-600/50">
                  <Mail className="h-4 w-4 text-orange-300" />
                  <input
                    type="email"
                    autoComplete="email"
                    className="w-full bg-transparent py-3 text-slate-100 outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </label>

              <label className="text-sm text-slate-300">
                Password
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-800/60 bg-slate-900/40 px-3 focus-within:border-orange-600/50">
                  <Lock className="h-4 w-4 text-orange-300" />
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="w-full bg-transparent py-3 text-slate-100 outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="text-slate-400 hover:text-orange-300 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </label>

              <FormError message={err} />

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black font-semibold cursor-pointer"
              >
                {loading ? "Logging in..." : "Log in"}{" "}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm text-slate-300">
              <span>
                New here?{" "}
                <Link
                  to="/signup"
                  className="text-orange-300 hover:text-orange-200 underline"
                >
                  Create an account
                </Link>
              </span>

              <Link
                to="/forgot-password"
                className="text-orange-300 hover:text-orange-200 underline"
              >
                Forgot password?
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.main>
    </div>
  );
}
