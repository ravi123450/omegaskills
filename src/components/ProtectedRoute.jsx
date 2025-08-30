// // src/components/ProtectedRoute.jsx
// import React, { useEffect, useState } from "react";
// import { Navigate, Outlet, useLocation } from "react-router-dom";
// import { useAuth } from "@/context/AuthProvider";

// /**
//  * Protects nested routes.
//  * Blocks when neither AuthProvider has a user NOR localStorage has a token.
//  * Listens to `auth-changed` so redirects happen immediately after logout.
//  */
// export default function ProtectedRoute() {
//   const { user, ready } = useAuth();
//   const loc = useLocation();

//   // local token snapshot
//   const [hasToken, setHasToken] = useState(
//     !!localStorage.getItem("auth_token")
//   );

//   useEffect(() => {
//     const update = () => setHasToken(!!localStorage.getItem("auth_token"));
//     window.addEventListener("auth-changed", update);
//     window.addEventListener("storage", update);
//     // sync once on mount
//     update();
//     return () => {
//       window.removeEventListener("auth-changed", update);
//       window.removeEventListener("storage", update);
//     };
//   }, []);

//   // while provider is loading, don't flash
//   if (!ready) return null;

//   // authed if context has user OR token exists
//   const isAuthed = !!user || hasToken;

//   if (!isAuthed) {
//     return <Navigate to="/login" replace state={{ from: loc }} />;
//   }

//   return <Outlet />;
// }

// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthFlag from "@/lib/useAuthFlag";

/**
 * Protects nested routes.
 * Uses the same localStorage-driven hook as Navbar/Footer.
 */
export default function ProtectedRoute() {
  const isAuthed = useAuthFlag();
  const loc = useLocation();

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }

  return <Outlet />;
}
