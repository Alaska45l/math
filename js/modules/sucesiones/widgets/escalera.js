/**
 * widgets/escalera.js — Widget interactivo para la Sección 4:
 * Fórmulas recursivas: «la escalera».
 * Dos modos:
 * 1. Aritmética paso a paso con contador de costo computacional.
 * 2. Reglas generales (mixta, cuadrática, fibonacci con anclas conmutables).
 */

import { h, mount } from '../../../core/dom.js';
import { fmt, MINUS } from '../../../core/math-format.js';
import { react } from '../../../core/vn.js';
import { GENERAL_RULES, expandRecursive } from '../logic.js';

export function initEscaleraWidget(container) {
  let mode = 'ari'; // 'ari' | 'general'
  let kVal = 3;
  let dVal = 2;
  let currentStep = 1;
  const maxStep = 8;

  let generalRuleId = 'fibonacci';
  let fiboAnchor1 = 1;
  let fiboAnchor2 = 1;
  let enableSecondAnchor = true;

  function render() {
    const tabs = h('div', { class: 'seq-controls' },
      h('button', {
        type: 'button',
        class: ['chip', mode === 'ari' ? 'is-active' : ''],
        on: { click: () => { mode = 'ari'; render(); } },
      }, 'Modo Aritmética (Paso a paso)'),
      h('button', {
        type: 'button',
        class: ['chip', mode === 'general' ? 'is-active' : ''],
        on: { click: () => { mode = 'general'; render(); } },
      }, 'Modo Reglas Generales (Fibonacci, Cuadrática…)')
    );

    let contentArea;

    if (mode === 'ari') {
      // Cálculo de los escalones
      const stepsList = [];
      let val = kVal;
      stepsList.push({ n: 1, val, expr: `a(1) = ${fmt(val)} (Ancla de inicio)` });

      for (let n = 2; n <= currentStep; n++) {
        const prev = val;
        val = prev + dVal;
        const dStr = dVal >= 0 ? `+ ${fmt(dVal)}` : `${MINUS} ${fmt(Math.abs(dVal))}`;
        stepsList.push({ n, val, expr: `a(${n}) = a(${n - 1}) ${dStr} = ${fmt(prev)} ${dStr} = ${fmt(val)}` });
      }

      const controls = h('div', { class: 'seq-controls' },
        h('label', { class: 'field__label' },
          'Primer término a(1): ',
          h('input', {
            type: 'number',
            class: 'seq-check__input-sm',
            value: kVal,
            step: 'any',
            on: {
              change: (e) => {
                kVal = parseFloat(e.target.value) || 0;
                currentStep = 1;
                render();
              },
            },
          })
        ),
        h('label', { class: 'field__label' },
          'Diferencia común d: ',
          h('input', {
            type: 'number',
            class: 'seq-check__input-sm',
            value: dVal,
            step: 'any',
            on: {
              change: (e) => {
                dVal = parseFloat(e.target.value) || 0;
                render();
              },
            },
          })
        ),
        h('button', {
          type: 'button',
          class: 'btn',
          disabled: currentStep >= maxStep,
          on: {
            click: () => {
              if (currentStep < maxStep) {
                currentStep++;
                render();
              }
            },
          },
        }, 'Subir un escalón (+1)'),
        h('button', {
          type: 'button',
          class: 'chip chip--ghost',
          on: {
            click: () => {
              currentStep = 1;
              render();
            },
          },
        }, 'Reiniciar al piso 1')
      );

      const tableRows = stepsList.map((st) =>
        h('tr', { class: st.n === currentStep ? 'is-active' : '' },
          h('td', null, `Escalón n = ${st.n}`),
          h('td', null, st.expr),
          h('td', null, h('strong', null, fmt(st.val)))
        )
      );

      const table = h('div', { class: 'seq-table-wrap' },
        h('table', { class: 'seq-table' },
          h('thead', null,
            h('tr', null,
              h('th', null, 'Término'),
              h('th', null, 'Cálculo recursivo'),
              h('th', null, 'Resultado')
            )
          ),
          h('tbody', null, ...tableRows)
        )
      );

      const costNotice = h('div', { class: 'notice notice--info' },
        h('strong', null, `Costo computacional de la escalera: `),
        h('span', null, `Para calcular a(${currentStep}) necesitaste ${currentStep - 1} escalones previos. Para llegar a a(100) por este camino, ¡tendrías que calcular 99 operaciones encadenadas sin saltearte ninguna!`)
      );

      contentArea = h('div', { class: 'seq-escalera-content' }, controls, table, costNotice);
    } else {
      // Modo Reglas Generales
      const ruleSelector = h('div', { class: 'seq-controls' },
        Object.values(GENERAL_RULES).map((r) => {
          const btn = h('button', {
            type: 'button',
            class: ['chip', r.id === generalRuleId ? 'is-active' : ''],
            on: {
              click: () => {
                generalRuleId = r.id;
                render();
              },
            },
          }, r.label);
          return btn;
        })
      );

      let anchorControls;
      let anchorsList;

      if (generalRuleId === 'fibonacci') {
        anchorControls = h('div', { class: 'seq-controls' },
          h('label', { class: 'field__label' },
            'Ancla a(1): ',
            h('input', {
              type: 'number',
              class: 'seq-check__input-sm',
              value: fiboAnchor1,
              on: { change: (e) => { fiboAnchor1 = parseFloat(e.target.value) || 0; render(); } },
            })
          ),
          h('label', { class: 'chip chip--toggle' },
            h('input', {
              type: 'checkbox',
              checked: enableSecondAnchor,
              on: {
                change: (e) => {
                  enableSecondAnchor = e.target.checked;
                  render();
                  if (!enableSecondAnchor) {
                    react({
                      pose: 'colapso',
                      tag: '¿Y el combustible?',
                      html: '¿¡Desactivaste la segunda ancla!? La regla de Fibonacci suma los <strong>dos</strong> escalones previos: <span class="eq">a(n − 1) + a(n − 2)</span>. Sin <span class="eq">a(2)</span>, la máquina queda ciega y no sabe cómo arrancar.',
                    });
                  }
                },
              },
            }),
            'Habilitar 2.ª ancla a(2)'
          ),
          enableSecondAnchor
            ? h('label', { class: 'field__label' },
                'Ancla a(2): ',
                h('input', {
                  type: 'number',
                  class: 'seq-check__input-sm',
                  value: fiboAnchor2,
                  on: { change: (e) => { fiboAnchor2 = parseFloat(e.target.value) || 0; render(); } },
                })
              )
            : null
        );

        anchorsList = enableSecondAnchor ? [fiboAnchor1, fiboAnchor2] : [fiboAnchor1];
      } else {
        const defaultAnch = GENERAL_RULES[generalRuleId].defaultAnchors;
        anchorsList = defaultAnch;
        anchorControls = h('p', { class: 'muted small' },
          `Esta regla necesita ${GENERAL_RULES[generalRuleId].neededAnchors} ancla inicial: a(1) = ${defaultAnch[0]}.`
        );
      }

      const res = expandRecursive({ id: generalRuleId, anchors: anchorsList }, 6);

      let resultView;
      if (res.ok) {
        resultView = h('div', { class: 'seq-table-wrap' },
          h('table', { class: 'seq-table' },
            h('thead', null,
              h('tr', null,
                h('th', null, 'n'),
                h('th', null, 'Cálculo de recurrencia'),
                h('th', null, 'Valor')
              )
            ),
            h('tbody', null,
              res.terms.map((val, i) =>
                h('tr', null,
                  h('td', null, `a(${i + 1})`),
                  h('td', null, i < anchorsList.length ? `Ancla inicial dada` : res.steps[i - anchorsList.length]),
                  h('td', null, h('strong', null, fmt(val)))
                )
              )
            )
          )
        );
      } else {
        resultView = h('div', { class: 'notice notice--err' },
          h('strong', null, 'Error conceptual de recursión: '),
          h('p', { style: 'margin: 4px 0;' }, res.error.message),
          h('p', { class: 'small', style: 'margin: 4px 0;' },
            'Para calcular a(3) = a(2) + a(1) necesitás conocer obligatoriamente los dos escalones previos. Sin a(2), ¡el sistema se queda sin combustible y la regla no puede dar el siguiente paso!'
          )
        );
      }

      contentArea = h('div', { class: 'seq-escalera-content' }, ruleSelector, anchorControls, resultView);
    }

    mount(container, tabs, contentArea);
  }

  render();
}
