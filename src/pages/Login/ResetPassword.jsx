// src/pages/ResetPassword.jsx
import React, { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Eye, EyeOff, ArrowRight, Check, X } from "lucide-react";
import FormError from "@/components/FormError";
import { passwordRules, passwordIsStrong } from "@/lib/validation";

export default function ResetPassword() {
  const { token } = useParams();
  const nav = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const checklist = useMemo(
    () => passwordRules.map((r) => ({ label: r.label, ok: r.test(password) })),
    [password]
  );

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    if (!token || token.length < 10) {
      return setErr("Invalid or expired reset link. Please request a new one.");
    }
    if (!passwordIsStrong(password)) {
      return setErr(
        "Please create a stronger password that meets all requirements."
      );
    }
    if (password !== confirm) {
      return setErr("Passwords do not match.");
    }

    setLoading(true);
    try {
      // TODO: Replace with your API call:
      // await api.resetPassword({ token, newPassword: password });
      await new Promise((r) => setTimeout(r, 1500)); // simulate API

      nav("/login", {
        replace: true,
        state: { resetSuccess: true },
      });
    } catch (e) {
      const msg = e?.message || "Could not reset password. Please try again.";
      setErr(msg);
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
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge className="bg-orange-600/20 text-orange-300">
                Reset Password
              </Badge>{" "}
              Your
              <Badge className="bg-orange-600/20 text-orange-300">
                Ω Omega Skills Academy
              </Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
              Set a new password
            </h1>
            <p className="mt-3 text-sm text-slate-300">
              Create a strong password to secure your account.
            </p>

            <form onSubmit={onSubmit} className="mt-6 grid gap-5" noValidate>
              <label className="text-sm text-slate-300">
                New password
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-800/60 bg-slate-900/40 px-3 focus-within:border-orange-600/50">
                  <Lock className="h-4 w-4 text-orange-300" />
                  <input
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    className="w-full bg-transparent py-3 text-slate-100 outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    className="text-slate-400 hover:text-orange-300 focus:outline-none cursor-pointer"
                  >
                    {showPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <ul className="mt-3 space-y-1">
                  {checklist.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-center gap-2 text-xs"
                    >
                      {item.ok ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-slate-500" />
                      )}
                      <span
                        className={
                          item.ok ? "text-emerald-300" : "text-slate-400"
                        }
                      >
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </label>

              <label className="text-sm text-slate-300">
                Confirm password
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-800/60 bg-slate-900/40 px-3 focus-within:border-orange-600/50">
                  <Lock className="h-4 w-4 text-orange-300" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    className="w-full bg-transparent py-3 text-slate-100 outline-none"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    className="text-slate-400 hover:text-orange-300 focus:outline-none cursor-pointer"
                  >
                    {showConfirm ? (
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
                {loading ? "Saving..." : "Reset password"}{" "}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>

              <p className="text-sm text-slate-300 text-center">
                Back to{" "}
                <Link
                  to="/login"
                  className="text-orange-300 hover:text-orange-200 underline cursor-pointer"
                >
                  Log in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.main>
    </div>
  );
}
