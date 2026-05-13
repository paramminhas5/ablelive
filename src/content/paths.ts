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
    slug: "music-foundations",
    title: "Music Foundations",
    tagline: "Sound, rhythm, melody, harmony, production — from absolute zero.",
    color: "bg-acid",
    description: "40 missions across 5 paths. Everything you need to know before you touch a DAW or a DJ controller.",
    missionSlugs: [
      "what-is-sound","frequency-pitch","amplitude-volume","timbre-tone","waveforms","sound-in-space","overtones-harmonics","how-we-hear",
      "what-is-rhythm","tempo-bpm","bars-time-signatures","groove-feel","syncopation","polyrhythm","note-values","rhythm-in-production",
      "notes-and-octaves","major-scale","minor-scale","intervals","pentatonic-scales","melody-writing","ear-training","transposition-modes",
      "what-are-chords","chord-types","chord-progressions","keys-tonality","tension-resolution","harmony-in-production","song-structure","listening-actively",
      "daw-explained","midi-explained","digital-audio","samples-loops","signal-chain","effects-overview","mixing-basics","music-tech-integration",
    ],
  },
  {
    slug: "dj-fundamentals-path",
    title: "DJ Path",
    tagline: "Beatmatching, the mix, performance, the crowd.",
    color: "bg-volt text-bone",
    description: "40 missions built from the rekordbox 6.0 manual. From setting up your first rig to reading a crowd at peak hour.",
    missionSlugs: [
      "what-is-djing","dj-equipment","rekordbox-intro","headphone-monitoring","booth-setup","dj-culture","genre-bpm-reference","your-first-mix",
      "music-library-dj","bpm-analysis-dj","key-detection-dj","my-tags-dj","playlists-dj","crate-digging","export-mode-dj","waveform-reading",
      "beatmatching-manual","sync-function","cue-points-dj","eq-mixing-dj","crossfader-technique","long-mix-blend","transitions-cut-dj","loop-function-dj",
      "reading-the-crowd","set-structure-dj","harmonic-mixing-dj","effects-performance-dj","energy-management-dj","genre-strategy-dj","preparing-a-set-dj","live-mistakes-dj",
      "effects-deep-dj","loop-performance-dj","harmonic-key-shift-dj","stem-djing","recording-your-set-dj","dvs-basics","dj-business","dj-advanced-complete",
    ],
  },
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
  {
    slug: "finish-a-track",
    title: "Finish a Track",
    tagline: "From idea to bounce, no half-songs.",
    color: "bg-sun",
    description: "Arrangement editing, comping, automation, export. The path most producers never actually finish — until now.",
    missionSlugs: [
      "arrangement-view", "linked-track-editing", "comping-flow",
      "take-lanes", "automation", "modulation-lanes",
      "limiter-truepeak", "exporting",
    ],
  },
  {
    slug: "studio-to-stage",
    title: "Studio to Stage",
    tagline: "Push 3, Link, controllers, performable sets.",
    color: "bg-hot text-bone",
    description: "Build a Session you can actually play. Map a controller. Sync to the room. Walk on knowing nothing silently fails.",
    missionSlugs: [
      "session-view", "scenes-follow", "push-controllers",
      "push3-workflow", "push3-standalone", "midi-mapping",
      "ableton-link", "tempo-following", "automation",
    ],
  },
  {
    slug: "sampling-deep",
    title: "Sampling Deep Dive",
    tagline: "Simpler, Sampler, Drum Rack, Granulator, warp.",
    color: "bg-volt text-bone",
    description: "Turn any sound source into a playable instrument. Slice, map, warp, granulate.",
    missionSlugs: [
      "sampler-simpler", "sampler-deep", "drum-rack",
      "drum-sampler", "slicing", "warping",
      "warp-modes-deep", "granulator-iii", "stem-separation",
    ],
  },
  {
    slug: "live12-power",
    title: "Live 12 Power Tools",
    tagline: "What makes Live 12 a step-change.",
    color: "bg-acid",
    description: "Stem separation, MIDI transformations, scale awareness, sound similarity, Push 3 standalone.",
    missionSlugs: [
      "stem-separation", "midi-transforms", "scale-awareness",
      "sound-similarity", "groove-pool", "push3-standalone",
      "accessibility-features",
    ],
  },
  {
    slug: "midi-instruments",
    title: "MIDI & Instruments Tour",
    tagline: "Every built-in synth, sampler and rack.",
    color: "bg-volt text-bone",
    description: "Drift, Wavetable, Operator, Meld, Sampler, Granulator, Collision/Tension/Electric/Analog, Bass & Poli, Racks, MIDI effects, External Instrument.",
    missionSlugs: [
      "instruments-overview", "drift", "wavetable", "operator", "meld",
      "sampler-simpler", "sampler-deep", "granulator-iii",
      "collision-tension-electric", "bass-poli",
      "instrument-rack", "midi-effects-tour", "external-instrument",
    ],
  },
];

export function pathBySlug(slug: string) {
  return PATHS.find((p) => p.slug === slug);
}