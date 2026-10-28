import test from 'node:test';
import assert from 'node:assert/strict';
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
  // Should not throw even when AudioContext is missing
  assert.doesNotThrow(() => {
    playSliderTick(1.5);
    playVoiceBlip('a', 'feliz');
    playVoiceBlip(' ', 'feliz'); // Ignored char
    playPoseEmote('colapso');
    playPoseEmote('orgullosa');
    playPoseEmote('enojada');
    playPoseEmote('feliz');
    playSuccess('normal');
    playSuccess('section');
    playError(1);
    playError(3);
    playClick();
    playPageTurn();
    initGlobalSoundUI();
  });
});

test('sound: state toggle works gracefully', () => {
  const initial = isSoundEnabled();
  assert.equal(typeof initial, 'boolean');
  const toggled = toggleSound();
  assert.equal(toggled, !initial);
  const reverted = toggleSound();
  assert.equal(reverted, initial);
});
