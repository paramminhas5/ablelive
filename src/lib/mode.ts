// Beginner / Advanced mode — global, persisted, hook-friendly.
import { useEffect, useState } from "react";

export type Mode = "beginner" | "advanced";
const KEY = "ableton.school.mode";

const read = (): Mode => {
  if (typeof localStorage === "undefined") return "beginner";
  return (localStorage.getItem(KEY) as Mode) || "beginner";
};

export const useMode = () => {
  const [mode, setMode] = useState<Mode>("beginner");
  useEffect(() => {
    setMode(read());
    const h = () => setMode(read());
    window.addEventListener("mode:update", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("mode:update", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  const set = (m: Mode) => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(KEY, m);
    window.dispatchEvent(new Event("mode:update"));
    setMode(m);
  };
  return { mode, setMode: set };
};