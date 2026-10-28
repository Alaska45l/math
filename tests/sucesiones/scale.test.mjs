import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calcSafeAxis, compactFmt } from '../../js/modules/sucesiones/scale.js';

describe('scale: compactFmt', () => {
  it('formatea números normales sin sufijo', () => {
    assert.equal(compactFmt(0), '0');
    assert.equal(compactFmt(5), '5');
    assert.equal(compactFmt(25), '25');
    assert.equal(compactFmt(-12), '−12');
  });

  it('formatea miles con k', () => {
    assert.equal(compactFmt(1000), '1k');
    assert.equal(compactFmt(2500), '2.5k');
    assert.equal(compactFmt(50000), '50k');
    assert.equal(compactFmt(-15000), '−15k');
  });

  it('formatea millones con M y miles de millones con B', () => {
    assert.equal(compactFmt(1000000), '1M');
    assert.equal(compactFmt(2500000), '2.5M');
    assert.equal(compactFmt(3000000000), '3B');
  });

  it('soporta opción de moneda ($)', () => {
    assert.equal(compactFmt(0, { currency: true }), '$0');
    assert.equal(compactFmt(100, { currency: true }), '$100');
    assert.equal(compactFmt(15000, { currency: true }), '$15k');
    assert.equal(compactFmt(2500000, { currency: true }), '$2.5M');
  });
});

describe('scale: calcSafeAxis', () => {
  it('mantiene la cantidad de ticks estrictamente entre 3 y 10 para spans pequeños', () => {
    const res = calcSafeAxis({ minVal: 0, maxVal: 10 });
    assert.ok(res.tickCount >= 3 && res.tickCount <= 10, `tickCount fue ${res.tickCount}`);
    assert.ok(res.yStep >= 1);
    assert.ok(res.yMin <= 0);
    assert.ok(res.yMax >= 10);
  });

  it('calcula paso y ticks seguros ante spans gigantes (500.000) sin explotar en miles de marcas', () => {
    const res = calcSafeAxis({ minVal: 0, maxVal: 500000 });
    assert.ok(res.tickCount >= 3 && res.tickCount <= 10, `tickCount fue ${res.tickCount}`);
    assert.ok(res.yStep >= 50000, `yStep fue ${res.yStep}`);
    assert.equal(typeof res.yFmt(500000), 'string');
    assert.equal(res.yFmt(500000), '500k');
  });

  it('soporta valores negativos y alternantes (radar de r < 0)', () => {
    const res = calcSafeAxis({ minVal: -12500, maxVal: 37500 });
    assert.ok(res.tickCount >= 3 && res.tickCount <= 10, `tickCount fue ${res.tickCount}`);
    assert.ok(res.yMin <= -12500);
    assert.ok(res.yMax >= 37500);
    assert.ok(res.yStep >= 5000);
  });

  it('maneja valores microscópicos o idénticos con gracia', () => {
    const res = calcSafeAxis({ minVal: 0, maxVal: 0 });
    assert.ok(res.tickCount >= 3 && res.tickCount <= 10);
    assert.ok(res.yMax > res.yMin);
  });
});
