/**
 * vn.js — Motor Visual Novel interactivo ("Modo Tutora Alaska")
 * Reutilizable, sin dependencias externas, accesible y con estética de pizarra de tiza.
 */

import { h, mount } from './dom.js';

export const VN_POSES = {
  base: 'assets/vn/base.webp',
  orgullosa: 'assets/vn/orgullosa.webp',
  colapso: 'assets/vn/colapso.webp',
  enojada: 'assets/vn/enojada.webp',
  feliz: 'assets/vn/feliz.webp',
};

const DEFAULT_TAGS = {
  base: '👓 Modo Teoría',
  orgullosa: '😏 Te lo advertí',
  colapso: '💧 Colapso mental',
  enojada: '💢 ¡Frená la mano!',
  feliz: '😊 ¡Bien ahí!',
};

// Precarga inmediata de los 5 sprites
if (typeof window !== 'undefined' && typeof Image !== 'undefined') {
  Object.values(VN_POSES).forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

/**
 * Controlador singleton del HUD de Visual Novel
 */
class VisualNovelController {
  constructor() {
    this.hudEl = null;
    this.boxEl = null;
    this.fabEl = null;
    this.spriteEl = null;
    this.spriteWrapEl = null;
    this.tagEl = null;
    this.textEl = null;
    this.counterEl = null;
    this.btnNext = null;

    this.currentScript = [];
    this.currentIndex = 0;
    this.onFinishCallback = null;
    this.autoHideTimer = null;

    this.isTyping = false;
    this.typewriterTimer = null;
    this.currentFullHtml = '';
    this.currentTextNodes = [];
    this.typingNodeIndex = 0;
    this.typingCharIndex = 0;

    this.isOpen = false;
    this.isMinimized = false;

    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.initDOM());
      } else {
        this.initDOM();
      }
    }
  }

  initDOM() {
    if (this.hudEl || typeof document === 'undefined') return;

    // Botón flotante minimizado [ 👓 Alaska ]
    this.fabEl = h('button', {
      type: 'button',
      class: 'vn-fab',
      'aria-label': 'Abrir diálogo de Alaska',
      title: 'Consultar a Alaska (Tutora de Exactas)',
      on: {
        click: () => this.restore(),
      },
    },
      h('span', { class: 'vn-fab__icon' }, '👓'),
      h('span', { class: 'vn-fab__label' }, 'Alaska')
    );

    // Sprite de personaje
    this.spriteEl = h('img', {
      class: 'vn-sprite',
      src: VN_POSES.base,
      alt: 'Alaska, tutora científica de Exactas',
    });

    this.spriteWrapEl = h('div', { class: 'vn-sprite-wrap' }, this.spriteEl);

    // Placa de nombre y estado emocional
    this.tagEl = h('span', { class: 'vn-tag' }, DEFAULT_TAGS.base);
    const nameplateEl = h('div', { class: 'vn-nameplate' },
      h('strong', { class: 'vn-name' }, 'Alaska'),
      h('span', { class: 'vn-role' }, 'Tutora de Exactas'),
      this.tagEl
    );

    // Controles de ventana
    const btnMin = h('button', {
      type: 'button',
      class: 'vn-ctrl-btn vn-ctrl-btn--min',
      'aria-label': 'Minimizar diálogo',
      title: 'Minimizar diálogo a la esquina',
      on: {
        click: (e) => {
          e.stopPropagation();
          this.minimize();
        },
      },
    }, '—');

    const btnClose = h('button', {
      type: 'button',
      class: 'vn-ctrl-btn vn-ctrl-btn--close',
      'aria-label': 'Cerrar diálogo',
      title: 'Cerrar diálogo (Esc)',
      on: {
        click: (e) => {
          e.stopPropagation();
          this.close();
        },
      },
    }, '✕');

    const headerEl = h('div', { class: 'vn-box__header' },
      nameplateEl,
      h('div', { class: 'vn-box__controls' }, btnMin, btnClose)
    );

    // Cuerpo de texto
    this.textEl = h('div', { class: 'vn-text', 'aria-live': 'polite' });

    // Footer con contador y botón siguiente
    this.counterEl = h('span', { class: 'vn-counter small muted' }, '');
    this.btnNext = h('button', {
      type: 'button',
      class: 'btn btn--sm vn-btn-next',
      on: {
        click: (e) => {
          e.stopPropagation();
          this.advance();
        },
      },
    }, 'Siguiente ▸');

    const footerEl = h('div', { class: 'vn-box__footer' },
      this.counterEl,
      this.btnNext
    );

    // Cuadro principal
    this.boxEl = h('div', {
      class: 'vn-box',
      role: 'dialog',
      'aria-label': 'Explicación de Alaska',
      on: {
        click: () => this.handleBoxClick(),
      },
    },
      this.spriteWrapEl,
      h('div', { class: 'vn-box__inner' },
        headerEl,
        this.textEl,
        footerEl
      )
    );

    // Contenedor HUD global
    this.hudEl = h('div', { class: 'vn-hud', 'aria-hidden': 'true' },
      this.fabEl,
      this.boxEl
    );

    document.body.append(this.hudEl);

    // Atajos de teclado globales
    window.addEventListener('keydown', (e) => {
      if (!this.isOpen || this.isMinimized) return;

      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      const isInput = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      if (e.key === 'Escape') {
        e.preventDefault();
        this.close();
      } else if ((e.key === ' ' || e.key === 'Enter') && !isInput) {
        e.preventDefault();
        this.advance();
      }
    });
  }

  /**
   * Clic en la caja: si escribe, termina de escribir; si no, avanza.
   */
  handleBoxClick() {
    this.advance();
  }

  /**
   * Avanza la línea del diálogo o completa el typewriter si está en curso.
   */
  advance() {
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
      this.autoHideTimer = null;
    }

    if (this.isTyping) {
      this.finishTypewriter();
      return;
    }

    if (this.currentIndex < this.currentScript.length - 1) {
      this.currentIndex++;
      this.renderCurrentLine();
    } else {
      this.close();
    }
  }

  /**
   * Termina el efecto máquina de escribir al instante mostrando el HTML completo.
   */
  finishTypewriter() {
    if (this.typewriterTimer) {
      clearTimeout(this.typewriterTimer);
      this.typewriterTimer = null;
    }
    this.isTyping = false;
    if (this.textEl) {
      this.textEl.innerHTML = this.currentFullHtml;
    }
    this.updateControlsState();
  }

  /**
   * Inicia el efecto máquina de escribir respetando tags HTML.
   */
  startTypewriter(html) {
    if (this.typewriterTimer) {
      clearTimeout(this.typewriterTimer);
      this.typewriterTimer = null;
    }

    this.currentFullHtml = html;
    this.isTyping = true;
    this.textEl.innerHTML = html;

    // Recolectar todos los nodos de texto manteniendo la estructura de elementos HTML
    const walker = document.createTreeWalker(this.textEl, NodeFilter.SHOW_TEXT, null);
    this.currentTextNodes = [];
    let textNode;
    while ((textNode = walker.nextNode())) {
      this.currentTextNodes.push({
        node: textNode,
        fullText: textNode.nodeValue || '',
      });
      textNode.nodeValue = '';
    }

    this.typingNodeIndex = 0;
    this.typingCharIndex = 0;
    this.updateControlsState();

    const tick = () => {
      if (!this.isTyping) return;

      if (this.typingNodeIndex >= this.currentTextNodes.length) {
        this.finishTypewriter();
        return;
      }

      const currentItem = this.currentTextNodes[this.typingNodeIndex];
      if (this.typingCharIndex < currentItem.fullText.length) {
        // Revelar 1 carácter
        this.typingCharIndex++;
        currentItem.node.nodeValue = currentItem.fullText.slice(0, this.typingCharIndex);
        this.typewriterTimer = setTimeout(tick, 18);
      } else {
        // Pasar al siguiente nodo de texto
        this.typingNodeIndex++;
        this.typingCharIndex = 0;
        this.typewriterTimer = setTimeout(tick, 10);
      }
    };

    tick();
  }

  /**
   * Actualiza los botones y contadores del footer
   */
  updateControlsState() {
    const total = this.currentScript.length;
    const current = this.currentIndex + 1;
    const isLast = current >= total;

    if (this.counterEl) {
      this.counterEl.textContent = total > 1 ? `[${current}/${total}]` : '';
    }

    if (this.btnNext) {
      this.btnNext.textContent = isLast ? 'Cerrar ✕' : `Siguiente [${current}/${total}] ▸`;
    }
  }

  /**
   * Renderiza la pose, tag y texto de la línea actual
   */
  renderCurrentLine() {
    const line = this.currentScript[this.currentIndex];
    if (!line) return;

    const pose = line.pose || 'base';
    const tag = line.tag || DEFAULT_TAGS[pose] || '👓 Alaska';
    const html = line.html || '';

    // Actualizar sprite y animaciones
    if (this.spriteEl) {
      this.spriteEl.src = VN_POSES[pose] || VN_POSES.base;
    }

    if (this.spriteWrapEl) {
      this.spriteWrapEl.classList.remove('vn-shake', 'vn-pop');
      // Forzar reflujo para reiniciar animación si repite pose
      void this.spriteWrapEl.offsetWidth;

      if (pose === 'enojada') {
        this.spriteWrapEl.classList.add('vn-shake');
      } else if (pose === 'orgullosa' || pose === 'feliz') {
        this.spriteWrapEl.classList.add('vn-pop');
      }
    }

    // Actualizar tag
    if (this.tagEl) {
      this.tagEl.textContent = tag;
    }

    // Iniciar máquina de escribir
    this.startTypewriter(html);
  }

  /**
   * Reproduce un guion scripteado de varias líneas
   */
  playScript(lines = [], { onFinish } = {}) {
    if (!this.hudEl) this.initDOM();
    if (!Array.isArray(lines) || lines.length === 0) return;

    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
      this.autoHideTimer = null;
    }

    this.currentScript = lines;
    this.currentIndex = 0;
    this.onFinishCallback = onFinish || null;

    this.isOpen = true;
    this.isMinimized = false;
    this.hudEl.classList.add('is-visible');
    this.hudEl.classList.remove('is-minimized');
    this.hudEl.setAttribute('aria-hidden', 'false');

    this.renderCurrentLine();
  }

  /**
   * Dispara una reacción rápida de 1 o 2 líneas
   */
  react({ pose = 'base', tag, html = '', autoHideMs = 0 } = {}) {
    if (!this.hudEl) this.initDOM();

    this.playScript([{ pose, tag, html }], {
      onFinish: () => {},
    });

    if (autoHideMs > 0) {
      this.autoHideTimer = setTimeout(() => {
        if (this.isOpen && !this.isMinimized) {
          this.close();
        }
      }, autoHideMs);
    }
  }

  /**
   * Minimiza el HUD a un avatar en la esquina inferior derecha
   */
  minimize() {
    if (!this.hudEl) return;
    this.isMinimized = true;
    this.hudEl.classList.add('is-minimized');
  }

  /**
   * Restaura el diálogo desde el avatar minimizado
   */
  restore() {
    if (!this.hudEl) return;
    this.isMinimized = false;
    this.hudEl.classList.remove('is-minimized');
  }

  /**
   * Cierra el diálogo y llama al callback de finalización
   */
  close() {
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
      this.autoHideTimer = null;
    }
    if (this.typewriterTimer) {
      clearTimeout(this.typewriterTimer);
      this.typewriterTimer = null;
    }
    this.isTyping = false;
    this.isOpen = false;
    this.isMinimized = false;

    if (this.hudEl) {
      this.hudEl.classList.remove('is-visible', 'is-minimized');
      this.hudEl.setAttribute('aria-hidden', 'true');
    }

    const cb = this.onFinishCallback;
    this.onFinishCallback = null;
    if (typeof cb === 'function') {
      try {
        cb();
      } catch (_) {}
    }
  }
}

// Instancia singleton
export const vn = new VisualNovelController();

export function createVN() {
  return vn;
}

export function playScript(lines, options) {
  return vn.playScript(lines, options);
}

export function react(options) {
  return vn.react(options);
}

export default vn;
