import React, { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ResetPassword() {
  const [sp] = useSearchParams();
  const tokenFromUrl = sp.get("token") || "";
  const [token, setToken] = useState(tokenFromUrl);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const canToken = !!token;
  const api = import.meta.env.VITE_API_URL || "http://54.89.165.43";

  const strongHint = useMemo(
    () => "8+ chars with upper, lower, number, and symbol.",
    []
  );

  async function submitToken() {
    setErr(""); setMsg("");
    if (!pw || pw !== pw2) return setErr("Passwords do not match");
    try {
      const r = await fetch(`${api}/api/auth/reset-password`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        credentials: "include",
        body: JSON.stringify({ token, new_password: pw }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error || "Failed");
      setMsg("Password updated. You can now log in.");
    } catch (e) { setErr(e.message); }
  }

  async function submitOtp() {
    setErr(""); setMsg("");
    if (!pw || pw !== pw2) return setErr("Passwords do not match");
    try {
      const r = await fetch(`${api}/api/auth/reset-password`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        credentials: "include",
        body: JSON.stringify({ email, otp, new_password: pw }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error || "Failed");
      setMsg("Password updated. You can now log in.");
    } catch (e) { setErr(e.message); }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 grid place-items-center px-4">
      <Card className="w-full max-w-xl border-slate-800/70 bg-slate-900/50">
        <CardContent className="p-6">
          <div className="mb-3">
            <Badge className="bg-orange-600/20 text-orange-300">Account</Badge>
          </div>
          <h1 className="text-2xl font-bold">Reset password</h1>
          <p className="mt-1 text-sm text-slate-300">
            Use the <b>link token</b> from your email or the <b>6-digit OTP</b>.
          </p>

          {/* Link token method */}
          <div className="mt-6 rounded-xl border border-slate-800/60 p-4">
            <div className="text-sm font-semibold text-slate-200">Via reset link</div>
            <div className="mt-2 grid gap-3 md:grid-cols-2">
              <input
                placeholder="Paste token from link"
                className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm"
                value={token}
                onChange={(e)=>setToken(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="password"
                  placeholder="New password"
                  className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm"
                  value={pw} onChange={(e)=>setPw(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Repeat password"
                  className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm"
                  value={pw2} onChange={(e)=>setPw2(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-400">Password rule: {strongHint}</div>
            <div className="mt-3">
              <Button onClick={submitToken} disabled={!canToken} className="bg-orange-500 text-slate-900 hover:bg-orange-400">
                Reset with link token
              </Button>
            </div>
          </div>

          {/* OTP method */}
          <div className="mt-6 rounded-xl border border-slate-800/60 p-4">
            <div className="text-sm font-semibold text-slate-200">Via email OTP</div>
            <div className="mt-2 grid gap-3 md:grid-cols-3">
              <input
                placeholder="you@domain.com"
                className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm"
                value={email} onChange={(e)=>setEmail(e.target.value)}
              />
              <input
                placeholder="6-digit code"
                className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm"
                value={otp} onChange={(e)=>setOtp(e.target.value)}
                maxLength={6}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="password"
                  placeholder="New password"
                  className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm"
                  value={pw} onChange={(e)=>setPw(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Repeat password"
                  className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm"
                  value={pw2} onChange={(e)=>setPw2(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-400">Password rule: {strongHint}</div>
            <div className="mt-3">
              <Button onClick={submitOtp} className="bg-orange-500 text-slate-900 hover:bg-orange-400">
                Reset with OTP
              </Button>
            </div>
          </div>

          {err && <div className="mt-4 rounded-lg border border-rose-600/30 bg-rose-600/15 p-3 text-rose-300 text-sm">{err}</div>}
          {msg && <div className="mt-4 rounded-lg border border-emerald-600/30 bg-emerald-600/15 p-3 text-emerald-300 text-sm">{msg}</div>}

          <div className="mt-6 text-sm text-slate-300">
            <Link to="/login" className="text-orange-300 hover:underline">Back to login</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
