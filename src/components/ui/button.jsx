import React from "react";

const base =
  "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

const variants = {
  default: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600",
  outline: "border border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-900/60 focus-visible:ring-slate-600",
};

const sizes = {
  sm: "h-8 px-3",
  md: "h-10 px-4",
  lg: "h-12 px-5",
};

export function Button({ asChild = false, variant = "default", size = "md", className = "", ...props }) {
  const Comp = asChild ? "span" : "button";
  return <Comp className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />;
}
