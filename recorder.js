/**
 * recorder.js - Session state & Event tracking
 */

let recordedNotes = [];
let isRecording = false;
let recordStartTime = 0;

function startRecording() {
  recordedNotes = [];
  isRecording = true;
  recordStartTime = Tone.now();
  
  // Start the master recorder for audio file generation
  recorder.start();
  
  console.log("Recording started...");
}

function stopRecording() {
  isRecording = false;
  console.log("Recording stopped. Total notes: " + recordedNotes.length);
}

function recordEvent(instrument, note, tempo) {
  if (!isRecording) return;
  
  const currentTime = Tone.now() - recordStartTime;
  
  const event = {
    instrument: instrument,
    note: note,
    time: currentTime * 1000, // store in ms for easier relative calculation
    tempo: tempo
  };
  
  recordedNotes.push(event);
}
