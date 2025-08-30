// src/lib/validation.js
export const passwordRules = [
  { test: (v) => v.length >= 8, label: "At least 8 characters" },
  { test: (v) => /[A-Z]/.test(v), label: "1 uppercase letter (A-Z)" },
  { test: (v) => /[a-z]/.test(v), label: "1 lowercase letter (a-z)" },
  { test: (v) => /[0-9]/.test(v), label: "1 number (0-9)" },
  { test: (v) => /[^A-Za-z0-9]/.test(v), label: "1 symbol (!@#$…)" },
];

export function passwordIsStrong(pw) {
  return passwordRules.every((r) => r.test(pw));
}

export function emailIsValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}
