# AUDITORÍA CURRICULAR Y ARQUITECTÓNICA — ALASKA MATH LAB (UNIDADES 01–11)

> **Puerta de Aprobación — Etapa A:**  
> **Estado: Aprobado técnicamente por Agente 00 (2026-11-17T17:44:00Z)**  
> **Autoridad curricular:** `agent/Contexto/Módulo Introducción a la Matemática.md` (FCEyN UNMDP — 158 págs., 10 capítulos oficiales, 2 bloques de Actividades de Integración, 8 evaluaciones/simulacros de ediciones anteriores y anexo de fórmulas).  
> **Autoridad pedagógica y técnica:** `LEARNING_ARCHITECTURE.md`, `ROADMAP.md`, `DESIGN_PHILOSOPHY.md` y el núcleo `js/core/learning/`.

---

## 1. Línea de Base del Repositorio, Pruebas e Infraestructura

### 1.1 Estado Git, Entorno y Políticas de Higiene

| Ítem | Estado verificado en Etapa A | Evidencia |
|---|---|---|
| Rama base y commit de partida | Rama `main` limpia en commit `eed2951` (`eed2951bbe1436af0ec6fe41029a9b920a3aaa33`) | `git rev-parse HEAD main origin/main` |
| Rama de trabajo Etapa A | `feat/expand-11-units` creada desde `main` (`eed2951`) sin modificar `main` directamente | `git checkout -b feat/expand-11-units` |
| Runtime Node.js | `v26.1.0` (sin `package.json` en la raíz; ejecución nativa de módulos ES2023+ sin dependencias en runtime) | `node -v` |
| Higiene `.gitignore` | `.gitignore` ignora `/tests/` (línea 8) y `/scripts` (línea 16). Archivos previos bajo `tests/sucesiones/`, `tests/sound.test.mjs`, `scripts/audit-potencias-raices.mjs`, `scripts/verify-pages.mjs`, `scripts/verify-interactions.mjs` y scripts Python siguen rastreados por git, mientras que las suites y scripts recientes permanecen en disco sin seguimiento por `.gitignore`. | `.gitignore:8,16` + `git status --ignored --short` |

### 1.2 Resultados Verificados de Pruebas, Auditorías Estáticas y Verificación Browser

| Comando / Suite | Código de salida | Resultado verificado | Detalles observados |
|---|---|---|---|
| `node --test tests/*.test.mjs tests/*/*.test.mjs` | `0` | **PASS (377 / 377)** | 42 archivos `.test.mjs` (4 en raíz, 11 `cuadraticas`, 13 `exponenciales`, 8 `learning`, 2 `potencias-raices`, 2 `sucesiones`, 2 `valor-absoluto`). 377 aprobados, 0 fallidos, 0 omitidos. Emite `ExperimentalWarning` esperado cuando `ProgressStore` prueba `localStorage` sin `--localstorage-file` y cae de forma segura a `MemoryStorage`. |
| `node scripts/audit-exponenciales.mjs` | `0` | **PASS (9 / 9)** | 0 emojis, 0 `eval`, 17 poses, 20 guiones VN, 10 competencias y 10 diagnósticos, 30 chequeos con 90 pistas, 10 familias PRNG + 5 Trampas, 13 términos de glosario. |
| `node scripts/audit-cuadraticas.mjs` | `0` | **PASS** | 10 widgets SVG (`.quad-board-svg`), 10 competencias y 10 diagnósticos, 20 guiones VN (100 globos), 30 preguntas y 90 pistas, 10 familias PRNG + 5 Trampas, 0 emojis, 0 `eval`. |
| `node scripts/audit-potencias-raices.mjs` | `1` | **PRE-EXISTING FAIL** | Falla en `scripts/audit-potencias-raices.mjs:129`: `AssertionError [ERR_ASSERTION]: El glosario debe tener nueve términos. 33 !== 9`. `js/core/glossary.js` creció a 33 términos al incorporar Exponenciales (+12) y Cuadráticas (+12), mientras esta auditoría previa aún exige igualdad exacta `=== 9`. |
| `node scripts/verify-pages.mjs` | `0` | **PASS (9 / 9 páginas)** | Verifica `index.html` + 8 laboratorios en `320`, `375`, `390`, `768`, `1024`, `1280` y `1440` px. 0 errores de consola, 0 desbordes horizontales, verifica `.curriculum-card` `=== 9` (`menuHasNineUnits`). |
| `node scripts/verify-interactions.mjs` | `0` | **PASS (5 / 5 suites)** | Verifica interacciones E2E en `sucesiones.html`, `valor-absoluto.html`, `potencias-raices.html`, `exponenciales.html` y `cuadraticas.html` (0 errores de consola, `viewportOverflowFree: true`). *Nota:* `desigualdades.html`, `unidades.html` y `funciones.html` todavía no están incluidos en este script. |

### 1.3 Inventario HTML, Hub (`index.html`) y Navegación (`js/core/nav.js`)

- **Inventario HTML actual en raíz (10 archivos `.html`):** `index.html`, 8 laboratorios activos (`desigualdades.html`, `unidades.html`, `potencias-raices.html`, `funciones.html`, `valor-absoluto.html`, `sucesiones.html`, `cuadraticas.html`, `exponenciales.html`) y 1 redirección heredada (`laboratorio_unidades.html` → `unidades.html`).
- **`index.html` (212 líneas) + `js/hub.js` (5 líneas):** Lista únicamente 8 entradas en orden histórico de creación (faltan U03, U04, U06, U07, U09, U10 y U11), exhibe badges `.hub-badge-new` (`¡nuevo!`) en `exponenciales.html` (L196–201) y `cuadraticas.html` (L165–170), y carece de panel de reentrada de baja fricción (*Continuar / Repasar / Explorar*) o acceso al **Cuaderno de Misterios Abiertos**.
- **`js/core/nav.js` (752 líneas):**
  - `PAGES` (L8–18) contiene 9 entradas (`inicio` + 8 labs); `CURRICULUM_UNITS` (L20–109) solo define **9 unidades** (`1` a `9`, faltando Unidad 10 *Razones trigonométricas* y Unidad 11 *Funciones trigonométricas*).
  - **Bug en `resolveCurrentUnit(current)` (L334–349):** Resuelve Unidades 1, 2 y 8 (`exponenciales`), pero **omite `'cuadraticas'`** (Unidad 5), devolviendo `{ unit: null, itemId: null }` en `cuadraticas.html`.
  - **Textos hardcodeados e imprecisos en el drawer:** `'aria-label': 'Mapa curricular de las nueve unidades'` (L468), `'Mapa curricular · 9 unidades'` (L478) y `'3 unidades con laboratorios activos · 6 unidades en construcción'` (L481), cuando ya existen **4 unidades activas** (U01, U02, U05, U08).

---

## 2. Alineación Estructural: Cuadernillo (10 Capítulos) vs. Programa del Lab (11 Unidades / 15+2 Páginas)

El índice oficial del cuadernillo (`Módulo Introducción a la Matemática.md:17-46`, pág. 1) lista **10 capítulos temáticos**, **2 bloques integradores** y **evaluaciones anteriores**. Alaska Math Lab (`nav.js` y `ORIGINAL_REQUEST.md` §R3–R5) organiza la ruta curricular en **11 Unidades (01–11)** al promover la subsección *«Sistemas de ecuaciones lineales con dos incógnitas»* (págs. 42–49 del capítulo 3 del cuadernillo) a una unidad propia (Unidad 04):

| Unidad Lab | Título en Programa Lab | Capítulo / Páginas en Cuadernillo Oficial | Laboratorios / Páginas HTML | Estado |
|---|---|---|---|---|
| **01** | Números reales | Cap. 1: *Números Reales* (pp. 2–20) | `potencias-raices.html`, `desigualdades.html`, `unidades.html` (+ `valor-absoluto.html#sec-1` puente 1D) | 3 labs existentes (sin instrumentar en `core/learning/`) |
| **02** | Funciones | Cap. 2: *Funciones* (pp. 21–36) | `funciones.html`, `valor-absoluto.html`, `sucesiones.html` | 3 labs existentes (sin instrumentar en `core/learning/`) |
| **03** | Función lineal | Cap. 3 (Parte I): *Función lineal* (pp. 37–41, 45–49) | `lineal.html` (Nuevo) | Faltante (`status: 'soon'`) |
| **04** | Sistemas de ecuaciones | Cap. 3 (Parte II): *Sistemas de ecuaciones lineales con dos incógnitas* (pp. 42–49) | `sistemas.html` (Nuevo) | Faltante (`status: 'soon'`) |
| **05** | Función cuadrática | Cap. 4: *Función cuadrática* (pp. 50–61) | `cuadraticas.html` (Existente) | Activo, instrumentado (con brechas de IDs/DAG) |
| **06** | Polinomios | Cap. 5: *Polinomios* (pp. 62–73) | `polinomios.html` (Nuevo) | Faltante (`status: 'soon'`) |
| *Int. 1* | *Actividades de integración (1)* | *Actividades de integración (1)* (pp. 74–76, cubre U01–U06) | **Jefe Integrador 1** (Nuevo) | Faltante |
| **07** | Función racional e irracional | Cap. 6: *Función racional e irracional* (pp. 77–88) | `racionales-irracionales.html` (Nuevo, 2 submódulos) | Faltante (`status: 'soon'`) |
| **08** | Función exponencial | Cap. 7: *Función exponencial* (pp. 89–96) | `exponenciales.html` (Existente) | Activo, instrumentado (con brechas de IDs/DAG) |
| **09** | Función logarítmica | Cap. 8: *Función logarítmica* (pp. 97–104) | `logaritmicas.html` (Nuevo) | Faltante (`status: 'soon'`) |
| **10** | Razones trigonométricas | Cap. 9: *Razones trigonométricas* (pp. 105–113) | `razones-trigonometricas.html` (Nuevo) | Faltante (`status: 'soon'`) |
| **11** | Funciones trigonométricas | Cap. 10: *Funciones trigonométricas* (pp. 114–126) | `funciones-trigonometricas.html` (Nuevo) | Faltante (`status: 'soon'`) |
| *Int. 2 / Global* | *Integración (2) y Evaluaciones* | *Actividades de integración (2)* (pp. 127–129) + *Evaluaciones* (pp. 130–156) + *Fórmulas* (pp. 157–158) | **Jefe / Simulacro Integrador Global** (Nuevo) | Faltante |

**Resumen cuantitativo:** 11 unidades curriculares = **15 páginas de laboratorio** (8 existentes + 7 nuevas) + **2 evaluaciones integradoras** (Jefe Integrador 1 y Jefe/Simulacro Integrador Global) + `index.html` (+ redirección heredada `laboratorio_unidades.html`).

---

## 3. Auditoría de Estado Real de los 8 Laboratorios Existentes

| Laboratorio (`html` / `js/modules/`) | Unidad `nav.js` | Secciones / Widgets | Chequeos y Retos PRNG | Evaluador / Diagnóstico | Persistencia actual | Conexión `core/learning/` | Anomalías, Deuda Técnica y Brechas Verificadas |
|---|---|---|---|---|---|---|---|
| `desigualdades.html` (`circuitos/`) | U01 | 1 pizarra única (`logic.js`, `render.js`) | 0 `CHECKS_DATA`; 4 `PRESETS` y 5 `RETOS` de configuración | `compute()` verifica `setStr` contra `RETOS[i].set`; **sin** `diagnose*` | Ninguna | **No** (`MODULE_IDS` tampoco lo incluye) | Sin `competencies-map.js`, sin `learning-adapter.js`, sin `CHECKS_DATA` (8-tupla), sin POE ni pistas graduales, sin resolución algebraica de inecuaciones lineales/cuadráticas, sin tests en `tests/`, excluido de `verify-interactions.mjs`. |
| `unidades.html` (`dimensional/`) | U01 | 1 pizarra única (`logic.js`, `render.js`) | 0 `CHECKS_DATA`; 5 `PROBLEMS` manipulables | `compute()` verifica `sameUnits`, `neutral`, `stacked`, `predictionOk`, `cubeApplied`; **sin** `diagnose*` | Ninguna | **No** (`MODULE_IDS` tampoco lo incluye) | **`#solve` ("Ver solución") en `dimensional/index.js:65` carga `PROBLEMS[st.p].sol` haciendo que `compute()` devuelva `solved: true` sin marcar intento asistido/revelado.** Tiene POE parcial (`#predict-up/down`) sin etapa de formalización ni bloqueo. Redirección heredada `laboratorio_unidades.html`. Sin tests ni inclusión en `verify-interactions.mjs`. |
| `potencias-raices.html` (`potencias-raices/`) | U01 | 10 secciones (`sec-1`..`sec-10`), 10 widgets | 30 `CHECKS_DATA` (sin 8-tupla ni `id`); 8 familias PRNG + 5 Trampas | AST `expr.js` + `diagnosePowRad` (9 reglas + `unsimplified_radical`) | `potencias_raices:progreso:v1` (`sec-1:0`), `:seed`, `:sidebar` | **No** (`MODULE_IDS` reservado) | **Etiqueta visual en HTML (`potencias-raices.html:39,150`) dice `"Unidad 11"`**, contradiciendo `nav.js` (U01). `saveProgress` guarda `true` sin distinguir ayuda/solución. Sin `competencies-map.js`, `learning-adapter.js`, `migrations.js`, `createPredictBox` 2-etapas ni `mountCompetencyDashboard` (`#sec-repaso` estático). Importa `css/modules/valor-absoluto.css` (L26) y carga Google Fonts (L17–22). |
| `funciones.html` (`funciones/`) | U02 | 4 pestañas (`scanner`, `radiografia`, `secante`, `inversa`) | 0 `CHECKS_DATA`; 1 mini-quiz de 3 opciones en `radiografia.js:302-330`; 0 `retos.js` | Lógica en controladores DOM; **sin** `logic.js`/`expr.js`/`diagnose*` | Ninguna | **No** (`MODULE_IDS` tampoco lo incluye) | **`<title>` y cabecera (`funciones.html:13,27`, `funciones/index.js:2`) dicen `"Unidad 8"`**, contradiciendo `nav.js` (U02). Handles SVG (`bindSvgDrag`) sin accesibilidad de teclado (`tabindex="0"`, `role="slider"`, flechas). Sin persistencia, sin `CHECKS_DATA`, sin `retos.js`, sin `competencies-map.js` ni `learning-adapter.js`, sin tests ni inclusión en `verify-interactions.mjs`. |
| `valor-absoluto.html` (`valor-absoluto/`) | U01 (`#sec-1`) + U02 | 10 secciones (`sec-1`..`sec-10`), 10 widgets | 30 `CHECKS_DATA` (sin 8-tupla); 8 familias PRNG + 5 Trampas + Boss «Escudo Deflector V» | AST `expr.js` + `diagnoseAbs` (7 IDs) + `validatePiecewiseFunction` | `valor_absoluto:progreso:v1` (booleano por sección) | **No** (`MODULE_IDS` reservado) | **`<title>` dice `"— Álgebra 1"` (L13) y existe un `<h1>` duplicado dentro de `<aside>` (`valor-absoluto.html:42`).** `css/modules/valor-absoluto.css` es compartido e importado por 4 páginas (`valor-absoluto`, `potencias-raices`, `cuadraticas`, `exponenciales`). Carga Google Fonts (L14–16). Varias preguntas/trampas tienen 1–2 pistas en vez de 3. Sin `competencies-map.js`, `learning-adapter.js`, `migrations.js`, `createPredictBox` 2-etapas, Split-Workbench ni `mountCompetencyDashboard`. |
| `sucesiones.html` (`sucesiones/`) | U02 | 11 secciones (`sec-1`..`sec-11`, con `sec-5a`/`sec-5b`: 12 claves), 12 widgets | 33 `CHECKS_DATA` (sin 8-tupla); 8 familias PRNG + 5 Trampas | AST `expr.js` + `diagnose()` (7 IDs en `logic.js:474`) | `sucesiones:progreso:v1` (booleano por `sectionId`) | **No** (`MODULE_IDS` reservado) | **Contenido completo es ampliación didáctica** (ausente del cuadernillo oficial). **Polución de almacenamiento:** `retos.js:433,450` escribe claves `seed-*` y `trampas-clasicas` en `sucesiones:progreso:v1`. **VN punitiva:** `sucesiones/components.js:500-512` dispara pose `enojada` con texto reprobatorio en `failCount >= 2` (viola `LEARNING_ARCHITECTURE.md` §4.9 y §7.2). Algunas preguntas tienen 1–2 pistas; sin `competencies-map.js`, `learning-adapter.js`, `migrations.js`, `createPredictBox`, Split-Workbench ni `mountCompetencyDashboard`. |
| `cuadraticas.html` (`cuadraticas/`) | U05 | 10 secciones (`sec-area-binomios`..`sec-optimizacion-extremos`), 10 widgets | 30 `CHECKS_DATA` (8-tupla completa); 10 familias PRNG + 5 Trampas | AST `expr.js` + `diagnoseQuad` (10 IDs) | `cuadraticas:progreso:v1` + `alaska:learning:v1` | **Sí** | `nav.js` `resolveCurrentUnit('cuadraticas')` devuelve `null`. `migrateLegacyProgress()` nunca se invoca al inicio; `CUAD_ITEM_TO_COMPETENCY` (`migrations.js:62-103`) mapea erróneamente `sec2-q*` a `grouping_and_factoring_strategy` y `sec3-q*` a `parabola_geometry_and_parameters`, y `progress-store.js:136-147` usa IDs desactualizados. **Drift en `LEARNING_ARCHITECTURE.md` §6.9** (8 IDs no coinciden con `QUAD_COMPETENCIES`). Carga Google Fonts (`cuadraticas.html:17-22`); `#sec-retos` (L880) dice `"8 familias"` en vez de 10. DAG solo intra-módulo. |
| `exponenciales.html` (`exponenciales/`) | U08 | 10 secciones (`sec-1`..`sec-10`), 10 widgets | 30 `CHECKS_DATA` (8-tupla completa); 10 familias PRNG + 5 Trampas | AST `expr.js` + `diagnoseExp` (10 IDs) | `exponenciales:progreso:v1` + `alaska:learning:v1` | **Sí** | **Doble escritura de maestría:** `exponenciales/components.js:129-194` llama a `recordExpAttempt()` (`alaska:learning:v1`) y además ejecuta localmente `evaluateCompetencyMastery()` escribiendo `state.competencies` en `exponenciales:progreso:v1`, generando riesgo de divergencia. **7/10 IDs en `progress-store.js:124-135` y `migrations.js:19-60`** no coinciden con `EXP_COMPETENCIES` (dependen de `COMPETENCY_ALIASES` y `migrateLegacyProgress()` tampoco se invoca). **Drift en `LEARNING_ARCHITECTURE.md` §6.9** (3 IDs + `analisis_monotonia_cuadrantes` vs `exponenciales/index.js:1298`). Carga Google Fonts (`exponenciales.html:17-22`). DAG solo intra-módulo. |

---

## 4. Mapeo Curricular Detallado por Unidad (Contenidos Oficiales vs. Ampliaciones)

> **Regla de rigor curricular:** Todo contenido atribuido al programa oficial cita explícitamente páginas, definiciones, ejercicios o exámenes de `agent/Contexto/Módulo Introducción a la Matemática.md`. Toda extensión conceptual, metáfora o generalización se etiqueta explícitamente como **Ampliación didáctica o matemática** (nunca atribuida al cuadernillo oficial).

### Unidad 01 — Números reales (`potencias-raices.html`, `desigualdades.html`, `unidades.html`, puente `valor-absoluto.html#sec-1`)
- **Contenidos obligatorios del cuadernillo oficial (Cap. 1, pp. 2–20):**
  - Conjuntos numéricos $\mathbb{N}, \mathbb{Z}, \mathbb{Q}, \mathbb{I}, \mathbb{R}$ y pertenencia (pp. 2–3, Ej. 1, 11).
  - Potenciación ($a^1, a^0=1, a^{-n}, (ab)^n, a^n\cdot a^m, a^n:a^m, (a^n)^m$) y no distributividad $(a\pm b)^n \neq a^n\pm b^n$, cuadrado y cubo de binomio $(a\pm b)^2, (a\pm b)^3$ (p. 3, Ej. 2–3, 9–10; 1° Parcial 2025 Ej. 2a–d p. 148).
  - Radicación en $\mathbb{R}$ ($n$ par $\ge 0$ vs $n$ impar $\in \mathbb{R}$), propiedades, $\sqrt[n]{a^n}=|a|$ si $n$ par vs $a$ si $n$ impar, exponentes racionales $a^{m/n}$ y $a^{-m/n}$, extracción de factores, simplificación, racionalización de denominadores (monomios y binomios conjugados) y operaciones exactas con radicales (pp. 4–7, Ej. 4–7; Global 2023 Ej. 2d p. 145; Global 2025 Ej. 2b p. 154).
  - Aplicaciones geométricas exactas (perímetro/área/diagonal con radicales, Pitágoras, Ej. 8, 12e–g, 14–15, 19; TP1 2022 Ej. 2 p. 136), notación científica (Ej. 10c, 13a), porcentajes, IVA y recargos/descuentos en ecuaciones lineales (Ej. 10–13, 16–18; Global 2022 Ej. 3 p. 142).
  - Valor absoluto $|x|$ (definición por tramos y 9 propiedades incluida desigualdad triangular), distancia $d(x;y)=|x-y|$ y ecuaciones $|x|=k$ (pp. 11–12, Ej. 20–21).
  - Intervalos reales (abiertos, cerrados, semiabiertos, infinitos), operaciones entre conjuntos ($\cup, \cap, -, \text{complemento}$) e inecuaciones lineales, dobles/encadenadas, cuadráticas factorizadas (por regla de signos) y con valor absoluto ($|x|\le k, |x|\ge k$) (pp. 13–16, Ej. 22–33; Int. 1 Ej. 2a p. 74).
  - Conversión de unidades implícita en problemas contextualizados (segundos→día en Ej. 13a, km→m en Trig Ej. 30, días→horas en Exp Int. 2 Ej. 5a, min→h en Global 2025 Ej. 6a).
- **Ampliaciones didácticas o matemáticas (NO atribuibles como capítulo propio del cuadernillo):**
  - *`desigualdades.html`*: metáfora de circuitos eléctricos en serie (`AND`/$\cap$) y paralelo (`OR`/$\cup$) y lectura de huecos por Leyes de De Morgan.
  - *`unidades.html`*: laboratorio dedicado de análisis dimensional mediante el neutro multiplicativo (`· 1`) con encastre de pines/huecos y conversiones de tasas compuestas ($\text{g/cm}^3 \to \text{kg/m}^3$).
  - *`potencias-raices.html`*: metáfora de «Dos mundos» (origen $+0$ vs origen $\times 1$), árboles de factores primos hasta índice 7 y modelización geométrica de cuadrados/cubos para exponentes $2$ y $3$.

### Unidad 02 — Funciones (`funciones.html`, `valor-absoluto.html`, `sucesiones.html`)
- **Contenidos obligatorios del cuadernillo oficial (Cap. 2, pp. 21–36):**
  - Concepto de función $f: A \to B$, unicidad, dominio, codominio, imagen, preimagen, representaciones (diagramas de Venn, tablas, gráficos, pares ordenados, fórmulas) y prueba gráfica de función (pp. 21–23, Ej. 1–3).
  - Clasificación: inyectividad, suryectividad, biyectividad y redefinición/restricción de dominio y/o codominio para lograr biyectividad (pp. 23–24, 31, Ej. 4–5, 13–14; TP1 2022 Ej. 1d p. 136; Global 2023 Ej. 1d p. 145).
  - Conjuntos $C_0, C^+, C^-$ (pp. 25–26, Ej. 6, 9; 1° Parcial 2025 Ej. 1 p. 148).
  - Continuidad y discontinuidad gráfica (agujeros/evitables y saltos/no evitables), asíntotas verticales/horizontales y lectura de tendencias ($x\to\pm\infty$, $x\to a^\pm$) (pp. 26–27, 30, Ej. 7, 9, 11).
  - Intervalos de crecimiento y decrecimiento ($I_\uparrow, I_\downarrow$) y máximos/mínimos relativos o locales (pp. 28–31, Ej. 8–12).
  - Funciones definidas por tramos presentes transversalmente en el cuadernillo (Cap. 3 Ej. 10 p. 41; Cap. 4 Ej. 13–14 p. 54; Int. 1 Ej. 6 p. 75; Cap. 6 Ej. 15 p. 82).
- **Ampliaciones didácticas o matemáticas (NO atribuibles al cuadernillo):**
  - *`funciones.html`*: tasa de cambio promedio / recta secante (`secante.js`, puente a Análisis I) y máquina de función inversa explícita por reflexión general (`inversa.js`; en el cuadernillo la inversa explícita recién se formula en Cap. 8 Logarítmica, p. 98–99).
  - *`valor-absoluto.html`*: graficación y transformaciones de $f(x)=a|x-h|+k$ en el plano (en el cuadernillo $|x|$ se define como función por tramos en Cap. 1 p. 11 y se usa en ecuaciones/inecuaciones 1D, no como familia paramétrica de gráficas en V) y funciones escalonadas piso $\lfloor x \rfloor$ / techo $\lceil x \rceil$ (`sec-10`, ausentes del cuadernillo).
  - *`sucesiones.html`*: **todo el módulo** (sucesiones aritméticas, geométricas, fórmulas recursivas y explícitas con dominio $\mathbb{N}$, noción de límite al infinito) es una **ampliación puente** basada en Khan Academy; no existe como tema del cuadernillo oficial UNMDP.

### Unidad 03 — Función lineal (`lineal.html` — Nuevo)
- **Contenidos obligatorios del cuadernillo oficial (Cap. 3, pp. 37–41, 45–49; Int. 1, pp. 74–76; Exámenes):**
  - Definición $f:\mathbb{R}\to\mathbb{R},\ f(x)=mx+b$, representación como recta, pendiente $m=\operatorname{tg}(\alpha)$ (ángulo con semieje $+X$), ordenada al origen $b$ y pertenencia de puntos (p. 37, Ej. 1–2, 4–5).
  - Pendiente entre dos puntos $m=(y_2-y_1)/(x_2-x_1)$ ($x_1\neq x_2$) y recta vertical sin pendiente ($x_1=x_2$) (p. 37, Ej. 6f).
  - Estudio analítico completo de la lineal ($Dom, Im, C_0, C^+, C^-$, biyectividad) y lectura de ecuaciones desde gráficos (p. 38, Ej. 2–3; 1° Parcial 2025 Ej. 5 p. 149).
  - Formas de la recta: explícita ($y=mx+b$), segmentaria ($x/a + y/b = 1$) e implícita ($ax+by+c=0$) (p. 38, Ej. 6g–h, 21c–d,g; Simulacro 2019 Ej. 2b, 6 pp. 131–132).
  - Posiciones relativas en el plano: secantes (perpendiculares $m_1=-1/m_2$, oblicuas) y paralelas (coincidentes, no coincidentes) (pp. 39–41, Ej. 6g–h, 8b, 21c,g; Int. 1 Ej. 2b p. 74).
  - Geometría analítica en el plano: punto medio $M$, distancia $d(P;Q)$, colinealidad, clasificación de triángulos por lados, **mediatriz de un segmento** (p. 40, Ej. 7–8a) y **distancia punto-recta** (Ej. 21a p. 45: $d(P(4;2), y=2x-1)=\sqrt{5}$).
  - Modelización lineal (represa con filtración Ej. 9 p. 41; conversión Celsius–Fahrenheit Ej. 21i p. 46; precio de soja 2019 p. 130; viaje en tren 2022 p. 137) y **función lineal por tramos** (Ej. 10 p. 41: $f(x)$ con tres tramos lineales/constantes, gráfica, $Dom, Im, C_0, C^+, C^-$, biyectividad).
- **Ampliaciones didácticas o matemáticas (NO atribuibles al cuadernillo):**
  - Tratamiento exhaustivo de casos degenerados al convertir implícita $\leftrightarrow$ segmentaria ($c=0$, rectas por el origen, $a=0$ horizontal, $b=0$ vertical que la segmentaria no representa) como tabla sistemática de restricciones; exploración interactiva de mediatriz como lugar geométrico equidistante; familias de funciones lineales por tramos adicionales más allá de Ej. 10.

### Unidad 04 — Sistemas de ecuaciones (`sistemas.html` — Nuevo)
- **Contenidos obligatorios del cuadernillo oficial (Cap. 3 §Sistemas, pp. 42–49; Int. 1, p. 74; Exámenes):**
  - Sistema $2\times 2$ ($ax+by=c,\ a'x+b'y=c'$), solución como punto en común $(x_0; y_0)$ de dos rectas $r_1, r_2$ (p. 42).
  - Resolución analítica (sustitución, igualación, reducción) de sistemas con fracciones y distribución (Ej. 11a–c p. 42, Ej. 21f p. 45).
  - Clasificación geométrica y algebraica: **Compatible Determinado (SCD)** (solución única, secantes), **Compatible Indeterminado (SCI)** (infinitas soluciones, paralelas coincidentes), **Incompatible (SI)** (sin solución, paralelas no coincidentes) (p. 42, Int. 1 Ej. 1c p. 74).
  - **Sistemas con parámetros** ($k \in \mathbb{R}-\{0\}$ o $a \in \mathbb{R}-\{1\}$) para determinar cuándo el sistema es SCD, SCI o SI (Ej. 12a–b p. 42, Ej. 21h p. 46).
  - **Reconstrucción del sistema desde una representación gráfica**, incluyendo rectas perpendiculares (Ej. 14–15 p. 44).
  - **Problemas de modelización** con 2 incógnitas: mezclas nutricionales/aceites, cinemática/encuentro (micro y auto), geometría/ángulos/perímetro, edades, monedas, descuentos porcentuales/IVA, menú de restaurant, empleados, reactivos químicos (Ej. 13a–f, 16–20 pp. 43–45; Simulacro 2019 Ej. 3 p. 131; TP1 2022 Ej. 3 p. 136; Global 2023 Ej. 3 p. 146; 1° Parcial 2025 Ej. 3 p. 148; Global 2025 Ej. 3 p. 154).
- **Ampliaciones didácticas o matemáticas (NO atribuibles al cuadernillo):**
  - Determinante $\Delta = ab' - a'b$ como indicador geométrico visual de paralelismo/singularidad (Cramer): **ampliación didáctica**, ya que el cuadernillo clasifica comparando pendientes/ordenadas o por eliminación algebraica sin introducir matrices ni determinantes. (No incluir sistemas $3\times 3$).

### Unidad 05 — Función cuadrática (`cuadraticas.html` — Existente)
- **Contenidos obligatorios del cuadernillo oficial (Cap. 4, pp. 50–61; Int. 1, pp. 74–76; Exámenes):**
  - Definición $f(x)=ax^2+bx+c$ ($a\neq 0$), concavidad, vértice $x_v=-b/(2a)$, eje de simetría, ordenada al origen $c$, resolvente, discriminante $\Delta=b^2-4ac$ ($\Delta>0, =0, <0$) y propiedades de raíces $x_1+x_2=-b/a,\ x_1\cdot x_2=c/a$ (p. 50, Ej. 1–3, 8–9).
  - Formas polinómica, canónica $a(x-x_v)^2+y_v$ y factorizada $a(x-x_1)(x-x_2)$, conversión entre formas, reconstrucción desde vértice/raíces/punto/gráfica (pp. 51–55, Ej. 4–7, 10–11, 15, 18–19; Simulacro 2019 Ej. 5 p. 131; TP1 2022 Ej. 5 p. 137; Global 2022 Ej. 5 p. 143).
  - Análisis completo ($Dom, Im, C_0, C^+, C^-, I_\uparrow, I_\downarrow$, biyectividad por restricción de rama) (Ej. 4–5, 15g, 19).
  - Intersección parábola–parábola y parábola–recta, condición de tangencia $\Delta_{\text{int}}=0$ (Ej. 15b,e pp. 54–55; Int. 1 Ej. 5 p. 75).
  - Problemas geométricos, proyectiles y optimización en dominios restringidos, incluido el cuadrado inscripto $S(x)$ en $[0; 16]$ con vínculo GeoGebra (Ej. 12, 16–17, 20–24 pp. 53–57; Int. 1 Ej. 4 p. 74; 1° Parcial 2025 Ej. 6 p. 149) y funciones por tramos cuadrático-lineales (Ej. 13–14 p. 54; Int. 1 Ej. 6 p. 75).
- **Ampliaciones didácticas o matemáticas (ya presentes en `cuadraticas.html`, NO atribuibles al cuadernillo):**
  - Modelo de área con fichas rectangulares para $(x+p)(x+q)$; método visual de «completar el cuadrado» con peaje $+0$ para deducir $x_v = -b/(2a)$ (el cuadernillo da $x_v = -b/(2a)$ directamente); brújula de factorización de 5 pasos con agrupación $m\cdot n = a\cdot c$ (el cuadernillo usa la fórmula resolvente para el trinomio general de 2° grado en Cap. 5 p. 67); escenario 3 de optimización «cerco contra un muro».

### Unidad 06 — Polinomios (`polinomios.html` — Nuevo)
- **Contenidos obligatorios del cuadernillo oficial (Cap. 5, pp. 62–73; Int. 1, pp. 74–76; Exámenes):**
  - Definición $P(x)=a_n x^n+\dots+a_0$ ($a_n\neq 0$), grado $\operatorname{gr}(P)$, coeficiente principal, término independiente, polinomio nulo (sin grado), mónico, ordenado y completo, igualdad y polinomios opuestos (p. 62, Ej. 1, 4, 9b).
  - Suma, resta, producto, leyes del grado ($\operatorname{gr}(P+Q)\le\max$, $\operatorname{gr}(P\cdot Q)=\operatorname{gr}(P)+\operatorname{gr}(Q)$, $\operatorname{gr}(P:Q)=\operatorname{gr}(P)-\operatorname{gr}(Q)$) y despeje de $P(x)$ (pp. 63–65, Ej. 2–3, 5, 9c).
  - Algoritmo de división $P(x)=Q(x)C(x)+R(x)$ ($\operatorname{gr}(R)<\operatorname{gr}(Q)$ o $R=0$) y divisibilidad (p. 63, Ej. 9a).
  - **Regla de Ruffini** para divisores $(x-a)$ (y caso con divisor lineal no mónico $3x+1$ en Ej. 6e p. 65, resp. p. 71 reescalando cociente), **Teorema del Resto** ($R = P(a)$) y consecuencias ($P(a)=0 \iff (x-a)\mid P(x)$) (pp. 64–66, Ej. 6–9e; Int. 1 Ej. 7 p. 75).
  - Factorización en producto de $a_n$ por polinomios mónicos primos (lineales y cuadráticos irreducibles en $\mathbb{R}$), teorema «un polinomio de grado $n$ tiene a lo sumo $n$ raíces reales contadas con su multiplicidad», y los **6 métodos de factorización** (factor común, común por grupos, diferencia de cuadrados, trinomio de 2° grado vía resolvente, trinomio cuadrado perfecto, cuatrinomio cubo perfecto) (p. 67, Ej. 10–17).
  - **Teorema de Gauss** ($p\mid a_0,\ q\mid a_n$ para coeficientes enteros y $a_0\neq 0$), raíces racionales e irracionales (combinando Gauss + Ruffini + resolvente, Ej. 18–21 pp. 68–69; Int. 1 Ej. 2d, 8 pp. 74–75; Simulacro 2019 Ej. 4 p. 131; TP1 2022 Ej. 6 p. 137; 1° Parcial 2025 Ej. 4 p. 149; Global 2025 Ej. 4 p. 155) y modelado de volumen de prismas/cubos (Ej. 22–23 p. 70).
- **Ampliaciones didácticas o matemáticas (NO atribuir al cuadernillo):**
  - Regla gráfica de paridad de multiplicidad (cruce vs. rebote tangente vs. inflexión en $m=3$ y bosquejo de curvas polinómicas de grado $\ge 3$ con tabla de $C^+/C^-$): el cuadernillo **solo** usa la multiplicidad en forma algebraica/factorizada (doble/triple en Ej. 10, 12, 16, 21b, p. 67 y exámenes) y **no** pide graficar ni estudiar $C^+/C^-$ de polinomios de grado $\ge 3$.
  - Regla de signos de Descartes, raíces complejas conjugadas y algoritmo general de Horner más allá de Ruffini.

### Unidad 07 — Función racional e irracional (`racionales-irracionales.html` — Nuevo, 2 submódulos)
- **Contenidos obligatorios del cuadernillo oficial (Cap. 6, pp. 77–88; Int. 2, pp. 127–129; Exámenes):**
  - *Submódulo Racional:*
    - Expresiones algebraicas racionales $P(x)/Q(x)$ ($Q\neq 0$), simplificación declarando explícitamente el dominio de validez, polinomio múltiplo común mínimo $M(x)$, suma, resta, producto, cociente y operaciones combinadas (pp. 77–78, Ej. 1–6).
    - Ecuaciones racionales (con exclusión de raíces del denominador) e inecuaciones racionales simples (Ej. 7, 16, 17d–e, 18 pp. 78, 82–83; TP2 2022 Ej. 3 p. 139; 2° Parcial 2025 Ej. 3 p. 151).
    - Función racional: dominio máximo $\mathbb{R}-\{Q(x)=0\}$, ceros $C_0$ (raíces de $P$ dentro de $Dom(f)$), **criterio de multiplicidad para distinguir puntos agujero (discontinuidad evitable, $\operatorname{mult}_P(a)\ge\operatorname{mult}_Q(a)$, ordenada evaluada en la simplificada) vs. asíntotas verticales ($\operatorname{mult}_P(a)<\operatorname{mult}_Q(a)$)** — con el contraste explícito $(x^2-1)/(x-1)$ vs $(x-1)/(x-1)^2$ en p. 79 —, **asíntotas horizontales** por grados ($\operatorname{gr}P=\operatorname{gr}Q \implies y=a_n/b_m$, $\operatorname{gr}P<\operatorname{gr}Q \implies y=0$, $\operatorname{gr}P>\operatorname{gr}Q \implies$ no tiene A.H.) (pp. 79–84, Ej. 8–11, 17c, 19–20; Int. 2 Ej. 2, 3b p. 127; Exámenes pp. 133, 139, 142, 146, 148, 152, 154). Igualdad de funciones racionales por dominio (Ej. 9 p. 81).
  - *Submódulo Irracional:*
    - Función irracional $f(x)=k\sqrt[n]{g(x)}$: dominio máximo ($n$ impar $\implies \operatorname{Dom} g$, $n$ par $\implies \{x\in\operatorname{Dom} g : g(x)\ge 0\}$) (pp. 81–83, Ej. 12, 17a,f; Int. 2 Ej. 3a p. 127).
    - Ecuaciones irracionales verificando pertenencia al dominio y descartando **soluciones extraviadas** introducidas al elevar al cuadrado (Ej. 13, 17b pp. 82–83).
    - Gráfica, imagen, $C_0$ e intersecciones de funciones radicales desplazadas/reflejadas ($2-\sqrt{x+1}$, $3-\sqrt{7x-1}$, $2-\sqrt{-x+3}$) (Ej. 14, 17g, 21 pp. 82–84) y funciones por tramos mixtas con rama racional o radical (Ej. 15 p. 82).
- **Ampliaciones didácticas o matemáticas (NO atribuir al cuadernillo):**
  - Asíntotas oblicuas ($\operatorname{gr}P=\operatorname{gr}Q+1$): el cuadernillo en p. 80 corta explícitamente en «si $\operatorname{gr}(P(x)) > \operatorname{gr}(Q(x)) \implies$ no tiene A.H.» y no incluye asíntotas oblicuas.
  - Análisis completo de $C^+/C^-$ por cuadros de signos para racionales de grado superior al homográfico (en el cuadernillo se pide en lectura gráfica, ej. 1° Parcial 2025 Ej. 1f p. 148, o en ecuaciones simples).

### Unidad 08 — Función exponencial (`exponenciales.html` — Existente)
- **Contenidos obligatorios del cuadernillo oficial (Cap. 7, pp. 89–96; Int. 2, pp. 128–129; Exámenes):**
  - Situaciones de duplicación y desintegración al 50% (amebas y masa radiactiva, Ej. 1–2 pp. 89–90); definición $f(x)=k\cdot a^x$ ($a\in\mathbb{R}^+-\{1\},\ k\in\mathbb{R}-\{0\}$) y base natural $e^x$ (pp. 90–91, Ej. 3).
  - Simetría $(1/a)^x = a^{-x}$, asíntota $y=0$, monotonía en los 4 cuadrantes de $(k, a)$, imagen abierta, inyectividad y restricción de codominio $\mathbb{R}^+$ o $(-\infty; 1)$ para biyectividad (pp. 91–94, Ej. 4–6, 11, 12b).
  - Reconstrucción de $f(x)=k\cdot a^x$ desde dos puntos o gráfica (Ej. 7, 12c, 13 pp. 92, 94).
  - Ecuaciones y sistemas exponenciales resolubles sin logaritmos (igualación de bases, factor común, sustitución cuadrática $u=a^x>0$) (pp. 92–94, Ej. 8–9, 12a,d–f; Int. 2 Ej. 4a p. 128; Global 2022 Ej. 2a p. 142; 2° Parcial 2025 Ej. 2b p. 151).
  - Modelos temporales (carbono-14, talio vida media $t/3$, $+12\%$ cada 5 años, salmón, bacterias $+3,5\%$ cada $10\text{ h}$, vacuna $e^{-0,3t}$, isótopo $e^{-0,05t}$) (Ej. 10 p. 93; Int. 2 Ej. 5a p. 128; Exámenes pp. 140, 151, 155) y análisis completo de exponenciales trasladadas verticalmente $c - (1/a)^x$ (Ej. 14 p. 94; TP2 2022 Ej. 5 p. 140; 2° Parcial 2025 Ej. 1 p. 151).
- **Ampliaciones didácticas o matemáticas (ya presentes en `exponenciales.html`, NO atribuibles al cuadernillo):**
  - Discriminación tabular lineal vs. exponencial vs. cuadrática (integración Khan Academy); exploración continua de densidad racional y casos degenerados ($a=0, a=1, a<0$); desplazamiento horizontal general $h\neq 0$ en gráficas $k\cdot a^{x-h}+c$ (en el cuadernillo $h\neq 0$ aparece dentro de ecuaciones, mientras las gráficas desplazadas usan $c \pm a^x$).

### Unidad 09 — Función logarítmica (`logaritmicas.html` — Nuevo)
- **Contenidos obligatorios del cuadernillo oficial (Cap. 8, pp. 97–104; Int. 2, pp. 127–129; Exámenes):**
  - Definición $\log_a x = y \iff a^y = x$ ($a\in\mathbb{R}^+-\{1\},\ x\in\mathbb{R}^+$), logaritmo decimal ($\log x$) y natural ($\ln x$), conversión exponencial $\leftrightarrow$ logarítmica (p. 97, Ej. 1–2).
  - Las **5 propiedades operativas**: producto, cociente, potencia del argumento ($\log_a(x^n)=n\log_a x$), raíz del argumento ($\log_a(\sqrt[n]{x})=\frac{1}{n}\log_a x$) y **cambio de base** ($\log_a x = \log_b x / \log_b a$) (pp. 97–100, Ej. 3–5, 12a–b; Int. 2 Ej. 3c–d p. 127; Simulacro 2019 Ej. 2a p. 133 — detección de error $\log_a\sqrt{8}\cdot\log_a 4$ —; TP2 2022 Ej. 2 p. 139; Global 2022 Ej. 2b p. 142; Global 2023 Ej. 2c p. 145; 2° Parcial 2025 Ej. 2a p. 151; Global 2025 Ej. 2a p. 154).
  - Ecuaciones logarítmicas y exponenciales no reducibles por base común ($4^x=9,\ 5^{2x+4}-20=0,\ e^{2x}-e^x-6=0$) y sistemas de ecuaciones logarítmicos/mixtos verificando positividad de argumento y validez de base (p. 98, Ej. 6–7, 12d,f; Int. 2 Ej. 4b p. 128).
  - **Función logarítmica como inversa de la exponencial** ($\mathbb{R}^+\to\mathbb{R}$, gráfica, simetría respecto de $y=x$, corte $(1;0)$, asíntota vertical $x=0$, monotonía $a>1$ vs $0<a<1$, análisis de funciones desplazadas como $\log_{1/2}(x+1)$ o $\log_2(4-x)$, cálculo de inversa explícita como $f(x)=2e^x-3$, intersección entre gráficas logarítmicas) (pp. 98–100, Ej. 8–11, 12c,e; Simulacro 2019 Ej. 5 p. 134).
  - Aplicaciones reales resueltas con logaritmos: cultivos bacterianos $e^{3t}$, descontaminación de lago $e^{-0,231t}$, escala de Richter $M=\log(p)$, velocidad de partícula, eliminación de medicamento, presión atmosférica, crecimiento de árbol $\log_{1,5}(t+25)$ y modelo logístico (pp. 100–102, Ej. 13–21; Exámenes pp. 134, 140, 143, 146, 151, 155).
- **Ampliaciones didácticas o matemáticas (NO atribuibles al cuadernillo):**
  - Laboratorio contrastivo sistemático de **todas** las identidades falsas clásicas ($\log_a(x+y)\neq\log_a x+\log_a y$, $(\log_a x)^2\neq 2\log_a x$, $\log_a x/\log_a y\neq\log_a(x-y)$) como diagnóstico preventivo (en el cuadernillo solo aparece el error de producto $\log_a\sqrt{8}\cdot\log_a 4$ en Simulacro 2019 p. 133); deslizador interactivo de reflexión especular continua respecto de $y=x$ y comparador logarítmico de órdenes de magnitud (Richter/pH).

### Unidad 10 — Razones trigonométricas (`razones-trigonometricas.html` — Nuevo)
- **Contenidos obligatorios del cuadernillo oficial (Cap. 9, pp. 105–113; Int. 2, p. 128; Exámenes):**
  - Triángulo rectángulo: Teorema de Pitágoras, ángulos agudos complementarios ($\hat{B}+\hat{C}=90^\circ$) y razones $\operatorname{sen}, \cos, \operatorname{tg}$ (SOHCAHTOA) (p. 105).
  - Resolución de triángulos rectángulos (lados y ángulos en sistema sexagesimal $^\circ\ '\ ''$) (p. 106, Ej. 1–2, 7–8, 17–18).
  - Problemas de **ángulos de elevación y depresión** y doble observación topográfica (Ej. 3–4, 6, 11, 25–26, 28–29, 32, 34–35; TP2 2022 Ej. 6 p. 140; 2° Parcial 2025 Ej. 6 p. 152; Int. 2 Ej. 5b p. 128).
  - Geometría plana y espacial: rombos, trapecios, **polígonos regulares** (lado, apotema, radio de circunferencia circunscripta, área), cuerdas y ángulo central, diagonal de prisma rectangular y volumen de pirámide de base cuadrada (pp. 106–111, Ej. 5, 9–10, 12–16, 19–21, 31, 33, 36; Global 2023 Ej. 6a p. 146; Anexo pp. 157–158).
  - Triángulos oblicuángulos presentes en la guía (Ej. 22, 23, 24, 27, 30 pp. 108–110: descomposición en triángulos rectángulos por altura o distancia entre dos caminos/barcos con ángulo conocido).
- **Discrepancia curricular detectada y Ampliaciones didácticas o matemáticas:**
  - **Ubicación de sistemas de medición angular y longitud de arco:** `ORIGINAL_REQUEST.md` §R5 solicita incluir «sistemas sexagesimal y circular» y «longitudes de arco» en Unidad 10 (`razones-trigonometricas.html`). Sin embargo, en el cuadernillo oficial, el bloque *«Sistemas de medición de ángulos»* (sistema sexagesimal, sistema circular/radián, regla $\pi\text{ rad} \leftrightarrow 180^\circ$ y longitud de arco, Ej. 1–5) pertenece al inicio del **Capítulo 10 (Unidad 11, pág. 114)**. En el laboratorio se incluirá el conversor angular y de arco en U10 como puente hacia U11 (atendiendo §R5), dejando explícito que su fuente oficial es la pág. 114.
  - **Teorema del Seno y del Coseno:** El recuadro teórico de la pág. 105 no enuncia explícitamente los teoremas del seno ni del coseno, aunque los ejercicios 22, 27 y 30 (triángulos no rectángulos con dos lados y el ángulo comprendido, ej. barcos a $125^\circ$) los requieren o exigen trazado de altura auxiliar. Su incorporación como herramienta explícita para oblicuángulos se etiqueta como **ampliación puente**.

### Unidad 11 — Funciones trigonométricas (`funciones-trigonometricas.html` — Nuevo)
- **Contenidos obligatorios del cuadernillo oficial (Cap. 10, pp. 114–126; Int. 2, pp. 127–129; Exámenes):**
  - Sistemas sexagesimal y circular (radián, $\pi\text{ rad}\leftrightarrow 180^\circ$, longitud de arco y ángulo interior de polígono regular en radianes) (p. 114, Ej. 1–5).
  - **Congruencia de ángulos y clases de congruencia $C_\alpha$** en ambos sistemas ($\alpha-\beta = k\cdot 360^\circ$ o $2k\pi$, representante principal en $[0^\circ;360^\circ)$ o $[0;2\pi)$) (p. 115, Ej. 6–8, 14a–b; Int. 2 Ej. 1a p. 127).
  - Definición cartesiana de las **6 funciones trigonométricas** ($\operatorname{sen}, \cos, \operatorname{tg}, \operatorname{cosec}, \sec, \operatorname{cotg}$) mediante $(\text{abs}, \text{ord}, \text{r.v.})$ y signos por cuadrante (I–IV) (p. 116, Ej. 9).
  - Gráficas y estudio diferenciado de las **6 funciones**: dominio y valores excluidos ($\frac{\pi}{2}+k\pi$ para $\operatorname{tg}/\sec$ vs $k\pi$ para $\operatorname{cotg}/\operatorname{cosec}$), imagen ($[-1;1]$ vs $\mathbb{R}$ vs $(-\infty;-1]\cup[1;+\infty)$), ceros y ecuaciones elementales en $[0;2\pi)$ y $\mathbb{R}$ (usando clases $C_\alpha$), intervalos de signo, períodos ($2\pi$ vs $\pi$) y restricción de dominio/codominio para biyectividad (pp. 116–121, Ej. 10–17; Int. 2 Ej. 1b–d p. 127; Global 2023 Ej. 6b p. 146; Global 2025 Ej. 5 p. 155).
  - Relaciones trigonométricas de un mismo ángulo (relación pitagórica $\operatorname{sen}^2\alpha+\cos^2\alpha=1$, cocientes y recíprocas, cálculo exacto dado cuadrante y una razón), valores exactos de ángulos notables ($0, \pi/6, \pi/4, \pi/3, \pi/2$), reducción al I cuadrante e identidades trigonométricas (pp. 121–122, Ej. 18–20; Global 2022 Ej. 6 p. 143).
  - Ecuaciones trigonométricas en $[0;\pi/2]$, $[0;2\pi)$ y $\mathbb{R}$ (con unión de clases $C_\alpha$, cuadráticas en $\operatorname{sen}/\cos$ y control de dominio en denominadores/$\operatorname{tg}/\sec$) (pp. 122–123, Ej. 21–23; Simulacro 2019 Ej. 4 p. 134; Int. 2 Ej. 4c p. 128).
- **Ampliaciones didácticas o matemáticas (NO atribuibles al cuadernillo):**
  - Explorador de transformación sinusoidal $f(x)=A\operatorname{sen}(Bx-C)+D$ (amplitud, frecuencia, corrimiento de fase): el cuadernillo trabaja únicamente las 6 funciones trigonométricas canónicas sin traslaciones ni escalamientos sinusoidales.
  - Visualización de los 6 segmentos geométricos en la circunferencia trigonométrica de radio $r=1$ (el cuadernillo define mediante radio vector general `r.v.` en el plano cartesiano).

### Integración 1 y Evaluador Global / Simulacros
- **Actividades de integración (1) (pp. 74–76 → Jefe Integrador 1):** Integra Unidades 01–06 (propiedades de potencias, sistemas SCI/SI, intervalos/distancia en $\mathbb{R}$, perpendicularidad de rectas, discriminante cuadrático, raíces racionales de cúbicas, recta–parábola, función por tramos cuadrática, parámetro en divisibilidad/Ruffini, factorización con parámetro).
- **Actividades de integración (2) (pp. 127–129) + 8 Evaluaciones/Simulacros (pp. 130–156) → Jefe / Simulacro Integrador Global:** Integra Unidades 01–11 (congruencia trigonométrica, dominio de radicales e imagen de $\operatorname{tg}$, reconstrucción gráfica de racionales homográficas y con hueco, propiedades de logaritmos y corrección de errores, ecuaciones exponenciales/logarítmicas/trigonométricas, modelado temporal continuo y discreto, trigonometría aplicada, sistemas lineales y factorización de polinomios).

---

## 5. Matriz Completa de Competencias y Prerrequisitos (DAG Acíclico — 88 Competencias)

> **Política de validación:** 88 competencias distribuidas en 15 módulos (11 unidades). Verificada programáticamente con **0 ciclos, 0 autorreferencias, 0 IDs duplicados, 0 prerrequisitos inexistentes, 100% con `moduleId` y mecanismo de evidencia**. Los nodos raíz sin prerrequisitos o nodos terminales sin dependientes no se consideran huérfanos (`ORIGINAL_REQUEST` §R2).  
> **Nota sobre `cuadraticas` y `exponenciales`:** Conservan exactamente sus 10 IDs canónicos existentes; los prerrequisitos **inter-módulo** listados aquí deben inyectarse mediante la capa de registro global en dos pasos para no romper las pruebas unitarias intra-módulo preexistentes (`tests/cuadraticas/competencies.test.mjs:79,84-88`, `tests/exponenciales/competencies.test.mjs:85`).

| # | Unidad | Módulo (`moduleId`) | ID de Competencia | Estado | Mecanismo de Evidencia | Prerrequisitos (`prerequisiteIds`) |
|---|---|---|---|---|---|---|
| 1 | 01 | `potencias-raices` | `powers.additive_vs_multiplicative_worlds` | Faltante (map) | `CHECKS sec-1` + reto `dos_mundos_mitad` + `diagnosePowRad` | `[]` |
| 2 | 01 | `potencias-raices` | `powers.negative_exponents_and_reciprocals` | Faltante (map) | `CHECKS sec-2` + reto `exponente_negativo_neutro` + `diagnosePowRad` | `powers.additive_vs_multiplicative_worlds` |
| 3 | 01 | `potencias-raices` | `powers.quotient_and_product_laws` | Faltante (map) | `CHECKS sec-3` + reto `cociente_potencias_neutro` + `diagnosePowRad` | `powers.negative_exponents_and_reciprocals` |
| 4 | 01 | `potencias-raices` | `powers.rational_exponents_and_nth_roots` | Faltante (map) | `CHECKS sec-4` + reto `dos_mundos_mitad` + `diagnosePowRad` | `powers.quotient_and_product_laws` |
| 5 | 01 | `potencias-raices` | `powers.geometric_squares_and_cubes` | Faltante (map) | `CHECKS sec-5` + widget `geometria-raices` | `powers.rational_exponents_and_nth_roots` |
| 6 | 01 | `potencias-raices` | `powers.prime_factor_tree_extraction` | Faltante (map) | `CHECKS sec-6` + reto `arbol_raiz_orden_n` + `simplifyRadical` | `powers.rational_exponents_and_nth_roots` |
| 7 | 01 | `potencias-raices` | `powers.radical_simplification_and_rationalization` | Faltante (map) | `CHECKS sec-7` + retos `simplificar_radical_vars`, `producto_radicales` + `diagnosePowRad` | `powers.prime_factor_tree_extraction` |
| 8 | 01 | `potencias-raices` | `powers.binomial_power_non_distributivity` | Faltante (map) | `CHECKS sec-8` + reto `choque_mundos_binomio` + `diagnosePowRad` | `powers.geometric_squares_and_cubes` |
| 9 | 01 | `potencias-raices` | `powers.real_domain_restrictions_and_abs_root` | Faltante (map) | `CHECKS sec-9` + reto `auditoria_reales_exactas` + `diagnosePowRad` | `powers.radical_simplification_and_rationalization` |
| 10 | 01 | `potencias-raices` | `powers.precedence_and_paradox_auditing` | Faltante (map) | `CHECKS sec-10` + reto `auditoria_reales_exactas` + `diagnosePowRad` | `powers.real_domain_restrictions_and_abs_root`, `powers.binomial_power_non_distributivity` |
| 11 | 01 | `desigualdades` | `inequalities.intervals_and_number_line` | Faltante | Nuevos checks + `intervalOf` + `formatSet` | `[]` |
| 12 | 01 | `desigualdades` | `inequalities.compound_and_or_sets` | Faltante | `RETOS` 1–5 + nuevos checks + `intersect`/`union`/`compute` | `inequalities.intervals_and_number_line` |
| 13 | 01 | `desigualdades` | `inequalities.linear_and_factored_solving` | Faltante | Nuevos checks/retos + evaluador de inecuaciones | `inequalities.compound_and_or_sets` |
| 14 | 01 | `unidades` | `units.unitary_factor_neutral_one` | Faltante | `PROBLEMS` 1,2,3,5 + nuevos checks + `compute` (`sameUnits`, `neutral`) | `powers.quotient_and_product_laws` |
| 15 | 01 | `unidades` | `units.compound_rates_and_powers` | Faltante | `PROBLEMS[3]` + nuevos checks + `cubeApplied` | `units.unitary_factor_neutral_one`, `powers.geometric_squares_and_cubes` |
| 16 | 02 | `funciones` | `functions.concept_and_uniqueness` | Faltante | `scanner` + nuevos checks/retos + detector de unicidad | `inequalities.intervals_and_number_line` |
| 17 | 02 | `funciones` | `functions.domain_image_and_sign_sets` | Faltante | `radiografia` + `quizBox` + nuevos checks/retos | `functions.concept_and_uniqueness`, `inequalities.compound_and_or_sets` |
| 18 | 02 | `funciones` | `functions.monotonicity_extrema_and_continuity` | Faltante | `radiografia` + nuevos checks/retos | `functions.domain_image_and_sign_sets` |
| 19 | 02 | `funciones` | `functions.bijectivity_and_inverse` | Faltante | `inversa` + nuevos checks/retos | `functions.monotonicity_extrema_and_continuity` |
| 20 | 02 | `funciones` | `functions.average_rate_of_change` | Faltante | `secante` + nuevos checks/retos | `functions.domain_image_and_sign_sets` |
| 21 | 02 (U01#1) | `valor-absoluto` | `abs.distance_1d_and_equations` | Faltante (map) | `CHECKS sec-1` + reto `resolver_modulo` + `solveAbsComparison` | `powers.real_domain_restrictions_and_abs_root`, `inequalities.intervals_and_number_line` |
| 22 | 02 | `valor-absoluto` | `abs.cartesian_mirror_parent` | Faltante (map) | `CHECKS sec-2` + `diagnoseAbs` | `abs.distance_1d_and_equations`, `functions.concept_and_uniqueness` |
| 23 | 02 | `valor-absoluto` | `abs.translations_vertex_hk` | Faltante (map) | `CHECKS sec-3` + reto `hallar_vertice` + `diagnoseAbs` | `abs.cartesian_mirror_parent` |
| 24 | 02 | `valor-absoluto` | `abs.vertical_scale_and_reflection` | Faltante (map) | `CHECKS sec-4` + `diagnoseAbs` | `abs.cartesian_mirror_parent` |
| 25 | 02 | `valor-absoluto` | `abs.canonical_form_synthesis` | Faltante (map) | `CHECKS sec-5` + retos `ecuacion_desde_grafica`, `graficar_interactivo` + `diagnoseAbs` | `abs.translations_vertex_hk`, `abs.vertical_scale_and_reflection` |
| 26 | 02 | `valor-absoluto` | `abs.piecewise_decomposition` | Faltante (map) | `CHECKS sec-6` + reto `desarmar_en_partes` + `toPiecewise` | `abs.canonical_form_synthesis` |
| 27 | 02 | `valor-absoluto` | `abs.full_analytical_study_and_inequalities` | Faltante (map) | `CHECKS sec-7` + retos `rango_y_positividad`, `resolver_modulo` + `analyzeAbs` | `abs.piecewise_decomposition`, `functions.monotonicity_extrema_and_continuity`, `inequalities.compound_and_or_sets` |
| 28 | 02 | `valor-absoluto` | `abs.piecewise_domain_customs` | Faltante (map) | `CHECKS sec-8` + reto `evaluar_por_partes` + `evalPiecewise` | `abs.piecewise_decomposition`, `functions.domain_image_and_sign_sets` |
| 29 | 02 | `valor-absoluto` | `abs.boundary_continuity_and_uniqueness` | Faltante (map) | `CHECKS sec-9` + reto `dominio_rango_partes` + `validatePiecewiseFunction` | `abs.piecewise_domain_customs` |
| 30 | 02 | `valor-absoluto` | `abs.step_floor_and_ceiling` | Faltante (map) | `CHECKS sec-10` | `abs.boundary_continuity_and_uniqueness` |
| 31 | 02 (Ext.) | `sucesiones` | `sequences.pattern_recognition_and_classification` | Faltante (map) | `CHECKS sec-1,sec-2` + retos `extend`, `classify` + `classify()` | `functions.concept_and_uniqueness` |
| 32 | 02 (Ext.) | `sucesiones` | `sequences.discrete_domain_and_notation` | Faltante (map) | `CHECKS sec-3` | `sequences.pattern_recognition_and_classification` |
| 33 | 02 (Ext.) | `sucesiones` | `sequences.recursive_formulas` | Faltante (map) | `CHECKS sec-4` + reto `recursive` + `recursiveOf` | `sequences.discrete_domain_and_notation` |
| 34 | 02 (Ext.) | `sucesiones` | `sequences.arithmetic_explicit_and_membership` | Faltante (map) | `CHECKS sec-5a,5b,6` + `isTerm` + `diagnose` | `sequences.recursive_formulas` |
| 35 | 02 (Ext.) | `sucesiones` | `sequences.geometric_explicit_and_models` | Faltante (map) | `CHECKS sec-7..10` + `diagnose` | `sequences.arithmetic_explicit_and_membership`, `powers.precedence_and_paradox_auditing` |
| 36 | 02 (Ext.) | `sucesiones` | `sequences.asymptotic_behavior_intuition` | Faltante (map) | `CHECKS sec-11` | `sequences.geometric_explicit_and_models` |
| 37 | 03 | `lineal` | `linear.definition_slope_and_intercept` | Nuevo | Checks + retos PRNG + `analyzeLinear` | `functions.bijectivity_and_inverse` |
| 38 | 03 | `lineal` | `linear.angle_and_three_equation_forms` | Nuevo | Checks + retos PRNG + `convertLinearForms` | `linear.definition_slope_and_intercept` |
| 39 | 03 | `lineal` | `linear.parallel_perpendicular_and_incidence` | Nuevo | Checks + retos PRNG + `classifyLinePair` | `linear.angle_and_three_equation_forms` |
| 40 | 03 | `lineal` | `linear.analytic_geometry_distance_midpoint_bisector` | Nuevo | Checks + retos PRNG + `perpendicularBisector`, `pointLineDistance` | `linear.parallel_perpendicular_and_incidence`, `powers.geometric_squares_and_cubes` |
| 41 | 03 | `lineal` | `linear.modeling_and_piecewise` | Nuevo | Checks + retos PRNG + `diagnoseLinear` | `linear.definition_slope_and_intercept`, `abs.piecewise_domain_customs` |
| 42 | 04 | `sistemas` | `systems.linear_2x2_graphical_and_analytical` | Nuevo | Checks + retos PRNG + `solveSystem2x2` | `linear.parallel_perpendicular_and_incidence` |
| 43 | 04 | `sistemas` | `systems.classification_scd_sci_si` | Nuevo | Checks + retos PRNG + `classifySystem2x2` | `systems.linear_2x2_graphical_and_analytical` |
| 44 | 04 | `sistemas` | `systems.parametric_systems` | Nuevo | Checks + retos PRNG + `analyzeParametricSystem` | `systems.classification_scd_sci_si` |
| 45 | 04 | `sistemas` | `systems.modeling_and_graph_reconstruction` | Nuevo | Checks + retos PRNG + `diagnoseSystem` | `systems.classification_scd_sci_si`, `linear.modeling_and_piecewise` |
| 46 | 05 | `cuadraticas` | `quadratics.area_model_and_notable_products` | Existente | `CHECKS sec-area-binomios` + reto `area_model_and_notable_products` + `diagnoseQuad` | (Intra: `[]`; Global: `powers.binomial_power_non_distributivity`, `linear.definition_slope_and_intercept`) |
| 47 | 05 | `cuadraticas` | `quadratics.sum_product_factoring` | Existente | `CHECKS sec-balanza-suma-producto` + reto `factor_trinomial` + `diagnoseQuad` | `quadratics.area_model_and_notable_products` |
| 48 | 05 | `cuadraticas` | `quadratics.grouping_and_factoring_strategy` | Existente | `CHECKS sec-agrupacion-estrategia` + reto `grouping_and_factoring_strategy` + `diagnoseQuad` | `quadratics.sum_product_factoring` |
| 49 | 05 | `cuadraticas` | `quadratics.canonical_form_and_vertex` | Existente | `CHECKS sec-canonica-vertice` + reto `vertex_from_standard` + `diagnoseQuad` | `quadratics.area_model_and_notable_products` |
| 50 | 05 | `cuadraticas` | `quadratics.factored_form_and_symmetry` | Existente | `CHECKS sec-factorizada-simetria` + reto `roots_and_factored_form` + `diagnoseQuad` | `quadratics.canonical_form_and_vertex`, `quadratics.sum_product_factoring` |
| 51 | 05 | `cuadraticas` | `quadratics.completing_the_square` | Existente | `CHECKS sec-completar-cuadrado` + reto `complete_the_square` + `diagnoseQuad` | `quadratics.canonical_form_and_vertex`, `quadratics.area_model_and_notable_products` |
| 52 | 05 | `cuadraticas` | `quadratics.discriminant_and_vieta` | Existente | `CHECKS sec-discriminante-vieta` + reto `discriminant_and_vieta` + `diagnoseQuad` | `quadratics.completing_the_square`, `quadratics.factored_form_and_symmetry` |
| 53 | 05 | `cuadraticas` | `quadratics.full_analysis_exactas` | Existente | `CHECKS sec-radiografia-cuadratica` + reto `full_analysis_exactas` + `diagnoseQuad` | `quadratics.canonical_form_and_vertex`, `quadratics.discriminant_and_vieta` (+ Global: `functions.bijectivity_and_inverse`, `inequalities.linear_and_factored_solving`) |
| 54 | 05 | `cuadraticas` | `quadratics.parabola_line_tangency` | Existente | `CHECKS sec-interseccion-recta-parabola` + reto `line_parabola_intersection` + `diagnoseQuad` | `quadratics.discriminant_and_vieta` (+ Global: `systems.linear_2x2_graphical_and_analytical`) |
| 55 | 05 | `cuadraticas` | `quadratics.extremum_optimization` | Existente | `CHECKS sec-optimizacion-extremos` + reto `optimization_context` + `diagnoseQuad` | `quadratics.canonical_form_and_vertex`, `quadratics.full_analysis_exactas` |
| 56 | 06 | `polinomios` | `polynomials.structure_degree_and_equality` | Nuevo | Checks + retos PRNG + `inspectPolynomial` | `quadratics.area_model_and_notable_products` |
| 57 | 06 | `polinomios` | `polynomials.arithmetic_and_degree_laws` | Nuevo | Checks + retos PRNG + `polyAdd`/`polyMul` | `polynomials.structure_degree_and_equality` |
| 58 | 06 | `polinomios` | `polynomials.division_ruffini_and_remainder` | Nuevo | Checks + retos PRNG + `polyDiv`/`ruffini` | `polynomials.arithmetic_and_degree_laws` |
| 59 | 06 | `polinomios` | `polynomials.factoring_and_gauss_roots` | Nuevo | Checks + retos PRNG + `factorPolynomial`/`rationalRootCandidates` | `polynomials.division_ruffini_and_remainder`, `quadratics.grouping_and_factoring_strategy`, `quadratics.discriminant_and_vieta` |
| 60 | 06 | `polinomios` | `polynomials.parameter_reconstruction_and_modeling` | Nuevo | Checks + retos PRNG + `diagnosePolynomial` | `polynomials.factoring_and_gauss_roots` |
| 61 | 07 | `racionales-irracionales` | `rational.simplification_lcm_and_operations` | Nuevo | Checks + retos PRNG + `simplifyRational` | `polynomials.factoring_and_gauss_roots` |
| 62 | 07 | `racionales-irracionales` | `rational.equations_and_inequalities` | Nuevo | Checks + retos PRNG + `solveRationalEquation` | `rational.simplification_lcm_and_operations`, `inequalities.linear_and_factored_solving` |
| 63 | 07 | `racionales-irracionales` | `rational.domain_holes_and_asymptotes` | Nuevo | Checks + retos PRNG + `analyzeRationalFunction` | `rational.simplification_lcm_and_operations`, `functions.monotonicity_extrema_and_continuity` |
| 64 | 07 | `racionales-irracionales` | `irrational.domain_and_radical_equations` | Nuevo | Checks + retos PRNG + `solveIrrationalEquation` | `powers.real_domain_restrictions_and_abs_root`, `inequalities.linear_and_factored_solving`, `quadratics.discriminant_and_vieta` |
| 65 | 07 | `racionales-irracionales` | `irrational.graphs_analysis_and_piecewise` | Nuevo | Checks + retos PRNG + `analyzeIrrationalFunction` | `irrational.domain_and_radical_equations`, `rational.domain_holes_and_asymptotes`, `abs.piecewise_domain_customs` |
| 66 | 08 | `exponenciales` | `exponentials.tables_additive_vs_multiplicative` | Existente | `CHECKS sec-1` + reto `razon_tabla_vs_salto` + `diagnoseExp` | (Intra: `[]`; Global: `linear.definition_slope_and_intercept`, `sequences.geometric_explicit_and_models`) |
| 67 | 08 | `exponenciales` | `exponentials.neutral_and_order_of_operations` | Existente | `CHECKS sec-2` + reto `orden_k_a_x` + `diagnoseExp` | `exponentials.tables_additive_vs_multiplicative` (+ Global: `powers.additive_vs_multiplicative_worlds`) |
| 68 | 08 | `exponenciales` | `exponentials.rational_density_and_base_restrictions` | Existente | `CHECKS sec-3` + reto `restricciones_base` + `diagnoseExp` | `exponentials.neutral_and_order_of_operations` (+ Global: `powers.rational_exponents_and_nth_roots`, `powers.real_domain_restrictions_and_abs_root`) |
| 69 | 08 | `exponenciales` | `exponentials.base_reflection_and_asymptote` | Existente | `CHECKS sec-4` + reto `simetria_inversa` + `diagnoseExp` | `exponentials.rational_density_and_base_restrictions` (+ Global: `powers.negative_exponents_and_reciprocals`) |
| 70 | 08 | `exponenciales` | `exponentials.four_quadrants_monotonicity` | Existente | `CHECKS sec-5` + reto `monotonia_cuadrantes` + `diagnoseExp` | `exponentials.base_reflection_and_asymptote` |
| 71 | 08 | `exponenciales` | `exponentials.analytical_reconstruction_two_points` | Existente | `CHECKS sec-6` + reto `formula_desde_dos_puntos` + `fitExponentialFromPoints` | `exponentials.four_quadrants_monotonicity` |
| 72 | 08 | `exponenciales` | `exponentials.time_models_rates_and_euler_base` | Existente | `CHECKS sec-7` + reto `modelos_temporales` + `diagnoseExp` | `exponentials.analytical_reconstruction_two_points` |
| 73 | 08 | `exponenciales` | `exponentials.shifts_and_horizontal_asymptote` | Existente | `CHECKS sec-8` + reto `desplazamientos_asintota` + `diagnoseExp` | `exponentials.base_reflection_and_asymptote` |
| 74 | 08 | `exponenciales` | `exponentials.full_analytical_study` | Existente | `CHECKS sec-9` + reto `estudio_completo_exactas` + `analyzeExponential` | `exponentials.shifts_and_horizontal_asymptote` (+ Global: `functions.bijectivity_and_inverse`) |
| 75 | 08 | `exponenciales` | `exponentials.equations_three_methods_in_reals` | Existente | `CHECKS sec-10` + reto `ecuaciones_exponenciales` + `solveExpEquation` | `exponentials.full_analytical_study` (+ Global: `quadratics.discriminant_and_vieta`) |
| 76 | 09 | `logaritmicas` | `logarithms.definition_existence_and_special_bases` | Nuevo | Checks + retos PRNG + `evalLog` | `exponentials.rational_density_and_base_restrictions`, `exponentials.full_analytical_study` |
| 77 | 09 | `logaritmicas` | `logarithms.operative_properties_and_change_of_base` | Nuevo | Checks + retos PRNG + `diagnoseLog` | `logarithms.definition_existence_and_special_bases` |
| 78 | 09 | `logaritmicas` | `logarithms.equations_and_systems` | Nuevo | Checks + retos PRNG + `solveLogEquation` | `logarithms.operative_properties_and_change_of_base`, `exponentials.equations_three_methods_in_reals`, `systems.linear_2x2_graphical_and_analytical` |
| 79 | 09 | `logaritmicas` | `logarithms.function_inverse_and_analysis` | Nuevo | Checks + retos PRNG + `analyzeLogFunction` | `logarithms.definition_existence_and_special_bases`, `functions.bijectivity_and_inverse` |
| 80 | 09 | `logaritmicas` | `logarithms.real_world_time_and_scale_models` | Nuevo | Checks + retos PRNG + `diagnoseLog` | `logarithms.equations_and_systems`, `exponentials.time_models_rates_and_euler_base` |
| 81 | 10 | `razones-trigonometricas` | `trig_ratios.right_triangle_sohcahtoa_and_pythagoras` | Nuevo | Checks + retos PRNG + `solveRightTriangle` | `powers.geometric_squares_and_cubes`, `linear.analytic_geometry_distance_midpoint_bisector` |
| 82 | 10 | `razones-trigonometricas` | `trig_ratios.elevation_depression_and_indirect_measurement` | Nuevo | Checks + retos PRNG + `diagnoseTrigRatios` | `trig_ratios.right_triangle_sohcahtoa_and_pythagoras`, `systems.linear_2x2_graphical_and_analytical` |
| 83 | 10 | `razones-trigonometricas` | `trig_ratios.polygons_chords_and_solids_geometry` | Nuevo | Checks + retos PRNG + evaluadores geométricos | `trig_ratios.right_triangle_sohcahtoa_and_pythagoras` |
| 84 | 10 | `razones-trigonometricas` | `trig_ratios.angle_systems_and_arc_length` | Nuevo | Checks + retos PRNG + `convertAngle` | `trig_ratios.right_triangle_sohcahtoa_and_pythagoras`, `units.unitary_factor_neutral_one` |
| 85 | 11 | `funciones-trigonometricas` | `trig_functions.congruence_classes_and_cartesian_def` | Nuevo | Checks + retos PRNG + `congruenceRepresentative` | `trig_ratios.angle_systems_and_arc_length`, `functions.concept_and_uniqueness` |
| 86 | 11 | `funciones-trigonometricas` | `trig_functions.six_functions_domains_graphs_and_bijectivity` | Nuevo | Checks + retos PRNG + `analyzeTrigFunction` | `trig_functions.congruence_classes_and_cartesian_def`, `functions.bijectivity_and_inverse`, `rational.domain_holes_and_asymptotes` |
| 87 | 11 | `funciones-trigonometricas` | `trig_functions.pythagorean_identities_and_reduction` | Nuevo | Checks + retos PRNG + `exactTrigFromQuadrant` | `trig_functions.congruence_classes_and_cartesian_def` |
| 88 | 11 | `funciones-trigonometricas` | `trig_functions.periodic_equations_and_domain_checks` | Nuevo | Checks + retos PRNG + `solveTrigEquation` | `trig_functions.six_functions_domains_graphs_and_bijectivity`, `trig_functions.pythagorean_identities_and_reduction`, `quadratics.discriminant_and_vieta` |

*Nota sobre Jefes Integradores y Cuaderno de Misterios:* **Jefe Integrador 1** (U01–U06) y **Simulacro/Jefe Integrador Global** (U01–U11) no introducen competencias huérfanas separadas; cada ítem evalúa las competencias unitarias listadas arriba con `stage: 'transfer'` o `'retrieval'` y `transferDistance: 'far'`.

---

## 6. Brechas de Instrumentación y Motor Central (`js/core/learning/` y UI Compartida)

1. **Registro en dos pasos e integridad del grafo inexistentes (`js/core/learning/competencies.js`):**
   - `registerModuleCompetencies()` invoca `validateGraph(moduleId)` inmediatamente en la línea 156 (`competencies.js:156`). Cualquier prerrequisito inter-módulo fallará si el módulo dependiente se importa antes que el prerrequisito.
   - `competencies.js:130-131` sobrescribe silenciosamente IDs duplicados en `modEntry.competencies` y `globalCompetencies` (y al re-registrar un módulo no limpia entradas previas).
   - `competencies.js:117-128` no almacena ni valida mecanismos de evidencia (`evidenceMechanisms`/`evidenceSources`) ni verifica que `diagnostic.competencyId` exista o que no haya ciclos de alias. Además, `validateGraph(moduleId)` solo inicia DFS desde `targetCompetencies`, omitiendo ciclos fuera de ese subconjunto.
2. **Desincronización de IDs y migración parcial (`progress-store.js`, `migrations.js`, `transfer.js`, `LEARNING_ARCHITECTURE.md`):**
   - `js/core/learning/progress-store.js:123-148` (`MODULE_COMPETENCY_IDS`) lista 12/20 IDs antiguos incompatibles con `EXP_COMPETENCIES` y `QUAD_COMPETENCIES`, y la línea 396 hardcodea prefijos (`exponenciales` → `exponentials.`, `cuadraticas` → `quadratics.`, resto `${moduleId}.`) que fallarán con `powers.*`, `linear.*`, `trig_ratios.*`, `trig_functions.*`.
   - `js/core/learning/migrations.js:19-103` reproduce los IDs viejos en `EXP_ITEM_TO_COMPETENCY` y `CUAD_ITEM_TO_COMPETENCY`, mapea erróneamente `sec2-q*` de Cuadráticas a `grouping_and_factoring_strategy` y `sec3-q*` a `parabola_geometry_and_parameters`, nunca se invoca en runtime desde `index.js`, y carece de migradores para `potencias_raices:progreso:v1`, `valor_absoluto:progreso:v1` y `sucesiones:progreso:v1`.
   - `js/core/learning/transfer.js:599` referencia `'quadratics.three_forms_conversion'` (inexistente en `QUAD_COMPETENCIES` y `QUAD_COMPETENCY_ALIASES`).
   - `LEARNING_ARCHITECTURE.md` §6.9 presenta desalineación en 8 IDs de Cuadráticas y 3 IDs de Exponenciales respecto del código real.
3. **Doble escritura de estado de maestría en `exponenciales/components.js`:**
   - `js/modules/exponenciales/components.js:129-194` llama a `recordExpAttempt()` (que escribe en `alaska:learning:v1`) y además ejecuta localmente `evaluateCompetencyMastery()` sobre `state.competencies` en `exponenciales:progreso:v1`. La evidencia registrada directamente en `ProgressStore` (p. ej. vía `transfer.js` o Jefes) diverge de la copia local si `ProgressStore` no actúa como única fuente de verdad.
4. **`events.js` limitado en `MODULE_IDS` (`js/core/learning/events.js:19-25`):**
   - Solo enumera 5 slugs (`exponenciales`, `cuadraticas`, `sucesiones`, `valor-absoluto`, `potencias-raices`); faltan `desigualdades`, `unidades`, `funciones` y las nuevas unidades/integradores (`lineal`, `sistemas`, `polinomios`, `racionales-irracionales`, `logaritmicas`, `razones-trigonometricas`, `funciones-trigonometricas`, `jefe-integrador-1`, `simulacro-global`).
5. **6 de los 8 laboratorios existentes carecen de instrumentación:**
   - `desigualdades`, `unidades`, `funciones`, `potencias-raices`, `valor-absoluto` y `sucesiones` carecen de `competencies-map.js`, `learning-adapter.js`, metadatos de 8-tupla y `mountCompetencyDashboard`.
6. **Brechas de Transferencia, Intercalación y Misterios Abiertos (`transfer.js`, `exercise-selector.js`):**
   - `transfer.js:14-15` importa estáticamente `cuadraticas/expr.js` y `exponenciales/expr.js` y solo cubre 3 modelos (`linear`, `exponential`, `quadratic` + `neither`); debe refactorizarse mediante registro modular de clasificadores para cubrir las **8 familias** (Lineal, Cuadrática, Polinómica, Racional, **Radical o Irracional**, Exponencial, Logarítmica y Trigonométrica) y filtrar competencias aún en estado `'unseen'`.
   - `exercise-selector.js:127` recibe `moduleId` sin utilizarlo y no filtra competencias `'unseen'` ni pondera prerrequisitos en `needs_repair` en la intercalación global.
   - El **Cuaderno de Misterios Abiertos** no existe aún en `js/core/learning/` (solo en diseño normativo); requiere persistencia acotada en `alaska:learning:v1` y garantía estricta de que explorar sin evaluación explícita nunca incrementa `independentCount` ni maestría.
7. **Consolidación de UI compartida y `nav.js` (9 → 11 unidades):**
   - Promover un `board-kit.js` unificado (con `createPredictBox` 2-etapas y `attachSvgDrag` con teclado), `scale.js`, `mountCompetencyDashboard` parametrizado e `initBlackboardController` compartido evitará duplicar código en las 7 unidades nuevas.
   - Actualizar `js/core/nav.js` de 9 a 11 unidades, agregar `'cuadraticas'` a `resolveCurrentUnit()` y calcular dinámicamente contadores del drawer en sincronía con `scripts/verify-pages.mjs`.

---

## 7. Riesgos Técnicos Identificados

1. **Riesgo de regresión en tests existentes al agregar prerrequisitos inter-módulo (CRÍTICO):**
   - `tests/cuadraticas/competencies.test.mjs:79` exige `rootComp.prerequisiteIds.length === 0` y las líneas `84-88` exigen que todos los `prerequisiteIds` de `QUAD_COMPETENCIES` existan en el `Set` intra-módulo con `preComp.order < comp.order`.
   - `tests/exponenciales/competencies.test.mjs:85` exige que todos los `prerequisiteIds` de `EXP_COMPETENCIES` pertenezcan al `Set` de `EXP_COMPETENCIES`.
   - **Mitigación:** Mantener `QUAD_COMPETENCIES` y `EXP_COMPETENCIES` con sus `prerequisiteIds` intra-módulo intactos y declarar los enlaces inter-módulo en un overlay central (`CROSS_MODULE_PREREQUISITES` en `js/core/learning/competencies.js` / registro curricular global) aplicado durante el Paso 2, preservando 100% los tests existentes (`ORIGINAL_REQUEST.md` §R7).
2. **Riesgo de pérdida de restricciones de dominio y soluciones extraviadas (Unidades 07, 09, 11):**
   - Simplificar $(x^2-1)/(x-1)$ o resolver ecuaciones racionales, irracionales, logarítmicas o trigonométricas sin preservar exclusiones del denominador, radicandos pares $<0$, argumentos $\le 0$ o polos de $\operatorname{tg}/\sec/\operatorname{cosec}/\operatorname{cotg}$ genera falsos positivos. Los evaluadores puros deben devolver `{ value, domainConstraints, extraneousRoots, multiplicityComparison }` y no validar equivalencia solo por muestreo puntual.
3. **Riesgo de aritmética flotante vs. aritmética exacta (Unidades 03, 04, 06, 07, 10, 11):**
   - Raíces racionales (Gauss), ángulos notables ($\sqrt{2}/2, \sqrt{3}/2, \pi/6$), Ruffini con divisor $(3x+1)$ y conversiones de formas de la recta exigen aritmética exacta (fracciones reducidas `num/den` y radicales/múltiplos simbólicos de $\pi$).
4. **Riesgo de higiene Git e interpretaciones de línea de base (`.gitignore` y `audit-potencias-raices.mjs`):**
   - `.gitignore` oculta `/tests/` (L8) y `/scripts` (L16); nuevos archivos allí requieren seguimiento explícito o revisión de política con Agente 00.
   - `scripts/audit-potencias-raices.mjs:129` presenta un fallo preexistente (`33 !== 9` términos en `GLOSSARY_TERMS`), que debe distinguirse de regresiones nuevas y acotarse al módulo correspondiente.
5. **Riesgo de acoplamiento CSS (`valor-absoluto.css`) y navegación (`nav.js` / `verify-pages.mjs`):**
   - `css/modules/valor-absoluto.css` es importado por 4 páginas (`valor-absoluto`, `potencias-raices`, `cuadraticas`, `exponenciales`): cualquier refactor visual ahí impacta 4 laboratorios.
   - Cambiar `nav.js` a 11 unidades romperá `scripts/verify-pages.mjs:217,332` (`=== 9`) y requiere revisar el grid de `css/layout.css` (`.curriculum-grid`) si no se actualizan en conjunto.
6. **Riesgo de divergencia de estado y deuda visual/pedagógica heredada:**
   - La doble escritura de maestría en `exponenciales/components.js:129-194`, los IDs obsoletos en `progress-store.js`/`migrations.js`, los `<link>` de Google Fonts en 4 HTMLs, la pose punitiva `enojada` y claves `seed-*` en `sucesiones`, y `#solve` sin marca asistida en `unidades.html` deben corregirse en Etapa B antes de escalar a las Unidades 03–11.

---

## 8. Contratos Compartidos Necesarios (Coordinación Agente 00 ↔ Agentes 02–08)

Antes de iniciar la codificación en Etapas B–E, el Agente 00 debe congelar los siguientes 6 contratos compartidos:

1. **Contrato del Registro Curricular Global en Dos Pasos (`js/core/learning/competencies.js` + `curriculum-registry.js`):**
   - `registerModuleCompetencies(moduleId, data, { deferValidation: true })`: registra competencias (con `moduleId`, `evidenceMechanisms`, `prerequisiteIds`), taxonomía diagnóstica y alias sin validar aristas aún; rechaza IDs duplicados.
   - `registerCrossModulePrerequisites(edgeMap)` + `validateGlobalGraph()`: aplica los enlaces inter-módulo y valida globalmente en Paso 2 (0 ciclos, 0 autorreferencias, 0 IDs duplicados, 0 referencias faltantes, 100% con `moduleId` y `evidenceMechanisms`; permite raíces/hojas válidas).
2. **Contrato de Eventos y Cuaderno de Misterios (`js/core/learning/events.js` + `mysteries.js`):**
   - Completar `MODULE_IDS` con los 15 módulos + `jefe-integrador-1` + `simulacro-global`.
   - Definir la política de **Cuaderno de Misterios Abiertos** en `alaska:learning:v1` (`state.mysteries`): exploraciones (`mystery_saved` / `mystery_explored` / `mystery_dismissed`) nunca modifican `independentCount` ni `status` en `mastery.js`; solo un envío con evaluador explícito (`answer_submitted` válido) produce evidencia.
3. **Contrato Matemático Compartido de Polinomios (`js/core/math/polynomials.js` o exportación pública de `js/modules/polinomios/logic.js`):**
   - Reutilizable por Unidad 06 (`polinomios`) y Unidad 07 (`racionales-irracionales`): representación exacta de polinomios, grado, igualdad, suma/resta/producto, división euclídea, Ruffini (incluido $(ax-b)$), Teorema del Resto, factorización con multiplicidades (`[{ root, multiplicity }]` y factores cuadráticos irreducibles), candidatos racionales de Gauss y MCM $M(x)$.
4. **Contrato Matemático Compartido de Trigonometría (`js/core/math/trigonometry.js`):**
   - Compartido por Unidad 10 (`razones-trigonometricas`) y Unidad 11 (`funciones-trigonometricas`): conversión exacta sexagesimal ($^\circ\ '\ ''$) $\leftrightarrow$ circular (múltiplos racionales de $\pi$ y radianes decimales), representante de clase $C_\alpha$, tabla exacta de ángulos notables, signos por cuadrante, las 6 funciones con dominios excluidos explícitos y soluciones periódicas en $C_\alpha$.
5. **Contrato Modular de Transferencia e Intercalación (`js/core/learning/transfer.js` + `transfer-classifiers/*.js`):**
   - Registro desacoplado de clasificadores para 8 familias (Lineal, Cuadrática, Polinómica, Racional, Radical/Irracional, Exponencial, Logarítmica, Trigonométrica). `generateTransferChallenge()` y `selectAdaptiveExercise()` filtran obligatoriamente competencias no introducidas (`entry.status !== 'unseen'`) en `ProgressStore`.
6. **Contrato de Navegación Dinámica (`js/core/nav.js`) y Evaluador de Jefes (`js/core/learning/boss-engine.js`):**
   - `nav.js`: 11 unidades dinámicas (`01`–`11`), enlaces de los 15 labs + 2 integradores, contadores calculados desde `CURRICULUM_UNITS`, `resolveCurrentUnit()` cubriendo todas las páginas.
   - `boss-engine.js`: máquina de las 6 fases (`Reconocer`, `Predecir`, `Modelar`, `Resolver`, `Transferir`, `Debrief`) sin cronómetro punitivo, diferenciando intentos independientes de asistidos y emitiendo eventos normalizados a `alaska:learning:v1`.

---

## 9. Orden Recomendado de Implementación (Etapas A → F)

1. **Etapa A (Actual — Puerta de Calidad):** Aprobación técnica de `docs/CURRICULUM_AUDIT.md` por Agente 00 y congelamiento de los 6 contratos compartidos.
2. **Etapa B (Fase P0 — Motor e Instrumentación de Base):**
   - B1: Actualizar `competencies.js`, `events.js`, `progress-store.js` (alinear IDs canónicos y quitar doble escritura de maestría en `exponenciales/components.js`) y `migrations.js` (corregir mapeo de Cuadráticas, invocar migración segura y sumar migraciones de U01/U02). Implementar registro global en dos pasos + `validateGlobalGraph()`.
   - B2: Crear `competencies-map.js`, `learning-adapter.js`, 8-tuplas y evaluadores/diagnósticos faltantes para los 6 labs existentes sin instrumentar (`desigualdades`, `unidades`, `potencias-raices`, `funciones`, `valor-absoluto`, `sucesiones`), corrigiendo anomalías auditadas (`#solve` en `unidades.html`, `UNIDAD 11` en `potencias-raices.html`, `Unidad 8` en `funciones.html`, `<h1>` duplicado y `Álgebra 1` en `valor-absoluto.html`, `seed-*` y pose punitiva `enojada` en `sucesiones`, y `<link>` externos de Google Fonts).
3. **Etapa C (Bloque P1 — Unidades 03, 04, 06 y Jefe Integrador 1):**
   - C1: Construir `lineal.html` + `js/modules/lineal/*` (Unidad 03).
   - C2: Construir `sistemas.html` + `js/modules/sistemas/*` (Unidad 04, depende de `lineal`).
   - C3: Construir `polinomios.html` + `js/modules/polinomios/*` + contrato polinómico compartido (Unidad 06).
   - C4: Construir **Jefe Integrador 1** (pp. 74–76, Unidades 01–06) sobre `boss-engine.js`.
4. **Etapa D (Bloque P2 — Unidades 07 y 09):**
   - D1: Construir `racionales-irracionales.html` + `js/modules/racionales-irracionales/*` consumiendo contrato de Polinomios (Unidad 07).
   - D2: Construir `logaritmicas.html` + `js/modules/logaritmicas/*` extendiendo Exponenciales (Unidad 09).
5. **Etapa E (Bloque P3 — Unidades 10, 11 y Jefe/Simulacro Global):**
   - E1: Implementar capa compartida `js/core/math/trigonometry.js`.
   - E2: Construir `razones-trigonometricas.html` (Unidad 10) y `funciones-trigonometricas.html` (Unidad 11).
   - E3: Construir **Jefe / Simulacro Integrador Global** (pp. 127–156, Unidades 01–11).
6. **Etapa F (Transferencia, Misterios, Navegación, QA Independiente y Documentación):**
   - F1: Ampliar `transfer.js` (8 familias, incluida **Radical/Irracional**), `exercise-selector.js` e implementar **Cuaderno de Misterios Abiertos**.
   - F2: Actualizar `js/core/nav.js` (11 unidades dinámicas), `index.html`, `scripts/verify-pages.mjs` y `scripts/verify-interactions.mjs`.
   - F3: Auditoría independiente del Agente 08 (rúbrica completa sobre los 15+2 laboratorios), corrección de bloqueantes y sincronización documental final (`LEARNING_ARCHITECTURE.md`, `ROADMAP.md`, `README.md`, `README_ESP.md`) + informe técnico final de 15 puntos.
