/**
 * setup.js - Tone.js Instruments & Audio Routing
 */

// 1. Mobile Optimization: Add a Master Limiter to prevent clipping
const limiter = new Tone.Limiter(-1).toDestination();

// 2. Increase Master Volume (removed -10dB reduction)
Tone.getDestination().volume.value = 0;

// Master Volume connected to limiter
const mainVolume = new Tone.Volume(0).connect(limiter);

// 3. Optimized Instrument Objects (Reused, lightweight)
const instruments = {
  piano: new Tone.PolySynth(Tone.Synth, {
    maxPolyphony: 8,
    oscillator: { type: "triangle" },
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.5 }
  }).connect(mainVolume),

  guitar: new Tone.PolySynth(Tone.Synth, {
    maxPolyphony: 4,
    oscillator: { type: "sine" },
    envelope: { attack: 0.005, decay: 0.2, sustain: 0.1, release: 0.8 }
  }).connect(mainVolume),

  violin: new Tone.Synth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.3, decay: 0.2, sustain: 0.6, release: 1 }
  }).connect(mainVolume),

  // Drum kit: Reuse synths
  drum: [
    new Tone.MembraneSynth().connect(mainVolume), // 1: Kick
    new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 4, envelope: { attack: 0.001, decay: 0.2, sustain: 0 } }).connect(mainVolume), // 2: Snare
    new Tone.MetalSynth({ envelope: { attack: 0.001, decay: 0.1, release: 0.01 }, frequency: 200, modulationIndex: 20 }).connect(mainVolume), // 3: Hi-hat
    new Tone.MetalSynth({ envelope: { attack: 0.001, decay: 0.5, release: 0.1 }, frequency: 200, modulationIndex: 20 }).connect(mainVolume), // 4: Open Hi-hat
    new Tone.MembraneSynth({ octaves: 2 }).connect(mainVolume), // 5: Tom 1
    new Tone.MembraneSynth({ octaves: 1 }).connect(mainVolume), // 6: Tom 2
    new Tone.NoiseSynth({ envelope: { attack: 0.001, decay: 0.2, sustain: 0 } }).connect(mainVolume), // 7: Clap
    new Tone.MetalSynth({ envelope: { attack: 0.001, decay: 1, release: 0.5 }, frequency: 500, modulationIndex: 50 }).connect(mainVolume), // 8: Crash
    new Tone.MembraneSynth({ pitchDecay: 0.1, octaves: 8 }).connect(mainVolume), // 9: Perc 1
    new Tone.MembraneSynth({ pitchDecay: 0.2, octaves: 10 }).connect(mainVolume), // 10: Perc 2
    new Tone.NoiseSynth({ envelope: { attack: 0.01, decay: 0.1, sustain: 0 } }).connect(mainVolume), // 11: Shaker
    new Tone.MetalSynth({ envelope: { attack: 0.005, decay: 0.05, release: 0.05 }, frequency: 1000 }).connect(mainVolume) // 12: Rim
  ]
};

// Global Recorder (connected to main volume)
const recorder = new Tone.Recorder();
mainVolume.connect(recorder);

// Helper to calculate duration in seconds from tempo (1 beat)
function getDuration(tempo) {
  // Lower tempo -> Longer duration (sustained notes)
  // Higher tempo -> Shorter duration
  return (60 / parseInt(tempo)) * 1.5; // * 1.5 to provide a slight overlap for smoother transitions
}

/**
 * playSound - Trigger sound based on instrument and note
 * @param {string} instrumentName - piano, guitar, violin, drum
 * @param {string|number} noteOrIndex - note name or drum index
 * @param {number} currentTempo - tempo to calculate duration
 */
function playSound(instrumentName, noteOrIndex, currentTempo = 120) {
  if (Tone.context.state !== 'running') {
    console.warn("Audio context not running.");
    return;
  }
  
  const duration = getDuration(currentTempo);
  
  if (instrumentName === "drum") {
    const padIndex = parseInt(noteOrIndex) - 1;
    const drumSynth = instruments.drum[padIndex];
    if (drumSynth) {
      if (drumSynth instanceof Tone.NoiseSynth) {
        drumSynth.triggerAttackRelease("16n");
      } else {
        drumSynth.triggerAttackRelease("C2", "16n");
      }
    }
  } else if (instruments[instrumentName]) {
    // Apply dynamic duration to melodic instruments
    instruments[instrumentName].triggerAttackRelease(noteOrIndex, duration);
  } else {
    console.warn(`Instrument ${instrumentName} not found.`);
  }
}

// Export for global access
window.playSound = playSound;
window.recorder = recorder;
