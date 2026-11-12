// Short synthesized Foley: a metal tab click followed by escaping carbonation.
// The noise buffer is created only when sound is enabled and reused per context.
const noiseBuffers = new WeakMap<AudioContext, AudioBuffer>();

function noiseFor(context: AudioContext) {
  const cached = noiseBuffers.get(context);
  if (cached) return cached;
  const buffer = context.createBuffer(
    1,
    context.sampleRate,
    context.sampleRate,
  );
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < samples.length; index++) {
    samples[index] = Math.random() * 2 - 1;
  }
  noiseBuffers.set(context, buffer);
  return buffer;
}

function tone(
  context: AudioContext,
  start: number,
  frequency: number,
  endFrequency: number,
  duration: number,
  volume: number,
  type: OscillatorType = "sine",
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(
    endFrequency,
    start + duration,
  );
  gain.gain.setValueAtTime(0.001, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.01);
  oscillator.onended = () => {
    oscillator.disconnect();
    gain.disconnect();
  };
}

export function playAnswerSound(
  context: AudioContext,
  correct: boolean,
  streak: number,
) {
  const start = context.currentTime;
  if (!correct) {
    tone(context, start, 220, 160, 0.16, 0.06, "triangle");
    tone(context, start + 0.09, 147, 100, 0.2, 0.05, "triangle");
    return;
  }

  // Two tiny metal transients, then the seal gives way with a low pop.
  tone(context, start + 0.06, 1850, 1100, 0.035, 0.045, "triangle");
  tone(context, start + 0.085, 3200, 2200, 0.045, 0.025);
  tone(context, start + 0.11, 170, 65, 0.11, 0.085);

  const hiss = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  hiss.buffer = noiseFor(context);
  filter.type = "bandpass";
  filter.Q.value = 0.6;
  filter.frequency.setValueAtTime(4200, start + 0.1);
  filter.frequency.exponentialRampToValueAtTime(1400, start + 0.75);
  gain.gain.setValueAtTime(0.001, start);
  gain.gain.linearRampToValueAtTime(0.13, start + 0.13);
  gain.gain.exponentialRampToValueAtTime(0.001, start + 0.85);
  hiss.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  hiss.start(start + 0.1);
  hiss.stop(start + 0.87);
  hiss.onended = () => {
    hiss.disconnect();
    filter.disconnect();
    gain.disconnect();
  };

  if (streak >= 3) {
    tone(context, start + 0.5, 784, 790, 0.2, 0.025);
    tone(context, start + 0.6, 1047, 1052, 0.25, 0.025);
  }
}
