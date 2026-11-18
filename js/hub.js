/**
 * hub.js — Punto de entrada del Hub principal:
 * - Navegación global de 11 unidades
 * - Reentrada de baja fricción (#hub-reentry)
 * - Cuaderno de Misterios Abiertos (#hub-mysteries)
 */
import { h, chalkIcon } from './core/dom.js';
import { renderNav, PAGES, CURRICULUM_UNITS } from './core/nav.js';
import { initCurriculumRegistry } from './core/learning/curriculum-registry.js';
import { getProgressStore, MODULE_COMPETENCY_IDS } from './core/learning/progress-store.js';
import { selectAdaptiveExercise, buildGlobalExerciseCatalog } from './core/learning/exercise-selector.js';
import { OPEN_MYSTERIES, listMysteries, mountMysteriesNotebook } from './core/learning/mysteries.js';

const REVIEW_ELIGIBLE_STATUSES = new Set(['needs_repair', 'review_due', 'developing']);

function findPageMeta(moduleId) {
  return PAGES.find((p) => p.id === moduleId) || null;
}

function getModuleIntroducedCount(store, moduleId) {
  const ids = MODULE_COMPETENCY_IDS[moduleId] || [];
  let count = 0;
  for (const cid of ids) {
    const st = store.getCompetencyState(cid);
    if (st && st.status && st.status !== 'unseen') {
      count += 1;
    }
  }
  return count;
}

function buildContinueSuggestion(store) {
  const recent = store.getRecentEvents(10);
  const lastWithPage = recent.find((evt) => evt?.moduleId && findPageMeta(evt.moduleId));

  if (!lastWithPage) {
    return {
      kicker: 'Continuar',
      title: 'Empezar por Unidad 01 · Potencias y Raíces',
      desc: 'Un recorrido paso a paso desde los dos mundos (+0 vs ×1) y las bases del dominio real.',
      href: 'potencias-raices.html',
      cta: 'Ir al laboratorio',
    };
  }

  const page = findPageMeta(lastWithPage.moduleId);
  const isBoss = lastWithPage.moduleId === 'jefe-integrador-1' || lastWithPage.moduleId === 'simulacro-global';
  return {
    kicker: 'Continuar',
    title: page.label,
    desc: isBoss
      ? 'Retomá la evaluación integradora donde la dejaste, sin cronómetro.'
      : 'Volvé al último laboratorio que estuviste trabajando.',
    href: page.href,
    cta: isBoss ? 'Retomar evaluación' : 'Volver al laboratorio',
  };
}

function buildReviewSuggestion(store) {
  const catalog = buildGlobalExerciseCatalog({ store, includeTransfer: false });
  const selection = selectAdaptiveExercise({
    moduleId: 'global',
    availableExercises: catalog,
    store,
    excludeUnseen: true,
  });

  if (!selection?.exercise || !selection.targetCompetencyId) {
    return null;
  }

  const entry = store.getCompetencyState(selection.targetCompetencyId);
  if (!entry || !REVIEW_ELIGIBLE_STATUSES.has(entry.status)) {
    return null;
  }

  const ex = selection.exercise;
  const page = findPageMeta(ex.moduleId);
  if (!page) return null;

  const targetHash = ex.sectionId ? `#${ex.sectionId}` : '#sec-retos';
  return {
    kicker: 'Repasar',
    title: `${page.label} · ${ex.title || 'Práctica breve'}`,
    desc: selection.selectionReason || 'Una oportunidad breve para consolidar lo que ya practicaste.',
    href: `${page.href}${targetHash}`,
    cta: 'Repasar ahora',
  };
}

function buildExploreSuggestion(store) {
  const openMysteries = listMysteries({ store, status: 'open' });
  if (openMysteries.length > 0) {
    const first = openMysteries[0];
    return {
      kicker: 'Explorar',
      title: first.title,
      desc: `Tenés ${openMysteries.length} misterio${openMysteries.length > 1 ? 's' : ''} guardado${openMysteries.length > 1 ? 's' : ''} en tu cuaderno para investigar sin apuro.`,
      href: '#hub-mysteries',
      cta: 'Abrir cuaderno',
    };
  }

  for (const unit of CURRICULUM_UNITS) {
    for (const item of unit.items) {
      const modId = item.pageId || item.id;
      if (getModuleIntroducedCount(store, modId) === 0) {
        return {
          kicker: 'Explorar',
          title: `Unidad ${String(unit.number).padStart(2, '0')} · ${item.label}`,
          desc: item.detail,
          href: item.href,
          cta: 'Explorar unidad',
        };
      }
    }
  }

  const sampleMystery = OPEN_MYSTERIES[0];
  return {
    kicker: 'Explorar',
    title: sampleMystery ? sampleMystery.title : 'Cuaderno de Misterios Abiertos',
    desc: 'Elegí una pregunta matemática abierta para investigar relaciones sin afectar tu dominio.',
    href: '#hub-mysteries',
    cta: 'Ver misterios',
  };
}

function renderHubReentry(container, store) {
  if (!container) return;

  const items = [
    buildContinueSuggestion(store),
    buildReviewSuggestion(store),
    buildExploreSuggestion(store),
  ].filter(Boolean);

  const cards = items.map((item) =>
    h(
      'a',
      { class: 'hub-reentry__item', href: item.href },
      h('span', { class: 'hub-reentry__kicker' }, item.kicker),
      h('strong', { class: 'hub-reentry__title' }, item.title),
      h('span', { class: 'hub-reentry__desc' }, item.desc),
      h('span', { class: 'hub-reentry__cta' }, item.cta, ' →'),
    ),
  );

  container.replaceChildren(
    h(
      'div',
      { class: 'hub-reentry__header' },
      h('h2', { class: 'hub-reentry__heading' }, chalkIcon('compass', { width: 18, height: 18 }), ' Retomar estudio'),
      h(
        'p',
        { class: 'hub-reentry__sub muted' },
        'Elegí por dónde seguir hoy, o saltá directo al laboratorio que necesites.',
      ),
    ),
    h('div', { class: 'hub-reentry__grid' }, ...cards),
  );
}

renderNav();
initCurriculumRegistry();

const store = getProgressStore();
const reentryHost = document.getElementById('hub-reentry');
const mysteriesHost = document.getElementById('hub-mysteries');

renderHubReentry(reentryHost, store);
if (mysteriesHost) {
  mountMysteriesNotebook(mysteriesHost, { store });
}

store.subscribe((payload) => {
  if (
    payload?.type === 'learning_event_recorded' ||
    payload?.type === 'mysteries_updated' ||
    payload?.type === 'store_reset' ||
    payload?.type === 'state_imported'
  ) {
    renderHubReentry(reentryHost, store);
  }
});
