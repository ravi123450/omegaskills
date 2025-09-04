// src/pages/VerifyLoginOtp.jsx  (you can keep the filename/route)
// This now verifies SIGNUP OTP instead of login MFA.

import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function VerifyLoginOtp() {
  const [sp] = useSearchParams();
  const pending_id = sp.get("pid");
  const email = sp.get("email"); // optional mask from previous step
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();
  const api = import.meta.env.VITE_API_URL || "http://54.89.165.43";

  async function submit() {
    setErr("");
    try {
      const r = await fetch(`${api}/api/auth/signup-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pending_id, otp: code }), // <-- send {otp}
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error || "Verification failed");

      // signup verified (account created + cookie set) -> go to success
      nav("/account-created", { replace: true });
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 grid place-items-center px-4">
      <Card className="w-full max-w-md border-slate-800/70 bg-slate-900/50">
        <CardContent className="p-6">
          <div className="mb-3">
            <Badge className="bg-orange-600/20 text-orange-300">Verify your email</Badge>
          </div>
          <h1 className="text-2xl font-bold">Enter your 6-digit code</h1>
          <p className="mt-1 text-sm text-slate-300">
            We emailed a code to {email ? <b>{email}</b> : "your address"}.
          </p>
          <div className="mt-4">
            <input
              autoFocus
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-center text-xl tracking-widest"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="••••••"
            />
          </div>
          {err && (
            <div className="mt-3 rounded-lg border border-rose-600/30 bg-rose-600/15 p-3 text-rose-300 text-sm">
              {err}
            </div>
          )}
          <div className="mt-4">
            <Button onClick={submit} className="w-full bg-orange-500 text-slate-900 hover:bg-orange-400">
              Verify & continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
