// src/pages/AccountCreated.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function AccountCreated() {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-[90px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-orange-500/15 blur-[110px]" />
      </div>

      <motion.main initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md px-4">
        <Card className="border border-slate-800/60 bg-slate-900/40 backdrop-blur">
          <CardContent className="p-8 text-center">
            <div className="mb-3 flex justify-center">
              <CheckCircle2 className="h-22 w-22 text-emerald-400" />
            </div>
            <Badge className="bg-orange-600/20 text-orange-300 mb-3 !text-2xl">Account created</Badge>
            <h1 className="text-3xl font-extrabold">You're all set!</h1>
            <p className="mt-2 text-sm text-slate-300">Please log in to access your dashboard and tools.</p>

            <Button asChild size="lg" className="mt-6 bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black">
              <Link to="/login" className="inline-flex items-center">
                Log in now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.main>
    </div>
  );
}
