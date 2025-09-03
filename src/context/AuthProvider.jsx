// src/context/AuthProvider.jsx
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  signIn,
  signupStart,       // OTP-first
  verifySignupOtp,   // complete signup
  resendSignupOtp,   // resend code
  me,
  logout as apiLogout,
} from "@/lib/api";

const STORAGE_KEY = "auth";       // stores { token?, user? }
const MIRROR_TOKEN_KEY = "token"; // convenience mirror for libs

const AuthContext = createContext(null);

function extractToken(obj) {
  return obj?.token || obj?.accessToken || obj?.jwt || obj?.authToken || null;
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      return null;
    }
  });

  const [ready, setReady] = useState(false);
  const initRan = useRef(false);

  // Persist entire blob
  useEffect(() => {
    try {
      auth ? localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
           : localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, [auth]);

  // Mirror token for other helpers
  useEffect(() => {
    const t = extractToken(auth);
    if (t) localStorage.setItem(MIRROR_TOKEN_KEY, t);
    else localStorage.removeItem(MIRROR_TOKEN_KEY);
  }, [auth]);

  // Cross-tab sync
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        try { setAuth(e.newValue ? JSON.parse(e.newValue) : null); } catch { setAuth(null); }
      }
      if (e.key === MIRROR_TOKEN_KEY && e.newValue == null) {
        setAuth((prev) => (prev ? { ...prev, token: undefined } : null));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Initial hydrate (cookie → token → logout)
  useEffect(() => {
    if (initRan.current) return;
    initRan.current = true;
    (async () => {
      try {
        const cookieUserResp = await me(); // cookie probe
        const cookieUser = cookieUserResp?.user ?? cookieUserResp ?? null;
        if (cookieUser) {
          setAuth((prev) => (prev ? { ...prev, user: cookieUser } : { user: cookieUser }));
          setReady(true);
          return;
        }
        const t = extractToken(auth);
        if (t) {
          const tokenUserResp = await me(t);
          const tokenUser = tokenUserResp?.user ?? tokenUserResp ?? null;
          if (tokenUser) {
            setAuth({ token: t, user: tokenUser });
            setReady(true);
            return;
          }
        }
        setAuth(null);
      } catch {
        setAuth(null);
      } finally {
        setReady(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If token changes later, refresh user
  useEffect(() => {
    if (!ready) return;
    const t = extractToken(auth);
    if (!t) return;
    let cancelled = false;
    (async () => {
      try {
        const u = await me(t);
        if (cancelled) return;
        const user = u?.user ?? u ?? null;
        user ? setAuth((prev) => (prev ? { ...prev, user } : { token: t, user }))
             : setAuth(null);
      } catch { setAuth(null); }
    })();
    return () => { cancelled = true; };
  }, [auth?.token, ready]);

  /* ---------------------------- actions ---------------------------- */
  async function login(arg1, arg2) {
    // accept payload or (email, password)
    if (typeof arg1 === "object" && arg1 !== null) {
      setAuth(arg1);
      window.dispatchEvent(new Event("auth-changed"));
      return arg1;
    }
    const email = String(arg1 || "").trim();
    const password = String(arg2 || "");
    if (!email || !password) throw new Error("Missing credentials");

    const data = await signIn(email, password);
    const token = extractToken(data);
    const user = data?.user ?? null;

    token ? setAuth({ token, user }) : setAuth({ user });
    window.dispatchEvent(new Event("auth-changed"));
    return { token, user };
  }

  // Start signup (sends OTP) — does NOT set auth
  async function signup(name, email, password) {
    return await signupStart(name, String(email || "").trim(), password);
  }

  // Complete signup with OTP — sets auth
  async function completeSignup(pending_id, otp) {
    const data = await verifySignupOtp(pending_id, otp); // { user, token }
    const token = extractToken(data);
    const user = data?.user ?? null;
    token ? setAuth({ token, user }) : setAuth({ user });
    window.dispatchEvent(new Event("auth-changed"));
    return { token, user };
  }

  // Resend signup OTP
  async function resendOtp(pending_id) {
    return await resendSignupOtp(pending_id);
  }

  async function logout() {
    try { await apiLogout(); } catch {}
    const KEYS = ["auth", "token", "auth_token", "accessToken", "jwt", "Authorization"];
    KEYS.forEach((k) => localStorage.removeItem(k));
    KEYS.forEach((k) => sessionStorage.removeItem(k));
    setAuth(null);
    window.dispatchEvent(new Event("auth-changed"));
  }

  const value = useMemo(() => ({
    // state
    auth,
    user: auth?.user ?? null,
    token: extractToken(auth),
    ready,

    // actions
    login,
    signup,           // start OTP
    completeSignup,   // verify OTP
    resendOtp,        // resend code
    logout,

    // advanced
    setAuth,
  }), [auth, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
