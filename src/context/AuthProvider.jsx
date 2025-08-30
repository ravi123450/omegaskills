// src/context/AuthProvider.jsx
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { signIn, signUp, me, logout as apiLogout } from "@/lib/api"; // includes server logout

const STORAGE_KEY = "auth";       // stores { token?, user? }
const MIRROR_TOKEN_KEY = "token"; // handy for API wrappers that read localStorage

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

  // Persist the full blob
  useEffect(() => {
    try {
      if (auth) localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, [auth]);

  // Mirror just the token for any fetch helpers
  useEffect(() => {
    const t = extractToken(auth);
    if (t) localStorage.setItem(MIRROR_TOKEN_KEY, t);
    else localStorage.removeItem(MIRROR_TOKEN_KEY);
  }, [auth]);

  // Cross-tab sync for login/logout
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        try {
          const next = e.newValue ? JSON.parse(e.newValue) : null;
          setAuth(next);
        } catch {
          setAuth(null);
        }
      }
      if (e.key === MIRROR_TOKEN_KEY && e.newValue == null) {
        // token removed in another tab -> reflect here too
        setAuth((prev) => (prev ? { ...prev, token: undefined } : null));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /**
   * Initial hydrate:
   * 1) Try cookie session first: me() with credentials (handled in lib/api).
   * 2) If no cookie session, but we have a token -> me(token).
   * 3) If both fail, we’re logged out.
   */
  useEffect(() => {
    if (initRan.current) return;
    initRan.current = true;

    (async () => {
      try {
        // 1) Cookie session probe (lib/api.me sends credentials)
        const cookieUserResp = await me(); // no token param
        const cookieUser = cookieUserResp?.user ?? cookieUserResp ?? null;

        if (cookieUser) {
          setAuth((prev) => (prev ? { ...prev, user: cookieUser } : { user: cookieUser }));
          setReady(true);
          return;
        }

        // 2) Token validation if present
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

        // 3) Neither worked
        setAuth(null);
      } catch {
        setAuth(null);
      } finally {
        setReady(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * If the stored token changes later, verify it and hydrate user.
   * Skip on first mount (handled above).
   */
  useEffect(() => {
    if (!ready) return; // wait until initial hydrate completes
    const t = extractToken(auth);
    if (!t) return;

    let cancelled = false;
    (async () => {
      try {
        const u = await me(t);
        if (cancelled) return;
        const user = u?.user ?? u ?? null;
        if (user) {
          setAuth((prev) => (prev ? { ...prev, user } : { token: t, user }));
        } else {
          setAuth(null);
        }
      } catch {
        setAuth(null);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token, ready]);

  /**
   * Login helpers
   */
  async function login(arg1, arg2) {
    // Accept either a full payload or (email, password)
    if (typeof arg1 === "object" && arg1 !== null) {
      setAuth(arg1); // { token?, user? }
      window.dispatchEvent(new Event("auth-changed"));
      return arg1;
    }
    const email = String(arg1 || "").trim();
    const password = String(arg2 || "");
    if (!email || !password) throw new Error("Missing credentials");

    const data = await signIn(email, password); // { token, user } or throws
    const token = extractToken(data);
    const user = data?.user ?? null;

    if (token) setAuth({ token, user });
    else setAuth({ user }); // cookie-only session
    window.dispatchEvent(new Event("auth-changed"));
    return { token, user };
  }

  async function signup(name, email, password) {
    const data = await signUp(name, String(email || "").trim(), password);
    const token = extractToken(data);
    const user = data?.user ?? null;

    if (token) setAuth({ token, user }); // auto-login when token returned
    else if (user) setAuth({ user });    // cookie-only auto-login
    window.dispatchEvent(new Event("auth-changed"));
    return data;
  }

 async function logout() {
  try { await apiLogout(); } catch {}
  // nuke every possible stale key (some older code used different names)
  const KEYS = [
    "auth", "token", "auth_token", "accessToken", "jwt", "Authorization"
  ];
  KEYS.forEach((k) => localStorage.removeItem(k));
  KEYS.forEach((k) => sessionStorage.removeItem(k));
  setAuth(null);
  window.dispatchEvent(new Event("auth-changed"));
}

  const value = useMemo(
    () => ({
      // raw blob + convenience fields
      auth,
      user: auth?.user ?? null,
      token: extractToken(auth),
      ready,

      // actions
      login,
      signup,
      logout,

      // advanced: allow manual overrides (e.g., after refresh-token flow)
      setAuth,
    }),
    [auth, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
