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

// Subrayados anclados al texto (estilo lector electrónico)
const MARKS_STORAGE_PREFIX = 'sp-marks:';
const ANCHOR_CONTEXT = 32;
const HIGHLIGHT_SUPPORTED =
  typeof CSS !== 'undefined' && !!CSS.highlights && typeof Highlight !== 'undefined';

export function initScratchpad(root = document.body) {
  if (instance) return instance;
  if (typeof window === 'undefined' || typeof document === 'undefined' || !root) return null;

  // Estado del lienzo
  let activeTool = 'pencil'; // 'pencil' | 'highlighter' | 'eraser'
  let currentColor = CHALK_COLORS[1].hex; // Amarillo por defecto
  let currentWidth = STROKE_WIDTHS[1].size; // Medio por defecto
  let isToolbarOpen = false;
  let isDrawing = false;

  // Vector de trazos anclados a coordenadas de documento (pageX, pageY)
  // Cada trazo: { isEraser, color, width, points: [{x, y}] }
  const strokes = [];
  const redoStack = [];
  // Historial unificado (trazos de tiza y subrayados) para deshacer / rehacer
  const history = [];

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

  const iconHighlighter = () =>
    s('svg', { viewBox: '0 0 16 16', width: '18', height: '18', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' },
      s('path', { d: 'M9.5 2.5l4 4-5.5 5.5-4-4 5.5-5.5z' }),
      s('path', { d: 'M4 8l4 4' }),
      s('path', { d: 'M2.5 14h6' })
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

  // Trazo en curso (declarado antes de la primera llamada a redraw)
  let activeStroke = null;

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
  let prevSmoothX = 0;
  let prevSmoothY = 0;
  let lastMidX = 0;
  let lastMidY = 0;
  let lastMoveTime = 0;
  let liveStrokeWidth = currentWidth;

  function updateCanvasInteractivity() {
    if (!isToolbarOpen || activeTool === 'highlighter') {
      // Barra minimizada o remarcador: el lienzo no captura eventos y el texto
      // de la página se puede seleccionar de forma nativa.
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
    if (!isToolbarOpen) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    try { canvas.setPointerCapture?.(e.pointerId); } catch { /* puntero sintético o ya liberado */ }

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

    const coalesced = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [];
    const events = coalesced.length > 0 ? coalesced : [e];
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
      history.push({ kind: 'stroke', item: activeStroke });
      if (strokes.length > 150) {
        const dropped = strokes.shift(); // Límite de seguridad
        const hi = history.findIndex((en) => en.item === dropped);
        if (hi >= 0) history.splice(hi, 1);
      }
    }
    activeStroke = null;
    updateToolbarUI(); // habilita Deshacer / Limpiar
    try { canvas.releasePointerCapture?.(e.pointerId); } catch { /* sin captura activa */ }
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

  function applyEntry(entry, add) {
    if (entry.kind === 'stroke') {
      const idx = strokes.indexOf(entry.item);
      if (add && idx < 0) strokes.push(entry.item);
      if (!add && idx >= 0) strokes.splice(idx, 1);
      redraw();
    } else if (add) {
      addMark(entry.item);
    } else {
      removeMark(entry.item);
    }
  }

  function undo() {
    if (history.length === 0) return;
    const entry = history.pop();
    redoStack.push(entry);
    applyEntry(entry, false);
    updateToolbarUI();
    playClick();
  }

  function redo() {
    if (redoStack.length === 0) return;
    const entry = redoStack.pop();
    history.push(entry);
    applyEntry(entry, true);
    updateToolbarUI();
    playClick();
  }

  function clearAll() {
    if (strokes.length === 0 && marks.length === 0) return;
    strokes.length = 0;
    history.length = 0;
    redoStack.length = 0;
    clearMarks();
    redraw();
    updateToolbarUI();
    playClick();
  }

  // ==========================================================================
  // SUBRAYADOS ANCLADOS AL TEXTO
  // Se usa la CSS Custom Highlight API: no modifica el DOM (no rompe widgets) y
  // los Range vivos siguen al texto ante scroll, resize o reflujo. Para
  // persistir entre visitas, cada subrayado guarda una cita de texto con
  // prefijo y sufijo, que se vuelve a ubicar al cargar la página.
  // ==========================================================================
  const marks = []; // { id, range, color, colorId, anchor }
  const highlightsByColor = new Map();
  let pendingAnchors = []; // anclas aún no resueltas (contenido dinámico)
  const storageKey = MARKS_STORAGE_PREFIX + (location.pathname || '/');
  let markSeq = 0;

  function highlightFor(colorId) {
    let hl = highlightsByColor.get(colorId);
    if (!hl) {
      hl = new Highlight();
      highlightsByColor.set(colorId, hl);
      CSS.highlights.set(`sp-hl-${colorId}`, hl);
    }
    return hl;
  }

  function isIgnoredNode(node) {
    const el = node.nodeType === 1 ? node : node.parentElement;
    if (!el) return true;
    if (el.closest('.scratchpad-container, .scratchpad-canvas, script, style, noscript, textarea')) return true;
    return false;
  }

  // Índice lineal de todo el texto visible de la página
  function buildTextIndex() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (isIgnoredNode(n) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nodes = [];
    let text = '';
    let n;
    while ((n = walker.nextNode())) {
      nodes.push({ node: n, start: text.length });
      text += n.nodeValue;
    }
    return { text, nodes };
  }

  function offsetOf(index, container, offset) {
    // Convierte (nodo, offset) del DOM en un offset lineal del índice de texto
    if (container.nodeType === 3) {
      const entry = index.nodes.find((e) => e.node === container);
      return entry ? entry.start + offset : -1;
    }
    const probe = document.createRange();
    probe.setStart(container, offset);
    probe.collapse(true);
    for (const entry of index.nodes) {
      const r = document.createRange();
      r.selectNodeContents(entry.node);
      if (r.compareBoundaryPoints(Range.START_TO_START, probe) >= 0) return entry.start;
    }
    return index.text.length;
  }

  function locate(index, pos) {
    for (let i = index.nodes.length - 1; i >= 0; i--) {
      const e = index.nodes[i];
      if (pos >= e.start) return { node: e.node, offset: Math.min(pos - e.start, e.node.nodeValue.length) };
    }
    return null;
  }

  function makeAnchor(range) {
    const index = buildTextIndex();
    const start = offsetOf(index, range.startContainer, range.startOffset);
    const end = offsetOf(index, range.endContainer, range.endOffset);
    if (start < 0 || end <= start) return null;
    return {
      quote: index.text.slice(start, end),
      prefix: index.text.slice(Math.max(0, start - ANCHOR_CONTEXT), start),
      suffix: index.text.slice(end, end + ANCHOR_CONTEXT),
      start,
    };
  }

  function resolveAnchor(anchor, index) {
    const { quote, prefix, suffix } = anchor;
    if (!quote) return null;
    let best = -1;
    let bestScore = -1;
    let from = 0;
    for (;;) {
      const at = index.text.indexOf(quote, from);
      if (at < 0) break;
      let score = 0;
      const before = index.text.slice(Math.max(0, at - prefix.length), at);
      const after = index.text.slice(at + quote.length, at + quote.length + suffix.length);
      if (before === prefix) score += 2;
      if (after === suffix) score += 2;
      if (at === anchor.start) score += 1;
      if (score > bestScore) { best = at; bestScore = score; }
      from = at + 1;
    }
    // Sin contexto coincidente se acepta solo si la cita es única
    if (best < 0 || (bestScore < 2 && index.text.indexOf(quote, best + 1) >= 0)) return null;
    const a = locate(index, best);
    const b = locate(index, best + quote.length);
    if (!a || !b) return null;
    const range = document.createRange();
    range.setStart(a.node, a.offset);
    range.setEnd(b.node, b.offset);
    return range;
  }

  function saveMarks() {
    try {
      const data = [
        ...marks.map((m) => ({ ...m.anchor, colorId: m.colorId })),
        ...pendingAnchors,
      ];
      if (data.length === 0) localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey, JSON.stringify(data));
    } catch { /* almacenamiento no disponible */ }
  }

  function addMark(mark, persist = true) {
    if (marks.includes(mark)) return;
    marks.push(mark);
    highlightFor(mark.colorId).add(mark.range);
    if (persist) saveMarks();
  }

  function removeMark(mark) {
    const idx = marks.indexOf(mark);
    if (idx < 0) return;
    marks.splice(idx, 1);
    highlightsByColor.get(mark.colorId)?.delete(mark.range);
    saveMarks();
  }

  function clearMarks() {
    marks.length = 0;
    pendingAnchors = [];
    highlightsByColor.forEach((hl) => hl.clear());
    saveMarks();
  }

  function restoreMarks() {
    if (pendingAnchors.length === 0) return;
    const index = buildTextIndex();
    const still = [];
    for (const anchor of pendingAnchors) {
      const range = resolveAnchor(anchor, index);
      const color = CHALK_COLORS.find((c) => c.id === anchor.colorId);
      if (range && color) {
        addMark({ id: ++markSeq, range, color: color.hex, colorId: color.id, anchor }, false);
      } else {
        still.push(anchor);
      }
    }
    pendingAnchors = still;
  }

  function loadMarks() {
    try {
      const raw = localStorage.getItem(storageKey);
      const data = raw ? JSON.parse(raw) : [];
      pendingAnchors = Array.isArray(data) ? data.filter((a) => a && typeof a.quote === 'string') : [];
    } catch {
      pendingAnchors = [];
    }
    restoreMarks();
    // El contenido de los widgets puede renderizarse después: se reintenta
    [400, 1500, 4000].forEach((ms) => setTimeout(restoreMarks, ms));
    window.addEventListener('load', restoreMarks, { once: true });
  }

  let selectionTimer = null;
  let pointerIsDown = false;

  function commitSelectionAsMark() {
    if (!isToolbarOpen || activeTool !== 'highlighter' || pointerIsDown) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;
    const range = sel.getRangeAt(0).cloneRange();
    if (isIgnoredNode(range.commonAncestorContainer)) return;
    if (!document.body.contains(range.commonAncestorContainer)) return;
    if (!range.toString().trim()) return;

    const anchor = makeAnchor(range);
    if (!anchor || !anchor.quote.trim()) return;
    const color = CHALK_COLORS.find((c) => c.hex === currentColor) || CHALK_COLORS[1];
    const mark = { id: ++markSeq, range, color: color.hex, colorId: color.id, anchor };

    redoStack.length = 0;
    addMark(mark);
    history.push({ kind: 'mark', item: mark });
    sel.removeAllRanges();
    updateToolbarUI();
    playClick();
  }

  function markAtPoint(x, y) {
    for (let i = marks.length - 1; i >= 0; i--) {
      const rects = marks[i].range.getClientRects();
      for (const r of rects) {
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return marks[i];
      }
    }
    return null;
  }

  if (HIGHLIGHT_SUPPORTED) {
    loadMarks();

    document.addEventListener('selectionchange', () => {
      clearTimeout(selectionTimer);
      if (!isToolbarOpen || activeTool !== 'highlighter') return;
      selectionTimer = setTimeout(commitSelectionAsMark, 350);
    });
    document.addEventListener('pointerdown', (e) => {
      if (e.target instanceof Element && e.target.closest('.scratchpad-container')) return;
      pointerIsDown = true;
    }, true);
    const onPointerRelease = () => {
      if (!pointerIsDown) return;
      pointerIsDown = false;
      clearTimeout(selectionTimer);
      selectionTimer = setTimeout(commitSelectionAsMark, 30);
    };
    document.addEventListener('pointerup', onPointerRelease, true);
    document.addEventListener('pointercancel', onPointerRelease, true);

    // Tocar un subrayado (sin seleccionar texto) lo quita
    document.addEventListener('click', (e) => {
      if (!isToolbarOpen || activeTool !== 'highlighter') return;
      if (e.target instanceof Element && e.target.closest('.scratchpad-container')) return;
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) return;
      const hit = markAtPoint(e.clientX, e.clientY);
      if (!hit) return;
      removeMark(hit);
      const hi = history.findIndex((en) => en.item === hit);
      if (hi >= 0) history.splice(hi, 1);
      updateToolbarUI();
      playClick();
    });
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

    updateToolbarUI();
    updateCanvasInteractivity();
    playClick();
  }

  toggleBtn.addEventListener('click', () => toggleToolbar());

  // Render de controles de la barra de herramientas
  function updateToolbarUI() {
    toolbar.replaceChildren();

    // 1. Selector de herramientas: Lápiz, Remarcador, Goma
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
        hidden: !HIGHLIGHT_SUPPORTED,
        class: ['scratchpad-btn', activeTool === 'highlighter' ? 'is-active' : ''],
        title: 'Remarcador (seleccioná texto para subrayarlo; tocá un subrayado para quitarlo)',
        'aria-label': 'Remarcador de texto',
        on: { click: () => setTool('highlighter') },
      }, iconHighlighter(), h('span', { class: 'scratchpad-btn__text' }, 'Remarcador')),
      h('button', {
        type: 'button',
        class: ['scratchpad-btn', activeTool === 'eraser' ? 'is-active' : ''],
        title: 'Goma de borrar (eliminar trazos de tiza)',
        'aria-label': 'Goma de borrar',
        on: { click: () => setTool('eraser') },
      }, iconEraser(), h('span', { class: 'scratchpad-btn__text' }, 'Goma'))
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
              if (activeTool === 'eraser') {
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
              if (activeTool === 'eraser' || activeTool === 'highlighter') {
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
        disabled: strokes.length === 0 && marks.length === 0,
        on: { click: undo },
      }, iconUndo()),
      h('button', {
        type: 'button',
        class: 'scratchpad-btn scratchpad-btn--icon',
        title: 'Limpiar toda la pizarra',
        'aria-label': 'Limpiar pizarra',
        disabled: strokes.length === 0 && marks.length === 0,
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

    sizeGroup.hidden = activeTool === 'highlighter';
    toolbar.append(toolGroup, colorGroup, sizeGroup, actionGroup);
  }

  instance = {
    toggle: toggleToolbar,
    setTool,
    clear: clearAll,
    undo,
    redo,
    getStrokesCount: () => strokes.length,
    getMarksCount: () => marks.length,
    getActiveTool: () => activeTool,
  };

  return instance;
}
