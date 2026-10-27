import { byId } from '../../core/dom.js';
import { renderNav, initTabs } from '../../core/nav.js';
import { initPostes } from './postes.js';
import { initTraductor } from './traductor.js';
import { initGeometrica } from './geometrica.js';
import { initRetos } from './retos.js';
renderNav(); initTabs(document.querySelector('.tabs'));
initPostes(byId('panel-postes')); initTraductor(byId('panel-traductor'));
initGeometrica(byId('panel-geometrica')); initRetos(byId('panel-retos'));
