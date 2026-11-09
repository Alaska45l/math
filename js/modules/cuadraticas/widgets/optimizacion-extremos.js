/**
 * Widget 10 · optimizacion-extremos.js
 * Laboratorio geométrico y físico en vivo:
 * Escenario 1: El Cuadrado Inscrito MNOP dentro de un cuadrado de 16 cm (S(x) = 2x² − 32x + 256 en [0; 16])
 * Escenario 2: Lanzamiento de proyectil (Exactas y(t) = −5t² + 10t en [0; 2] y Khan h(t) = −5t² + 20t en [0; 4])
 * Escenario 3: Cerco Rectangular contra un Muro (A(x) = x(40 − 2x) = −2x² + 40x en [0; 20])
 */

import { h, s, clear } from '../../../core/dom.js';
import { playClick } from '../../../core/sound.js';
import { fmtNumClean } from '../logic.js';
import {
  createQuadBoardSvg,
  createCartesianMapper,
  drawCartesianAxes,
  sampleCurvePath,
  createSliderField,
  createPredictBox,
  attachSvgDrag,
} from './board-kit.js';

export function initOptimizacionExtremos(host) {
  if (!host) return null;
  clear(host);

  const state = {
    mode: 'square', // 'square' | 'projectile' | 'fence'
    xCut: 5, // en [0; 16]
    tTime: 1.5, // tiempo
    projPreset: 'exactas', // 'exactas' | 'khan'
    xFence: 8, // en [0; 20]
  };

  const predictBox = createPredictBox({
    prompt:
      'Al inscribir un cuadrado dentro de otro cuadrado de 16 cm de lado (área 256 cm²), cuando el punto de corte pasa por la mitad exacta del lado (x = 8 cm), ¿qué fracción del área original ocupa el cuadrado inscrito?',
    options: [
      {
        label: 'Un cuarto del área original (64 cm²)',
        correct: false,
        explanation:
          'Por Pitágoras, con catetos de 8 cm y 8 cm el área es 8² + 8² = 64 + 64 = 128 cm².',
      },
      {
        label: 'Exactamente la mitad del área original (128 cm², mínimo absoluto)',
        correct: true,
        explanation:
          '¡Exacto! En xᵥ = 8 cm los cuatro triángulos de las esquinas suman la otra mitad (128 cm²) y el cuadrado interior alcanza su área mínima.',
      },
      {
        label: 'El área se mantiene constante en 256 cm² para cualquier corte x',
        correct: false,
        explanation:
          'Al girar el cuadrado interior, se recortan cuatro triángulos rectángulos en las esquinas cuya área varía con x.',
      },
    ],
    onVerify: () => {
      state.mode = 'square';
      state.xCut = 8;
      sliderCut.setValue(8);
      btnSquare.classList.add('is-active');
      btnProjectile.classList.remove('is-active');
      btnFence.classList.remove('is-active');
      sliderCut.root.removeAttribute('hidden');
      sliderTime.root.setAttribute('hidden', '');
      sliderFence.root.setAttribute('hidden', '');
      projSubpresetsRow.setAttribute('hidden', '');
      render();
    },
  });

  const modeRow = h('div', { class: 'pr-chip-row pr-presets' });
  const btnSquare = h(
    'button',
    { type: 'button', class: 'pr-chip is-active' },
    'Escenario 1 · Cuadrado Inscrito de 16 cm (Mínimo en Vértice)'
  );
  const btnProjectile = h(
    'button',
    { type: 'button', class: 'pr-chip' },
    'Escenario 2 · Proyectil (Máximo en Vértice)'
  );
  const btnFence = h(
    'button',
    { type: 'button', class: 'pr-chip' },
    'Escenario 3 · Cerco Rectangular contra un Muro (Máximo en Vértice)'
  );
  modeRow.append(btnSquare, btnProjectile, btnFence);

  // Sub-presets para Escenario 2
  const projSubpresetsRow = h('div', { class: 'pr-chip-row', hidden: '' });
  const btnProjExactas = h(
    'button',
    { type: 'button', class: 'pr-chip is-active' },
    'Exactas: y(t) = −5t² + 10t (máx 5 m en 1 s)'
  );
  const btnProjKhan = h(
    'button',
    { type: 'button', class: 'pr-chip' },
    'Khan: h(t) = −5t² + 20t (máx 20 m en 2 s)'
  );
  projSubpresetsRow.append(btnProjExactas, btnProjKhan);

  const board = createQuadBoardSvg({
    width: 680,
    height: 330,
    ariaLabel: 'Simulador de optimización cuadrática: cuadrado inscrito, trayectoria y cerco',
  });

  const sliderCut = createSliderField({
    label: 'Corte x sobre el lado de 16 cm (dominio físico [0; 16])',
    min: 0,
    max: 16,
    step: 0.5,
    value: state.xCut,
    formatValue: (v) => `${v} cm`,
    onInput: (v) => {
      state.xCut = v;
      render();
    },
  });

  const sliderTime = createSliderField({
    label: 'Tiempo t del proyectil',
    min: 0,
    max: 2,
    step: 0.05,
    value: Math.min(2, state.tTime),
    formatValue: (v) => `${v} s`,
    onInput: (v) => {
      state.tTime = v;
      render();
    },
  });
  sliderTime.root.setAttribute('hidden', '');

  const sliderFence = createSliderField({
    label: 'Ancho x perpendicular al muro (dominio físico [0; 20] m)',
    min: 0,
    max: 20,
    step: 0.5,
    value: state.xFence,
    formatValue: (v) => `${v} m`,
    onInput: (v) => {
      state.xFence = v;
      render();
    },
  });
  sliderFence.root.setAttribute('hidden', '');

  const slidersWrap = h('div', { class: 'quad-sliders-grid' }, [
    sliderCut.root,
    sliderTime.root,
    sliderFence.root,
  ]);

  const readoutLine1 = h('div', { class: 'eq' });
  const readoutLine2 = h('div', { class: 'muted small' });
  const readout = h('div', { class: 'pr-readout' }, [readoutLine1, readoutLine2]);

  // Manija arrastrable del vértice M para Escenario 1
  const sqX = 52;
  const sqY = 58;
  const sqSize = 210;

  const handleM = s('circle', {
    r: 7,
    fill: 'var(--yellow)',
    stroke: '#111',
    'stroke-width': 2,
    'aria-label': 'Punto de corte M arrastrable',
  });

  const cutMapper = {
    fromX: (px) => Math.max(0, Math.min(16, ((px - sqX) / sqSize) * 16)),
    fromY: () => 0,
    toX: (x) => sqX + (x / 16) * sqSize,
    toY: () => sqY,
  };

  attachSvgDrag(
    board.svg,
    handleM,
    () => cutMapper,
    ({ x }) => {
      state.xCut = Math.max(0, Math.min(16, Math.round(x * 2) / 2));
      sliderCut.setValue(state.xCut);
      render();
    },
    { ariaLabel: 'Punto de corte M sobre lado superior de 16 cm', stepX: 0.5 }
  );

  btnSquare.addEventListener('click', () => {
    playClick();
    state.mode = 'square';
    btnSquare.classList.add('is-active');
    btnProjectile.classList.remove('is-active');
    btnFence.classList.remove('is-active');
    sliderCut.root.removeAttribute('hidden');
    sliderTime.root.setAttribute('hidden', '');
    sliderFence.root.setAttribute('hidden', '');
    projSubpresetsRow.setAttribute('hidden', '');
    render();
  });

  btnProjectile.addEventListener('click', () => {
    playClick();
    state.mode = 'projectile';
    btnProjectile.classList.add('is-active');
    btnSquare.classList.remove('is-active');
    btnFence.classList.remove('is-active');
    sliderTime.root.removeAttribute('hidden');
    sliderCut.root.setAttribute('hidden', '');
    sliderFence.root.setAttribute('hidden', '');
    projSubpresetsRow.removeAttribute('hidden');
    render();
  });

  btnFence.addEventListener('click', () => {
    playClick();
    state.mode = 'fence';
    btnFence.classList.add('is-active');
    btnSquare.classList.remove('is-active');
    btnProjectile.classList.remove('is-active');
    sliderFence.root.removeAttribute('hidden');
    sliderCut.root.setAttribute('hidden', '');
    sliderTime.root.setAttribute('hidden', '');
    projSubpresetsRow.setAttribute('hidden', '');
    render();
  });

  btnProjExactas.addEventListener('click', () => {
    playClick();
    state.projPreset = 'exactas';
    btnProjExactas.classList.add('is-active');
    btnProjKhan.classList.remove('is-active');
    sliderTime.input.max = '2';
    state.tTime = Math.min(2, state.tTime);
    sliderTime.setValue(state.tTime);
    render();
  });

  btnProjKhan.addEventListener('click', () => {
    playClick();
    state.projPreset = 'khan';
    btnProjKhan.classList.add('is-active');
    btnProjExactas.classList.remove('is-active');
    sliderTime.input.max = '4';
    sliderTime.setValue(state.tTime);
    render();
  });

  function render() {
    clear(board.gridLayer);
    clear(board.clippedLayer);
    clear(board.overlayLayer);

    if (state.mode === 'square') {
      const x = state.xCut;
      const area = 2 * x * x - 32 * x + 256;
      const ratio = x / 16;
      const dPx = ratio * sqSize;

      board.overlayLayer.appendChild(
        s(
          'text',
          {
            x: sqX + sqSize / 2,
            y: 42,
            fill: 'var(--yellow)',
            'font-size': 12.5,
            'font-weight': 'bold',
            'text-anchor': 'middle',
          },
          'Cuadrado exterior 16 × 16 cm (M arrastrable)'
        )
      );

      // Cuadrado grande exterior
      board.overlayLayer.appendChild(
        s('rect', {
          x: sqX,
          y: sqY,
          width: sqSize,
          height: sqSize,
          fill: 'rgba(20, 30, 25, 0.85)',
          stroke: 'var(--muted)',
          'stroke-width': 2,
        })
      );

      // Cuadrado inscrito MNOP
      const pM = `${sqX + dPx},${sqY}`;
      const pN = `${sqX + sqSize},${sqY + dPx}`;
      const pO = `${sqX + sqSize - dPx},${sqY + sqSize}`;
      const pP = `${sqX},${sqY + sqSize - dPx}`;

      board.overlayLayer.appendChild(
        s('polygon', {
          points: `${pM} ${pN} ${pO} ${pP}`,
          fill:
            Math.abs(x - 8) < 1e-6
              ? 'rgba(129, 178, 154, 0.35)'
              : 'rgba(132, 165, 157, 0.25)',
          stroke: Math.abs(x - 8) < 1e-6 ? 'var(--green)' : 'var(--blue)',
          'stroke-width': 2.5,
        })
      );

      // Vértices N, O, P decorativos
      board.overlayLayer.appendChild(
        s('circle', {
          cx: sqX + sqSize,
          cy: sqY + dPx,
          r: 4.5,
          fill: 'var(--blue)',
          stroke: '#111',
          'stroke-width': 1.5,
        })
      );
      board.overlayLayer.appendChild(
        s('circle', {
          cx: sqX + sqSize - dPx,
          cy: sqY + sqSize,
          r: 4.5,
          fill: 'var(--blue)',
          stroke: '#111',
          'stroke-width': 1.5,
        })
      );
      board.overlayLayer.appendChild(
        s('circle', {
          cx: sqX,
          cy: sqY + sqSize - dPx,
          r: 4.5,
          fill: 'var(--blue)',
          stroke: '#111',
          'stroke-width': 1.5,
        })
      );

      // Vértice M directamente interactivo
      handleM.setAttribute('cx', String(sqX + dPx));
      handleM.setAttribute('cy', String(sqY));
      board.overlayLayer.appendChild(handleM);

      board.overlayLayer.appendChild(
        s(
          'text',
          {
            x: sqX + dPx,
            y: sqY - 8,
            fill: 'var(--yellow)',
            'font-size': 11,
            'font-weight': 'bold',
            'text-anchor': 'middle',
          },
          'M'
        )
      );

      board.overlayLayer.appendChild(
        s(
          'text',
          {
            x: sqX + sqSize / 2,
            y: sqY + sqSize / 2 + 5,
            fill: 'var(--ink)',
            'font-size': 14,
            'font-weight': 'bold',
            'text-anchor': 'middle',
          },
          `S(${fmtNumClean(x)}) = ${fmtNumClean(area)} cm²`
        )
      );

      // Etiquetas catetos
      board.overlayLayer.appendChild(
        s(
          'text',
          {
            x: sqX + dPx / 2,
            y: sqY + 16,
            fill: 'var(--yellow)',
            'font-size': 11,
            'text-anchor': 'middle',
          },
          `x=${fmtNumClean(x)}`
        )
      );
      board.overlayLayer.appendChild(
        s(
          'text',
          {
            x: sqX + dPx + (sqSize - dPx) / 2,
            y: sqY + 16,
            fill: 'var(--pink)',
            'font-size': 11,
            'text-anchor': 'middle',
          },
          `16−x=${fmtNumClean(16 - x)}`
        )
      );

      // Gráfico cartesiano
      const rightBox = { x: 325, y: 34, w: 325, h: 256 };
      const mapper = createCartesianMapper(rightBox, {
        xMin: -2,
        xMax: 18,
        yMin: 0,
        yMax: 280,
      });

      drawCartesianAxes(board.gridLayer, mapper, {
        xStep: 4,
        yStep: 64,
        xLabel: 'x (cm)',
        yLabel: 'S(x)',
      });

      const fnS = (u) => 2 * u * u - 32 * u + 256;

      board.clippedLayer.appendChild(
        s('path', {
          d: sampleCurvePath(fnS, mapper, 100, -2, 18),
          fill: 'none',
          stroke: 'rgba(167, 184, 174, 0.28)',
          'stroke-width': 1.8,
          'stroke-dasharray': '4 4',
        })
      );

      board.clippedLayer.appendChild(
        s('path', {
          d: sampleCurvePath(fnS, mapper, 90, 0, 16),
          fill: 'none',
          stroke: 'var(--blue)',
          'stroke-width': 3,
        })
      );

      board.clippedLayer.appendChild(
        s('circle', {
          cx: mapper.toX(8),
          cy: mapper.toY(128),
          r: 5.5,
          fill: 'var(--green)',
          stroke: '#111',
          'stroke-width': 1.6,
        })
      );

      board.clippedLayer.appendChild(
        s('circle', {
          cx: mapper.toX(x),
          cy: mapper.toY(area),
          r: 6.5,
          fill: 'var(--yellow)',
          stroke: '#111',
          'stroke-width': 2,
        })
      );

      readoutLine1.textContent = `Modelo Pitagórico: S(x) = x² + (16 − x)² = 2x² − 32x + 256 con dominio físico x ∈ [0; 16] cm`;
      readoutLine2.textContent = `Para x = ${fmtNumClean(x)} cm → Área S(${fmtNumClean(
        x
      )}) = ${fmtNumClean(
        area
      )} cm² · Mínimo absoluto en el vértice V(8 cm; 128 cm²) · Máximo en bordes x = 0 o 16 (256 cm²).`;
    } else if (state.mode === 'projectile') {
      const isExactas = state.projPreset === 'exactas';
      const maxT = isExactas ? 2 : 4;
      const t = Math.min(maxT, state.tTime);
      const fnH = isExactas ? (u) => -5 * u * u + 10 * u : (u) => -5 * u * u + 20 * u;
      const heightVal = fnH(t);
      const vertexT = isExactas ? 1 : 2;
      const vertexH = isExactas ? 5 : 20;

      const rightBox = { x: 60, y: 30, w: 580, h: 260 };
      const mapper = createCartesianMapper(rightBox, {
        xMin: -0.2 * maxT,
        xMax: 1.15 * maxT,
        yMin: -0.1 * vertexH,
        yMax: 1.25 * vertexH,
      });

      drawCartesianAxes(board.gridLayer, mapper, {
        xStep: isExactas ? 0.5 : 1,
        yStep: isExactas ? 1 : 5,
        xLabel: 't (s)',
        yLabel: isExactas ? 'y(t) (m)' : 'h(t) (m)',
      });

      board.clippedLayer.appendChild(
        s('path', {
          d: sampleCurvePath(fnH, mapper, 100, 0, maxT),
          fill: 'none',
          stroke: 'var(--blue)',
          'stroke-width': 3,
        })
      );

      // Vértice máximo
      board.clippedLayer.appendChild(
        s('circle', {
          cx: mapper.toX(vertexT),
          cy: mapper.toY(vertexH),
          r: 6,
          fill: 'var(--green)',
          stroke: '#111',
          'stroke-width': 1.8,
        })
      );

      // Posición actual
      board.clippedLayer.appendChild(
        s('circle', {
          cx: mapper.toX(t),
          cy: mapper.toY(heightVal),
          r: 7,
          fill: 'var(--yellow)',
          stroke: '#111',
          'stroke-width': 2,
        })
      );

      board.overlayLayer.appendChild(
        s(
          'text',
          {
            x: mapper.toX(vertexT),
            y: mapper.toY(vertexH) - 10,
            fill: 'var(--green)',
            'font-size': 12,
            'font-weight': 'bold',
            'text-anchor': 'middle',
          },
          `Cumbre Máxima V(${vertexT} s; ${vertexH} m)`
        )
      );

      if (isExactas) {
        readoutLine1.textContent = `Problema Exactas: y(t) = −5t² + 10t = −5t(t − 2) sobre el dominio físico t ∈ [0; 2] segundos`;
        readoutLine2.textContent = `En t = ${fmtNumClean(t)} s → Altura y(${fmtNumClean(t)}) = ${fmtNumClean(
          heightVal
        )} m · Cumbre en el vértice: tᵥ = 1 s con altura máxima y_máx = 5 m.`;
      } else {
        readoutLine1.textContent = `Trayectoria: h(t) = −5t² + 20t = −5t(t − 4) sobre el dominio físico t ∈ [0; 4] segundos`;
        readoutLine2.textContent = `En t = ${fmtNumClean(t)} s → Altura h(${fmtNumClean(t)}) = ${fmtNumClean(
          heightVal
        )} m · Altura máxima en el vértice: tᵥ = 2 s con h_máx = 20 m.`;
      }
    } else if (state.mode === 'fence') {
      const x = state.xFence;
      const length = 40 - 2 * x;
      const area = x * length;

      // Izquierda (x = 35..280): Diagrama geométrico del muro y el cerco
      const fX = 45;
      const fY = 55;
      const maxW = 220;
      const maxH = 170;

      board.overlayLayer.appendChild(
        s(
          'text',
          {
            x: fX + maxW / 2,
            y: 38,
            fill: 'var(--yellow)',
            'font-size': 12,
            'font-weight': 'bold',
            'text-anchor': 'middle',
          },
          'Geometría del terreno contra el muro (L = 40 m)'
        )
      );

      // Muro de piedra arriba
      board.overlayLayer.appendChild(
        s('rect', {
          x: fX - 5,
          y: fY - 10,
          width: maxW + 10,
          height: 12,
          rx: 3,
          fill: '#5a4a3a',
          stroke: 'var(--yellow)',
          'stroke-width': 1.5,
        })
      );
      board.overlayLayer.appendChild(
        s(
          'text',
          {
            x: fX + maxW / 2,
            y: fY - 1,
            fill: 'var(--yellow)',
            'font-size': 9.5,
            'font-weight': 'bold',
            'text-anchor': 'middle',
          },
          'MURO DE PIEDRA (sin cerco)'
        )
      );

      // Cerco rectangular (3 lados con alambre)
      const wPx = Math.max(12, Math.min(maxW, (Math.max(0, length) / 40) * maxW));
      const hPx = Math.max(8, Math.min(maxH, (x / 20) * maxH));
      const leftX = fX + (maxW - wPx) / 2;
      const topY = fY + 2;

      board.overlayLayer.appendChild(
        s('rect', {
          x: leftX,
          y: topY,
          width: wPx,
          height: hPx,
          fill: Math.abs(x - 10) < 1e-6 ? 'rgba(129, 178, 154, 0.32)' : 'rgba(132, 165, 157, 0.22)',
          stroke: Math.abs(x - 10) < 1e-6 ? 'var(--green)' : 'var(--blue)',
          'stroke-width': 2.5,
        })
      );

      // Cotas de medidas
      board.overlayLayer.appendChild(
        s(
          'text',
          {
            x: leftX + wPx / 2,
            y: topY + hPx / 2 + 5,
            fill: 'var(--ink)',
            'font-size': 13,
            'font-weight': 'bold',
            'text-anchor': 'middle',
          },
          `A(${fmtNumClean(x)}) = ${fmtNumClean(area)} m²`
        )
      );

      board.overlayLayer.appendChild(
        s(
          'text',
          {
            x: leftX + wPx / 2,
            y: topY + hPx + 16,
            fill: 'var(--yellow)',
            'font-size': 11,
            'text-anchor': 'middle',
          },
          `Largo = 40 − 2x = ${fmtNumClean(length)} m`
        )
      );

      board.overlayLayer.appendChild(
        s(
          'text',
          {
            x: Math.max(10, leftX - 10),
            y: topY + hPx / 2 + 4,
            fill: 'var(--pink)',
            'font-size': 11,
            'text-anchor': 'end',
          },
          `x = ${fmtNumClean(x)} m`
        )
      );

      // Derecha (x = 325..650): Curva de área A(x) = -2x^2 + 40x
      const rightBox = { x: 325, y: 34, w: 325, h: 256 };
      const mapper = createCartesianMapper(rightBox, {
        xMin: -2,
        xMax: 22,
        yMin: 0,
        yMax: 220,
      });

      drawCartesianAxes(board.gridLayer, mapper, {
        xStep: 5,
        yStep: 50,
        xLabel: 'x (m)',
        yLabel: 'A(x) (m²)',
      });

      const fnA = (u) => -2 * u * u + 40 * u;

      board.clippedLayer.appendChild(
        s('path', {
          d: sampleCurvePath(fnA, mapper, 100, -2, 22),
          fill: 'none',
          stroke: 'rgba(167, 184, 174, 0.28)',
          'stroke-width': 1.8,
          'stroke-dasharray': '4 4',
        })
      );

      board.clippedLayer.appendChild(
        s('path', {
          d: sampleCurvePath(fnA, mapper, 90, 0, 20),
          fill: 'none',
          stroke: 'var(--blue)',
          'stroke-width': 3,
        })
      );

      // Vértice en (10; 200)
      board.clippedLayer.appendChild(
        s('circle', {
          cx: mapper.toX(10),
          cy: mapper.toY(200),
          r: 5.5,
          fill: 'var(--green)',
          stroke: '#111',
          'stroke-width': 1.6,
        })
      );

      board.clippedLayer.appendChild(
        s('circle', {
          cx: mapper.toX(x),
          cy: mapper.toY(Math.max(0, area)),
          r: 6.5,
          fill: 'var(--yellow)',
          stroke: '#111',
          'stroke-width': 2,
        })
      );

      board.overlayLayer.appendChild(
        s(
          'text',
          {
            x: mapper.toX(10),
            y: mapper.toY(200) - 8,
            fill: 'var(--green)',
            'font-size': 11.5,
            'font-weight': 'bold',
            'text-anchor': 'middle',
          },
          'Máx V(10 m; 200 m²)'
        )
      );

      readoutLine1.textContent = `Cerco contra un Muro: A(x) = x(40 − 2x) = −2x² + 40x sobre el dominio físico x ∈ [0; 20] m`;
      readoutLine2.textContent = `Para x = ${fmtNumClean(x)} m → Dimensiones ${fmtNumClean(
        x
      )} m × ${fmtNumClean(length)} m ⇒ Área A(${fmtNumClean(
        x
      )}) = ${fmtNumClean(
        area
      )} m² · Máximo absoluto en el vértice V(10 m; 200 m²) con dimensiones 10 m × 20 m.`;
    }
  }

  render();
  host.append(predictBox, modeRow, projSubpresetsRow, board.svg, slidersWrap, readout);
  return { state, render };
}

export const initWidget = initOptimizacionExtremos;
export default initOptimizacionExtremos;
