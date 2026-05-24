"use client";

import { useEffect } from "react";

export const PwaRegistration = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) =>
          console.error("[PWA] Service worker registration failed:", err),
        );
    }
  }, []);

  return null;
};
