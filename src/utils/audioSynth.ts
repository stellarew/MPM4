/**
 * Generates an offline ambient soundtrack using pure Web Audio API synthesis.
 * 100% offline, zero network requests, zero external assets required.
 */
export async function generateOfflineAmbientAudio(durationSec: number): Promise<AudioBuffer> {
  const sampleRate = 44100;
  const numChannels = 2;
  const length = Math.ceil(sampleRate * durationSec);
  
  // Create offline audio context
  const offlineCtx = new OfflineAudioContext(numChannels, length, sampleRate);

  // Soothing chord progression: Fmaj7 - Cmaj7 - Am7 - G
  const chords = [
    [174.61, 220.00, 261.63, 329.63], // Fmaj7
    [130.81, 164.81, 196.00, 246.94], // Cmaj7
    [110.00, 130.81, 164.81, 196.00], // Am7
    [98.00, 123.47, 146.83, 196.00],  // G
  ];

  const chordDuration = Math.max(3, durationSec / chords.length);

  chords.forEach((frequencies, chordIndex) => {
    const startTime = chordIndex * chordDuration;
    if (startTime >= durationSec) return;
    const effectiveDuration = Math.min(chordDuration + 0.5, durationSec - startTime);

    frequencies.forEach((freq, i) => {
      // Warm sine / soft triangle oscillator
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      const filter = offlineCtx.createBiquadFilter();

      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      // Low pass filter for soft analog feel
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800 + i * 150, startTime);

      // Smooth attack and release envelope
      const attack = 0.8;
      const release = 1.0;
      const maxGain = 0.045 / frequencies.length;

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(maxGain, startTime + attack);
      gain.gain.setValueAtTime(maxGain, startTime + effectiveDuration - release);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + effectiveDuration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(offlineCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + effectiveDuration);
    });
  });

  // Render synthesized audio buffer
  return await offlineCtx.startRendering();
}

/**
 * Decodes user-uploaded audio file (MP3, WAV, AAC, etc.)
 */
export async function decodeAudioFile(file: File): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const decoded = await audioCtx.decodeAudioData(arrayBuffer);
  await audioCtx.close();
  return decoded;
}
