/**
 * components.js — Componentes transversales accesibles para el Laboratorio de Sucesiones:
 * 1. createRibbon: Cinta SVG de postes y arcos interactivos.
 * 2. annotatedFormula: Fórmulas explicadas e interactivas con notas Khan Academy.
 * 3. createCheckBlock: Bloque de chequeo autocorregido con pistas y soluciones.
 */

import { h, s, mount, on, chalkIcon } from '../../core/dom.js';
import { fmt, fractionHtml, MINUS } from '../../core/math-format.js';
import { react } from '../../core/vn.js';
import { parse, equivalent, toDisplay, isStandardForm } from './expr.js';
import { diagnose, approxEq } from './logic.js';

const PROGRESS_KEY = 'sucesiones:progreso:v1';

export function getProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

export function saveSectionProgress(sectionId) {
  try {
    const current = getProgress();
    current[sectionId] = true;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(current));
  } catch (_) {}
}

/**
 * createRibbon(root, props)
 * Props:
 *  - terms: number[] | (number|string)[]
 *  - startIndex: number (1 por defecto, o 0)
 *  - hop: { op: '+'|'×'|'÷'|'-', value: number|string } | Array | null
 *  - travelled: number (cantidad de saltos marcados)
 *  - selected: number | null (índice del poste seleccionado)
 *  - editableFrom: number | null (índice desde el cual los postes son editables)
 *  - onSelect: (index, val) => void
 *  - onEditTerm: (index, val) => void
 */
export function createRibbon(root, props = {}) {
  const {
    terms = [3, 5, 7, 9],
    startIndex = 1,
    hop = null,
    travelled = 0,
    selected = null,
    editableFrom = null,
    onSelect,
    onEditTerm,
  } = props;

  const N = terms.length;
  const W = Math.max(360, Math.min(800, N * 110 + 60));
  const H = 175;
  const padL = 45;
  const padR = 45;
  const stepX = N > 1 ? (W - padL - padR) / (N - 1) : 0;
  const postY = 110;

  const svg = s('svg', {
    class: 'seq-ribbon-svg',
    viewBox: `0 0 ${W} ${H}`,
    width: W,
    height: H,
    style: `min-width: ${W}px; width: ${W}px; height: ${H}px;`,
    role: 'img',
    'aria-label': `Cinta de ${N} términos y saltos de la sucesión`,
  });

  const arrowMarkerId = `ribbon-arrow-${Math.random().toString(36).slice(2, 7)}`;
  const defs = s('defs', null,
    s('marker', {
      id: arrowMarkerId,
      viewBox: '0 0 10 10',
      refX: 8,
      refY: 5,
      markerWidth: 7,
      markerHeight: 7,
      orient: 'auto-start-reverse',
    }, s('path', { d: 'M 1 2 L 8 5 L 1 8', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round' }))
  );
  svg.append(defs);

  // Arcos entre términos
  for (let i = 0; i < N - 1; i++) {
    const x1 = padL + i * stepX;
    const x2 = padL + (i + 1) * stepX;
    const midX = (x1 + x2) / 2;
    const arcInset = Math.min(22, stepX * 0.22);
    const startArcX = x1 + arcInset;
    const endArcX = x2 - arcInset;
    const arcPeakY = 32;

    const isTravelled = i < travelled;

    const arcPath = s('path', {
      class: ['seq-ribbon__arc', isTravelled ? 'is-travelled' : ''],
      d: `M ${startArcX} ${postY - 18} Q ${midX} ${arcPeakY} ${endArcX} ${postY - 18}`,
      'marker-end': `url(#${arrowMarkerId})`,
    });
    svg.append(arcPath);

    // Etiqueta del arco
    let hopLabel = '';
    if (Array.isArray(hop)) {
      const hItem = hop[i];
      if (hItem) {
        const opSym = hItem.op === '*' ? '×' : hItem.op;
        hopLabel = `${opSym} ${typeof hItem.value === 'number' ? fmt(hItem.value) : hItem.value} ↷`;
      }
    } else if (hop && typeof hop === 'object') {
      const opSym = hop.op === '*' ? '×' : hop.op;
      hopLabel = `${opSym} ${typeof hop.value === 'number' ? fmt(hop.value) : hop.value} ↷`;
    }

    if (hopLabel) {
      const textArc = s('text', {
        class: ['seq-ribbon__arc-label', isTravelled ? 'is-travelled' : ''],
        x: midX,
        y: arcPeakY - 4,
        'text-anchor': 'middle',
      }, hopLabel);
      svg.append(textArc);
    }
  }

  // Postes de términos
  for (let i = 0; i < N; i++) {
    const x = padL + i * stepX;
    const isSelected = selected === i;
    const isEditable = editableFrom !== null && i >= editableFrom;
    const termVal = terms[i];
    const termIndexNum = startIndex + i;
    const posLabel = termIndexNum === 1
      ? '1.er término'
      : termIndexNum === 2
      ? '2.º término'
      : termIndexNum === 3
      ? '3.er término'
      : `${termIndexNum}.º término`;

    const postGroup = s('g', {
      class: ['seq-ribbon__post', isSelected ? 'is-selected' : '', isEditable ? 'is-editable' : ''],
      tabindex: '0',
      role: 'button',
      'aria-label': `${posLabel}: ${termVal !== undefined && termVal !== null ? termVal : 'término a completar'}`,
      dataset: { index: i },
    });

    const circle = s('circle', {
      cx: x,
      cy: postY,
      r: 24,
      class: 'seq-ribbon__circle',
    });
    postGroup.append(circle);

    if (isEditable) {
      const fo = s('foreignObject', {
        x: x - 24,
        y: postY - 24,
        width: 48,
        height: 48,
      });
      const inputEl = h('input', {
        type: 'number',
        step: 'any',
        class: [
          'seq-ribbon__input',
          props.validities?.[i] === 'ok' ? 'is-correct' : props.validities?.[i] === 'err' ? 'is-error' : '',
        ],
        value: termVal !== undefined && termVal !== '?' && termVal !== '' ? termVal : '',
        placeholder: '¿?',
        'aria-label': `${posLabel}: ingresar valor con el teclado`,
      });
      inputEl.addEventListener('input', (e) => {
        onEditTerm?.(i, e.target.value, inputEl);
      });
      fo.append(inputEl);
      postGroup.append(fo);
    } else {
      const textVal = s('text', {
        x,
        y: postY + 5,
        class: 'seq-ribbon__val',
        'text-anchor': 'middle',
      }, typeof termVal === 'number' ? fmt(termVal) : String(termVal ?? ''));
      postGroup.append(textVal);
    }

    // Etiqueta de posición abajo
    const labelPos = s('text', {
      x,
      y: postY + 44,
      class: 'seq-ribbon__pos-label',
      'text-anchor': 'middle',
    }, posLabel);
    postGroup.append(labelPos);

    svg.append(postGroup);
  }

  mount(root, svg);

  // Delegación de selección
  on(svg, 'click', '.seq-ribbon__post', (_e, target) => {
    const idx = parseInt(target.dataset.index, 10);
    if (!Number.isNaN(idx)) {
      onSelect?.(idx, terms[idx]);
    }
  });

  on(svg, 'keydown', '.seq-ribbon__post', (e, target) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const idx = parseInt(target.dataset.index, 10);
      if (!Number.isNaN(idx)) {
        onSelect?.(idx, terms[idx]);
      }
    }
  });

  return {
    update(newProps) {
      createRibbon(root, { ...props, ...newProps });
    },
  };
}

/**
 * annotatedFormula(root, config)
 * Config:
 * - type: 'explicit' | 'recursive'
 * - seqName: 'a' | 'b' | 'c'
 * - k: number
 * - step: number
 * - op: '+' | '×' | '-'
 * - kind: 'ari' | 'geo'
 */
export function annotatedFormula(root, config = {}) {
  const {
    type = 'explicit',
    seqName = 'a',
    k = 3,
    step = 2,
    kStr = null,
    stepStr = null,
    op: oper = '+',
    kind = 'ari',
  } = config;

  const kDisplay = kStr || fmt(k);
  const stepDisplay = stepStr || (kind === 'geo' && Math.abs(step - 1 / 3) < 1e-4 ? '1/3' : fmt(step));

  const noteArea = h('div', { class: 'seq-annotated__note-box', 'aria-live': 'polite' },
    h('p', { class: 'seq-annotated__hint-text muted small' }, 'Tocá o pasá el mouse sobre cada elemento de la fórmula para ver su rol:')
  );

  let tokensContainer;

  function showNote(note) {
    mount(noteArea, h('p', { class: 'seq-annotated__note' }, note));
  }

  function clearNote() {
    mount(noteArea, h('p', { class: 'seq-annotated__hint-text muted small' }, 'Tocá o pasá el mouse sobre cada elemento de la fórmula para ver su rol:'));
  }

  const makeToken = (text, note, label) => {
    const btn = h('button', {
      type: 'button',
      class: 'seq-token',
      'aria-label': `${label}: ${text}`,
      tabindex: '0',
    }, text);

    btn.addEventListener('mouseenter', () => showNote(note));
    btn.addEventListener('mouseleave', () => clearNote());
    btn.addEventListener('focus', () => showNote(note));
    btn.addEventListener('blur', () => clearNote());
    btn.addEventListener('click', () => showNote(note));

    return btn;
  };

  if (type === 'explicit') {
    if (kind === 'ari') {
      const kToken = makeToken(kDisplay, `← Primer término ${seqName}(1): el poste donde arranca la sucesión (${kDisplay}).`, 'Primer término');
      const dSign = step >= 0 ? '+' : MINUS;
      const dVal = stepStr || fmt(Math.abs(step));
      const dToken = makeToken(`${dSign} ${dVal}`, `← Diferencia común d: cantidad fija que sumamos en cada paso (${stepDisplay}).`, 'Diferencia común');
      const jumpsToken = makeToken('(n − 1)', '← Cantidad de saltos: para llegar al poste n desde el poste 1 hacés exactamente n − 1 saltos.', 'Cantidad de saltos');

      tokensContainer = h('div', { class: 'seq-annotated__formula' },
        h('span', { class: 'seq-annotated__eq' }, `${seqName}(n) = `),
        kToken,
        h('span', { class: 'seq-annotated__space' }, ' '),
        dToken,
        h('span', { class: 'seq-annotated__space' }, ' · '),
        jumpsToken
      );
    } else {
      const kToken = makeToken(kDisplay, `← Primer término ${seqName}(1): el ancla inicial de la sucesión (${kDisplay}).`, 'Primer término');
      const rStr = step < 0 ? `(${stepDisplay})` : stepDisplay;
      const rToken = makeToken(rStr, `← Razón común r: factor por el que multiplicás en cada paso (${stepDisplay}).`, 'Razón común');
      const jumpsToken = makeToken('^(n − 1)', '← Potencia n − 1: acumulación multiplicativa de n − 1 saltos desde el inicio.', 'Exponente de saltos');

      tokensContainer = h('div', { class: 'seq-annotated__formula' },
        h('span', { class: 'seq-annotated__eq' }, `${seqName}(n) = `),
        kToken,
        h('span', { class: 'seq-annotated__space' }, ' · '),
        rToken,
        jumpsToken
      );
    }
  } else {
    // Recursiva con llave
    const anchorToken = makeToken(`${seqName}(1) = ${kDisplay}`, `← Ancla de inicio: el primer término es obligatoriamente ${kDisplay}.`, 'Ancla de inicio');
    const prevToken = makeToken(`${seqName}(n − 1)`, '← Término anterior: el valor del escalón inmediatamente previo.', 'Término anterior');
    const stepSign = kind === 'ari'
      ? (step >= 0 ? `+ ${stepDisplay}` : `${MINUS} ${stepDisplay}`)
      : `· ${step < 0 ? `(${stepDisplay})` : stepDisplay}`;
    const stepToken = makeToken(stepSign, `← Regla de recurrencia: cómo avanzar de un escalón al siguiente (${stepDisplay}).`, 'Regla de paso');

    tokensContainer = h('div', { class: 'seq-annotated__brace-box' },
      h('div', { class: 'seq-annotated__brace', 'aria-hidden': 'true' }, '{'),
      h('div', { class: 'seq-annotated__cases' },
        h('div', { class: 'seq-annotated__row' }, anchorToken),
        h('div', { class: 'seq-annotated__row' },
          h('span', null, `${seqName}(n) = `),
          prevToken,
          h('span', null, ' '),
          stepToken
        )
      )
    );
  }

  mount(root,
    h('div', { class: 'seq-annotated' },
      tokensContainer,
      noteArea
    )
  );
}

/**
 * createCheckBlock(root, questions, sectionId, onComplete)
 * Soporta:
 * - 'number': input numérico
 * - 'expr': fórmula evaluada con equivalent() y diagnose()
 * - 'pair': k y d (o r)
 * - 'choice': selección múltiple con opciones
 * - 'match': emparejamiento
 */
export function createCheckBlock(root, questions = [], sectionId = '', onComplete = null) {
  const state = {
    answers: questions.map(() => ({
      value: null,
      ok: false,
      feedback: null,
      hintIndex: 0,
      showSolution: false,
      failCount: 0,
    })),
  };

  const container = h('div', { class: 'seq-check-block', dataset: { section: sectionId } });

  function triggerVnReaction(q, qState, isOk, diagId = null) {
    if (isOk) {
      if ((qState.failCount || 0) === 0) {
        if (diagId === 'not_standard_but_equivalent') {
          react({
            pose: 'orgullosa',
            tag: 'Te lo advertí',
            html: '¡Ojo que está bien! Escribiste la forma simplificada equivalente. Genera exactamente los mismos términos, aunque acordate que ahí <span class="eq">k</span> no se ve a simple vista.',
          });
        } else {
          const correctPhrases = [
            { pose: 'orgullosa', tag: '¡Impecable!', html: '¡Clavadísimo a la primera! Ni tuviste que contar con los dedos.' },
            { pose: 'orgullosa', tag: '¡Impecable!', html: 'Je, impecable. Así se lee una estructura sin caer en recetas de memoria.' },
            { pose: 'feliz', tag: '¡Bien ahí!', html: '¡Exacto! Mirá qué limpio sale cuando respetás los <span class="eq">(n − 1)</span> saltos.' },
          ];
          const pick = correctPhrases[Math.floor(Math.random() * correctPhrases.length)];
          react(pick);
        }
      } else {
        react({
          pose: 'feliz',
          tag: '¡Bien ahí!',
          html: '¡Ahora sí! B-bueno, costó un par de chispazos pero corregiste el desfasaje. ¡Sigamos!',
        });
      }
    } else {
      qState.failCount = (qState.failCount || 0) + 1;
      if (qState.failCount === 1) {
        if (q.type === 'expr') {
          if (diagId === 'neg_pow_precedence') {
            react({
              pose: 'colapso',
              tag: 'Jerarquía rota',
              html: '¡Cuidado con la jerarquía! Escribiste la base negativa sin paréntesis y la potencia no está agarrando al signo menos.',
            });
          } else if (diagId === 'exponent_n') {
            react({
              pose: 'base',
              tag: 'Exponente adelantado',
              html: 'Te mandaste la gran Woo-Jin: pusiste exponente <span class="eq">n</span> en vez de <span class="eq">(n − 1)</span>. En <span class="eq">n = 1</span> ya estás multiplicando una vez de más.',
            });
          } else if (diagId === 'off_by_one') {
            react({
              pose: 'base',
              tag: 'Desfasaje de poste',
              html: 'Estás desfasado un poste: en el primer término (<span class="eq">n = 1</span>) todavía hiciste 0 saltos, así que el paso multiplica a <span class="eq">(n − 1)</span>, no a <span class="eq">n</span>.',
            });
          } else if (diagId === 'wrong_anchor_a2') {
            react({
              pose: 'colapso',
              tag: 'Ancla corrida',
              html: '¡Hiciste la gran Kiran! Armaste bien los <span class="eq">(n − 1)</span> saltos, pero pusiste el segundo término como punto de partida en vez de <span class="eq">a(1)</span>.',
            });
          } else if (diagId === 'sign_of_step') {
            react({
              pose: 'base',
              tag: 'Ojo al signo',
              html: 'Miraste bien el tamaño del salto, pero le pifiaste al signo: fijate si la sucesión está subiendo o bajando.',
            });
          } else if (diagId === 'swapped_k_step') {
            react({
              pose: 'colapso',
              tag: 'Cables cruzados',
              html: '¡Me diste vuelta los cables! Pusiste la diferencia común donde iba el primer término <span class="eq">k</span> y viceversa.',
            });
          } else {
            react({
              pose: 'base',
              tag: 'Revisá el planteo',
              html: 'Revisá la fórmula: compará lo que genera para <span class="eq">n = 1</span> y <span class="eq">n = 2</span> con los términos de la lista.',
            });
          }
        } else {
          react({
            pose: 'base',
            tag: 'Primer intento',
            html: 'Mmm, no coincide. Mirá bien los datos del problema o revisá las cuentas antes de volver a intentar.',
          });
        }
      } else if (qState.failCount === 2) {
        react({
          pose: 'enojada',
          tag: '¡Frená la mano!',
          html: '¿¡Me estás tirando números al azar para ver si embocás!? ¡No estamos en tu casa como para andar tirando cualquier fruta! N-no es que me preocupe si aprobás o no, ¿eh?, pero me da una bronca bárbara verte adivinar. ¡Mirá la cinta de saltos o tocá el botón de Pista antes de seguir disparando a ciegas!',
        });
      } else {
        react({
          pose: 'enojada',
          tag: '¡Colapso nervioso!',
          html: '¡Me vas a hacer dar un colapso nervioso! Evaluá con <span class="eq">n = 1</span> en lo que escribiste y fijate que ni siquiera te da el primer término de la lista.',
        });
      }
    }
  }

  function checkCompletion() {
    const allOk = state.answers.every((a) => a.ok);
    if (allOk) {
      saveSectionProgress(sectionId);
      onComplete?.(sectionId);
    }
  }

  function render() {
    const allDone = state.answers.every((a) => a.ok);

    const cards = questions.map((q, idx) => {
      const qState = state.answers[idx];
      const isResolved = qState.ok;

      // Header de la pregunta
      const header = h('div', { class: 'seq-check__header' },
        h('span', { class: 'seq-check__badge' }, `Ejercicio ${idx + 1}`),
        isResolved ? chalkIcon('check', { class: 'seq-check__check-icon' }) : null
      );

      // Prompt
      const promptEl = h('div', { class: 'seq-check__prompt' });
      if (typeof q.prompt === 'string') {
        promptEl.innerHTML = q.prompt;
      } else if (q.prompt instanceof Node) {
        promptEl.append(q.prompt);
      }

      // Input interactivo según tipo
      const inputSlot = h('div', { class: 'seq-check__input-slot' });

      if (q.type === 'number') {
        const inputNum = h('input', {
          type: 'number',
          class: ['seq-check__input', isResolved ? 'is-valid' : ''],
          step: 'any',
          disabled: isResolved,
          placeholder: 'Ingresá un número',
          value: qState.value !== null ? qState.value : '',
        });

        const btnCheck = h('button', {
          type: 'button',
          class: 'btn btn--check',
          disabled: isResolved,
        }, 'Comprobar');

        const evaluateNumber = () => {
          const val = parseFloat(inputNum.value);
          if (Number.isNaN(val)) {
            qState.feedback = { ok: false, message: 'Ingresá un número válido.' };
            triggerVnReaction(q, qState, false);
          } else {
            const isMatch = approxEq(val, q.expected);
            qState.value = val;
            qState.ok = isMatch;
            qState.feedback = isMatch
              ? { ok: true, message: '¡Excelente! Respuesta correcta.' }
              : { ok: false, message: `Revisá el cálculo: obtuviste ${fmt(val)}, pero no coincide.` };
            triggerVnReaction(q, qState, isMatch);
          }
          checkCompletion();
          render();
        };

        btnCheck.addEventListener('click', evaluateNumber);
        inputNum.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') evaluateNumber();
        });

        mount(inputSlot, h('div', { class: 'seq-check__row' }, inputNum, btnCheck));
      } else if (q.type === 'expr') {
        const inputExpr = h('input', {
          type: 'text',
          class: ['seq-check__input', isResolved ? 'is-valid' : ''],
          disabled: isResolved,
          placeholder: 'ej. 3 + 2(n − 1)',
          value: qState.value || '',
        });

        const previewEl = h('div', { class: 'seq-check__preview muted small' });
        const updatePreview = () => {
          const raw = inputExpr.value.trim();
          if (!raw) {
            mount(previewEl);
            return;
          }
          const parsed = parse(raw);
          if (parsed.ok) {
            mount(previewEl, 'Interpretado como: ', h('strong', { class: 'eq' }, toDisplay(parsed.ast)));
          } else {
            mount(previewEl, h('span', { class: 'text-warn' }, parsed.error?.message || 'Fórmula incompleta'));
          }
        };

        inputExpr.addEventListener('input', updatePreview);

        const btnCheck = h('button', {
          type: 'button',
          class: 'btn btn--check',
          disabled: isResolved,
        }, 'Comprobar');

        const evaluateExpr = () => {
          const raw = inputExpr.value.trim();
          const parsed = parse(raw);
          if (!parsed.ok) {
            qState.feedback = { ok: false, message: parsed.error?.message || 'Error de sintaxis en la fórmula.' };
            triggerVnReaction(q, qState, false);
            render();
            return;
          }

          qState.value = raw;
          const ast = parsed.ast;
          const expected = q.expected;
          const isEquiv = equivalent(ast, expected.expr || expected);

          if (isEquiv) {
            const isStd = isStandardForm(ast, expected.kind);
            if (expected.requireStandard && !isStd) {
              const diags = diagnose(ast, expected, { requireStandard: true });
              qState.ok = false;
              qState.feedback = {
                ok: false,
                message: diags[0]?.message || 'La fórmula es matemáticamente equivalente, pero debés escribirla en la forma estándar con (n − 1).',
              };
              triggerVnReaction(q, qState, false, diags[0]?.id || 'not_standard');
            } else {
              qState.ok = true;
              qState.feedback = {
                ok: true,
                message: isStd ? '¡Perfecto! Fórmula estándar correcta.' : '¡Correcto! Es una fórmula equivalente válida.',
              };
              const diags = !isStd ? diagnose(ast, expected) : [];
              const isEquivWarn = (!isStd) || diags.some((d) => d.id === 'not_standard_but_equivalent');
              triggerVnReaction(q, qState, true, isEquivWarn ? 'not_standard_but_equivalent' : null);
            }
          } else {
            qState.ok = false;
            const diags = diagnose(ast, expected);
            qState.feedback = {
              ok: false,
              message: diags[0]?.message || 'La fórmula no coincide con los términos de la sucesión pedida.',
            };
            triggerVnReaction(q, qState, false, diags[0]?.id || null);
          }

          checkCompletion();
          render();
        };

        btnCheck.addEventListener('click', evaluateExpr);
        inputExpr.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') evaluateExpr();
        });

        mount(inputSlot,
          h('div', { class: 'seq-check__row' }, inputExpr, btnCheck),
          previewEl
        );
      } else if (q.type === 'pair') {
        const kLabel = q.kLabel || 'Primer término (k)';
        const stepLabel = q.stepLabel || (q.kind === 'geo' ? 'Razón (r)' : 'Diferencia (d)');

        const inputK = h('input', {
          type: 'number',
          class: 'seq-check__input-sm',
          step: 'any',
          disabled: isResolved,
          placeholder: 'k',
          value: qState.value?.k !== undefined ? qState.value.k : '',
        });

        const inputStep = h('input', {
          type: 'number',
          class: 'seq-check__input-sm',
          step: 'any',
          disabled: isResolved,
          placeholder: q.kind === 'geo' ? 'r' : 'd',
          value: qState.value?.step !== undefined ? qState.value.step : '',
        });

        const btnCheck = h('button', {
          type: 'button',
          class: 'btn btn--check',
          disabled: isResolved,
        }, 'Comprobar');

        const evaluatePair = () => {
          const valK = parseFloat(inputK.value);
          const valStep = parseFloat(inputStep.value);
          if (Number.isNaN(valK) || Number.isNaN(valStep)) {
            qState.feedback = { ok: false, message: 'Completá ambos casilleros con números válidos.' };
            triggerVnReaction(q, qState, false);
          } else {
            const expK = q.expected.k;
            const expStep = q.expected.step !== undefined ? q.expected.step : (q.expected.d ?? q.expected.r);
            const matchK = approxEq(valK, expK);
            const matchStep = approxEq(valStep, expStep);

            qState.value = { k: valK, step: valStep };
            qState.ok = matchK && matchStep;

            if (qState.ok) {
              qState.feedback = { ok: true, message: '¡Excelente! Ambos valores son correctos.' };
            } else if (!matchK && matchStep) {
              qState.feedback = { ok: false, message: `El primer término k no es correcto. Revisá el primer poste a(1).` };
            } else if (matchK && !matchStep) {
              qState.feedback = { ok: false, message: `El paso no es correcto. Revisá el salto entre términos consecutivos.` };
            } else {
              qState.feedback = { ok: false, message: `Ninguno de los dos valores coincide. Revisá el inicio y el salto.` };
            }

            const diagPair = (!matchK && matchStep) ? 'wrong_k' : (matchK && !matchStep) ? 'wrong_step' : null;
            triggerVnReaction(q, qState, qState.ok, diagPair);
          }
          checkCompletion();
          render();
        };

        btnCheck.addEventListener('click', evaluatePair);

        mount(inputSlot,
          h('div', { class: 'seq-check__pair-grid' },
            h('label', { class: 'seq-check__pair-label' }, `${kLabel}: `, inputK),
            h('label', { class: 'seq-check__pair-label' }, `${stepLabel}: `, inputStep),
            btnCheck
          )
        );
      } else if (q.type === 'choice') {
        const optionsContainer = h('div', { class: 'seq-check__options' },
          q.options.map((opt, optIdx) => {
            const letter = String.fromCharCode(65 + optIdx);
            const isSelectedOpt = qState.value === optIdx;
            const btn = h('button', {
              type: 'button',
              class: ['seq-check__opt-btn', isSelectedOpt ? 'is-selected' : '', isResolved && optIdx === q.expected ? 'is-correct' : ''],
              dataset: { answer: optIdx },
              disabled: isResolved,
            },
              h('strong', { class: 'seq-check__opt-tag' }, `${letter}) `),
              opt
            );

            btn.addEventListener('click', () => {
              qState.value = optIdx;
              const isMatch = optIdx === q.expected;
              qState.ok = isMatch;
              qState.feedback = isMatch
                ? { ok: true, message: q.explanation || '¡Correcto! Opción acertada.' }
                : { ok: false, message: 'Opción incorrecta. Leé la pregunta con atención y volvé a probar.' };
              triggerVnReaction(q, qState, isMatch);
              checkCompletion();
              render();
            });

            return btn;
          })
        );
        mount(inputSlot, optionsContainer);
      } else if (q.type === 'match') {
        const pairs = q.pairs || [];
        const matchState = qState.value || pairs.map(() => '');

        const matchGrid = h('div', { class: 'seq-check__match-list' },
          pairs.map((p, pIdx) => {
            const selectEl = h('select', {
              class: 'seq-check__match-select',
              disabled: isResolved,
            },
              h('option', { value: '' }, 'Seleccioná un patrón...'),
              q.patterns.map((pat) => h('option', { value: pat, selected: matchState[pIdx] === pat }, pat))
            );

            selectEl.addEventListener('change', (e) => {
              matchState[pIdx] = e.target.value;
              qState.value = matchState;
            });

            return h('div', { class: 'seq-check__match-row' },
              h('span', { class: 'seq-check__match-left' }, p.seq),
              h('span', { class: 'seq-check__match-arrow' }, '→'),
              selectEl
            );
          })
        );

        const btnCheck = h('button', {
          type: 'button',
          class: 'btn btn--check',
          disabled: isResolved,
        }, 'Comprobar emparejamientos');

        btnCheck.addEventListener('click', () => {
          const allFilled = matchState.every((val) => val !== '');
          if (!allFilled) {
            qState.feedback = { ok: false, message: 'Asigná un patrón a cada una de las sucesiones.' };
            triggerVnReaction(q, qState, false);
          } else {
            const allMatched = pairs.every((p, i) => matchState[i] === p.pattern);
            qState.ok = allMatched;
            qState.feedback = allMatched
              ? { ok: true, message: '¡Impecable! Todas las relaciones son correctas.' }
              : { ok: false, message: 'Hay emparejamientos incorrectos. Revisá el tipo de operación y signo en cada caso.' };
            triggerVnReaction(q, qState, allMatched);
          }
          checkCompletion();
          render();
        });

        mount(inputSlot, matchGrid, h('div', { class: 'seq-check__row-end' }, btnCheck));
      }

      // Feedback del intento
      const feedbackEl = h('div', { class: 'seq-check__feedback', 'aria-live': 'polite' });
      if (qState.feedback) {
        mount(feedbackEl,
          h('div', { class: ['notice', qState.feedback.ok ? 'notice--ok' : 'notice--err'] },
            qState.feedback.ok ? chalkIcon('check') : chalkIcon('cross'),
            h('span', null, qState.feedback.message)
          )
        );
      }

      // Pistas y Solución
      const toolsRow = h('div', { class: 'seq-check__tools' });

      if (q.hints && q.hints.length > 0 && !isResolved) {
        const currentHintLevel = qState.hintIndex;
        const btnHint = h('button', {
          type: 'button',
          class: 'chip',
        }, currentHintLevel < q.hints.length ? `Pista (${currentHintLevel + 1}/${q.hints.length})` : 'Pistas mostradas');

        btnHint.addEventListener('click', () => {
          if (qState.hintIndex < q.hints.length) {
            const hintText = q.hints[qState.hintIndex];
            qState.hintIndex++;
            render();
            react({
              pose: 'base',
              tag: 'Pista desbloqueada',
              html: `Acá tenés una pista: <em>${hintText}</em>`,
            });
          }
        });
        toolsRow.append(btnHint);
      }

      if (q.solution && !isResolved) {
        const btnSol = h('button', {
          type: 'button',
          class: ['chip', qState.showSolution ? 'chip--active' : 'chip--ghost'],
        }, qState.showSolution ? 'Ocultar solución' : '¡Estoy atorado! Mostrame la solución');

        btnSol.addEventListener('click', () => {
          qState.showSolution = !qState.showSolution;
          render();
          if (qState.showSolution) {
            react({
              pose: 'colapso',
              tag: 'Suspiro...',
              html: 'Suspiro... está bien, no sufras más. Guardá la goma de borrar y mirá cómo se desarma paso por paso:',
            });
          }
        });
        toolsRow.append(btnSol);
      }

      // Despliegue de pistas (sólo si el usuario las solicitó)
      let hintsDisplay = null;
      if (qState.hintIndex > 0 && q.hints) {
        hintsDisplay = h('div', { class: 'seq-check__hints-box' });
        for (let hIdx = 0; hIdx < qState.hintIndex; hIdx++) {
          hintsDisplay.append(
            h('div', { class: 'seq-check__hint-item small' },
              h('strong', null, `Pista ${hIdx + 1}: `),
              q.hints[hIdx]
            )
          );
        }
      }

      // Despliegue de solución (sólo si el usuario la solicitó explícitamente)
      let solutionDisplay = null;
      if (qState.showSolution && q.solution) {
        solutionDisplay = h('div', { class: 'seq-check__solution-box' });
        const solContent = h('div', { class: 'seq-check__solution small' },
          h('strong', null, 'Resolución paso a paso:'),
          h('div', null)
        );
        if (typeof q.solution === 'string') {
          solContent.lastChild.innerHTML = q.solution;
        } else {
          solContent.lastChild.append(q.solution);
        }
        solutionDisplay.append(solContent);
      }

      const cardChildren = [
        header,
        promptEl,
        inputSlot,
        qState.feedback ? feedbackEl : null,
        toolsRow.childNodes.length > 0 ? toolsRow : null,
        hintsDisplay,
        solutionDisplay,
      ].filter(Boolean);

      return h('article', { class: ['seq-check__card', isResolved ? 'is-resolved' : ''] },
        ...cardChildren
      );
    });

    const completionBanner = allDone
      ? h('div', { class: 'notice notice--ok seq-check__all-done' },
          chalkIcon('check'),
          h('div', null,
            h('strong', null, '¡Sección completada con éxito!'),
            h('p', { class: 'small' }, 'Has resuelto todos los chequeos de esta sección. Tu progreso quedó guardado.')
          )
        )
      : null;

    mount(container, ...cards, completionBanner);
  }

  render();
  mount(root, container);

  return {
    isCompleted: () => state.answers.every((a) => a.ok),
  };
}
