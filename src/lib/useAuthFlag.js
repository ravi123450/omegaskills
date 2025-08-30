import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function useAuthFlag() {
  const [isAuthed, setIsAuthed] = useState(!!localStorage.getItem("auth_token"));
  const location = useLocation();

  useEffect(() => {
    const update = () => setIsAuthed(!!localStorage.getItem("auth_token"));
    window.addEventListener("auth-changed", update); // same tab
    window.addEventListener("storage", update);      // other tabs
    return () => {
      window.removeEventListener("auth-changed", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  useEffect(() => {
    setIsAuthed(!!localStorage.getItem("auth_token"));
  }, [location.pathname]);

  return isAuthed;
}
