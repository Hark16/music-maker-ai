/**
 * editor.js - Notation Editor Logic
 * Handles block-based cursor navigation and auto-insertion of notes.
 */

const notationBox = document.getElementById("notation-box");

/**
 * Inserts a note into the notation box at the current cursor position.
 * Format: [instrument_prefix][note][tempo]
 */
function insertNote(instrument, note, tempo) {
  const prefix = { piano: "p", guitar: "g", violin: "v", drum: "d" }[instrument];
  let cleanNote = note.toLowerCase();
  
  // Only strip digits for melodic instruments to remove frequency (e.g., C4 -> c)
  // Drums need the pad number preserved (e.g., d1, d5)
  if (instrument !== 'drum') {
    cleanNote = cleanNote.replace(/\d+$/, "");
  }
  
  const noteStr = instrument === 'drum' ? `${prefix}${cleanNote}` : `${prefix}${cleanNote}${tempo}`;
  const block = noteStr + ", ";
  
  const start = notationBox.selectionStart;
  const end = notationBox.selectionEnd;
  const text = notationBox.value;
  
  // Insert the block at current selection
  const newText = text.substring(0, start) + block + text.substring(end);
  notationBox.value = newText;
  
  // Move cursor to the end of the newly inserted block
  const newPos = start + block.length;
  notationBox.setSelectionRange(newPos, newPos);
}

/**
 * Handle custom cursor navigation for "note blocks"
 */
notationBox.addEventListener("keydown", (e) => {
  const pos = notationBox.selectionStart;
  const val = notationBox.value;

  if (e.key === "ArrowRight") {
    // Jump to the start of the next note (after the next comma)
    const nextComma = val.indexOf(",", pos);
    if (nextComma !== -1) {
      e.preventDefault();
      const newPos = nextComma + 2; // Jump past comma and space
      notationBox.setSelectionRange(newPos, newPos);
    }
  } else if (e.key === "ArrowLeft") {
    // Jump to the start of the current or previous note
    // If we are at the start of a block, we want the previous one
    let searchPos = pos - 2;
    if (searchPos < 0) return;
    
    const prevComma = val.lastIndexOf(",", searchPos);
    e.preventDefault();
    const newPos = prevComma === -1 ? 0 : prevComma + 2;
    notationBox.setSelectionRange(newPos, newPos);
  }
});

/**
 * Ensure the box stays focused after clicks for easy editing
 */
notationBox.addEventListener("click", () => {
  // Optional: Snap cursor to nearest block start on click?
  // For now, standard click behavior is fine as per "user can click anywhere".
});

// Export functions for global use
window.insertNote = insertNote;
