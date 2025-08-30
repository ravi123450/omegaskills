// src/main.jsx
import React from "react";
import { createRoot,  } from "react-dom/client";
import AppRouter from "./routes/AppRouter";
import { AuthProvider } from "@/context/AuthProvider.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </React.StrictMode>
);
