// Web Audio API sound generation - no external files needed

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playNote(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  type: OscillatorType = "square",
  gain: number = 0.15
) {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);
  gainNode.gain.setValueAtTime(gain, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

/**
 * Pachinko-style fanfare for pass result.
 * Ascending arpeggios with harmonics, building to a triumphant chord.
 */
export function playFanfare(): void {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  const now = ctx.currentTime;

  // Rapid ascending intro (pachinko-like "jingle")
  const introNotes = [523, 587, 659, 698, 784, 880, 988, 1047];
  introNotes.forEach((freq, i) => {
    playNote(ctx, freq, now + i * 0.07, 0.15, "square", 0.12);
    playNote(ctx, freq * 1.5, now + i * 0.07, 0.12, "sine", 0.06);
  });

  // Dramatic pause then triumphant chord sequence
  const chordStart = now + 0.7;

  // Chord 1: C major
  [523.25, 659.25, 783.99].forEach((f) => {
    playNote(ctx, f, chordStart, 0.4, "square", 0.1);
    playNote(ctx, f, chordStart, 0.5, "sine", 0.08);
  });

  // Chord 2: F major (build)
  [698.46, 880, 1046.5].forEach((f) => {
    playNote(ctx, f, chordStart + 0.35, 0.4, "square", 0.12);
    playNote(ctx, f, chordStart + 0.35, 0.5, "sine", 0.08);
  });

  // Chord 3: G major (tension)
  [783.99, 987.77, 1174.66].forEach((f) => {
    playNote(ctx, f, chordStart + 0.7, 0.35, "square", 0.13);
    playNote(ctx, f, chordStart + 0.7, 0.45, "sine", 0.09);
  });

  // Final chord: C major (high, resolution) - big and sustained
  [1046.5, 1318.5, 1568, 2093].forEach((f) => {
    playNote(ctx, f, chordStart + 1.05, 1.2, "square", 0.1);
    playNote(ctx, f, chordStart + 1.05, 1.5, "sine", 0.12);
    playNote(ctx, f, chordStart + 1.05, 1.0, "triangle", 0.07);
  });

  // Sparkle overlay (high rapid notes)
  const sparkleStart = chordStart + 1.1;
  [2093, 2349, 2637, 2793, 3136, 3520, 3951, 4186].forEach((f, i) => {
    playNote(ctx, f, sparkleStart + i * 0.06, 0.2, "sine", 0.04);
  });

  // Low bass rumble for impact
  playNote(ctx, 130.81, chordStart + 1.05, 1.5, "sawtooth", 0.06);
  playNote(ctx, 65.41, chordStart + 1.05, 1.5, "sine", 0.08);
}

/**
 * Dramatic failure buzzer for fail result.
 * Descending tones with dissonant buzz.
 */
export function playFailSound(): void {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  const now = ctx.currentTime;

  // Descending "wah-wah-wah" (classic game-over feel)
  const notes = [
    { freq: 440, time: 0, dur: 0.3 },
    { freq: 392, time: 0.3, dur: 0.3 },
    { freq: 349, time: 0.6, dur: 0.3 },
    { freq: 311, time: 0.9, dur: 0.6 },
  ];

  notes.forEach(({ freq, time, dur }) => {
    playNote(ctx, freq, now + time, dur, "sawtooth", 0.1);
    // Slight detune for dissonance
    playNote(ctx, freq * 1.02, now + time, dur, "sawtooth", 0.06);
  });

  // Final low buzz
  const buzzStart = now + 1.3;
  const buzzOsc = ctx.createOscillator();
  const buzzGain = ctx.createGain();
  buzzOsc.type = "sawtooth";
  buzzOsc.frequency.setValueAtTime(80, buzzStart);
  buzzOsc.frequency.exponentialRampToValueAtTime(50, buzzStart + 0.8);
  buzzGain.gain.setValueAtTime(0.12, buzzStart);
  buzzGain.gain.exponentialRampToValueAtTime(0.001, buzzStart + 0.8);
  buzzOsc.connect(buzzGain);
  buzzGain.connect(ctx.destination);
  buzzOsc.start(buzzStart);
  buzzOsc.stop(buzzStart + 0.8);
}
