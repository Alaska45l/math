/**
 * nav.js — Barra de navegación global y gestor de pestañas accesible.
 */
import { h, mount, qsa, on } from './dom.js';

export const PAGES = [
  { id: 'inicio', href: 'index.html', label: 'Inicio' },
  { id: 'desigualdades', href: 'desigualdades.html', label: 'Desigualdades' },
  { id: 'unidades', href: 'unidades.html', label: 'Unidades' },
  { id: 'funciones', href: 'funciones.html', label: 'Funciones' },
  { id: 'sucesiones', href: 'sucesiones.html', label: 'Sucesiones' },
];

/**
 * Colección curada de leyes fundamentales de la física, teoremas de la matemática
 * y conjuntos de operadores simbólicos para el brand dinámico del nav.
 */
export const FUNDAMENTAL_LAWS = [
  {
    icon: '∇',
    formula: '∇ × E = −∂B/∂t',
    name: 'Faraday-Lenz',
    field: 'Electromagnetismo',
    desc: 'Un campo magnético variable induce un campo eléctrico rotacional.',
  },
  {
    icon: '∇',
    formula: '∇ · B = 0',
    name: 'Gauss magnética',
    field: 'Electromagnetismo',
    desc: 'Ausencia de monopolos magnéticos: las líneas de B siempre se cierran.',
  },
  {
    icon: 'ψ',
    formula: 'iℏ ∂ψ/∂t = Ĥψ',
    name: 'Schrödinger',
    field: 'Mecánica Cuántica',
    desc: 'Evolución temporal del estado cuántico fundamental.',
  },
  {
    icon: 'c',
    formula: 'E = mc²',
    name: 'Einstein',
    field: 'Relatividad Especial',
    desc: 'Equivalencia fundamental entre masa en reposo y energía.',
  },
  {
    icon: 'G',
    formula: 'G_μν + Λg_μν = κT_μν',
    name: 'Relatividad General',
    field: 'Gravitación',
    desc: 'La masa-energía curva el espacio-tiempo y la geometría guía la materia.',
  },
  {
    icon: 'S',
    formula: 'S = k_B ln Ω',
    name: 'Boltzmann',
    field: 'Termodinámica Estadística',
    desc: 'La entropía macroscópica cuenta el número de microestados accesibles.',
  },
  {
    icon: 'Δ',
    formula: 'Δx · Δp ≥ ℏ/2',
    name: 'Heisenberg',
    field: 'Física Cuántica',
    desc: 'Límite intrínseco de precisión simultánea en posición y momento.',
  },
  {
    icon: 'F',
    formula: 'F = G (m₁m₂)/r²',
    name: 'Gravitación Universal',
    field: 'Mecánica Clásica',
    desc: 'Atracción mutua inversamente proporcional al cuadrado de la distancia.',
  },
  {
    icon: 'ℒ',
    formula: 'ℒ = T − V',
    name: 'Lagrangiano',
    field: 'Mecánica Analítica',
    desc: 'Principio de Hamilton: la trayectoria real estaciona la acción δS = 0.',
  },
  {
    icon: 'U',
    formula: 'dU = T dS − P dV',
    name: '1ª Ley Termodinámica',
    field: 'Termodinámica',
    desc: 'Conservación de la energía expresada en calor y trabajo mecánico.',
  },
  {
    icon: '∮',
    formula: '∮ B · dℓ = μ₀ I_enc',
    name: 'Ampère-Maxwell',
    field: 'Electromagnetismo',
    desc: 'Las corrientes y flujos eléctricos variables generan circulación magnética.',
  },
  {
    icon: 'c',
    formula: 'c = 1 / √(μ₀ ε₀)',
    name: 'Velocidad de la Luz',
    field: 'Electromagnetismo',
    desc: 'La velocidad de la luz emana de las constantes fundamentales del vacío.',
  },
  {
    icon: 'λ',
    formula: 'λ = h / p',
    name: 'De Broglie',
    field: 'Física Cuántica',
    desc: 'Dualidad onda-corpúsculo: toda materia con momento exhibe longitud de onda.',
  },
  {
    icon: 'e',
    formula: 'e^(iπ) + 1 = 0',
    name: 'Identidad de Euler',
    field: 'Análisis Complejo',
    desc: 'La fórmula más célebre: conecta e, i, π, 1 y 0 en una única relación.',
  },
  {
    icon: '∫',
    formula: '∫_−∞^∞ e^(−x²) dx = √π',
    name: 'Integral Gaussiana',
    field: 'Cálculo y Probabilidad',
    desc: 'Área bajo la curva campana normal que fundamenta la estadística moderna.',
  },
  {
    icon: '∮',
    formula: '∮_∂Σ ω = ∫_Σ dω',
    name: 'Teorema de Stokes',
    field: 'Geometría Diferencial',
    desc: 'Unifica el Teorema Fundamental del Cálculo, Green, Gauss y Stokes.',
  },
  {
    icon: '∑',
    formula: '∑_(n=1)^∞ 1/n² = π²/6',
    name: 'Problema de Basilea',
    field: 'Series de Euler',
    desc: 'La suma infinita de los inversos de los cuadrados converge a π²/6.',
  },
  {
    icon: 'f\'',
    formula: 'f\'(x) = lim_(h→0) Δf/h',
    name: 'Derivada Instantánea',
    field: 'Cálculo Diferencial',
    desc: 'Razón de cambio instantánea como límite del cociente incremental.',
  },
  {
    icon: 'ℵ',
    formula: 'ℵ₀ < 2^(ℵ₀) = c',
    name: 'Teorema de Cantor',
    field: 'Teoría de Conjuntos',
    desc: 'El infinito del continuo real es estrictamente mayor que el numerable.',
  },
  {
    icon: '⟨·⟩',
    formula: '⟨ ∇ · ∂ · ∫ · ∮ · ∑ · ∏ · ℏ ⟩',
    name: 'Operadores Matemáticos',
    field: 'Simbología Universal',
    desc: 'Conjunto de operadores diferenciales, integrales y cuánticos.',
  },
  {
    icon: '{ }',
    formula: '{ ∀, ∃, ∈, ⊂, ∪, ∩, ∅, ⟺ }',
    name: 'Lógica y Conjuntos',
    field: 'Fundamentos',
    desc: 'El alfabeto axiomatizado del razonamiento matemático exacto.',
  },
  {
    icon: 'ℝ',
    formula: 'ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ ⊂ ℂ',
    name: 'Torre de Cuerpos',
    field: 'Álgebra',
    desc: 'De los números naturales al cuerpo algebraicamente cerrado de los complejos.',
  },
];

let currentLawIdx = Math.floor(Math.random() * FUNDAMENTAL_LAWS.length);

/**
 * Renderiza la barra superior dentro de <header data-site-nav="idActual">
 * con el brand de leyes fundamentales/símbolos aleatorios y botón de barajar (shuffle).
 */
export function renderNav(root = document.querySelector('[data-site-nav]')) {
  if (!root) return;
  const current = root.dataset.siteNav;
  root.classList.add('site-nav');

  const law = FUNDAMENTAL_LAWS[currentLawIdx];

  const brandLink = h('a', {
    class: 'site-nav__brand',
    href: 'index.html',
    title: `${law.name} · Ir al Inicio`,
    'aria-label': `${law.formula}. Ir al inicio.`,
  }, law.formula);

  mount(
    root,
    h('nav', { class: 'site-nav__inner', 'aria-label': 'Laboratorios' },
      brandLink,
      h('ul', { class: 'site-nav__list' },
        PAGES.map((p) => h('li', null,
          h('a', {
            class: 'site-nav__link',
            href: p.href,
            'aria-current': p.id === current ? 'page' : null,
          }, p.label),
        )),
      ),
    ),
  );
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
