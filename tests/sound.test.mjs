import test from 'node:test';
import assert from 'node:assert/strict';

// 1. Tests in pure Node.js environment (no window / no DOM)
import sound, {
  isSoundEnabled,
  setSoundEnabled,
  toggleSound,
  playSliderTick,
  playVoiceBlip,
  playPoseEmote,
  playSuccess,
  playError,
  playClick,
  playPageTurn,
  initGlobalSoundUI,
  getAudioContext,
} from '../js/core/sound.js';

test('sound: exports exist and are functions', () => {
  assert.equal(typeof isSoundEnabled, 'function');
  assert.equal(typeof setSoundEnabled, 'function');
  assert.equal(typeof toggleSound, 'function');
  assert.equal(typeof playSliderTick, 'function');
  assert.equal(typeof playVoiceBlip, 'function');
  assert.equal(typeof playPoseEmote, 'function');
  assert.equal(typeof playSuccess, 'function');
  assert.equal(typeof playError, 'function');
  assert.equal(typeof playClick, 'function');
  assert.equal(typeof playPageTurn, 'function');
  assert.equal(typeof initGlobalSoundUI, 'function');
  assert.equal(typeof sound.playSuccess, 'function');
});

test('sound: safe execution in headless / Node environment (no DOM/WebAudio)', () => {
  assert.doesNotThrow(() => {
    playSliderTick(1.5);
    playVoiceBlip('a', 'feliz');
    playVoiceBlip(' ', 'feliz'); // Ignored char
    playPoseEmote('colapso');
    playPoseEmote('orgullosa');
    playPoseEmote('enojada');
    playPoseEmote('feliz');
    playPoseEmote('eureka');
    playPoseEmote('sonrojada');
    playPoseEmote('sospecha');
    playPoseEmote('evaluando');
    playPoseEmote('explicando');
    playSuccess('normal');
    playSuccess('section');
    playError(1);
    playError(3);
    playClick();
    playPageTurn();
    initGlobalSoundUI();
  });
});

test('sound: state toggle and localStorage persistence', () => {
  setSoundEnabled(true);
  assert.equal(isSoundEnabled(), true);
  const toggled = toggleSound();
  assert.equal(toggled, false);
  assert.equal(isSoundEnabled(), false);
  const reverted = toggleSound();
  assert.equal(reverted, true);
  assert.equal(isSoundEnabled(), true);
});

// 2. Mock Web Audio API test suite for acoustic parameter verification
class MockAudioParam {
  constructor(val = 0) {
    this.value = val;
    this.events = [];
  }
  setValueAtTime(val, t) { this.events.push({ type: 'set', val, t }); this.value = val; }
  linearRampToValueAtTime(val, t) { this.events.push({ type: 'linear', val, t }); this.value = val; }
  exponentialRampToValueAtTime(val, t) { this.events.push({ type: 'exponential', val, t }); this.value = val; }
}

class MockAudioNode {
  constructor(type) {
    this.nodeType = type;
    this.connectedTo = [];
  }
  connect(dest) { this.connectedTo.push(dest); return dest; }
}

class MockOscillatorNode extends MockAudioNode {
  constructor() {
    super('Oscillator');
    this.type = 'sine';
    this.frequency = new MockAudioParam(440);
    this.started = false;
    this.stopped = false;
  }
  start(t) { this.started = true; this.startTime = t; }
  stop(t) { this.stopped = true; this.stopTime = t; }
}

class MockGainNode extends MockAudioNode {
  constructor() {
    super('Gain');
    this.gain = new MockAudioParam(1);
  }
}

class MockBiquadFilterNode extends MockAudioNode {
  constructor() {
    super('BiquadFilter');
    this.type = 'lowpass';
    this.frequency = new MockAudioParam(350);
    this.Q = new MockAudioParam(1);
    this.gain = new MockAudioParam(0);
  }
}

class MockDynamicsCompressorNode extends MockAudioNode {
  constructor() {
    super('DynamicsCompressor');
    this.threshold = new MockAudioParam(-24);
    this.knee = new MockAudioParam(30);
    this.ratio = new MockAudioParam(12);
    this.attack = new MockAudioParam(0.003);
    this.release = new MockAudioParam(0.25);
  }
}

class MockBufferSourceNode extends MockAudioNode {
  constructor() {
    super('BufferSource');
    this.buffer = null;
    this.started = false;
  }
  start(when, offset, duration) {
    this.started = true;
    this.when = when;
    this.offset = offset;
    this.duration = duration;
  }
  stop(t) { this.stopped = true; this.stopTime = t; }
}

class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.currentTime = 0.05;
    this.sampleRate = 44100;
    this.destination = new MockAudioNode('Destination');
    this.createdNodes = [];
  }
  createBuffer(channels, length, sampleRate) {
    const data = new Float32Array(length);
    return {
      numberOfChannels: channels,
      length,
      sampleRate,
      duration: length / sampleRate,
      getChannelData: () => data,
    };
  }
  createBufferSource() { const n = new MockBufferSourceNode(); this.createdNodes.push(n); return n; }
  createOscillator() { const n = new MockOscillatorNode(); this.createdNodes.push(n); return n; }
  createGain() { const n = new MockGainNode(); this.createdNodes.push(n); return n; }
  createBiquadFilter() { const n = new MockBiquadFilterNode(); this.createdNodes.push(n); return n; }
  createDynamicsCompressor() { const n = new MockDynamicsCompressorNode(); this.createdNodes.push(n); return n; }
  resume() { this.state = 'running'; return Promise.resolve(); }
}

test('sound: mock Web Audio API acoustic specifications', async (t) => {
  // Install mock window and WebAudio
  const mockEvents = [];
  globalThis.window = {
    AudioContext: MockAudioContext,
    addEventListener: (ev, fn) => mockEvents.push({ ev, fn }),
    removeEventListener: () => {},
  };

  const ctx = getAudioContext();
  assert.ok(ctx instanceof MockAudioContext, 'AudioContext singleton created');

  setSoundEnabled(true);

  await t.test('1.1. playSliderTick: mechanical detent pulse and bandpass noise friction', async () => {
    await new Promise((r) => setTimeout(r, 40));
    const nodesBefore = ctx.createdNodes.length;
    playSliderTick(1.2);
    const newNodes = ctx.createdNodes.slice(nodesBefore);

    const bp = newNodes.find((n) => n.nodeType === 'BiquadFilter');
    assert.ok(bp, 'Bandpass filter created for noise friction');
    assert.equal(bp.type, 'bandpass');
    assert.equal(bp.Q.value, 2.2);
    assert.ok(bp.frequency.value >= 450 && bp.frequency.value <= 950);

    const osc = newNodes.find((n) => n.nodeType === 'Oscillator');
    assert.ok(osc, 'Detent oscillator pulse created');
    assert.equal(osc.type, 'triangle');
    assert.equal(osc.frequency.events[0].val, 135, 'Oscillator starts at 135 Hz');
    assert.equal(osc.frequency.events[1].val, 52, 'Oscillator ramps down to 52 Hz');

    // Throttling: immediate call within 32ms produces no new nodes
    const nodesBeforeThrottled = ctx.createdNodes.length;
    playSliderTick(2.0);
    assert.equal(ctx.createdNodes.length, nodesBeforeThrottled, 'Immediate tick throttled');
  });

  await t.test('1.2. playVoiceBlip: formant frequencies and character filtering', () => {
    // Silent punctuation and spaces must produce zero nodes
    [' ', '\n', '\t', '.', ',', '!', '?', ';', ':', '—', '-', '–', '"', "'", '«', '»', '`', '¿', '¡', '…'].forEach((c) => {
      const count = ctx.createdNodes.length;
      playVoiceBlip(c, 'base');
      assert.equal(ctx.createdNodes.length, count, `Silent char '${c}' should not produce audio`);
    });

    // Vowel 'a'
    const beforeA = ctx.createdNodes.length;
    playVoiceBlip('a', 'base');
    const nodesA = ctx.createdNodes.slice(beforeA);
    const bpA = nodesA.find((n) => n.nodeType === 'BiquadFilter' && n.type === 'peaking');
    assert.ok(bpA, 'Peaking formant filter created for vowel');
    assert.equal(bpA.frequency.value, 820, "Vowel 'a' has formant at 820 Hz");

    // Vowel 'i'
    const beforeI = ctx.createdNodes.length;
    playVoiceBlip('i', 'feliz');
    const nodesI = ctx.createdNodes.slice(beforeI);
    const bpI = nodesI.find((n) => n.nodeType === 'BiquadFilter' && n.type === 'peaking');
    assert.equal(bpI.frequency.value, 420, "Vowel 'i' has formant at 420 Hz");

    // Two oscillators (triangle 70% + sine 30%)
    const oscs = nodesA.filter((n) => n.nodeType === 'Oscillator');
    assert.equal(oscs.length, 2, 'Voice blip combines 2 oscillators (triangle + sine)');
    assert.ok(oscs.some((o) => o.type === 'triangle'));
    assert.ok(oscs.some((o) => o.type === 'sine'));
  });

  await t.test('1.2. playPoseEmote: colapso, orgullosa, enojada, feliz', () => {
    // Colapso: filtered noise sweep 300 -> 190 Hz in 260ms
    const beforeC = ctx.createdNodes.length;
    playPoseEmote('colapso');
    const nodesC = ctx.createdNodes.slice(beforeC);
    const bpC = nodesC.find((n) => n.nodeType === 'BiquadFilter' && n.type === 'bandpass');
    assert.ok(bpC, 'Colapso uses bandpass filter');
    assert.equal(bpC.frequency.events[0].val, 300);
    assert.equal(bpC.frequency.events[1].val, 190);

    // Orgullosa: double tone fourth 260 -> 345 Hz
    const beforeO = ctx.createdNodes.length;
    playPoseEmote('orgullosa');
    const nodesO = ctx.createdNodes.slice(beforeO);
    const oscsO = nodesO.filter((n) => n.nodeType === 'Oscillator');
    assert.equal(oscsO.length, 2, 'Orgullosa plays double tone');
    assert.equal(oscsO[0].frequency.events[0].val, 260);
    assert.equal(oscsO[1].frequency.events[0].val, 345);

    // Enojada: double pulse at 180 Hz
    const beforeE = ctx.createdNodes.length;
    playPoseEmote('enojada');
    const nodesE = ctx.createdNodes.slice(beforeE);
    const oscsE = nodesE.filter((n) => n.nodeType === 'Oscillator');
    assert.equal(oscsE.length, 2, 'Enojada plays double pulse');
    assert.equal(oscsE[0].frequency.events[0].val, 180);

    // Feliz: ascending warm marimba notes
    const beforeF = ctx.createdNodes.length;
    playPoseEmote('feliz');
    const nodesF = ctx.createdNodes.slice(beforeF);
    const oscsF = nodesF.filter((n) => n.nodeType === 'Oscillator');
    assert.ok(oscsF.length >= 2, 'Feliz plays ascending marimba notes');
  });

  await t.test('1.3. playSuccess: normal vs section', () => {
    // Normal: Do5 (523.25 Hz) -> Sol5 (783.99 Hz)
    const beforeNorm = ctx.createdNodes.length;
    playSuccess('normal');
    const nodesNorm = ctx.createdNodes.slice(beforeNorm);
    const oscsNorm = nodesNorm.filter((n) => n.nodeType === 'Oscillator');
    assert.equal(oscsNorm.length, 4, '2 notes with fundamental + 2nd harmonic = 4 oscillators');
    assert.equal(oscsNorm[0].frequency.events[0].val, 523.25, 'Note 1 is Do5');
    assert.equal(oscsNorm[2].frequency.events[0].val, 783.99, 'Note 2 is Sol5');

    // Section: Fa Maj7 (349.23 -> 440.00 -> 523.25 -> 659.25)
    const beforeSec = ctx.createdNodes.length;
    playSuccess('section');
    const nodesSec = ctx.createdNodes.slice(beforeSec);
    const oscsSec = nodesSec.filter((n) => n.nodeType === 'Oscillator');
    assert.equal(oscsSec.length, 8, '4 notes with harmonic = 8 oscillators');
    assert.equal(oscsSec[0].frequency.events[0].val, 349.23, 'Fa4');
    assert.equal(oscsSec[2].frequency.events[0].val, 440.00, 'La4');
    assert.equal(oscsSec[4].frequency.events[0].val, 523.25, 'Do5');
    assert.equal(oscsSec[6].frequency.events[0].val, 659.25, 'Mi5');
  });

  await t.test('1.4. playError: streak 1 vs streak >= 2', () => {
    // Streak 1: 2 descending notes (220 Hz -> 174.61 Hz)
    const beforeErr1 = ctx.createdNodes.length;
    playError(1);
    const nodesErr1 = ctx.createdNodes.slice(beforeErr1);
    const oscsErr1 = nodesErr1.filter((n) => n.nodeType === 'Oscillator');
    assert.equal(oscsErr1.length, 2, '2 descending notes for streak 1');
    assert.equal(oscsErr1[0].frequency.events[1].val, 220);
    assert.equal(oscsErr1[1].frequency.events[1].val, 174.61);

    // Streak >= 2: 3 descending notes (adds Re3 146.83 Hz)
    const beforeErr2 = ctx.createdNodes.length;
    playError(2);
    const nodesErr2 = ctx.createdNodes.slice(beforeErr2);
    const oscsErr2 = nodesErr2.filter((n) => n.nodeType === 'Oscillator');
    assert.equal(oscsErr2.length, 3, '3 notes for streak >= 2');
    assert.equal(oscsErr2[2].frequency.events[1].val, 146.83);
  });

  await t.test('Respects mute state: zero AudioNodes created when sound is disabled', () => {
    setSoundEnabled(false);
    const beforeCount = ctx.createdNodes.length;

    playSliderTick(1.0);
    playVoiceBlip('a', 'feliz');
    playPoseEmote('enojada');
    playSuccess('normal');
    playSuccess('section');
    playError(2);
    playClick();
    playPageTurn();

    assert.equal(ctx.createdNodes.length, beforeCount, 'Zero audio nodes created while muted');
    setSoundEnabled(true);
  });

  // Cleanup
  delete globalThis.window;
});
