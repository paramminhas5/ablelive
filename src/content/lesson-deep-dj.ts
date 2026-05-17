// Deep lessons for the DJ world — Path 1: DJ Fundamentals (8 missions).
// Two-track: beginner (high-school clear, analogies) + advanced (engineer-grade
// references to rekordbox controls and pro practice). Paraphrased from general
// DJ knowledge and the rekordbox 6 manual workflows — original prose.
import type { LessonDeep } from "./types";

export const DJ_LESSONS: Record<string, LessonDeep> = {
  // ============================================================
  // PATH 1 — DJ FUNDAMENTALS
  // ============================================================
  "what-is-djing": {
    hook: "A DJ is a live curator. The records do the singing — you choose which one, when, and how it arrives.",
    beginner: {
      what: [
        "DJing is the art of playing recorded music for a room of people and stitching the tracks together so the music never stops. Two songs at a time, one fading in while the other fades out.",
        "Your three jobs are: pick the right track for the moment, blend it in without breaking the dance floor's rhythm, and read what the crowd needs next. Everything else — gear, software, effects — is in service of those three jobs.",
        "You are not making the music. You are arranging a journey using music that already exists. The skill is in the order, the timing, and the transition.",
      ],
      why: [
        "It teaches you to listen actively — you hear structure, energy and key in seconds instead of minutes.",
        "It teaches taste. You build a library and learn why one snare hit lands and another doesn't.",
        "It teaches stage presence. Crowds tell you immediately if you read the room wrong.",
      ],
      analogy:
        "A chef doesn't grow the ingredients. They choose them, time them, and plate them so each course makes the next one feel inevitable. A DJ does the same with tracks.",
    },
    advanced: {
      what: [
        "Technically, DJing is real-time audio mixing of two or more pre-recorded sources synchronised in tempo and beat phase, with EQ and level used to shape the spectral and dynamic crossover between them.",
        "Modern DJing splits into three modes: turntablist (cuts, scratches, juggles on vinyl/CDJs), club mixer (long blends, energy curves over 1–6 hours), and performance DJ (stems, loops, effects, sometimes live remixing in software like rekordbox Performance Mode or Ableton).",
        "The discipline rewards three meta-skills: pattern recognition (structure, key, energy), motor control (beatmatching, faders, EQ rides) and crowd modelling (predicting what 200 people will need in 90 seconds).",
      ],
      edgeCases: [
        "'DJ' covers radio show hosts, weddings, raves, festivals and bedroom streamers — each has different rules. Wedding DJ tools (mic, requests) overlap only partially with club tools.",
        "Sync-only DJs are not 'fake' but lose recovery options when sync drifts on a track with a bad grid — manual beatmatching is the safety net.",
        "Streaming-restricted services (Beatport LINK, TIDAL via rekordbox) are not legal to play in commercial venues in every territory.",
      ],
      engineerNotes: [
        "A DJ mixer is essentially a 2–4 channel summing console with per-channel 3-band EQ, gain, fader, cue bus and a crossfader. Everything you do is volume × frequency × time.",
        "Latency budget matters once you add software FX: aim for <10 ms round-trip on the audio interface or rides feel sluggish.",
      ],
    },
    flow: "Library → Deck A → Mixer → Master / Headphones ← Deck B ← Library",
    walkthrough: [
      { do: "Open rekordbox and load any two tracks you know well to Deck 1 and Deck 2.", listen: "Notice both tracks now show waveforms and the BPM in the top corner — that's your analysis result." },
      { do: "Play Deck 1 through the master, send Deck 2 only to your headphones (cue button).", listen: "You hear the live track in the room and the next track privately. That separation is the entire DJ workflow." },
      { do: "While Deck 1 plays, hit play on Deck 2 in your headphones and find a moment where the two kicks line up.", listen: "When the kicks land together, that's beat phase alignment. Lose it by 20 ms and it sounds 'galloping'." },
      { do: "Slowly raise Deck 2's channel fader and lower Deck 1's at the same rate over 16 bars.", listen: "The room hears one continuous beat — you've done a basic blend." },
      { do: "After the swap, stop Deck 1 and re-cue it for the next track.", listen: "That repeat — load, cue, blend, swap — is one cycle of a DJ set. A 2-hour set is ~40 of those." },
    ],
    listenFor: [
      "The kick drum — it's the anchor for everything else.",
      "The 'phrase' — most dance music is built in 8-bar and 16-bar chunks. Transitions almost always land on a phrase boundary.",
      "Whether the new track has a vocal or hook coming up. Never bury a hook with a transition.",
      "The crowd's body language — heads up means you have their attention; phones out means you're losing them.",
    ],
    mistakes: [
      "Practising only with songs you love. Build technique on tracks you don't care about — you'll be less precious.",
      "Watching the waveforms instead of listening. The screen lies a little; your ears don't.",
      "Pushing the master fader to fix a quiet track. Use the channel gain (trim) instead, then mix.",
      "Treating the first 30 minutes like the peak. Energy is a curve, not a switch.",
    ],
    proMoves: [
      "Record every practice session. Listen back the next morning — your mistakes are obvious in hindsight.",
      "Learn one 4-deck workflow even if you mostly play 2-deck. It rewires how you think about layering.",
      "Memorise the intro length of your top 50 tracks. You'll mix without looking at the screen.",
    ],
    quizHard: [
      { q: "Why is phrase awareness more important than perfect BPM matching?", options: ["It isn't", "Crowds feel structure breaks (vocal cut off mid-line) far more than 1 BPM drift", "Phrases set the key", "Phrases trigger the FX"], answer: 1, explain: "A blend on the wrong bar cuts a hook in half and the dance floor notices instantly. Tempo drift of ±1 BPM over a 32-bar blend is inaudible.", hint: "What does the crowd hear, the math or the chorus?" },
      { q: "The 'cue bus' on a DJ mixer is", options: ["A backup master output", "A separate mix you send to headphones for previewing the next track", "An effect send", "The recording output"], answer: 1, explain: "Cue lets you hear a deck privately so you can beatmatch and prepare before bringing it into the room.", hint: "Private monitoring." },
      { q: "A 'phrase' in dance music usually means", options: ["1 bar", "4 bars", "8 or 16 bars", "A whole track"], answer: 2, explain: "Producers structure dance music in 8 and 16-bar units. Transitions land on these boundaries.", hint: "Count along to almost any house track — you'll feel the reset every 8 or 16." },
    ],
    sources: [{ label: "rekordbox 6 Operating Manual", section: "Overview" }],
  },

  "dj-equipment": {
    hook: "Two sources, one mixer, two outputs (room + headphones). Everything else is decoration.",
    beginner: {
      what: [
        "Every DJ setup is the same shape: two (or four) decks that play music, a mixer that blends them, a speaker output for the room, and a headphone output just for you.",
        "The decks can be turntables, CDJs (Pioneer's CD/USB players), a DJ controller plugged into a laptop, or even just software with a keyboard. They all do the same job: play a track and let you start/stop/loop/cue it.",
        "The mixer is the brain. Each deck plugs into a channel with its own volume, EQ (bass/mid/treble), and a button to send it to your headphones. The crossfader between channels lets you fade A↔B with one slider.",
      ],
      why: [
        "Once you know the layout, you can DJ on any gear in any club within 5 minutes.",
        "Knowing what each control does means you can fix problems live (a deck sounds bassy → cut the low EQ; a track is too loud → lower the channel gain, not the master).",
        "It's how you communicate with a sound engineer at a venue — 'no signal on channel 2' is faster than 'the music thing isn't working'.",
      ],
      analogy:
        "A DJ setup is a kitchen with two stove burners (decks), a counter where you combine ingredients (mixer), a plate you serve from (master out) and a tasting spoon (headphones).",
    },
    advanced: {
      what: [
        "Industry-standard club rig is a Pioneer CDJ-3000 pair plus a DJM-A9 / DJM-900NXS2 mixer over Pro DJ Link (Ethernet). USB sticks formatted with rekordbox library data plug into the CDJs; the mixer handles all summing, EQ, FX and master output.",
        "Controller setups (Pioneer DDJ, Native Instruments S-series) route audio over USB to/from a host laptop running rekordbox/Serato/Traktor — the controller has no audio brain of its own.",
        "Audio paths: each deck → channel strip (gain → EQ → filter/colour FX → fader) → crossfader → master & booth bus → either balanced TRS/XLR to PA or unbalanced RCA for home. Headphone cue is a parallel bus that taps post-fader OR pre-fader (cue) depending on each channel's cue button state.",
      ],
      edgeCases: [
        "Mixing controller + CDJs ('hybrid setup') requires sending the controller's master out into a free mixer channel — easy to forget the channel gain calibration and clip the rig.",
        "Older venues may have an unbalanced RCA-only booth feed; always carry a balanced→unbalanced adapter or an isolator if you encounter ground hum.",
        "Battery-powered all-in-ones (Pioneer XDJ-XZ, Denon Prime 4) replace mixer+decks in one box but their on-board FX and EQ curves differ from a DJM — practise on the actual venue gear when possible.",
      ],
      engineerNotes: [
        "Always check the master meter on the mixer, not the speakers — your monitor's volume is irrelevant to what hits the PA.",
        "Set gain so peaks hit the top of the green / bottom of the orange on each channel meter. Anything in the red is hitting the digital ceiling and clipping.",
      ],
    },
    flow: "Track source → Deck → Mixer channel (Gain → EQ → Filter → Fader) → Crossfader → Master & Booth → PA",
    walkthrough: [
      { do: "Trace the signal path on any DJ setup before you start: USB/deck → channel input → master out → speaker.", listen: "If no sound, walk the path one stage at a time — the silence is always at one specific point in the chain." },
      { do: "Plug headphones into the mixer (not the laptop or controller).", listen: "Only the channel(s) with the Cue button lit will play in your phones — that's by design." },
      { do: "Lower the master fader, then raise channel 1's gain until peaks reach -6 dB on the channel meter.", listen: "This is gain staging — set channels first, then use the master fader for room volume." },
      { do: "Switch the crossfader fully left, then fully right.", listen: "Only the deck on that side plays. Centre = both. This is the most-broken control on rented gear, so check it." },
      { do: "Find the booth output knob (separate from master) and the headphone mix knob (cue/master blend).", listen: "Booth = your stage monitor. Cue mix = how much of the room you hear in your phones vs. the cued track." },
    ],
    listenFor: [
      "Hum or buzz when nothing is playing — usually a ground loop, fix with a DI box or by plugging into the same circuit.",
      "Clipping (distorted peaks) — almost always a channel gain set too hot, not the master.",
      "One side of the stereo image missing — bad cable, or the channel pan is off-centre.",
      "Latency on a controller (you press play, sound arrives late) — increase buffer or check USB hub.",
    ],
    mistakes: [
      "Touching the master fader to balance individual tracks. That's what channel gain and EQ are for.",
      "Using the booth and master at different volumes mid-set without rebalancing — what sounds full in the booth may be thin in the room.",
      "Wrapping a USB stick in keys/coins in your pocket — corrupted file systems are the #1 cause of CDJ no-shows.",
      "Bringing only one USB. Always carry two synced copies (rekordbox Sync Manager handles this).",
    ],
    proMoves: [
      "Carry your own headphone splitter, RCA→3.5mm cable, and at least one spare USB stick.",
      "Take a photo of every connection BEFORE the previous DJ unplugs — saves you in a swap-over panic.",
      "Learn the layout of the DJM-A9, DJM-900NXS2 and DDJ-FLX10. Those three cover ~90% of the venues you'll play.",
    ],
    quizHard: [
      { q: "On a Pioneer DJM mixer, where should you set channel gain?", options: ["Maximum, then lower with the fader", "So peaks land in the green / lower orange of the channel meter", "By ear, the meters are decorative", "Same level as the master fader"], answer: 1, explain: "Gain stages each channel BEFORE the fader and crossfader. Hot gain into a low fader still clips internally.", hint: "Stage before fader." },
      { q: "Pro DJ Link is", options: ["A streaming service", "An Ethernet protocol linking CDJs, mixer and laptop to share BPM, beatgrid, library", "A USB connector type", "A type of XLR cable"], answer: 1, explain: "Pro DJ Link is the Ethernet network that lets CDJs/mixer/rekordbox share tempo, beat phase, library and waveform data.", hint: "Network cable between the decks." },
      { q: "Why send the booth output at a different level than master?", options: ["You don't — they should always match", "Booth feeds your stage monitor; the room PA needs more volume because of distance and crowd absorption", "Booth is mono, master is stereo", "Booth carries the cue signal"], answer: 1, explain: "Booth feeds the DJ; master feeds the room. Crowds and distance absorb high frequencies — booth often runs quieter and slightly different EQ.", hint: "You and the dance floor hear different rooms." },
    ],
    sources: [
      { label: "Pioneer DJM-A9 Operating Instructions", section: "Connections & signal flow" },
      { label: "rekordbox 6 Manual", section: "Connecting hardware (Pro DJ Link)" },
    ],
  },

  "rekordbox-intro": {
    hook: "rekordbox is the database. It analyses every track once, then your decks read that analysis for life.",
    beginner: {
      what: [
        "rekordbox is Pioneer's free software for managing your DJ music library. You drag a track in, it spends a few seconds 'analysing' it (finding the BPM, the key, the beat positions), and then that information lives in the file forever.",
        "There are two main modes: Export Mode (analyse on laptop, copy library to a USB, play on CDJs without the laptop) and Performance Mode (use rekordbox itself like a DJ controller's software, with a controller plugged in).",
        "The layout has 4 panels you'll use 90% of the time: Collection (all your tracks), Playlists (your folders), Browser (file system), and Deck view (the waveforms when you're mixing).",
      ],
      why: [
        "Analysis once, play everywhere. Plug your USB into any CDJ-3000 in any club and your cues, key, BPM and grid are there.",
        "Playlists let you build crates by genre/energy/key — way faster than scrolling 5000 tracks at 2 a.m.",
        "Hot cues you set at home work live — no fiddling under pressure.",
      ],
      analogy:
        "rekordbox is the prep kitchen. You wash, chop, label everything at home so service night is just plating.",
    },
    advanced: {
      what: [
        "rekordbox builds a per-track metadata record: BPM (auto-detected from transient analysis), beatgrid (anchor + tempo curve), musical key (algorithmic harmonic analysis, Camelot notation available), waveform image (3 zoom levels), hot cues (up to 8), memory cues, loops, and your custom My Tags.",
        "Two storage layers: a master SQLite database on your laptop (~/Library/Pioneer/rekordbox/) and per-USB export databases (PIONEER folder on the stick). Sync Manager (cloud or LAN) keeps multiple USBs/laptops aligned.",
        "Export Mode and Performance Mode share the same library — switching is one click. Lighting (DMX), video (rekordbox Video), CDJ tag list, related tracks and intelligent playlists are all built on top of the same metadata.",
      ],
      edgeCases: [
        "Analysis can mis-detect BPM at half/double tempo on drum & bass (often shows 87 instead of 174). Use the Edit Beatgrid panel and the ×2/÷2 buttons.",
        "Variable-tempo tracks (live recordings, edits with tempo curves) need 'Dynamic' grid mode rather than 'Static' — set in Preferences → Analysis.",
        "If you re-encode or re-tag a file outside rekordbox, the database can lose its link to the file. Always tag inside rekordbox or use 'Relocate' if files move.",
        "USB filesystem: FAT32 (universal, 4 GB file limit), exFAT (works on CDJ-3000/2000NXS2, larger files), HFS+ / NTFS are NOT supported on most CDJs.",
      ],
      engineerNotes: [
        "Beatgrid is anchor + tempo, not per-beat — the grid is mathematical from the anchor downwards. A bad anchor = a drifting grid.",
        "Hot cues store position (samples), name, colour and (optionally) a memory loop length. They are read by any CDJ-2000NXS2+ from your USB.",
        "Phrase analysis (Pioneer's 'Beat Jump per Phrase' on CDJ-3000) is a separate algorithm — it can be wrong on intro-less edits and you can override it.",
      ],
    },
    flow: "Drag track → Analyse (BPM/Key/Grid) → Set hot cues → Add to playlist → Export to USB → Plays anywhere",
    walkthrough: [
      { do: "Open rekordbox → drag a track from your Downloads folder into the Collection panel.", listen: "Watch the BPM, Key columns populate after analysis. The waveform appears in the lower preview." },
      { do: "Click the track to load it to a virtual deck (top of the screen).", listen: "Hit play on the deck and the waveform scrolls — that's the same view you'll see on a CDJ-3000." },
      { do: "On the first downbeat after the intro, hit Hot Cue A (numeric keys 1–8 in Performance Mode).", listen: "An orange marker drops on the waveform. From now on, pressing A jumps the playhead there instantly." },
      { do: "Right-click the track → Open in Browser → check the file's actual location on disk.", listen: "rekordbox doesn't move your audio — it just remembers where it lives. Move the file and rekordbox shows a red ! warning." },
      { do: "Create a new Playlist (left panel), drag 5 tracks into it, then Export to a USB stick (File → Export to Device).", listen: "rekordbox copies the audio + database to the stick. Plug into a CDJ and you have your playlist, cues, BPM, key — all of it." },
    ],
    listenFor: [
      "Does the beatgrid line up with the kicks all the way through? Zoom in at 1:00, 2:00, 3:00 — drift is visible.",
      "If the detected key feels wrong (vocal sounds dissonant against a bass note you trust), trust your ears and over-write.",
      "After export, the CDJ shows the same hot cue positions you set. If not, you exported to the wrong USB or didn't 'safely eject'.",
    ],
    mistakes: [
      "Pulling the USB without ejecting — corrupts the PIONEER database and the stick won't load.",
      "Trusting auto-key on tracks with heavy effects or breakdowns — verify by ear with reference tracks.",
      "Building one giant playlist instead of crates by energy/key/role. You'll be scrolling 800 tracks at peak.",
      "Forgetting Sync Manager — playing from a stick that's a week behind your master library is a classic 'where did that track go' moment.",
    ],
    proMoves: [
      "Set hot cue A on every track's first downbeat after the intro. Universal launching position.",
      "Use My Tags for Energy 1–5 and Role (Opener / Builder / Peak / Closer). Filter by tag during the set.",
      "Two USB sticks, identical, kept synced via Sync Manager. One in the deck, one in your pocket.",
      "Set Preferences → Analysis → Quality to High before importing — re-analysis on 5000 tracks later is painful.",
    ],
    quizHard: [
      { q: "Why does drum & bass often get detected at half BPM by rekordbox?", options: ["Bug in the software", "DnB has a half-time feel — kicks land on beats 1 and 3 of a 4/4 bar at 174, which the detector reads as 87", "DnB files are encoded differently", "The detector only goes up to 160"], answer: 1, explain: "The auto-detector picks the strongest pulse rate; DnB's heavy snare-on-3 rhythm reads as 87 BPM in 4/4. Hit ×2 to fix.", hint: "Half-time feel fools the algorithm." },
      { q: "On a CDJ-3000, the hot cues you see are stored", options: ["On the CDJ's internal memory", "In the rekordbox export database on the USB stick you inserted", "In the cloud", "On Pioneer's servers"], answer: 1, explain: "All cue/loop/grid data lives in the PIONEER folder on your USB. The CDJ reads it on insert.", hint: "Pull the USB out and the data goes with it." },
      { q: "Dynamic Beatgrid mode in rekordbox is for", options: ["Tracks with multiple tempos or live-feel timing", "Quantising MIDI", "Stems", "Setting hot cues automatically"], answer: 0, explain: "Static grids assume a constant BPM. Dynamic follows tempo curves — necessary for live recordings, edits with tempo shifts, and many older tracks.", hint: "Live recordings drift; the grid must drift with them." },
    ],
    sources: [
      { label: "rekordbox 6 Operating Manual", section: "Analysis settings & beatgrid editing" },
      { label: "rekordbox 6 Operating Manual", section: "Export Mode / Performance Mode" },
    ],
  },

  "headphone-monitoring": {
    hook: "Your headphones are a private window into the next track. The cue mix is the most under-used knob in the booth.",
    beginner: {
      what: [
        "Headphones in DJing don't replace the speakers — they let you listen to the *next* track privately while the *current* track plays loud in the room. That's how you beatmatch and find the right place to start the new track before anyone in the room hears it.",
        "Every DJ mixer has a 'Cue' button on each channel. Press it and that channel goes to your headphones (only). You can cue multiple channels at once to hear them blended privately.",
        "There's also a 'Cue/Master' or 'Mix' knob on the headphone section. All the way left = only the cued track. All the way right = only the room mix. In the middle = blend of both, which is how most pros monitor live.",
      ],
      why: [
        "You can prepare a transition completely in private — find the downbeat, beatmatch, EQ it — before bringing it into the room.",
        "Cueing both decks at once + Mix knob in the middle lets you hear your transition the way the crowd will hear it, before they hear it.",
        "If the room PA blows up (cable falls out, channel dies), your headphones are your only confirmation that the music is still actually playing.",
      ],
      analogy:
        "Think of headphones as a chef tasting the next dish in the kitchen before it leaves for the dining room.",
    },
    advanced: {
      what: [
        "The cue bus is a parallel summing bus on the mixer. Each channel's CUE button routes a pre-fader (sometimes user-selectable post-fader) signal to the cue bus, summed and sent to the headphone amp.",
        "The Cue/Master crossfade knob blends the cue bus with the master output bus into the headphone amp output. Splitting cue (some mixers: 'split' mode) puts cue in one ear, master in the other — useful for monitoring while wearing one cup.",
        "Closed-back, high-isolation headphones (HDJ-X10, HD25, Sennheiser HD7) are standard. In-ear monitors are increasingly used for hearing protection — sealed IEMs with a wedge or shaker for low-end body.",
      ],
      edgeCases: [
        "On Pioneer DJM-A9 and DJM-V10, the cue tap is post-EQ — so EQ moves on the deck affect what you hear in headphones, which can hide problems if you cut highs and then forget.",
        "Wireless / Bluetooth headphones have unacceptable latency for beatmatching — never use them live.",
        "Long sets with cue volume above 95 dB SPL average risk permanent hearing damage. NIOSH recommends max 85 dB for 8 hours, halve allowed time per +3 dB.",
      ],
      engineerNotes: [
        "Set headphone volume by the loudest source you'll cue against the loudest room moment. Don't keep cranking it through the night — your hearing fatigues but the SPL on your ears keeps rising.",
        "Cue mix at noon (50/50) is the most common pro position — you're always aware of the room while preparing the next track.",
      ],
    },
    flow: "Deck → Mixer channel → Cue button → Cue bus → Cue/Master knob → Headphone amp → Phones",
    walkthrough: [
      { do: "Plug headphones into the front of the mixer (1/4\" TRS jack).", listen: "Silence — even if music is playing in the room. Nothing reaches the cue bus until you press a Cue button." },
      { do: "Press Cue on channel 1 (with a track loaded and playing).", listen: "You hear that channel in your phones. Press it again to release." },
      { do: "Set the Cue/Master mix knob fully to 'Cue' and slowly turn it toward 'Master'.", listen: "You hear the room mix bleed in. Park it at noon for a balanced monitor." },
      { do: "Cue both channel 1 and channel 2 with both decks playing.", listen: "You hear both decks privately blended. This is how you check beatmatch before opening the channel fader to the room." },
      { do: "Open the channel fader on the cued deck while the cue is still active.", listen: "Sound enters the room. Drop the Cue button — your phones now only carry the other deck (the next track), as it should be." },
    ],
    listenFor: [
      "Distortion in headphones — almost always headphone volume too high relative to source, not gain on the channel.",
      "One ear quieter — bad TRS connection or worn jack. Twist the plug 90° to confirm.",
      "Whether the kick on the cued deck and the kick on the room deck arrive together. That's beat phase alignment, audible in <30 ms of drift.",
    ],
    mistakes: [
      "Setting cue mix fully to 'Cue' so you can't hear the room — you lose situational awareness and a dropped PA goes unnoticed.",
      "Cranking headphone volume because the cued track is quiet. Fix the deck's gain, not the headphone amp.",
      "Wearing headphones over both ears all night. Your hearing budget runs out fast — use one cup off when you don't need to cue.",
      "Forgetting to release Cue on the outgoing track. That deck is then absent from your headphones when you need it.",
    ],
    proMoves: [
      "Lower headphone volume between transitions — it gives your ears recovery time and your loud moments stay impactful.",
      "Use the split-cue mode if your mixer has it (cue in one ear, master in the other) when blending in noisy environments.",
      "Invest in flat-response, high-isolation headphones. Hyped low-end headphones make you under-EQ the bass in the room.",
    ],
    quizHard: [
      { q: "What does the Cue/Master knob on a DJ mixer actually do?", options: ["Sets master volume", "Crossfades between the cue bus and master bus into the headphone output", "Turns headphones on/off", "Sets EQ on cue"], answer: 1, explain: "It's a balance between two summed buses going into the headphone amp — neither replaces the other.", hint: "It blends two signals into your phones." },
      { q: "Why are wireless headphones unsuitable for beatmatching?", options: ["They sound worse", "Bluetooth audio latency is typically 150–300 ms — far above the 20 ms you need to feel beat phase", "They aren't loud enough", "They lack bass response"], answer: 1, explain: "You need real-time monitoring. 200 ms of latency means the track you hear is hundreds of ms behind reality.", hint: "Latency, not fidelity." },
      { q: "Safe long-set headphone level is approximately", options: ["Whatever sounds good", "≤85 dB SPL average per ear over 8 hours (NIOSH)", "100 dB", "120 dB"], answer: 1, explain: "Allowable exposure halves per +3 dB. A 4-hour set at 88 dB is the same dose as 8 hours at 85.", hint: "Hearing damage is a dose, not a moment." },
    ],
    sources: [
      { label: "Pioneer DJM-A9 Operating Instructions", section: "Headphone monitoring" },
      { label: "NIOSH 1998 Criteria", section: "Occupational noise exposure" },
    ],
  },

  "booth-setup": {
    hook: "30 seconds of setup checks save 30 minutes of panic. Always assume the previous DJ broke something.",
    beginner: {
      what: [
        "Booth setup is the routine you run from the moment you walk into the booth until your first track plays. Done right, it's invisible. Done wrong, you'll be debugging cables when your set starts.",
        "The basic checklist is: (1) load your USB, (2) check master/booth volume and headphones, (3) test each channel with the master fader down, (4) take over from the previous DJ on a clean phrase, (5) only then turn your master up.",
        "You always assume the EQ knobs, gain, filter, and effects on the mixer are in random positions from the previous DJ. Reset everything to neutral (12 o'clock / off) before bringing your first track in.",
      ],
      why: [
        "A clean takeover is the difference between looking like a pro and looking like an amateur — everyone in the booth notices.",
        "The previous DJ might have cut the high EQ to ride a moment, or left a filter half-on. If you don't reset, your first track sounds wrong and you'll panic-search for the cause.",
        "Knowing your headphone level is set before the takeover means you can cue immediately and not miss the next downbeat.",
      ],
      analogy:
        "Pre-flight check. Pilots don't trust the previous flight's switches — they reset and verify every one before takeoff.",
    },
    advanced: {
      what: [
        "Industry takeover routine: (1) USB inserted to a free CDJ + library loaded, (2) first track loaded but paused on a hot cue, (3) headphones plugged + cue verified, (4) channel gain matched to the outgoing track on the channel meter, (5) EQ + filter + colour FX neutralised, (6) channel fader at zero / crossfader away from your deck, (7) on phrase boundary, ride channel fader up while previous DJ rides theirs down.",
        "Master & booth volume are NEVER touched during a takeover — those belong to the venue's sound engineer or are calibrated to the system. Touch only your own channel.",
        "Effect units and master FX from the previous DJ must be disengaged. The DJM-A9 'BEAT FX' section can still be armed without lighting up — always tap the FX off button to be sure.",
      ],
      edgeCases: [
        "Some venues run Pioneer 'rekordbox lighting' — the DMX layer can desync if a CDJ is unplugged mid-set. Coordinate with the lighting engineer before USB swaps.",
        "Booth feed may have a separate EQ from master — check both meters, not just one.",
        "On hybrid setups (your controller into a free mixer channel), set channel gain to match the CDJs and engage the channel's 'Line' input mode, not 'Phono'.",
      ],
      engineerNotes: [
        "Carry a head torch. Booth lights die, sound desks are dim, and finding a USB port at 2 a.m. is faster with light.",
        "Mark your USB sticks with reflective tape — they vanish into black mixer surfaces.",
      ],
    },
    flow: "Walk in → USB in → Load track → Headphones + cue OK → Match gain → Neutralise EQ/FX → Cue downbeat → Phrase takeover → Master fader stays",
    walkthrough: [
      { do: "Greet the previous DJ. Ask 'how long do you have?' so you know your takeover window.", listen: "Their answer determines whether you have 2 minutes or 20 to set up. Plan accordingly." },
      { do: "Insert USB into an idle CDJ, load your first track, set the playhead on its first hot cue (downbeat after intro), keep it paused.", listen: "The deck shows your waveform. You're armed but silent." },
      { do: "Press the channel's Cue button, set headphone volume by ear against the room volume.", listen: "You hear your track at the volume you need to beatmatch. Master in the room is untouched." },
      { do: "Visually check every EQ knob (low/mid/high), filter, and colour FX on your channel — return any that aren't at 12 o'clock / off to neutral.", listen: "Channel is now a clean slate." },
      { do: "Wait for a phrase boundary (8 or 16 bars) in the outgoing track. On the downbeat, press Play on your deck and bring the channel fader up while the previous DJ brings theirs down.", listen: "Clean takeover. No level change in the master, no EQ collisions, no missed beat." },
    ],
    listenFor: [
      "Sub bass clash on the takeover — the safest first move is to cut your low EQ until the outgoing track's bass is mostly gone.",
      "Master meter staying in the same place during takeover — if it jumps, your gains aren't matched.",
      "Crowd's reaction — a clean takeover gets no reaction (good). A messy one gets heads turning to the booth (bad).",
    ],
    mistakes: [
      "Touching the master fader to 'make sure your track is loud enough' — the venue calibrated that for the room.",
      "Loading a track on a deck the previous DJ is still using.",
      "Forgetting to release the cue on the outgoing track — you'll be hearing the wrong source when you next look for the next track.",
      "Plugging the USB into the deck the previous DJ is currently playing from — yes, this happens, and it can crash the deck.",
    ],
    proMoves: [
      "Arrive 30 minutes before your set. Watch the previous DJ from the floor to learn the room's energy and the system's quirks.",
      "Bring an A4 card with your first 3 transitions noted. Sets where you free-form everything are confident sets; the safety card is for the 1% you need it.",
      "Take a phone photo of the mixer state when you START your set. If you get lost mid-set, you have a known-good reference to return to.",
    ],
    quizHard: [
      { q: "Why is the master fader untouchable during a takeover?", options: ["It's not — adjust freely", "The venue's sound engineer calibrated it for the room/PA; touching it changes the rig's reference level", "It controls the lights", "It's mechanically locked"], answer: 1, explain: "Master + booth output levels are part of the venue's system tuning. Channel gain and channel fader are yours; master belongs to the room.", hint: "Whose calibration is master?" },
      { q: "First move when you sense a sub-bass clash on a takeover is", options: ["Lower the master", "Cut the low EQ on the incoming or outgoing channel until phasing/mud disappears", "Engage a high-pass filter on master", "Reduce headphone volume"], answer: 1, explain: "Two basslines on top of each other = mud and phase issues. Cut low on one channel so only one bass is present at a time.", hint: "Two basses = one too many." },
      { q: "Why neutralise channel EQ/FX before takeover?", options: ["Looks tidy", "Previous DJ's settings can make your first track sound wrong, and you'll waste seconds debugging during your most exposed moment", "Required by Pioneer firmware", "Resets the BPM"], answer: 1, explain: "You can't trust the controls' position from the last user. Reset = predictable starting sound.", hint: "Trust nothing the last DJ left." },
    ],
    sources: [{ label: "rekordbox 6 Manual / Pioneer DJM-A9", section: "Channel signal flow & takeover practice" }],
  },

  "dj-culture": {
    hook: "DJing is older than the equipment. You're joining a 50-year conversation about how to move a room.",
    beginner: {
      what: [
        "DJ culture started in the 1940s with radio DJs picking records, exploded in the 1970s with disco DJs in New York like Francis Grasso (who invented beatmatching) and Larry Levan (who turned a club into a religion at the Paragon Garage).",
        "Hip-hop DJing started in the Bronx with Kool Herc looping the drum breaks of funk records, which led to Grandmaster Flash inventing the cross-fader scratch and turntablism as a musical instrument.",
        "House (Chicago, 1980s, Frankie Knuckles), techno (Detroit, Juan Atkins/Derrick May/Kevin Saunderson), garage (UK), drum & bass, dubstep, EDM, lo-fi — every genre has DJ heroes who set the template for how it's played.",
      ],
      why: [
        "Knowing the history means you can talk to other DJs, promoters and crowds without bluffing.",
        "Every modern technique (cue points, looping, beatmatching, key mixing) was invented by someone in this lineage solving a specific problem. Knowing the why explains the how.",
        "Crowds respect DJs who play the deep records. A 1985 Larry Heard cut in 2026 still works — but only if you know it exists.",
      ],
      analogy:
        "Like a chef who knows escoffier and the regional traditions — you can cook on autopilot, but knowing the lineage makes everything you do intentional.",
    },
    advanced: {
      what: [
        "Lineage you should be able to trace: Disco (Grasso, Mancuso, Levan, Knuckles) → Garage (Paradise Garage, NJ house) → Chicago House (Knuckles, Ron Hardy, Trax/DJ International labels) → Detroit Techno (Belleville Three, Underground Resistance) → UK Rave (Hardcore, Jungle, DnB) → UK Garage → Dubstep → contemporary fragmentation.",
        "Parallel lineage: Bronx hip-hop (Herc, Flash, Bambaataa) → turntablism (DMC, Q-Bert, Mix Master Mike) → modern controllerism / Serato turntablism.",
        "Equipment lineage: Technics SL-1200 (1972) → Pioneer CDJ-100 (1994) → CDJ-1000 (2001, hot cues + waveform) → CDJ-2000 NXS2 → CDJ-3000 + DJM-A9. Each device reshaped what was possible technique-wise.",
      ],
      edgeCases: [
        "'EDM' as a marketing term mostly refers to North American festival house/electro post-2010 — many older European scenes reject the label.",
        "Vinyl-only scenes still exist (some Berlin and Tokyo clubs); knowing why is more useful than dismissing it.",
        "Local scenes matter — your home city's promoters and crews are your real network. Internet fame ≠ booked weekends.",
      ],
      engineerNotes: [
        "Read: Bill Brewster & Frank Broughton 'Last Night a DJ Saved My Life'; Tim Lawrence 'Love Saves the Day'.",
        "Watch: Resident Advisor 'Slices' documentary series; Boiler Room sets from the era you're curious about.",
      ],
    },
    walkthrough: [
      { do: "Pick one decade (e.g. '90s Chicago house) and listen to 5 essential tracks from it on a proper system or good headphones.", listen: "Notice the production limits of the era — drum machines, samplers — and how DJs worked around them." },
      { do: "Watch a Boiler Room or Cercle set from a DJ you've never heard of, all the way through.", listen: "Their track selection tells you who their influences are. Spot the older records." },
      { do: "Read one DJ memoir or oral history of a scene (e.g. Last Night a DJ Saved My Life chapter on the Loft).", listen: "You'll start hearing modern sets as 'descendants of X' rather than isolated artistry." },
      { do: "Identify your local scene's three biggest residents (not touring acts) and listen to their last 5 published sets.", listen: "These are the people you're competing for slots with — know what they play." },
      { do: "Find one classic track per genre you play that's at least 20 years old. Slot it into a set.", listen: "Older heads in the crowd notice. So do promoters." },
    ],
    listenFor: [
      "The 'sound' of an era — disco's live strings, '90s house's MPC swing, '00s minimal's restraint.",
      "Tracks that sample older tracks — a chain backwards is a music history lesson.",
      "Who's quoted on dubplate intros and shout-outs — that's the network of who respects whom.",
    ],
    mistakes: [
      "Assuming culture started with the first DJ you heard of. There's always someone earlier who did it harder.",
      "Treating older genres as nostalgia. They're still being played, mostly because they still work.",
      "Skipping the local scene to chase Instagram-famous DJs. The locals are who book you.",
    ],
    proMoves: [
      "Build a 'roots' playlist of 30 tracks that defined the genre you play — and listen to it once a week.",
      "Show up to other people's parties. The DJ who only DJs is invisible to the scene.",
      "When you find an obscure track that works, share it. Generosity is currency in this culture.",
    ],
    quizHard: [
      { q: "Beatmatching as a DJ technique was popularised by", options: ["Larry Levan", "Francis Grasso, NYC ~1969", "Frankie Knuckles", "Carl Cox"], answer: 1, explain: "Grasso at Sanctuary in NYC built the technique that lets two records be heard as one continuous beat.", hint: "Pre-disco era, late '60s." },
      { q: "The Belleville Three are credited with the foundation of", options: ["Chicago house", "Detroit techno", "UK garage", "Trance"], answer: 1, explain: "Juan Atkins, Derrick May and Kevin Saunderson, all from Belleville, Michigan, defined Detroit techno in the early '80s.", hint: "Detroit, three teenagers, futurist sound." },
      { q: "Why does scene literacy matter for getting booked?", options: ["It doesn't", "Promoters book DJs who fit a scene's identity; knowing the lineage means you can program sets that feel native to a room", "It only matters for older DJs", "Promoters only check social numbers"], answer: 1, explain: "Beyond stats, promoters want DJs whose taste fits the room. Lineage knowledge shows in selection.", hint: "What gets you the second booking, not the first." },
    ],
  },

  "genre-bpm-reference": {
    hook: "BPM is a starting filter. Two tracks at the same BPM can be unmixable if they're from different worlds.",
    beginner: {
      what: [
        "Different styles of dance music live at different tempos. Knowing the rough BPM range of each genre lets you plan a set, find compatible tracks, and decide when to gear-shift the energy.",
        "Rough reference: Hip-hop / RnB 70–100, Reggae / Dub 80–100, House (most flavours) 118–128, Techno 125–140, Disco 110–125, Drum & Bass 160–180, UK Garage 130–140, Trance 130–145, Dubstep 138–150 (often felt at 75 half-time), Hardcore 150–180+.",
        "Within a genre, sub-styles cluster around specific BPMs — Deep house ≈122, Tech house ≈124–127, Peak-time techno 130–138, Liquid DnB 170–175, Footwork 160.",
      ],
      why: [
        "Mixing a 124 BPM track into a 128 BPM track is easy. 124 into 138 is a gear change you have to plan for.",
        "Knowing the genre's pocket means you can prep playlists by BPM bucket, then by key and energy.",
        "Helps you predict the crowd's mood — a 140 BPM crowd is in a different physical state than a 122 BPM one.",
      ],
      analogy:
        "Like cycling — there's a comfortable gear for each terrain. You can shift, but you do it on purpose, not by accident.",
    },
    advanced: {
      what: [
        "Most DJ pitch ranges are ±6%, ±10% or ±16% (selectable on CDJ-3000). At ±6% you can blend between tracks within ~7 BPM of each other before the pitch shift becomes audible on melodies and vocals.",
        "Master Tempo / Key Lock holds the perceived pitch constant while tempo changes — essential beyond ±3% if vocals are present. The algorithm introduces artefacts above ±8%, more obvious on sustained vocals than on percussion.",
        "Half-time / double-time mixes (e.g. 70 BPM hip-hop into 140 BPM dubstep at the same felt pulse) are valid genre bridges if the rhythm halves cleanly.",
      ],
      edgeCases: [
        "Many DnB tracks are written and detected at half-time (87 instead of 174). Plan your set tempo by 'felt' BPM, not detected.",
        "Footwork / juke at 160 has a 4/4 kick but a triplet feel — feels 'faster' than 160 due to rhythmic density.",
        "Old funk and disco have a wide tempo variance within a single track because they were recorded live — beatgrid carefully and use Dynamic mode.",
      ],
      engineerNotes: [
        "Build BPM-bracketed crates: e.g. 118–122, 122–126, 126–130, 130–134. Within each, sort by key and energy.",
        "When ramping tempo across a set, plan inflection points (e.g. +2 BPM every 25 minutes) rather than chasing per-track tempo bumps.",
      ],
    },
    flow: "Genre → BPM range → Pitch tolerance ±6% → Compatible neighbours → Key & energy filter → Slot in set",
    walkthrough: [
      { do: "In rekordbox, sort your collection by BPM ascending.", listen: "You'll see your library cluster around tempos that map to the genres you actually play." },
      { do: "Pick a target tempo (say 124) and select all tracks within ±4 BPM.", listen: "These are easy blends without needing key lock — your immediate-neighbour pool." },
      { do: "Engage Key Lock / Master Tempo on a deck and stretch a 124 track to 128.", listen: "Vocals stay in tune but you hear a slight 'shimmer' — that's the algorithm." },
      { do: "Try the same stretch with Key Lock off.", listen: "Now the pitch rises with tempo. Vocals sound chipmunked — clearly audible above +3%." },
      { do: "Find a 70 BPM hip-hop track and play it under a 140 BPM techno track (kicks on alternating beats).", listen: "If the rhythmic feel matches, that's a half-time bridge — useful for genre transitions." },
    ],
    listenFor: [
      "The 'sweet spot' of a track — most have a 2–4 BPM window where they sound best, not just where they were written.",
      "Half-time vs. double-time feel on detection — if your detected BPM seems wrong, halve or double it and check.",
      "Genre boundaries blur at the edges — 128 BPM is 'fast house' or 'slow techno' depending on production.",
    ],
    mistakes: [
      "Pitching tracks more than ±6% without Key Lock — vocals and melodic content become obviously processed.",
      "Programming a set entirely at one tempo — listenable, but it feels static after 45 minutes.",
      "Trusting auto-detected BPM on DnB / footwork / dubstep without verifying half/double.",
      "Mixing tracks across a 10+ BPM gap by aggressive pitch instead of using a half/double-time bridge.",
    ],
    proMoves: [
      "Memorise the BPM 'home' of the top 5 tracks per genre you play. You'll feel when a track is dragging or rushing instantly.",
      "Build a tempo arc for every set — opener at -4 BPM from peak, peak in the middle third, closer back down -6 BPM.",
      "Use half/double-time tricks to bridge into a genre change without breaking the rhythm.",
    ],
    quizHard: [
      { q: "Why is Master Tempo / Key Lock essential beyond ±3% pitch?", options: ["It isn't", "Pitch shift becomes audible on vocals and melodic content — Key Lock holds perceived pitch while tempo changes", "It only matters for techno", "It changes the BPM display"], answer: 1, explain: "Without Key Lock, ±5% is a ~80 cent pitch shift — clearly perceptible on vocals.", hint: "What does your ear tolerate without flagging?" },
      { q: "A 174 BPM DnB track detected at 87 BPM means", options: ["Bad audio file", "The detector locked onto the half-time pulse — kicks fall on beats 1 and 3, doubling the apparent beat interval", "Wrong file format", "Corrupted analysis"], answer: 1, explain: "DnB's strong snare on 3 reads as a downbeat, halving the perceived BPM. Use ×2 in rekordbox to correct.", hint: "Half-time feel fools the algorithm." },
      { q: "Half-time bridging means", options: ["Slowing the tempo by half mid-mix", "Playing a track at half the BPM of the other so each beat lands on every other beat of the faster track — used to bridge between tempo zones", "Using only the first half of each track", "Loop length set to half a bar"], answer: 1, explain: "70 BPM kicks every 2nd 140 BPM beat = same felt pulse. Useful for genre transitions across big tempo gaps.", hint: "Same pulse felt, different number printed." },
    ],
  },

  "your-first-mix": {
    hook: "Your first mix is two tracks, one fade. Get this right and every other technique is a refinement of it.",
    beginner: {
      what: [
        "A 'mix' between two tracks means: the first one is playing in the room; you start the second one secretly in your headphones; you make their beats line up; you fade the first one down while you fade the second one up; the room only ever hears continuous music.",
        "The simplest version uses just two faders. Track A is up, track B is at zero, you cue B in headphones, find a moment where their kicks line up, then over about 16 bars you raise B and lower A.",
        "Where you start track B matters a lot. Most dance tracks have a 16- or 32-bar intro of just drums — that's the safe runway to layer over the outgoing track's outro. Don't mix into a vocal section.",
      ],
      why: [
        "It's the foundation of everything: long blends, EQ swaps, cuts, effect transitions are all variations of this basic move.",
        "Practising it slowly first builds the muscle memory you need when the crowd is in front of you.",
        "Knowing where the safe intro/outro windows are means you can mix tracks you've never played before, just by reading the waveform.",
      ],
      analogy:
        "Like merging onto a motorway. You match speed in the slip road (cue), wait for the gap (intro), and slide in (fader ride). You don't slam the brakes mid-merge.",
    },
    advanced: {
      what: [
        "A standard 'long blend' is 16–32 bars on 4/4 dance music at 120–130 BPM (~30–60 seconds). The crossover happens on a phrase boundary, not arbitrarily.",
        "Three faders involved: outgoing channel fader (down), incoming channel fader (up), optional crossfader if you DJ in crossfader-centric style (mainly hip-hop/scratch). Most house/techno DJs leave the crossfader centred and use channel faders.",
        "Layered with EQ: as you bring track B in, you typically cut B's lows to prevent two-bass clash. Around the halfway point, you cut A's lows and let B's bass take over. By the end, A is fully out and B is full-range.",
      ],
      edgeCases: [
        "If A and B are in different keys (not Camelot-compatible), shorten the blend window so dissonance doesn't dwell.",
        "If B's intro has a melodic synth, watch for clashes with A's outro — cut B's mids until A is out.",
        "On 4-deck setups, the same blend logic applies but you can layer percussion from a third deck — same EQ discipline required.",
      ],
      engineerNotes: [
        "Practise the blend with the master fader DOWN until you can execute it without looking at the mixer. Then bring master up for the 'real' rehearsal.",
        "Record every practice blend. Listen back the next day — micro-drift and EQ misses you missed in the moment will be obvious.",
      ],
    },
    flow: "A playing → B cued + beatmatched → On phrase, fade B up + A down (16-32 bars) → EQ swap mids/lows → A out, B full",
    walkthrough: [
      { do: "Load two tracks of similar BPM (within 2) and similar genre/energy to Deck 1 and Deck 2.", listen: "Both waveforms now visible. Beat-grid the intro of each so you know where the first downbeat is." },
      { do: "Play Deck 1 to master. Set Deck 2 paused on its first downbeat. Cue Deck 2 in headphones.", listen: "Room hears A. You privately hear B silent (paused)." },
      { do: "Wait for a phrase boundary on A (count 8 bars from any obvious change like a snare roll). On the downbeat, press play on B.", listen: "B starts on a downbeat aligned with A's phrase. Their kicks should land together in your headphones." },
      { do: "Over the next 16 bars, raise B's channel fader gradually while lowering A's. Halfway through, cut A's bass EQ.", listen: "Room hears a continuous beat, B's drums emerging while A's bass leaves. No collision." },
      { do: "By the end of the 16 bars, A is at zero and you bring A's EQ back to centre (ready for the next reload). Release Cue on A.", listen: "Set continues on B. You've completed one blend cycle. Cue the next track on the now-free deck." },
    ],
    listenFor: [
      "The double-kick 'gallop' if your beatmatch drifts — pull your pitch fader by 0.1% to correct.",
      "Bass mud when both kicks/basslines play simultaneously — cut one channel's lows immediately.",
      "Vocal clash — if a vocal phrase is starting on B while A still has its hook, abandon the blend early or wait.",
      "The phrase boundaries in both tracks — they should line up or you'll feel a structural 'jolt'.",
    ],
    mistakes: [
      "Starting B in the middle of a busy section. Always start B from a clean intro point (hot cue A on the first drum-only downbeat).",
      "Doing the blend in fewer than 8 bars on long ambient tracks — feels rushed and abrupt.",
      "Forgetting to swap the bass — two basslines is the #1 cause of muddy mixes.",
      "Watching the screen for beatmatch confirmation instead of trusting your ears. The waveforms can look aligned and still sound off.",
    ],
    proMoves: [
      "Use hot cue A on every track for 'first drum downbeat after intro'. Now every blend starts the same way.",
      "Memorise the 16-bar / 32-bar structure of your top 50 tracks so you know where to land transitions without scrolling.",
      "Practise the EQ swap (bass A down, bass B up) as a single coordinated move — it should feel like one gesture, not two.",
      "Build a 'practice playlist' of 10 tracks at the same BPM. Drill the same blend until it's effortless.",
    ],
    quizHard: [
      { q: "Why is the bass EQ swap necessary during a blend?", options: ["It isn't", "Two simultaneous basslines cause phase issues and frequency masking — only one bass should be active at a time", "It saves CPU", "It changes the BPM"], answer: 1, explain: "Two 50 Hz kicks at slightly different phases sum unpredictably; the mix loses punch and gains mud.", hint: "Two basses = one too many." },
      { q: "Where do experienced DJs almost always start a blend?", options: ["Wherever feels right", "On a phrase boundary — typically every 8 or 16 bars in dance music", "On a snare", "On a bar boundary"], answer: 1, explain: "Crowds feel phrase structure. Mid-phrase blends sound like a glitch.", hint: "Structure not random." },
      { q: "If a vocal phrase starts on the incoming track during your blend, you should", options: ["Continue and ride it out", "Either abandon the blend, accelerate it, or cut the incoming mids until the vocal moment passes", "Stop the outgoing immediately", "Cut all EQ on the outgoing"], answer: 1, explain: "Vocal clashes are the most noticeable mistake. Avoid, accelerate, or duck around them.", hint: "Vocals are the most exposed element." },
    ],
    sources: [
      { label: "rekordbox 6 Operating Manual", section: "Hot cues, beatgrid, blending workflow" },
      { label: "Pioneer DJM-A9 Operating Instructions", section: "Channel fader & EQ" },
    ],
  },
};
