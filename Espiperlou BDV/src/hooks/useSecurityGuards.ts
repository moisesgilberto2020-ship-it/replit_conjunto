"use client";

import { useEffect } from "react";

export function useSecurityGuards() {
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const rawKey = event.key;
      if (!rawKey) {
        return;
      }
      const key = rawKey.toLowerCase();
      if (
        rawKey === "F12" ||
        (event.ctrlKey && event.shiftKey && (key === "i" || key === "c")) ||
        (event.ctrlKey && key === "u")
      ) {
        event.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    let blocked = false;
    const threshold = 160;
    const intervalId = window.setInterval(() => {
      const start = performance.now();
      debugger; // mimic original behaviour to detect open dev tools
      const end = performance.now();
      if (end - start > threshold && !blocked) {
        blocked = true;
        document.body.innerHTML = "Inspección bloqueada!";
      }
    }, 1000);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      window.clearInterval(intervalId);
    };
  }, []);
}
