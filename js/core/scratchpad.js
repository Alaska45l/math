/**
 * scratchpad.js — Pizarrón Borrador y Trazo Libre sobre pantalla.
 * Permite escribir y resolver libremente sobre la pantalla sin cuaderno físico.
 * Implementa trazo inteligente con interpolación spline cuadrática punto-medio,
 * filtrado exponencial de paso bajo (low-pass stream smoothing) para escritura
 * fluida con mouse, grosor adaptativo por velocidad, goma de borrar y deshacer.
 */

import { h, s, mount } from './dom.js';
import { playClick } from './sound.js';

let instance = null;

const CHALK_COLORS = [
  { id: 'white', hex: '#ece8dc', label: 'Tiza blanca' },
  { id: 'yellow', hex: '#eed49f', label: 'Tiza amarilla' },
  { id: 'teal', hex: '#8bd5ca', label: 'Tiza verde agua' },
  { id: 'pink', hex: '#f5bde6', label: 'Tiza rosa' },
];

const STROKE_WIDTHS = [
  { id: 'fine', size: 2.2, label: 'Fino' },
  { id: 'medium', size: 3.8, label: 'Medio' },
  { id: 'thick', size: 6.5, label: 'Grueso' },
];

const ERASER_RADIUS = 20;

export function initScratchpad(root = document.body) {
  if (instance) return instance;
  if (typeof window === 'undefined' || typeof document === 'undefined' || !root) return null;

  // Estado del lienzo
  let activeTool = 'pencil'; // 'pencil' | 'eraser' | 'pointer'
  let currentColor = CHALK_COLORS[1].hex; // Amarillo por defecto
  let currentWidth = STROKE_WIDTHS[1].size; // Medio por defecto
  let isToolbarOpen = false;
  let isDrawing = false;

  // Vector de trazos anclados a coordenadas de documento (pageX, pageY)
  // Cada trazo: { isEraser, color, width, points: [{x, y, v}] }
  const strokes = [];
  const redoStack = [];

  // Elementos del DOM
  const canvas = h('canvas', {
    class: 'scratchpad-canvas',
    'aria-label': 'Lienzo de dibujo libre sobre la pantalla',
    role: 'img',
  });

  const eraserCursor = h('div', {
    class: 'scratchpad-eraser-cursor',
    'aria-hidden': 'true',
  });

  // Iconos SVG de tiza a mano alzada
  const iconPencil = () =>
    s('svg', { viewBox: '0 0 16 16', width: '18', height: '18', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' },
      s('path', { d: 'M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z' }),
      s('path', { d: 'M9.5 4.5l2 2' })
    );

  const iconEraser = () =>
    s('svg', { viewBox: '0 0 16 16', width: '18', height: '18', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' },
      s('path', { d: 'M4 12.5l-2-2 7-7 4 4-5.5 5.5H4z' }),
      s('path', { d: 'M6.5 6l4 4' }),
      s('path', { d: 'M9 13.5h5' })
    );

  const iconPointer = () =>
    s('svg', { viewBox: '0 0 16 16', width: '18', height: '18', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' },
      s('path', { d: 'M3 3l4.5 10.5 2-4 4-2L3 3z' }),
      s('path', { d: 'M9.5 9.5L13 13' })
    );

  const iconUndo = () =>
    s('svg', { viewBox: '0 0 16 16', width: '16', height: '16', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' },
      s('path', { d: 'M3.5 6.5h7a3.5 3.5 0 0 1 0 7H8' }),
      s('path', { d: 'M6 4L3.5 6.5 6 9' })
    );

  const iconClear = () =>
    s('svg', { viewBox: '0 0 16 16', width: '16', height: '16', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' },
      s('path', { d: 'M2.5 4.5h11' }),
      s('path', { d: 'M5.5 4.5v-1a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1' }),
      s('path', { d: 'M4 4.5l.8 9a1 1 0 0 0 1 .9h4.4a1 1 0 0 0 1-.9l.8-9' })
    );

  const iconClose = () =>
    s('svg', { viewBox: '0 0 16 16', width: '16', height: '16', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' },
      s('path', { d: 'M4 4l8 8M12 4l-8 8' })
    );

  // Botón principal de alternancia en el límite inferior izquierdo
  const toggleBtn = h('button', {
    type: 'button',
    class: 'scratchpad-toggle-btn',
    'aria-label': 'Pizarra borrador (abrir herramientas de dibujo en pantalla)',
    title: 'Pizarra borrador (dibujar libremente en pantalla)',
  }, iconPencil());

  // Barra de herramientas desplegable
  const toolbar = h('div', {
    class: 'scratchpad-toolbar',
    role: 'toolbar',
    'aria-label': 'Controles de trazo y pizarra',
    hidden: true,
  });

  const container = h('aside', {
    class: 'scratchpad-container',
    'aria-label': 'Pizarra borrador flotante',
  }, toggleBtn, toolbar);

  root.appendChild(canvas);
  root.appendChild(eraserCursor);
  root.appendChild(container);

  const ctx = canvas.getContext('2d');

  // Ajuste de resolución Retina / HiDPI
  let dpr = window.devicePixelRatio || 1;
  function resizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  // Redibujado general según el scroll actual del documento
  let rafId = null;
  function redraw() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const scrollX = window.scrollX || window.pageXOffset || 0;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    for (let i = 0; i < strokes.length; i++) {
      drawStroke(ctx, strokes[i], scrollX, scrollY);
    }
    ctx.restore();
  }

  function scheduleRedraw() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      redraw();
    });
  }

  window.addEventListener('scroll', scheduleRedraw, { passive: true });

  /**
   * Dibuja un trazo completo almacenado usando curvas cuadráticas suaves.
   */
  function drawStroke(targetCtx, stroke, scrollX, scrollY) {
    const pts = stroke.points;
    if (!pts || pts.length === 0) return;

    targetCtx.save();
    if (stroke.isEraser) {
      targetCtx.globalCompositeOperation = 'destination-out';
      targetCtx.strokeStyle = 'rgba(0,0,0,1)';
      targetCtx.fillStyle = 'rgba(0,0,0,1)';
      targetCtx.lineWidth = stroke.width;
    } else {
      targetCtx.globalCompositeOperation = 'source-over';
      targetCtx.strokeStyle = stroke.color;
      targetCtx.fillStyle = stroke.color;
      targetCtx.lineWidth = stroke.width;
      targetCtx.shadowColor = stroke.color;
      targetCtx.shadowBlur = 0.5;
    }
    targetCtx.lineCap = 'round';
    targetCtx.lineJoin = 'round';

    const p0x = pts[0].x - scrollX;
    const p0y = pts[0].y - scrollY;

    if (pts.length === 1) {
      targetCtx.beginPath();
      targetCtx.arc(p0x, p0y, stroke.width / 2, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.restore();
      return;
    }

    if (pts.length === 2) {
      const p1x = pts[1].x - scrollX;
      const p1y = pts[1].y - scrollY;
      targetCtx.beginPath();
      targetCtx.moveTo(p0x, p0y);
      targetCtx.lineTo(p1x, p1y);
      targetCtx.stroke();
      targetCtx.restore();
      return;
    }

    targetCtx.beginPath();
    targetCtx.moveTo(p0x, p0y);

    let midX = (p0x + (pts[1].x - scrollX)) / 2;
    let midY = (p0y + (pts[1].y - scrollY)) / 2;
    targetCtx.lineTo(midX, midY);

    for (let i = 1; i < pts.length - 1; i++) {
      const cX = pts[i].x - scrollX;
      const cY = pts[i].y - scrollY;
      const nextX = pts[i + 1].x - scrollX;
      const nextY = pts[i + 1].y - scrollY;
      midX = (cX + nextX) / 2;
      midY = (cY + nextY) / 2;
      targetCtx.quadraticCurveTo(cX, cY, midX, midY);
    }

    const lastX = pts[pts.length - 1].x - scrollX;
    const lastY = pts[pts.length - 1].y - scrollY;
    targetCtx.lineTo(lastX, lastY);
    targetCtx.stroke();
    targetCtx.restore();
  }

  // Variables de trazo en vivo con filtro de paso bajo
  let activeStroke = null;
  let prevSmoothX = 0;
  let prevSmoothY = 0;
  let lastMidX = 0;
  let lastMidY = 0;
  let lastMoveTime = 0;
  let liveStrokeWidth = currentWidth;

  function updateCanvasInteractivity() {
    if (activeTool === 'pointer' || !isToolbarOpen) {
      canvas.classList.remove('is-active', 'is-eraser');
      eraserCursor.style.display = 'none';
    } else if (activeTool === 'eraser') {
      canvas.classList.add('is-active', 'is-eraser');
    } else {
      canvas.classList.add('is-active');
      canvas.classList.remove('is-eraser');
      eraserCursor.style.display = 'none';
    }
  }

  // Manejadores de puntero para trazo libre inteligente
  canvas.addEventListener('pointerdown', (e) => {
    if (activeTool === 'pointer') return;
    e.preventDefault();
    canvas.setPointerCapture?.(e.pointerId);

    isDrawing = true;
    redoStack.length = 0; // Se descarta el rehacer al crear un nuevo trazo

    const scrollX = window.scrollX || window.pageXOffset || 0;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const docX = e.clientX + scrollX;
    const docY = e.clientY + scrollY;

    prevSmoothX = docX;
    prevSmoothY = docY;
    lastMidX = e.clientX;
    lastMidY = e.clientY;
    lastMoveTime = performance.now();
    liveStrokeWidth = activeTool === 'eraser' ? ERASER_RADIUS * 2 : currentWidth;

    activeStroke = {
      isEraser: activeTool === 'eraser',
      color: currentColor,
      width: liveStrokeWidth,
      points: [{ x: docX, y: docY }],
    };

    // Dibujo instantáneo del punto de contacto
    ctx.save();
    if (activeStroke.isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.beginPath();
      ctx.arc(e.clientX, e.clientY, liveStrokeWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = activeStroke.color;
      ctx.shadowColor = activeStroke.color;
      ctx.shadowBlur = 0.5;
      ctx.beginPath();
      ctx.arc(e.clientX, e.clientY, liveStrokeWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });

  canvas.addEventListener('pointermove', (e) => {
    // Actualizar posición del aro visual de la goma
    if (activeTool === 'eraser') {
      eraserCursor.style.display = 'block';
      eraserCursor.style.transform = `translate(${e.clientX - ERASER_RADIUS}px, ${e.clientY - ERASER_RADIUS}px)`;
    } else {
      eraserCursor.style.display = 'none';
    }

    if (!isDrawing || !activeStroke) return;

    const events = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [e];
    const scrollX = window.scrollX || window.pageXOffset || 0;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    for (let i = 0; i < events.length; i++) {
      const ev = events[i];
      const now = performance.now();
      const rawX = ev.clientX + scrollX;
      const rawY = ev.clientY + scrollY;

      const dist = Math.hypot(rawX - prevSmoothX, rawY - prevSmoothY);
      // Umbral mínimo de movimiento para evitar acumulación de ruido
      if (dist < 1.8 && activeStroke.points.length > 1) continue;

      // Filtrado exponencial de paso bajo (Stream Smoothing)
      const alpha = ev.pointerType === 'touch' ? 0.82 : 0.72;
      const smoothX = prevSmoothX + alpha * (rawX - prevSmoothX);
      const smoothY = prevSmoothY + alpha * (rawY - prevSmoothY);

      // Modulación de grosor según velocidad (tacto natural de lápiz/tiza)
      const dt = Math.max(1, now - lastMoveTime);
      const speed = dist / dt;
      lastMoveTime = now;

      if (!activeStroke.isEraser) {
        const targetWidth = currentWidth * (1 - Math.min(1, Math.max(0, (speed - 0.25) / 2.6)) * 0.32);
        liveStrokeWidth = liveStrokeWidth * 0.6 + targetWidth * 0.4;
      }

      // Coordenadas locales en viewport
      const screenSmoothX = smoothX - scrollX;
      const screenSmoothY = smoothY - scrollY;
      const midX = (lastMidX + screenSmoothX) / 2;
      const midY = (lastMidY + screenSmoothY) / 2;

      // Trazo del segmento con spline cuadrática punto-medio
      ctx.save();
      if (activeStroke.isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = ERASER_RADIUS * 2;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = activeStroke.color;
        ctx.lineWidth = liveStrokeWidth;
        ctx.shadowColor = activeStroke.color;
        ctx.shadowBlur = 0.5;
      }
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(lastMidX, lastMidY);
      ctx.quadraticCurveTo(prevSmoothX - scrollX, prevSmoothY - scrollY, midX, midY);
      ctx.stroke();
      ctx.restore();

      activeStroke.points.push({ x: smoothX, y: smoothY });
      prevSmoothX = smoothX;
      prevSmoothY = smoothY;
      lastMidX = midX;
      lastMidY = midY;
    }
  });

  function endDrawing(e) {
    if (!isDrawing) return;
    isDrawing = false;
    if (activeStroke && activeStroke.points.length > 0) {
      strokes.push(activeStroke);
      if (strokes.length > 150) strokes.shift(); // Límite de seguridad
    }
    activeStroke = null;
    canvas.releasePointerCapture?.(e.pointerId);
  }

  canvas.addEventListener('pointerup', endDrawing);
  canvas.addEventListener('pointercancel', endDrawing);

  // Atajos de teclado: Ctrl+Z (deshacer), Esc (cerrar o interactuar)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
    } else if (e.key === 'Escape' && isToolbarOpen) {
      toggleToolbar(false);
    }
  });

  function undo() {
    if (strokes.length === 0) return;
    const removed = strokes.pop();
    redoStack.push(removed);
    redraw();
    playClick();
  }

  function redo() {
    if (redoStack.length === 0) return;
    const restored = redoStack.pop();
    strokes.push(restored);
    redraw();
    playClick();
  }

  function clearAll() {
    if (strokes.length === 0) return;
    strokes.length = 0;
    redoStack.length = 0;
    redraw();
    playClick();
  }

  function setTool(tool) {
    activeTool = tool;
    updateToolbarUI();
    updateCanvasInteractivity();
    playClick();
  }

  function toggleToolbar(openState) {
    isToolbarOpen = typeof openState === 'boolean' ? openState : !isToolbarOpen;
    toolbar.hidden = !isToolbarOpen;
    toggleBtn.setAttribute('aria-expanded', isToolbarOpen ? 'true' : 'false');
    toggleBtn.classList.toggle('is-open', isToolbarOpen);

    if (isToolbarOpen && activeTool === 'pointer') {
      activeTool = 'pencil';
    }
    updateToolbarUI();
    updateCanvasInteractivity();
    playClick();
  }

  toggleBtn.addEventListener('click', () => toggleToolbar());

  // Render de controles de la barra de herramientas
  function updateToolbarUI() {
    toolbar.replaceChildren();

    // 1. Selector de herramientas: Lápiz, Goma, Puntero (Interactuar)
    const toolGroup = h('div', { class: 'scratchpad-group', role: 'group', 'aria-label': 'Herramientas' },
      h('button', {
        type: 'button',
        class: ['scratchpad-btn', activeTool === 'pencil' ? 'is-active' : ''],
        title: 'Lápiz (dibujar cálculos con trazo inteligente)',
        'aria-label': 'Lápiz',
        on: { click: () => setTool('pencil') },
      }, iconPencil(), h('span', { class: 'scratchpad-btn__text' }, 'Lápiz')),
      h('button', {
        type: 'button',
        class: ['scratchpad-btn', activeTool === 'eraser' ? 'is-active' : ''],
        title: 'Goma de borrar (eliminar trazos de tiza)',
        'aria-label': 'Goma de borrar',
        on: { click: () => setTool('eraser') },
      }, iconEraser(), h('span', { class: 'scratchpad-btn__text' }, 'Goma')),
      h('button', {
        type: 'button',
        class: ['scratchpad-btn', activeTool === 'pointer' ? 'is-active' : ''],
        title: 'Modo Puntero (interactuar con la página sin borrar los cálculos)',
        'aria-label': 'Modo puntero para interactuar con la página',
        on: { click: () => setTool('pointer') },
      }, iconPointer(), h('span', { class: 'scratchpad-btn__text' }, 'Puntero'))
    );

    // 2. Paleta de colores de tiza
    const colorGroup = h('div', { class: 'scratchpad-colors', role: 'radiogroup', 'aria-label': 'Color de tiza' },
      ...CHALK_COLORS.map((c) =>
        h('button', {
          type: 'button',
          class: ['scratchpad-color-dot', currentColor === c.hex ? 'is-active' : ''],
          style: `background-color: ${c.hex};`,
          title: c.label,
          'aria-label': c.label,
          on: {
            click: () => {
              currentColor = c.hex;
              if (activeTool === 'eraser' || activeTool === 'pointer') {
                activeTool = 'pencil';
                updateCanvasInteractivity();
              }
              updateToolbarUI();
              playClick();
            },
          },
        })
      )
    );

    // 3. Grosor de trazo
    const sizeGroup = h('div', { class: 'scratchpad-sizes', role: 'group', 'aria-label': 'Grosor de trazo' },
      ...STROKE_WIDTHS.map((sItem) =>
        h('button', {
          type: 'button',
          class: ['scratchpad-size-btn', currentWidth === sItem.size ? 'is-active' : ''],
          title: `Trazo ${sItem.label}`,
          'aria-label': `Trazo ${sItem.label}`,
          on: {
            click: () => {
              currentWidth = sItem.size;
              if (activeTool === 'eraser' || activeTool === 'pointer') {
                activeTool = 'pencil';
                updateCanvasInteractivity();
              }
              updateToolbarUI();
              playClick();
            },
          },
        }, h('span', {
          class: 'scratchpad-size-preview',
          style: `width: ${sItem.size * 2.2}px; height: ${sItem.size * 2.2}px;`,
        }))
      )
    );

    // 4. Acciones: Deshacer, Limpiar y Cerrar
    const actionGroup = h('div', { class: 'scratchpad-actions', role: 'group', 'aria-label': 'Acciones' },
      h('button', {
        type: 'button',
        class: 'scratchpad-btn scratchpad-btn--icon',
        title: 'Deshacer último trazo (Ctrl+Z)',
        'aria-label': 'Deshacer',
        disabled: strokes.length === 0,
        on: { click: undo },
      }, iconUndo()),
      h('button', {
        type: 'button',
        class: 'scratchpad-btn scratchpad-btn--icon',
        title: 'Limpiar toda la pizarra',
        'aria-label': 'Limpiar pizarra',
        disabled: strokes.length === 0,
        on: { click: clearAll },
      }, iconClear()),
      h('button', {
        type: 'button',
        class: 'scratchpad-btn scratchpad-btn--icon scratchpad-btn--close',
        title: 'Minimizar barra',
        'aria-label': 'Minimizar barra',
        on: { click: () => toggleToolbar(false) },
      }, iconClose())
    );

    toolbar.append(toolGroup, colorGroup, sizeGroup, actionGroup);
  }

  instance = {
    toggle: toggleToolbar,
    setTool,
    clear: clearAll,
    undo,
    redo,
    getStrokesCount: () => strokes.length,
    getActiveTool: () => activeTool,
  };

  return instance;
}
