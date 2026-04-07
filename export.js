/**
 * export.js - Download Music & Save Notation
 */

/**
 * Downloads the current notation as an audio file.
 */
/**
 * Downloads the current notation as an audio file.
 */
async function downloadMusic() {
  const notationBox = document.getElementById("notation-box");
  const notation = notationBox.value;
  if (!notation.trim()) {
    alert("Notation is empty! Add some notes first.");
    return;
  }
  
  // Ensure audio is running
  if (Tone.context.state !== 'running') {
    await Tone.start();
  }

  console.log("Preparing audio export for notation...");
  
  // Start the master recorder
  try {
    recorder.start();
    console.log("Recorder started...");
  } catch (err) {
    console.error("Failed to start recorder:", err);
    alert("Recorder failed to start. Try refreshing the page.");
    return;
  }
  
  // Play the notation through Tone.js
  playFromNotation(false);
  
  // Calculate total duration: blocks * BASE_INTERVAL(500) * (120/currentTempo)
  const blocks = notation.split(",").map(b => b.trim()).filter(b => b.length > 0);
  let totalDuration = 0;
  const BASE_INTERVAL = 500; 

  blocks.forEach(b => {
    const match = b.match(/^([pgvd])([a-z0-9#]+)$/i);
    if (!match) return;
    
    const prefix = match[1].toLowerCase();
    const content = match[2];
    let tempo = 120;
    
    if (prefix !== 'd') {
      const tempoMatch = content.match(/(\d+)$/);
      if (tempoMatch) tempo = parseInt(tempoMatch[1]);
    }
    
    totalDuration += BASE_INTERVAL * (120 / tempo);
  });
  
  console.log(`Estimated playback duration: ${(totalDuration / 1000).toFixed(2)} seconds. Waiting...`);
  
  // Provide visual feedback (optional but helpful)
  const originalLabel = document.getElementById("btn-download").innerText;
  document.getElementById("btn-download").innerText = "Exporting...";
  document.getElementById("btn-download").disabled = true;

  // Wait for playback to finish + 1 second padding for tail-end reverb
  setTimeout(async () => {
    console.log("Stopping recorder...");
    const blob = await recorder.stop();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.download = `music-maker-${Date.now()}.webm`;
    anchor.href = url;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    
    console.log("Download complete.");
    document.getElementById("btn-download").innerText = originalLabel;
    document.getElementById("btn-download").disabled = false;
  }, totalDuration + 1000); 
}

/**
 * Copies the notation string to clipboard.
 */
function saveNotation() {
  const notation = document.getElementById("notation-box").value;
  if (!notation.trim()) {
    alert("Nothing in the notation box to save!");
    return;
  }
  
  navigator.clipboard.writeText(notation).then(() => {
    alert("Notation saved to clipboard!\nYou can paste this back here later.");
  }).catch(err => {
    console.error("Could not copy: ", err);
    prompt("Copy this notation code:", notation);
  });
}

// Export for main.js
window.downloadMusic = downloadMusic;
window.saveNotation = saveNotation;
