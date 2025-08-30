// src/pages/Profile.jsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";

export default function Profile({ auth }) {
  // fallback to global context if not passed
  const ctx = typeof useAuth === "function" ? useAuth() : null;
  const u = auth?.user ?? ctx?.user ?? {};

  return (
    <main className="bg-slate-950 text-slate-100 min-h-[70vh]">
      {/* background blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-[90px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-[110px]" />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Header */}
        <div className="mb-6">
          <Badge className="bg-orange-600/20 text-orange-300">Account</Badge>
          <h1 className="mt-2 text-3xl font-extrabold">Profile</h1>
          <p className="mt-1 text-sm text-slate-300">
            Manage your account information.
          </p>
        </div>

        {/* Profile Card */}
        <Card className="border border-slate-800/60 bg-slate-900/40">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-orange-300" />
              <div>
                <div className="text-sm text-slate-400">Name</div>
                <div className="font-medium">{u.name || "—"}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-orange-300" />
              <div>
                <div className="text-sm text-slate-400">Email</div>
                <div className="font-medium">{u.email || "—"}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-orange-300" />
              <div>
                <div className="text-sm text-slate-400">Role</div>
                <div className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1 text-xs font-medium">
                  {u.role || "student"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
