// Beginner / Advanced mode (content depth) and Classic / CCD learnMode
// (UX shape). They are orthogonal: CCD = gated skill-tree, hearts, XP loop.
// Classic = today's brutalist site. Skill tree is visible in BOTH.
import { useEffect, useState } from "react";

export type Mode = "beginner" | "advanced";
export type LearnMode = "classic" | "ccd";

const KEY = "ableton.school.mode";
const LEARN_KEY = "ableton.school.learn-mode";

const read = (): Mode => {
  if (typeof localStorage === "undefined") return "beginner";
  return (localStorage.getItem(KEY) as Mode) || "beginner";
};

const readLearn = (): LearnMode => {
  if (typeof localStorage === "undefined") return "classic";
  return (localStorage.getItem(LEARN_KEY) as LearnMode) || "classic";
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

export const useLearnMode = () => {
  const [learnMode, setLearnMode] = useState<LearnMode>("classic");
  useEffect(() => {
    setLearnMode(readLearn());
    const h = () => setLearnMode(readLearn());
    window.addEventListener("learn-mode:update", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("learn-mode:update", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  const set = (m: LearnMode) => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(LEARN_KEY, m);
    window.dispatchEvent(new Event("learn-mode:update"));
    setLearnMode(m);
  };
  return { learnMode, setLearnMode: set };
};
