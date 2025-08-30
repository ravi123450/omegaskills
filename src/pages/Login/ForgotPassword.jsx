// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import FormError from "@/components/FormError";
import { emailIsValid } from "@/lib/validation";

export default function ForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    if (!emailIsValid(email)) return setErr("Please enter a valid email.");

    setLoading(true);
    try {
      // TODO: call backend password reset here
      await new Promise((res) => setTimeout(res, 1500)); // simulate API
      setSuccess(true);
      setTimeout(() => nav("/login"), 2500); // redirect after success
    } catch (e) {
      setErr("Failed to send reset link. Try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center">
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md px-4"
      >
        <Card className="border border-slate-800/60 bg-slate-900/40 backdrop-blur">
          <CardContent className="p-8">
            {success ? (
              <div className="text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold">Reset Link Sent</h1>
                <p className="mt-2 text-sm text-slate-300">
                  Please check your email for instructions. Redirecting to login...
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap gap-2">
                  <Badge className="bg-orange-600/20 text-orange-300">Reset</Badge> YOUR
                  <Badge className="bg-orange-600/20 text-orange-300">Ω Omega Skills Academy</Badge> ACCOUNT
                </div>

                <h1 className="text-3xl font-extrabold">Forgot Password?</h1>
                <p className="mt-3 text-sm text-slate-300">
                  Enter your registered email to reset your password.
                </p>

                <form onSubmit={onSubmit} className="mt-6 grid gap-5" noValidate>
                  <label className="text-sm text-slate-300">
                    Email
                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-800/60 bg-slate-900/40 px-3 focus-within:border-orange-600/50">
                      <Mail className="h-4 w-4 text-orange-300" />
                      <input
                        type="email"
                        className="w-full bg-transparent py-3 text-slate-100 outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </label>

                  <FormError message={err} />

                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black font-semibold"
                  >
                    {loading ? "Sending..." : "Send reset link"}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>

                <p className="mt-6 text-sm text-slate-300 text-center">
                  Remembered your password?{" "}
                  <Link to="/login" className="text-orange-300 hover:text-orange-200 underline">
                    Back to login
                  </Link>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </motion.main>
    </div>
  );
}
