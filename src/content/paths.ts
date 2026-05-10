export type LearningPath = {
  slug: string;
  title: string;
  tagline: string;
  color: string;
  description: string;
  missionSlugs: string[];
};

export const PATHS: LearningPath[] = [
  {
    slug: "first-beat",
    title: "Make Your First Beat",
    tagline: "Zero to a 16-bar loop, the fastest path.",
    color: "bg-acid",
    description: "If you have never opened Live, this is the door. By the end you have a playable drum + bass + one synth loop in Session.",
    missionSlugs: [
      "what-is-live", "interface-tour", "browser",
      "session-view", "clips", "tracks",
      "midi-piano-roll", "drum-rack", "instruments-overview",
      "the-mixer",
    ],
  },
  {
    slug: "mix-a-track",
    title: "Mix a Track",
    tagline: "Take a rough idea to a balanced mix.",
    color: "bg-volt text-bone",
    description: "Gain stage, EQ surgery, dynamics, glue, sends and a sane master chain. The skills that make tracks sound finished.",
    missionSlugs: [
      "the-mixer", "groups-routing", "eq-eight", "compressor",
      "sidechain", "glue-compressor", "sends-returns",
      "reverb-delay", "hybrid-reverb", "saturator-distortion",
      "limiter-truepeak",
    ],
  },
  {
    slug: "sound-design",
    title: "Sound Design Crash Course",
    tagline: "Synthesis, sampling, mangling — your own sounds.",
    color: "bg-sun",
    description: "Learn the engines: Wavetable, Operator, Meld, Sampler, plus the mangle box (Roar) and racks for instant variations.",
    missionSlugs: [
      "instruments-overview", "wavetable", "operator", "meld",
      "sampler-simpler", "drum-sampler", "midi-effects",
      "racks-macros", "macro-variations", "roar",
    ],
  },
  {
    slug: "live-performance",
    title: "Live Performance Setup",
    tagline: "From bedroom to stage with Push and Link.",
    color: "bg-hot text-bone",
    description: "Build a performable Session set, map a controller, sync devices, and walk on stage knowing nothing will silently fail.",
    missionSlugs: [
      "session-view", "scenes-follow", "push-controllers", "push3-workflow",
      "midi-mapping", "ableton-link", "ableton-link-sync",
      "tempo-following", "automation", "exporting",
    ],
  },
];

export function pathBySlug(slug: string) {
  return PATHS.find((p) => p.slug === slug);
}