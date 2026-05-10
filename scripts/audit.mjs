import { LESSONS } from "../src/content/lesson-deep.ts";
import { MISSIONS } from "../src/content/missions.ts";
const rows = MISSIONS.map(m => {
  const d = LESSONS[m.slug] || {};
  return {
    slug: m.slug, world: m.world,
    b: !!(d.beginner?.what?.length), w: !!(d.beginner?.why?.length), a: !!d.beginner?.analogy,
    A: !!(d.advanced?.what?.length), e: !!(d.advanced?.edgeCases?.length), n: !!(d.advanced?.engineerNotes?.length),
    K: !!(d.walkthrough?.length), L: !!(d.listenFor?.length), F: !!d.flow,
    qE: !!(d.quizEasy?.length), qH: !!(d.quizHard?.length), s: !!(d.sources?.length),
  };
});
const fields = ["b","w","a","A","e","n","K","L","F","qE","qH","s"];
const totals = Object.fromEntries(fields.map(f => [f, rows.filter(r => r[f]).length]));
console.log("Total:", rows.length);
console.log("Coverage:", totals);
const gaps = rows.map(r => ({slug: r.slug, missing: fields.filter(f => !r[f]).join(",")})).filter(r => r.missing);
console.log("Missions with gaps:", gaps.length);
gaps.slice(0,80).forEach(g => console.log(g.slug.padEnd(28), g.missing));
