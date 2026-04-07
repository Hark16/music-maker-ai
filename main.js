/**
 * main.js - Core Logic Wiring
 */

// App State
let currentInstrument = "piano";
let currentTempo = 120;
let isAudioStarted = false;

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const btnStartAudio = document.getElementById("btn-start-audio");
  const startOverlay = document.getElementById("start-overlay");
  const btnPlay = document.getElementById("btn-play");
  const btnLoop = document.getElementById("btn-loop");
  const btnDownload = document.getElementById("btn-download");
  const btnSaveNotation = document.getElementById("btn-save-notation");
  const tempoSlider = document.getElementById("tempo-range");
  const tempoLabel = document.getElementById("tempo-label");
  const musicGrid = document.getElementById("music-grid");
  const tabs = document.querySelectorAll(".tab");
  const notationBox = document.getElementById("notation-box");

  // 1. Initialize Audio Engine
  console.log("Waiting for user to start audio...");
  if (btnStartAudio) {
    btnStartAudio.addEventListener("click", async () => {
      console.log("Start button clicked. Responding immediately...");
      
      // Hide overlay immediately for instant UI feedback
      if (startOverlay) startOverlay.style.display = "none";
      
      try {
        await Tone.start();
        console.log("Audio Engine initialized. Context state:", Tone.context.state);
        isAudioStarted = true;
      } catch (err) {
        console.error("Tone.js start failed:", err);
      }
    });
  }

// 2. Instrument Navigation
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    
    currentInstrument = tab.dataset.instrument;
    document.body.className = `${currentInstrument}-mode`;
    
    updateGridLabels();
    toggleTempoVisibility();
  });
});

function updateGridLabels() {
  const pads = musicGrid.querySelectorAll(".grid-pad");
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  
  pads.forEach((pad, index) => {
    if (currentInstrument === "drum") {
      pad.textContent = index + 1;
      pad.dataset.note = index + 1;
    } else {
      pad.textContent = notes[index];
      pad.dataset.note = notes[index] + "4";
    }
  });
}

function toggleTempoVisibility() {
  const tempoContainer = document.getElementById("tempo-container");
  if (currentInstrument === "drum") {
    tempoContainer.style.display = "none";
  } else {
    tempoContainer.style.display = "block";
  }
}

  // 3. Grid Interaction
  let lastPlayedTime = 0;
  musicGrid.addEventListener("click", (e) => {
    const pad = e.target.closest(".grid-pad");
    if (!pad) return;
    
    // Debounce rapid clicks for audio stability (mobile safety)
    const now = Date.now();
    if (now - lastPlayedTime < 50) return;
    lastPlayedTime = now;

    const note = pad.dataset.note;
    console.log(`Grid pad clicked: ${note} (Instrument: ${currentInstrument})`);
    
    // Play sound in real-time with current tempo for duration calculation
    if (typeof window.playSound === "function") {
      window.playSound(currentInstrument, note, currentTempo);
    } else {
      console.error("window.playSound function not found!");
    }
    
    // Auto-insert notation block
    if (typeof window.insertNote === "function") {
      window.insertNote(currentInstrument, note, currentTempo);
    } else {
      console.warn("window.insertNote not found. Content not recorded.");
    }
  });


// 4. Control Buttons
btnPlay.addEventListener("click", () => {
  if (window.playFromNotation) {
    window.playFromNotation(false);
  }
});

btnLoop.addEventListener("click", () => {
  if (window.playFromNotation) {
    window.playFromNotation(true);
  }
});

btnDownload.addEventListener("click", () => {
  if (window.downloadMusic) {
    window.downloadMusic();
  }
});

btnSaveNotation.addEventListener("click", () => {
  if (window.saveNotation) {
    window.saveNotation();
  }
});

// 5. Tempo Control
tempoSlider.addEventListener("input", (e) => {
  currentTempo = e.target.value;
  tempoLabel.textContent = `Tempo: ${currentTempo}`;
});

// Initial Setup
updateGridLabels();
toggleTempoVisibility();

});
