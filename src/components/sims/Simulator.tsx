import type { SimType } from "@/content/types";
import { DrumPadSim } from "./DrumPadSim";
import { PianoRollSim } from "./PianoRollSim";
import { MixerSim } from "./MixerSim";
import { DeviceChainSim } from "./DeviceChainSim";
import { WarpLabSim } from "./WarpLabSim";
import { KnobTrainerSim } from "./KnobTrainerSim";
import { SessionGridSim } from "./SessionGridSim";
import { ArrangementSim } from "./ArrangementSim";
import { RoutingPuzzleSim } from "./RoutingPuzzleSim";
import { MidiMapSim } from "./MidiMapSim";
import { EarTrainingSim } from "./EarTrainingSim";
import { InterfaceTourSim } from "./InterfaceTourSim";
import { BrowserTourSim } from "./BrowserTourSim";
import { MidiVsAudioSim } from "./MidiVsAudioSim";
import { DeviceLabBySlug } from "./DeviceLabBySlug";
import { SidechainSim } from "./SidechainSim";
import { SendReturnSim } from "./SendReturnSim";
import { StemSplitterSim } from "./StemSplitterSim";
import { MidiTransformSim } from "./MidiTransformSim";
import { ScaleAwareSim } from "./ScaleAwareSim";
import { CompLakeSim } from "./CompLakeSim";
import { GrooveExtractorSim } from "./GrooveExtractorSim";
import { Push3Sim } from "./Push3Sim";

export function Simulator({ type, preset }: { type: SimType; preset?: Record<string, unknown> }) {
  switch (type) {
    case "drum-pad": return <DrumPadSim />;
    case "piano-roll": return <PianoRollSim />;
    case "mixer": return <MixerSim />;
    case "device-chain": return <DeviceChainSim />;
    case "warp-lab": return <WarpLabSim />;
    case "knob-trainer": return <KnobTrainerSim preset={preset} />;
    case "session-grid": return <SessionGridSim />;
    case "arrangement": return <ArrangementSim />;
    case "routing-puzzle": return <RoutingPuzzleSim />;
    case "midi-map": return <MidiMapSim />;
    case "ear-training": return <EarTrainingSim preset={preset} />;
    case "interface-tour": return <InterfaceTourSim />;
    case "browser-tour": return <BrowserTourSim />;
    case "midi-vs-audio": return <MidiVsAudioSim />;
    case "device-lab": return <DeviceLabBySlug slug={(preset?.device as string) || "eq"} />;
    case "sidechain": return <SidechainSim />;
    case "send-return": return <SendReturnSim />;
    case "stem-splitter": return <StemSplitterSim />;
    case "midi-transform": return <MidiTransformSim />;
    case "scale-aware": return <ScaleAwareSim />;
    case "comp-lake": return <CompLakeSim />;
    case "groove-extractor": return <GrooveExtractorSim />;
    case "push3": return <Push3Sim />;
    default: return <div className="brutal-border bg-bone p-6 font-mono text-xs uppercase">No simulator for this mission — read & quiz only.</div>;
  }
}

export const SIM_LIST: { type: SimType; label: string; color: string }[] = [
  { type: "drum-pad", label: "Drum Rack", color: "bg-acid" },
  { type: "piano-roll", label: "Piano Roll", color: "bg-hot text-bone" },
  { type: "mixer", label: "Mixer", color: "bg-volt text-bone" },
  { type: "device-chain", label: "Device Chain", color: "bg-sun" },
  { type: "warp-lab", label: "Warp Lab", color: "bg-acid" },
  { type: "knob-trainer", label: "Knob Trainer", color: "bg-hot text-bone" },
  { type: "session-grid", label: "Session Grid", color: "bg-volt text-bone" },
  { type: "arrangement", label: "Arrangement", color: "bg-sun" },
  { type: "routing-puzzle", label: "Routing", color: "bg-acid" },
  { type: "midi-map", label: "MIDI Map", color: "bg-hot text-bone" },
  { type: "ear-training", label: "Ear Training", color: "bg-volt text-bone" },
  { type: "interface-tour", label: "Interface Tour", color: "bg-sun" },
  { type: "browser-tour", label: "Browser", color: "bg-acid" },
  { type: "sidechain", label: "Sidechain", color: "bg-hot text-bone" },
  { type: "send-return", label: "Sends/Returns", color: "bg-volt text-bone" },
  { type: "stem-splitter", label: "Stem Splitter", color: "bg-acid" },
  { type: "midi-transform", label: "MIDI Transform", color: "bg-hot text-bone" },
  { type: "scale-aware", label: "Scale Aware", color: "bg-volt text-bone" },
  { type: "comp-lake", label: "Comp Lake", color: "bg-sun" },
  { type: "groove-extractor", label: "Groove Pool", color: "bg-acid" },
  { type: "push3", label: "Push 3", color: "bg-hot text-bone" },
];
