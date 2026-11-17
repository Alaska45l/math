/**
 * funciones/index.js — Inicializador del Laboratorio de Funciones (Unidad 02).
 * Monta la navegación común, inicializa el gestor de pestañas, arranca los 4 micro-simuladores
 * y monta el mapa vivo de competencias.
 */
import { byId } from '../../core/dom.js';
import { renderNav, initTabs } from '../../core/nav.js';
import { initScanner } from './scanner.js';
import { initRadiografia } from './radiografia.js';
import { initSecante } from './secante.js';
import { initInversa } from './inversa.js';
import { initFnLearning, mountFnCompetencyDashboard } from './learning-adapter.js';

function init() {
  renderNav();
  initFnLearning();
  initTabs(document.querySelector('.tabs'));

  initScanner(byId('panel-scanner'));
  initRadiografia(byId('panel-radiografia'));
  initSecante(byId('panel-secante'));
  initInversa(byId('panel-inversa'));

  const dashboardHost = byId('fn-competency-panel');
  if (dashboardHost) {
    mountFnCompetencyDashboard(dashboardHost);
  }
}

init();
