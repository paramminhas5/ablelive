import { LESSONS } from "../src/content/lesson-deep.ts";
import { MISSIONS } from "../src/content/missions.ts";

// Depth thresholds — content failing these reads thin or jargon-heavy.
const TH = {
  beginnerWhatChars: 400,   // beginner.what joined length
  advancedWhatChars: 350,   // advanced.what joined length
  walkthroughSteps: 5,
  listenForItems: 4,
  edgeCases: 3,
  quizHardCount: 3,
};

// Words that suggest the prose is still jargon-first (not explained-first).
const JARGON_FLAGS = [
  "transducer","longitudinal","quantization","attenuation","propagation",
  "polyphony","monophonic","aliasing","heterodyne","cardioid","null point",
  "filter slope","resonance Q","oversampling","sidechain compression","look-ahead",
];

function joinLen(arr) { return Array.isArray(arr) ? arr.join(" ").length : 0; }
function hasJargonRaw(text) {
  if (!text) return [];
  const t = text.toLowerCase();
  return JARGON_FLAGS.filter(w => t.includes(w));
}

const rows = MISSIONS.map(m => {
  const d = LESSONS[m.slug] || {};
  const bWhatLen = joinLen(d.beginner?.what);
  const aWhatLen = joinLen(d.advanced?.what);
  const beginnerJargon = hasJargonRaw([d.beginner?.what, d.beginner?.why].flat().join(" "));
  // jargon in beginner is "raw" if it's not also defined in plain language
  const beginnerJargonRaw = beginnerJargon.filter(w => {
    const all = [d.beginner?.analogy, d.beginner?.what, d.beginner?.why].flat().join(" ").toLowerCase();
    // crude: word appears but no "is" / "means" / "like" near it
    return !new RegExp(`${w}[^.]{0,80}(is |means |like |i\\.e\\.|=)`, "i").test(all);
  });

  return {
    slug: m.slug, world: m.world, title: m.title,
    flags: [
      bWhatLen < TH.beginnerWhatChars && `beginner-thin(${bWhatLen})`,
      aWhatLen < TH.advancedWhatChars && `advanced-thin(${aWhatLen})`,
      (d.walkthrough?.length ?? 0) < TH.walkthroughSteps && `walkthrough(${d.walkthrough?.length ?? 0})`,
      (d.listenFor?.length ?? 0) < TH.listenForItems && `listenFor(${d.listenFor?.length ?? 0})`,
      (d.advanced?.edgeCases?.length ?? 0) < TH.edgeCases && `edgeCases(${d.advanced?.edgeCases?.length ?? 0})`,
      (d.quizHard?.length ?? 0) < TH.quizHardCount && `quizHard(${d.quizHard?.length ?? 0})`,
      !d.beginner?.analogy && "no-analogy",
      beginnerJargonRaw.length > 0 && `jargon[${beginnerJargonRaw.join(",")}]`,
    ].filter(Boolean),
  };
});

const clean = rows.filter(r => r.flags.length === 0).length;
const needsWork = rows.filter(r => r.flags.length > 0);

console.log(`Total missions: ${rows.length}  |  Clean: ${clean}  |  Need work: ${needsWork.length}\n`);
const byWorld = needsWork.reduce((acc, r) => { (acc[r.world] ||= []).push(r); return acc; }, {});
for (const [world, list] of Object.entries(byWorld)) {
  console.log(`── ${world.toUpperCase()} (${list.length}) ──`);
  list.forEach(r => console.log(`  ${r.slug.padEnd(34)} ${r.flags.join("  ")}`));
  console.log("");
}
