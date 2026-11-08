/**
 * nav.js — Barra de navegación global y gestor de pestañas accesible.
 */
import { h, s, mount, qsa, on, chalkIcon } from './dom.js';
import { isSoundEnabled, toggleSound, playClick, initGlobalSoundUI } from './sound.js';
import { initScratchpad } from './scratchpad.js';

export const PAGES = [
  { id: 'inicio', href: 'index.html', label: 'Inicio' },
  { id: 'desigualdades', href: 'desigualdades.html', label: 'Desigualdades' },
  { id: 'unidades', href: 'unidades.html', label: 'Unidades' },
  { id: 'potencias-raices', href: 'potencias-raices.html', label: 'Potencias y Raíces' },
  { id: 'funciones', href: 'funciones.html', label: 'Funciones' },
  { id: 'valor-absoluto', href: 'valor-absoluto.html', label: 'Valor Absoluto' },
  { id: 'sucesiones', href: 'sucesiones.html', label: 'Sucesiones' },
  { id: 'cuadraticas', href: 'cuadraticas.html', label: 'Función Cuadrática' },
  { id: 'exponenciales', href: 'exponenciales.html', label: 'Funciones Exponenciales' },
];

export const CURRICULUM_UNITS = [
  {
    number: 1,
    title: 'Números reales',
    status: 'active',
    subtitle: 'Conjuntos en ℝ, potencias, radicales, intervalos, módulo y unidades',
    items: [
      { id: 'potencias-raices', href: 'potencias-raices.html', label: 'Potencias y Raíces', detail: 'Dos mundos (+0 vs ×1), exponentes, radicales y dominio en ℝ' },
      { id: 'valor-absoluto-1d', href: 'valor-absoluto.html#sec-1', pageId: 'valor-absoluto', label: 'Valor Absoluto y Distancia', detail: 'Distancia en la recta real, propiedades y despeje con barras' },
      { id: 'desigualdades', href: 'desigualdades.html', label: 'Inecuaciones e Intervalos', detail: 'Compuertas lógicas AND (∩) / OR (∪) y notación de intervalos' },
      { id: 'unidades', href: 'unidades.html', label: 'Análisis Dimensional', detail: 'Conversión de unidades mediante el neutro multiplicativo 1' },
    ],
  },
  {
    number: 2,
    title: 'Funciones',
    status: 'active',
    subtitle: 'Unicidad, dominio, imagen, positividad, partes y sucesiones',
    items: [
      { id: 'funciones', href: 'funciones.html', label: 'Introducción a Funciones', detail: 'Escáner de unicidad, Dom/Im, C₀/C⁺/C⁻, monotonía, secante e inversa' },
      { id: 'valor-absoluto', href: 'valor-absoluto.html', label: 'Valor Absoluto y Partes', detail: 'Transformaciones a|x − h| + k, funciones por tramos y escalonadas' },
      { id: 'sucesiones', href: 'sucesiones.html', label: 'Sucesiones (Dominio en ℕ)', detail: 'Fórmulas recursivas y explícitas como funciones discretas' },
    ],
  },
  {
    number: 3,
    title: 'Función lineal',
    status: 'soon',
    subtitle: 'Pendiente m = tg(α), ordenada al origen, formas de la recta, paralelismo y perpendicularidad',
    concepts: ['Pendiente y ángulo', 'Ordenada al origen', 'Paralelismo y perpendicularidad'],
    items: [],
  },
  {
    number: 4,
    title: 'Sistemas de ecuaciones',
    status: 'soon',
    subtitle: 'Sistemas lineales 2×2, clasificación geométrica (SCD, SCI, SI) y problemas de modelado',
    concepts: ['Sistemas lineales 2×2', 'Clasificación geométrica', 'Problemas de modelado'],
    items: [],
  },
  {
    number: 5,
    title: 'Función cuadrática',
    status: 'active',
    subtitle: 'Parábola, formas polinómica, canónica y factorizada, vértice, simetría y discriminante Δ',
    concepts: ['Parábola y vértice', 'Formas de la cuadrática', 'Simetría y discriminante Δ'],
    items: [
      {
        id: 'cuadraticas',
        href: 'cuadraticas.html',
        label: 'Laboratorio de Función Cuadrática',
        detail: 'Modelo de área, factorización, las 3 formas de la parábola, completar el cuadrado, radar Δ, tangencia y optimización',
      },
    ],
  },
  {
    number: 6,
    title: 'Polinomios',
    status: 'soon',
    subtitle: 'Grado, operaciones, algoritmo de división, Regla de Ruffini, Teorema del Resto y Gauss',
    concepts: ['Grado y operaciones', 'División y Ruffini', 'Teorema del Resto y Gauss'],
    items: [],
  },
  {
    number: 7,
    title: 'Función racional e irracional',
    status: 'soon',
    subtitle: 'Expresiones algebraicas racionales, dominio de validez, asíntotas, agujeros y radicales',
    concepts: ['Expresiones racionales', 'Dominio y asíntotas', 'Agujeros y radicales'],
    items: [],
  },
  {
    number: 8,
    title: 'Función exponencial',
    status: 'active',
    subtitle: 'Crecimiento y decaimiento f(x) = k·aˣ, base natural e, asíntotas horizontales y ecuaciones',
    concepts: ['Crecimiento y decaimiento', 'Base natural e', 'Asíntota horizontal'],
    items: [
      { id: 'exponenciales', href: 'exponenciales.html', label: 'Laboratorio de Exponenciales', detail: 'Modelos k·aˣ, base e, asíntotas horizontales, radiografía completa y ecuaciones sin logaritmos' },
    ],
  },
  {
    number: 9,
    title: 'Función logarítmica',
    status: 'soon',
    subtitle: 'Definición logₐ(x), propiedades operativas, cambio de base e inversa de la exponencial',
    concepts: ['Definición y propiedades', 'Cambio de base', 'Inversa de la exponencial'],
    items: [],
  },
];

/**
 * Colección curada de leyes fundamentales de la física, teoremas de la matemática
 * y conjuntos de operadores simbólicos para el brand dinámico del nav.
 */
export const FUNDAMENTAL_LAWS = [
  {
    icon: '∇',
    formula: '∇ × E = −∂B/∂t',
    html: '∇ × E = −∂B/∂t',
    ariaLabel: 'Rotacional de E igual a menos derivada temporal de B',
    name: 'Faraday-Lenz',
    field: 'Electromagnetismo',
    desc: 'Un campo magnético variable induce un campo eléctrico rotacional.',
  },
  {
    icon: '∇',
    formula: '∇ · B = 0',
    html: '∇ · B = 0',
    ariaLabel: 'Divergencia de B igual a cero',
    name: 'Gauss magnética',
    field: 'Electromagnetismo',
    desc: 'Ausencia de monopolos magnéticos: las líneas de B siempre se cierran.',
  },
  {
    icon: 'ψ',
    formula: 'iℏ ∂ψ/∂t = Ĥψ',
    html: 'iℏ ∂ψ/∂t = Ĥψ',
    ariaLabel: 'Ecuación de Schrödinger para la evolución cuántica',
    name: 'Schrödinger',
    field: 'Mecánica Cuántica',
    desc: 'Evolución temporal del estado cuántico fundamental.',
  },
  {
    icon: 'c',
    formula: 'E = mc²',
    html: 'E = mc<sup>2</sup>',
    ariaLabel: 'E igual a m por c al cuadrado',
    name: 'Einstein',
    field: 'Relatividad Especial',
    desc: 'Equivalencia fundamental entre masa en reposo y energía.',
  },
  {
    icon: 'G',
    formula: 'G_μν + Λg_μν = κT_μν',
    html: 'G<sub>μν</sub> + Λg<sub>μν</sub> = κT<sub>μν</sub>',
    ariaLabel: 'Ecuaciones de campo de Einstein de la Relatividad General',
    name: 'Relatividad General',
    field: 'Gravitación',
    desc: 'La masa-energía curva el espacio-tiempo y la geometría guía la materia.',
  },
  {
    icon: 'S',
    formula: 'S = k_B ln Ω',
    html: 'S = k<sub>B</sub> <span class="op-name">ln</span> Ω',
    ariaLabel: 'S igual a constante de Boltzmann por logaritmo de microestados',
    name: 'Boltzmann',
    field: 'Termodinámica Estadística',
    desc: 'La entropía macroscópica cuenta el número de microestados accesibles.',
  },
  {
    icon: 'Δ',
    formula: 'Δx · Δp ≥ ℏ/2',
    html: 'Δx · Δp ≥ ℏ/2',
    ariaLabel: 'Principio de incertidumbre de Heisenberg',
    name: 'Heisenberg',
    field: 'Física Cuántica',
    desc: 'Límite intrínseco de precisión simultánea en posición y momento.',
  },
  {
    icon: 'F',
    formula: 'F = G (m₁m₂)/r²',
    html: 'F = G (m<sub>1</sub>m<sub>2</sub>)/r<sup>2</sup>',
    ariaLabel: 'Ley de Gravitación Universal de Newton',
    name: 'Gravitación Universal',
    field: 'Mecánica Clásica',
    desc: 'Atracción mutua inversamente proporcional al cuadrado de la distancia.',
  },
  {
    icon: 'ℒ',
    formula: 'ℒ = T − V',
    html: 'ℒ = T − V',
    ariaLabel: 'Lagrangiano igual a energía cinética menos potencial',
    name: 'Lagrangiano',
    field: 'Mecánica Analítica',
    desc: 'Principio de Hamilton: la trayectoria real estaciona la acción δS = 0.',
  },
  {
    icon: 'U',
    formula: 'dU = T dS − P dV',
    html: 'dU = T dS − P dV',
    ariaLabel: 'Primera ley de la termodinámica',
    name: '1ª Ley Termodinámica',
    field: 'Termodinámica',
    desc: 'Conservación de la energía expresada en calor y trabajo mecánico.',
  },
  {
    icon: '∮',
    formula: '∮ B · dℓ = μ₀ I_enc',
    html: '∮ B · dℓ = μ<sub>0</sub> I<sub>enc</sub>',
    ariaLabel: 'Ley de Ampère-Maxwell de circulación magnética',
    name: 'Ampère-Maxwell',
    field: 'Electromagnetismo',
    desc: 'Las corrientes y flujos eléctricos variables generan circulación magnética.',
  },
  {
    icon: 'c',
    formula: 'c = 1 / √(μ₀ ε₀)',
    html: 'c = 1 / √(μ<sub>0</sub> ε<sub>0</sub>)',
    ariaLabel: 'Velocidad de la luz en función de permitividad y permeabilidad',
    name: 'Velocidad de la Luz',
    field: 'Electromagnetismo',
    desc: 'La velocidad de la luz emana de las constantes fundamentales del vacío.',
  },
  {
    icon: 'λ',
    formula: 'λ = h / p',
    html: 'λ = h / p',
    ariaLabel: 'Longitud de onda de De Broglie',
    name: 'De Broglie',
    field: 'Física Cuántica',
    desc: 'Dualidad onda-corpúsculo: toda materia con momento exhibe longitud de onda.',
  },
  {
    icon: 'e',
    formula: 'e^(iπ) + 1 = 0',
    html: 'e<sup>iπ</sup> + 1 = 0',
    ariaLabel: 'Identidad de Euler: e elevado a i pi más 1 igual a 0',
    name: 'Identidad de Euler',
    field: 'Análisis Complejo',
    desc: 'La fórmula más célebre: conecta e, i, π, 1 y 0 en una única relación.',
  },
  {
    icon: '∫',
    formula: '∫_−∞^∞ e^(−x²) dx = √π',
    html: '∫<sub>−∞</sub><sup>∞</sup> e<sup>−x²</sup> dx = √π',
    ariaLabel: 'Integral gaussiana de menos infinito a infinito',
    name: 'Integral Gaussiana',
    field: 'Cálculo y Probabilidad',
    desc: 'Área bajo la curva campana normal que fundamenta la estadística moderna.',
  },
  {
    icon: '∮',
    formula: '∮_∂Σ ω = ∫_Σ dω',
    html: '∮<sub>∂Σ</sub> ω = ∫<sub>Σ</sub> dω',
    ariaLabel: 'Teorema de Stokes para formas diferenciales',
    name: 'Teorema de Stokes',
    field: 'Geometría Diferencial',
    desc: 'Unifica el Teorema Fundamental del Cálculo, Green, Gauss y Stokes.',
  },
  {
    icon: '∑',
    formula: '∑_(n=1)^∞ 1/n² = π²/6',
    html: '∑<sub>n=1</sub><sup>∞</sup> 1/n<sup>2</sup> = π<sup>2</sup>/6',
    ariaLabel: 'Problema de Basilea: suma de inversos de cuadrados converge a pi cuadrado sobre seis',
    name: 'Problema de Basilea',
    field: 'Series de Euler',
    desc: 'La suma infinita de los inversos de los cuadrados converge a π²/6.',
  },
  {
    icon: 'f\'',
    formula: 'f\'(x) = lim_(h→0) Δf/h',
    html: 'f\'(x) = <span class="op-name">lim</span><sub>h→0</sub> Δf/h',
    ariaLabel: 'Derivada instantánea como límite del cociente incremental',
    name: 'Derivada Instantánea',
    field: 'Cálculo Diferencial',
    desc: 'Razón de cambio instantánea como límite del cociente incremental.',
  },
  {
    icon: 'ℵ',
    formula: 'ℵ₀ < 2^(ℵ₀) = c',
    html: 'ℵ<sub>0</sub> &lt; 2<sup>ℵ₀</sup> = c',
    ariaLabel: 'Teorema de Cantor: álef cero menor que potencia del continuo',
    name: 'Teorema de Cantor',
    field: 'Teoría de Conjuntos',
    desc: 'El infinito del continuo real es estrictamente mayor que el numerable.',
  },
  {
    icon: '⟨·⟩',
    formula: '⟨ ∇ · ∂ · ∫ · ∮ · ∑ · ∏ · ℏ ⟩',
    html: '⟨ ∇ · ∂ · ∫ · ∮ · ∑ · ∏ · ℏ ⟩',
    ariaLabel: 'Operadores matemáticos fundamentales',
    name: 'Operadores Matemáticos',
    field: 'Simbología Universal',
    desc: 'Conjunto de operadores diferenciales, integrales y cuánticos.',
  },
  {
    icon: '{ }',
    formula: '{ ∀, ∃, ∈, ⊂, ∪, ∩, ∅, ⟺ }',
    html: '{ ∀, ∃, ∈, ⊂, ∪, ∩, ∅, ⟺ }',
    ariaLabel: 'Símbolos de lógica y teoría de conjuntos',
    name: 'Lógica y Conjuntos',
    field: 'Fundamentos',
    desc: 'El alfabeto axiomatizado del razonamiento matemático exacto.',
  },
  {
    icon: 'ℝ',
    formula: 'ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ ⊂ ℂ',
    html: '<span class=\"math-sets\">ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ ⊂ ℂ</span>',
    ariaLabel: 'Torre de conjuntos numéricos: Naturales, Enteros, Racionales, Reales y Complejos',
    name: 'Torre de Cuerpos',
    field: 'Álgebra',
    desc: 'De los números naturales al cuerpo algebraicamente cerrado de los complejos.',
  },
];

/** Contenido del botón de sonido: únicamente el ícono SVG (18×18), sin texto. */
function createSoundBtnContent(enabled) {
  return [
    chalkIcon(enabled ? 'volume' : 'mute', {
      width: 18,
      height: 18,
      class: 'site-nav__sound-icon',
    }),
  ];
}

function updateSoundBtn(btn, enabled) {
  btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
  btn.setAttribute('aria-label', 'Activar o silenciar sonido');
  btn.title = enabled ? 'Silenciar sonidos' : 'Activar sonidos';
  btn.replaceChildren(...createSoundBtnContent(enabled));
}

function resolveCurrentUnit(current) {
  if (current === 'valor-absoluto' && location.hash === '#sec-1') {
    return { unit: 1, itemId: 'valor-absoluto-1d' };
  }
  if (['potencias-raices', 'valor-absoluto-1d', 'desigualdades', 'unidades'].includes(current)) {
    const itemId = current === 'valor-absoluto-1d' ? current : current;
    return { unit: 1, itemId };
  }
  if (['funciones', 'valor-absoluto', 'sucesiones'].includes(current)) {
    return { unit: 2, itemId: current };
  }
  if (current === 'exponenciales') {
    return { unit: 8, itemId: 'exponenciales' };
  }
  return { unit: null, itemId: null };
}

function makeCurriculumCard(unit, { activeItemId = null } = {}) {
  const active = unit.status === 'active';
  const links = active
    ? h(
        'ul',
        { class: 'curriculum-card__links' },
        unit.items.map((item) => {
          const selected = item.id === activeItemId;
          return h(
            'li',
            null,
            h(
              'a',
              {
                class: `curriculum-card__link${selected ? ' is-active' : ''}`,
                href: item.href,
                'aria-current': selected ? 'page' : null,
              },
              h(
                'span',
                { class: 'curriculum-card__link-heading' },
                h('strong', null, item.label),
                selected ? h('span', { class: 'curriculum-card__here' }, '← Estás acá') : null,
              ),
              h('span', { class: 'curriculum-card__detail' }, item.detail),
            ),
          );
        }),
      )
    : h(
        'ul',
        { class: 'curriculum-card__concepts' },
        (unit.concepts || []).map((concept) => h('li', null, concept)),
      );

  return h(
    'article',
    { class: `curriculum-card${active ? '' : ' curriculum-card--soon'}` },
    h(
      'div',
      { class: 'curriculum-card__eyebrow' },
      h('span', { class: 'curriculum-card__number' }, `UNIDAD ${String(unit.number).padStart(2, '0')}`),
      h(
        'span',
        { class: `curriculum-card__status${active ? ' is-available' : ' is-soon'}` },
        active ? 'Disponible' : 'Próximamente',
      ),
    ),
    h('h3', { class: 'curriculum-card__title' }, unit.title),
    h('p', { class: 'curriculum-card__subtitle' }, unit.subtitle),
    links,
  );
}

export function renderNav(root = document.querySelector('[data-site-nav]')) {
  if (!root) return;
  const current = root.dataset.siteNav || PAGES.find((page) => location.pathname.endsWith(page.href))?.id;
  const currentContext = resolveCurrentUnit(current);
  const currentUnit = CURRICULUM_UNITS.find((unit) => unit.number === currentContext.unit);
  root.classList.add('site-nav');
  root._navAbortController?.abort();
  root._navBackdrop?.remove();
  root._navAbortController = new AbortController();
  const { signal } = root._navAbortController;

  // Determinista por página (sin Math.random()): cada página muestra una ley/fórmula fundamental.
  const pageIdx = Math.max(0, PAGES.findIndex((p) => p.id === current));
  const lawIdx = current === 'inicio' ? 21 : (pageIdx * 5 + 3) % FUNDAMENTAL_LAWS.length;
  const law = FUNDAMENTAL_LAWS[lawIdx];
  const brandLink = h('a', {
    class: 'site-nav__brand',
    href: 'index.html',
    title: `${law.name} · Ir al Inicio`,
    'aria-label': `${law.ariaLabel}. Ir al inicio.`,
  });
  brandLink.innerHTML = law.html;

  const exploreButton = h(
    'button',
    {
      type: 'button',
      class: 'site-nav__explore',
      'aria-expanded': 'false',
      'aria-controls': 'site-curriculum-drawer',
      title: currentUnit ? `U${currentUnit.number} · ${currentUnit.title}` : 'Módulos y unidades',
    },
    h('span', null, 'Módulos'),
    h('span', { class: 'site-nav__explore-caret', 'aria-hidden': 'true' }, '▾'),
  );

  // Ranura inteligente: aloja los controles del pizarrón al acoplarse (ver initLessonDock).
  const dock = h('div', { class: 'site-nav__dock', 'data-site-nav-dock': 'true' });
  const modeSlot = h('div', { class: 'site-nav__mode-slot', 'data-site-nav-mode': 'true' });

  const soundEnabled = isSoundEnabled();
  const soundBtn = h(
    'button',
    {
      type: 'button',
      class: 'chip chip--icon-only site-nav__sound site-nav__sound-btn',
      'aria-pressed': soundEnabled ? 'true' : 'false',
      'aria-label': 'Activar o silenciar sonido',
      title: soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos',
    },
    ...createSoundBtnContent(soundEnabled),
  );
  soundBtn.addEventListener('click', () => {
    const next = toggleSound();
    updateSoundBtn(soundBtn, next);
    if (next) playClick();
  });

  const drawer = h(
    'section',
    {
      id: 'site-curriculum-drawer',
      class: 'site-nav__drawer',
      'aria-label': 'Mapa curricular de las nueve unidades',
      'aria-hidden': 'true',
      inert: true,
    },
    h(
      'div',
      { class: 'site-nav__drawer-header' },
      h(
        'div',
        null,
        h('p', { class: 'site-nav__drawer-kicker' }, 'Mapa curricular · 9 unidades'),
        h('h2', null, 'Ruta de Aprendizaje · Ingreso de UNMDP Exactas'),
      ),
      h('p', { class: 'site-nav__drawer-count' }, '3 unidades con laboratorios activos · 6 unidades en construcción'),
    ),
    h(
      'div',
      { class: 'curriculum-grid' },
      CURRICULUM_UNITS.map((unit) => makeCurriculumCard(unit, {
        activeItemId: currentContext.unit === unit.number ? currentContext.itemId : null,
      })),
    ),
  );
  const backdrop = h('button', {
    type: 'button',
    class: 'site-nav__backdrop',
    'aria-label': 'Cerrar menú de módulos',
    tabindex: '-1',
  });
  const setDrawerOpen = (open, restoreFocus = false) => {
    root.classList.toggle('is-drawer-open', open);
    backdrop.classList.toggle('is-visible', open);
    exploreButton.setAttribute('aria-expanded', String(open));
    drawer.setAttribute('aria-hidden', String(!open));
    drawer.inert = !open;
    if (restoreFocus) exploreButton.focus();
  };
  exploreButton.addEventListener('click', () => {
    setDrawerOpen(exploreButton.getAttribute('aria-expanded') !== 'true');
  });
  backdrop.addEventListener('click', () => setDrawerOpen(false));
  drawer.addEventListener('click', (event) => {
    if (event.target.closest('a')) setDrawerOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && root.classList.contains('is-drawer-open')) {
      setDrawerOpen(false, true);
    }
  }, { signal });

  mount(
    root,
    h(
      'div',
      { class: 'site-nav__bar' },
      h('div', { class: 'site-nav__left' }, brandLink, exploreButton),
      dock,
      h('div', { class: 'site-nav__right' }, modeSlot, soundBtn),
    ),
    drawer,
  );
  document.body.append(backdrop);
  root._navBackdrop = backdrop;

  renderChalkSill();
  initGlobalSoundUI();
  initScratchpad();
}

/**
 * Acopla los controles de `#seq-board-toolbar` (toggle de índice, capítulo/pizarrón
 * actual y modo de vista) al `site-nav` cuando la barra natural sale por arriba del viewport.
 * Los controles acoplados delegan en los originales (`.click()`) y se sincronizan por
 * MutationObserver, de modo que el estado siempre es el de la barra del pizarrón.
 */
export function initLessonDock(root = document.querySelector('[data-site-nav]')) {
  const toolbar = document.getElementById('seq-board-toolbar');
  const dock = root?.querySelector('[data-site-nav-dock]');
  const modeSlot = root?.querySelector('[data-site-nav-mode]');
  if (!root || !toolbar || !dock || !modeSlot) return;
  root._dockCleanup?.();

  const origSidebar = toolbar.querySelector('[data-sidebar-toggle]');
  const origMode = document.getElementById('seq-mode-toggle');
  const origBadge = document.getElementById('seq-board-badge');
  const origTitle = document.getElementById('seq-board-title');
  const cleanups = [];

  const sidebarBtn = origSidebar
    ? h('button', {
        type: 'button',
        class: 'chip site-nav__dock-btn site-nav__sidebar-toggle',
        'aria-controls': origSidebar.getAttribute('aria-controls'),
        on: { click: () => origSidebar.click() },
      })
    : null;

  const pickerLabel = h('span', { class: 'site-nav__chapter-label' });
  const picker = h(
    'button',
    {
      type: 'button',
      class: 'chip site-nav__dock-btn site-nav__chapter-picker',
      'aria-haspopup': 'true',
      'aria-expanded': 'false',
      'aria-controls': 'site-chapter-popover',
    },
    pickerLabel,
    h('span', { class: 'site-nav__explore-caret', 'aria-hidden': 'true' }, '▾'),
  );
  const popover = h('div', {
    id: 'site-chapter-popover',
    class: 'site-nav__chapter-popover',
    role: 'menu',
    'aria-label': 'Secciones del módulo',
    hidden: true,
  });

  const modeBtn = origMode
    ? h('button', {
        type: 'button',
        class: 'chip site-nav__dock-btn site-nav__mode',
        on: { click: () => origMode.click() },
      })
    : null;

  const setPopover = (open) => {
    popover.hidden = !open;
    picker.setAttribute('aria-expanded', String(open));
  };
  const buildPopover = () => {
    const links = [...document.querySelectorAll('.seq-sidebar__link[data-sec]')];
    popover.replaceChildren(
      ...links.map((link) =>
        h(
          'button',
          {
            type: 'button',
            role: 'menuitem',
            class: `site-nav__chapter-item${link.classList.contains('is-active') ? ' is-active' : ''}`,
            'aria-current': link.classList.contains('is-active') ? 'true' : null,
            on: {
              click: () => {
                link.click();
                setPopover(false);
              },
            },
          },
          link.textContent.trim().replace(/\s+/g, ' '),
        ),
      ),
    );
  };
  picker.addEventListener('click', () => {
    if (popover.hidden) buildPopover();
    setPopover(popover.hidden);
  });
  const onDocClick = (event) => {
    if (!popover.hidden && !event.target.closest?.('.site-nav__chapter-picker, .site-nav__chapter-popover')) {
      setPopover(false);
    }
  };
  const onKey = (event) => {
    if (event.key === 'Escape' && !popover.hidden) {
      setPopover(false);
      picker.focus();
    }
  };
  document.addEventListener('click', onDocClick);
  document.addEventListener('keydown', onKey);
  cleanups.push(() => {
    document.removeEventListener('click', onDocClick);
    document.removeEventListener('keydown', onKey);
  });

  const sync = () => {
    if (sidebarBtn && origSidebar) {
      sidebarBtn.textContent = origSidebar.textContent.replace('Ocultar índice', 'Índice').trim();
      const expanded = origSidebar.getAttribute('aria-expanded');
      if (expanded !== null) sidebarBtn.setAttribute('aria-expanded', expanded);
    }
    const badge = origBadge?.textContent.trim() || '';
    const title = origTitle?.textContent.trim() || '';
    pickerLabel.textContent = title;
    picker.title = [badge, title].filter(Boolean).join(' — ') || 'Ir a otra sección';
    picker.setAttribute('aria-label', `Capítulo actual: ${title}. Elegir otra sección`);
    if (modeBtn && origMode) {
      const continuous = /continua/i.test(origMode.textContent);
      modeBtn.textContent = continuous ? 'Continua' : 'Pizarrón';
      modeBtn.classList.toggle('chip--ghost', origMode.classList.contains('chip--ghost'));
      modeBtn.title = origMode.title || 'Alternar modo de vista';
    }
  };
  sync();
  if (typeof MutationObserver !== 'undefined') {
    const mo = new MutationObserver(sync);
    [origSidebar, origMode, origBadge, origTitle].filter(Boolean).forEach((el) =>
      mo.observe(el, { childList: true, characterData: true, subtree: true, attributes: true }),
    );
    cleanups.push(() => mo.disconnect());
  }

  dock.replaceChildren(...[sidebarBtn, picker, popover].filter(Boolean));
  modeSlot.replaceChildren(...[modeBtn].filter(Boolean));

  const setDocked = (docked) => {
    root.classList.toggle('is-lesson-docked', docked);
    if (!docked) setPopover(false);
  };
  if (typeof IntersectionObserver !== 'undefined') {
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        setDocked(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0, rootMargin: '-56px 0px 0px 0px' },
    );
    io.observe(toolbar);
    cleanups.push(() => io.disconnect());
  }
  root._dockCleanup = () => {
    cleanups.forEach((fn) => fn());
    root.classList.remove('is-lesson-docked');
  };
}

/** Renderiza la repisa inferior de pizarra con un trozo de tiza SVG (solo visible >= 820px). */
export function renderChalkSill() {
  if (document.querySelector('.chalk-sill')) return;
  const sill = h('footer', { class: 'chalk-sill', 'aria-hidden': 'true' },
    h('div', { class: 'chalk-sill__rail' },
      s('svg', { class: 'chalk-sill__chalk', viewBox: '0 0 32 9', width: '32', height: '9', 'aria-hidden': 'true' },
        s('path', { d: 'M2 7 L30 5 L31 8 L2 9 Z', fill: '#ece8dc', opacity: '0.95' })
      )
    )
  );
  document.body.appendChild(sill);
}

/**
 * Pestañas accesibles (patrón WAI-ARIA Tabs).
 * Espera: [role=tablist] > [role=tab][aria-controls] y paneles [role=tabpanel].
 * Sincroniza con location.hash (#id-del-panel) para enlaces directos.
 */
export function initTabs(root, { onChange } = {}) {
  const tablist = root?.matches?.('[role="tablist"]') ? root : (root?.querySelector('[role="tablist"]') || root);
  const tabs = qsa('[role="tab"]', tablist);
  const panelOf = (tab) => document.getElementById(tab.getAttribute('aria-controls'));

  function select(tab, { focus = false, updateHash = true } = {}) {
    tabs.forEach((t) => {
      const active = t === tab;
      t.setAttribute('aria-selected', active ? 'true' : 'false');
      t.tabIndex = active ? 0 : -1;
      panelOf(t).hidden = !active;
    });
    if (tab && typeof tab.scrollIntoView === 'function') {
      tab.scrollIntoView({ inline: 'center', block: 'nearest' });
    }
    if (focus) tab.focus();
    const id = tab.getAttribute('aria-controls');
    if (updateHash && location.hash !== `#${id}`) history.replaceState(null, '', `#${id}`);
    onChange?.(id);
  }

  on(tablist, 'click', '[role="tab"]', (_e, tab) => select(tab));
  on(tablist, 'keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    let next = null;
    if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
    else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
    else if (e.key === 'Home') next = tabs[0];
    else if (e.key === 'End') next = tabs[tabs.length - 1];
    if (next) {
      e.preventDefault();
      select(next, { focus: true });
    }
  });

  const fromHash = tabs.find((t) => `#${t.getAttribute('aria-controls')}` === location.hash);
  select(fromHash || tabs[0], { updateHash: false });
  return { select: (id) => select(tabs.find((t) => t.getAttribute('aria-controls') === id)) };
}
