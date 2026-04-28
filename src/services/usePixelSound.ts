/**
 * usePixelSound — procedural 8-bit / pixel-art sound effects
 * Built with the Web Audio API, zero external files needed.
 */

type SoundType =
  | "click"       // short blip — button press / form input focus
  | "select"      // option selected (radio / checkbox)
  | "success"     // ascending arpeggio — form submitted / step complete
  | "error"       // descending buzz — validation error
  | "warning"     // siren ping — anti-cheat warning triggered
  | "tick"        // soft tick — countdown clock per-second
  | "danger"      // rapid low beep — last 5-min timer danger
  | "loader"      // ascending dot-beep — loading spinner loop
  | "start"       // fanfare — exam starts
  | "submit";     // final submit chord

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "square",
  volume = 0.18,
  delay = 0,
  rampDown = true,
) {
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ac.currentTime + delay);
    gain.gain.setValueAtTime(volume, ac.currentTime + delay);
    if (rampDown) {
      gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + delay + duration);
    }
    osc.start(ac.currentTime + delay);
    osc.stop(ac.currentTime + delay + duration + 0.01);
  } catch {
    /* silently fail on browsers that block audio */
  }
}

function playNoise(duration: number, volume = 0.05, delay = 0) {
  try {
    const ac = getCtx();
    const bufferSize = ac.sampleRate * duration;
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ac.createBufferSource();
    source.buffer = buffer;
    const gain = ac.createGain();
    source.connect(gain);
    gain.connect(ac.destination);
    gain.gain.setValueAtTime(volume, ac.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + delay + duration);
    source.start(ac.currentTime + delay);
    source.stop(ac.currentTime + delay + duration + 0.01);
  } catch {
    /* silently fail */
  }
}

const sounds: Record<SoundType, () => void> = {
  click: () => {
    playTone(880, 0.06, "square", 0.12);
    playNoise(0.04, 0.04);
  },

  select: () => {
    playTone(660, 0.05, "square", 0.12);
    playTone(880, 0.08, "square", 0.10, 0.05);
  },

  success: () => {
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => playTone(f, 0.12, "square", 0.15, i * 0.1));
  },

  error: () => {
    playTone(200, 0.08, "sawtooth", 0.18);
    playTone(150, 0.12, "sawtooth", 0.18, 0.09);
    playNoise(0.06, 0.06, 0.18);
  },

  warning: () => {
    // Alternating siren tones
    [0, 0.15, 0.3, 0.45].forEach((d, i) =>
      playTone(i % 2 === 0 ? 880 : 660, 0.13, "square", 0.22, d)
    );
  },

  tick: () => {
    playTone(440, 0.04, "square", 0.06);
  },

  danger: () => {
    playTone(330, 0.07, "square", 0.14);
    playTone(330, 0.07, "square", 0.14, 0.12);
  },

  loader: () => {
    // Soft ascending ping used by spinner
    const notes = [330, 440, 550];
    notes.forEach((f, i) => playTone(f, 0.09, "triangle", 0.07, i * 0.12));
  },

  start: () => {
    // C-E-G-C fanfare
    const notes = [262, 330, 392, 523, 784];
    notes.forEach((f, i) => playTone(f, 0.18, "square", 0.18, i * 0.12));
  },

  submit: () => {
    // Submit chord — C major, stacked
    const notes = [523, 659, 784];
    notes.forEach((f, i) => playTone(f, 0.3, "square", 0.14, i * 0.04));
    playTone(1047, 0.4, "triangle", 0.1, 0.2);
  },
};

/** Resume audio context — must be called from a user gesture */
export function resumeAudio() {
  try {
    getCtx().resume();
  } catch {
    /* ignore */
  }
}

/**
 * Returns a stable play() function.
 * Usage:  const play = usePixelSound();
 *         play("click");
 */
export function usePixelSound() {
  return (sound: SoundType) => {
    try {
      resumeAudio();
      sounds[sound]();
    } catch {
      /* silently fail */
    }
  };
}
