/**
 * @file js/core/learning/dashboard.js
 * Shared Competency Dashboard & Error Atlas component across all Alaska Math Lab units.
 * Pure Vanilla ES2022. Zero external dependencies. Zero eval. Zero emojis.
 */

import { h, chalkIcon } from '../dom.js';
import { fmt } from '../math-format.js';
import { STATUS_BADGES } from './progress-store.js';

const TONE_TO_CLASS = Object.freeze({
  success: 'badge--success',
  warning: 'badge--warning',
  info: 'badge--info',
  attention: 'badge--attention',
  danger: 'badge--danger',
  muted: 'badge--neutral',
});

/**
 * Mounts a live competency dashboard with 3 KPI cards, competency cards covering all 7 mastery
 * states, diagnostic error alerts, and navigation/practice actions.
 *
 * @param {object} options
 * @param {HTMLElement} options.container
 * @param {string} options.moduleId
 * @param {Array<object>} options.competencies
 * @param {object} [options.diagnosticTaxonomy={}]
 * @param {function} options.getReport
 * @param {function|null} [options.onNavigateSection=null]
 * @param {function|null} [options.onPracticeFamily=null]
 * @param {string} [options.classPrefix='learning-dashboard']
 * @param {string[]} [options.extraClassPrefixes=[]]
 * @param {string} [options.title='Mapa de Competencias y Atlas de Errores']
 * @param {string} [options.subtitle]
 * @param {function} [options.sectionLabelFn]
 * @param {function} [options.emptyErrorLabel]
 * @param {function} [options.formatNumber]
 * @returns {{ update: () => void, destroy: () => void }|null}
 */
export function mountCompetencyDashboard({
  container,
  moduleId,
  competencies = [],
  diagnosticTaxonomy = {},
  getReport,
  onNavigateSection = null,
  onPracticeFamily = null,
  classPrefix = 'learning-dashboard',
  extraClassPrefixes = [],
  title = 'Mapa de Competencias y Atlas de Errores',
  subtitle = 'El dominio se consolida únicamente al resolver ejercicios sin pistas ni solución revelada.',
  sectionLabelFn = (comp) => `Ir al Pizarrón ${String(comp.sectionId || '').replace('sec-', '') || comp.order}`,
  emptyErrorLabel = (errId) => errId,
  formatNumber = (n) => fmt(n),
} = {}) {
  if (!container) return null;

  const prefixes = Array.from(new Set(['learning-dashboard', classPrefix, ...extraClassPrefixes].filter(Boolean)));
  const cx = (suffix) => prefixes.map((p) => `${p}${suffix}`).join(' ');

  let destroyed = false;

  const render = () => {
    if (destroyed) return;
    const rawReport = typeof getReport === 'function' ? getReport() : null;
    const rawList = Array.isArray(rawReport?.list)
      ? rawReport.list
      : Array.isArray(rawReport?.competencies)
        ? rawReport.competencies
        : [];

    const items = competencies.map((comp) => {
      const found = rawList.find((c) => (c.id || c.competencyId || c.competency?.id) === comp.id) || {};
      const status = found.status || 'unseen';
      const diagnostics = Array.isArray(found.diagnostics)
        ? found.diagnostics
        : (Array.isArray(found.recentDiagnosticIds) ? found.recentDiagnosticIds : []);
      return {
        comp,
        status,
        diagnostics,
        attempts: found.attempts || 0,
        independentCount: found.independentCount || 0,
        assistedCount: found.assistedCount || 0,
        errorCount: found.errorCount || 0,
      };
    });

    const counts = {
      durable: 0,
      consolidating: 0,
      developing: 0,
      introduced: 0,
      unseen: 0,
      needs_repair: 0,
      review_due: 0,
    };
    items.forEach((it) => {
      if (counts[it.status] !== undefined) counts[it.status] += 1;
      else counts.unseen += 1;
    });

    const summary = rawReport?.summary || counts;
    const masteredCount = (summary.consolidating || 0) + (summary.durable || 0);
    const developingCount = summary.developing || 0;
    const pendingCount =
      (summary.unseen || 0) +
      (summary.introduced || 0) +
      (summary.needs_repair || 0) +
      (summary.review_due || 0);

    const summaryCard = h(
      'div',
      { class: cx('-summary') },
      h(
        'div',
        { class: `${cx('-kpi')} ${cx('-kpi--mastered')}` },
        h('span', { class: cx('-kpi__num') }, formatNumber(masteredCount)),
        h('span', { class: cx('-kpi__label') }, 'Consolidada / Durable'),
      ),
      h(
        'div',
        { class: `${cx('-kpi')} ${cx('-kpi--assisted')}` },
        h('span', { class: cx('-kpi__num') }, formatNumber(developingCount)),
        h('span', { class: cx('-kpi__label') }, 'En desarrollo'),
      ),
      h(
        'div',
        { class: `${cx('-kpi')} ${cx('-kpi--pending')}` },
        h('span', { class: cx('-kpi__num') }, formatNumber(pendingCount)),
        h('span', { class: cx('-kpi__label') }, 'Pendiente / Refuerzo'),
      ),
    );

    const cards = items.map((item) => {
      const { comp, status, diagnostics } = item;
      const badgeInfo = STATUS_BADGES[status] || STATUS_BADGES.unseen;
      const statusMod = badgeInfo.classModifier || status;
      const badgeToneClass = TONE_TO_CLASS[badgeInfo.tone] || 'badge--neutral';

      const statusBadge = h(
        'span',
        {
          class: `${cx('-badge')} badge ${badgeToneClass} is-${statusMod}`,
          'data-status': status,
        },
        badgeInfo.label,
      );

      const header = h(
        'header',
        { class: cx('-card__header') },
        h('h4', { class: cx('-card__title') }, `${comp.order}. ${comp.title}`),
        statusBadge,
      );

      const diagnosticEls = diagnostics.map((diagId) => {
        const tax = diagnosticTaxonomy[diagId];
        const label = tax ? tax.shortLabel : emptyErrorLabel(diagId);
        const pose = tax?.pose || 'pensativa';
        return h(
          'div',
          {
            class: cx('-error-alert'),
            title: `Error cognitivo recurrente (Pose: ${pose})`,
          },
          chalkIcon('hint', 14),
          h('span', null, ` Error detectado: ${label}`),
        );
      });

      const btnGo = h(
        'button',
        {
          type: 'button',
          class: `btn btn--subtle btn--sm ${cx('-btn-nav')} pr-btn`,
          on: {
            click: () => {
              if (typeof onNavigateSection === 'function') {
                onNavigateSection(comp);
              } else if (typeof document !== 'undefined') {
                const link = document.querySelector(`.seq-sidebar__link[data-sec="${comp.sectionId}"]`);
                if (link) link.click();
                else if (typeof location !== 'undefined') location.hash = `#${comp.sectionId}`;
              }
            },
          },
        },
        sectionLabelFn(comp),
      );

      const btnPractice = h(
        'button',
        {
          type: 'button',
          class: `btn btn--sm ${cx('-btn-practice')} pr-btn`,
          on: {
            click: () => {
              if (typeof onPracticeFamily === 'function') {
                onPracticeFamily(comp);
              } else if (typeof document !== 'undefined') {
                const link = document.querySelector('.seq-sidebar__link[data-sec="sec-retos"]');
                if (link) link.click();
                else if (typeof location !== 'undefined') location.hash = '#sec-retos';
              }
            },
          },
        },
        chalkIcon('target', 14),
        ' Practicar en Entrenador',
      );

      const actions = h(
        'div',
        { class: cx('-card__actions') },
        btnGo,
        btnPractice,
      );

      return h(
        'article',
        {
          class: `${cx('-card')} ${cx(`-card--${statusMod}`)}`,
          'data-competency-id': comp.id,
          'data-module-id': moduleId,
        },
        header,
        diagnosticEls.length > 0 ? h('div', { class: cx('-errors') }, ...diagnosticEls) : null,
        actions,
      );
    });

    const grid = h('div', { class: cx('-grid') }, ...cards);

    const titleHeader = h(
      'header',
      { class: cx('-header') },
      h('h3', null, title),
      h('p', { class: 'muted small' }, subtitle),
    );

    container.replaceChildren(titleHeader, summaryCard, grid);
  };

  render();

  return {
    update: render,
    destroy: () => {
      destroyed = true;
    },
  };
}
