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

/**
 * Renderiza la barra superior dentro de <header data-site-nav="idActual">
 * con el brand de leyes fundamentales/símbolos y navegación accesible.
 */
export function renderNav(root = document.querySelector('[data-site-nav]')) {
  if (!root) return;
  const current = root.dataset.siteNav;
  root.classList.add('site-nav');

  // Determinista por página para respetar la regla sin Math.random()
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
