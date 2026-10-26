/**
 * funciones/index.js — Inicializador del Laboratorio de Funciones (Unidad 8).
 * Monta la navegación común, inicializa el gestor de pestañas y arranca los 4 micro-simuladores.
 */
import { byId } from '../../core/dom.js';
import { renderNav, initTabs } from '../../core/nav.js';
import { initScanner } from './scanner.js';
import { initRadiografia } from './radiografia.js';
import { initSecante } from './secante.js';
import { initInversa } from './inversa.js';

function init() {
  renderNav();
  initTabs(document.querySelector('.tabs'));

  initScanner(byId('panel-scanner'));
  initRadiografia(byId('panel-radiografia'));
  initSecante(byId('panel-secante'));
  initInversa(byId('panel-inversa'));
}

init();
