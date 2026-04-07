/**
 * player.js - Sequence playback engine based on notation string
 */

let playbackTimeouts = [];
let isLooping = false;

function playFromNotation(loop = false) {
  const notation = document.getElementById("notation-box").value;
  if (!notation.trim()) return;

  stopPlayback();
  isLooping = loop;

  const blocks = notation.split(",").map(b => b.trim()).filter(b => b.length > 0);
  console.log(`Playing notation (Loop: ${isLooping}):`, blocks);

  let currentTime = 0;
  const BASE_INTERVAL = 500; 

  blocks.forEach((block, index) => {
    const match = block.match(/^([pgvd])([a-z0-9#]+)$/i);
    if (!match) return;

    const prefix = match[1].toLowerCase();
    const content = match[2];
    
    let noteStr, tempo;
    if (prefix === 'd') {
      noteStr = content;
      tempo = 120;
    } else {
      const tempoMatch = content.match(/(\d+)$/);
      if (tempoMatch) {
        tempo = parseInt(tempoMatch[1]);
        noteStr = content.substring(0, content.length - tempoMatch[1].length);
      } else {
        tempo = 120;
        noteStr = content;
      }
    }

    const instrument = { p: "piano", g: "guitar", v: "violin", d: "drum" }[prefix];
    const interval = BASE_INTERVAL * (120 / tempo);

    const timeout = setTimeout(() => {
      let finalNote = noteStr;
      if (prefix !== 'd') {
        finalNote = noteStr.toUpperCase();
        if (!finalNote.match(/\d$/)) finalNote += "4";
      } else {
        finalNote = parseInt(noteStr);
      }

      if (typeof window.playSound === 'function') {
        window.playSound(instrument, finalNote, tempo);
      }

      // If it's the last block and looping is active, restart
      if (index === blocks.length - 1 && isLooping) {
        const loopTimeout = setTimeout(() => {
            playFromNotation(true);
        }, interval);
        playbackTimeouts.push(loopTimeout);
      }
    }, currentTime);

    playbackTimeouts.push(timeout);
    currentTime += interval;
  });
}

function stopPlayback() {
  playbackTimeouts.forEach(t => clearTimeout(t));
  playbackTimeouts = [];
  isLooping = false;
  console.log("Playback stopped.");
}

// Export for main.js
window.playFromNotation = playFromNotation;
window.stopPlayback = stopPlayback;
