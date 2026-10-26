/**
 * nav.js — Barra de navegación global y gestor de pestañas accesible.
 */
import { h, mount, qsa, on } from './dom.js';

export const PAGES = [
  { id: 'inicio', href: 'index.html', label: 'Inicio' },
  { id: 'desigualdades', href: 'desigualdades.html', label: 'Desigualdades' },
  { id: 'unidades', href: 'unidades.html', label: 'Unidades' },
  { id: 'funciones', href: 'funciones.html', label: 'Funciones' },
];

/**
 * Renderiza la barra superior dentro de <header data-site-nav="idActual">.
 */
export function renderNav(root = document.querySelector('[data-site-nav]')) {
  if (!root) return;
  const current = root.dataset.siteNav;
  root.classList.add('site-nav');
  mount(
    root,
    h('nav', { class: 'site-nav__inner', 'aria-label': 'Laboratorios' },
      h('a', { class: 'site-nav__brand', href: 'index.html' }, 'Laboratorio de Matemática'),
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
  const tablist = root.querySelector('[role="tablist"]');
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
