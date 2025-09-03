import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    setErr("");
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Request failed");
      setOk(true);
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 grid place-items-center px-4">
      <Card className="w-full max-w-md border-slate-800/70 bg-slate-900/50">
        <CardContent className="p-6">
          <div className="mb-3">
            <Badge className="bg-orange-600/20 text-orange-300">Account</Badge>
          </div>
          <h1 className="text-2xl font-bold">Forgot password</h1>
          <p className="mt-1 text-sm text-slate-300">
            We’ll email you a reset link and a 6-digit code (valid for ~15 minutes).
          </p>

          {ok ? (
            <div className="mt-4 rounded-lg border border-emerald-600/30 bg-emerald-600/15 p-3 text-emerald-300">
              If that email exists, we sent reset instructions. Check your inbox.
            </div>
          ) : (
            <>
              <div className="mt-4">
                <label className="block text-sm text-slate-200">Email</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                />
              </div>
              {err && (
                <div className="mt-3 rounded-lg border border-rose-600/30 bg-rose-600/15 p-3 text-rose-300 text-sm">
                  {err}
                </div>
              )}
              <div className="mt-4">
                <Button onClick={submit} className="bg-orange-500 text-slate-900 hover:bg-orange-400">
                  Send reset email
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
