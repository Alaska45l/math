<div align="center">
  <img src="assets/github/readme_esp.webp" alt="Alaska — tutora de Visual Novel y mascota del pizarrón" width="100%">
  <h1>Alaska Math Lab</h1>
  <p><strong>Laboratorios interactivos de matemática desde primeros principios, con diagnóstico conceptual, exploración experimental y una arquitectura de aprendizaje adaptativo en desarrollo.</strong></p>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-ES2023%2B%20Modules-F7DF1E?style=for-the-badge&logo=javascript&logoColor=111111" alt="Vanilla ES Modules">
  <img src="https://img.shields.io/badge/Dependencies-Zero%20Runtime-2EAD33?style=for-the-badge&logo=node.js&logoColor=white" alt="Zero runtime dependencies">
  <img src="https://img.shields.io/badge/SVG-Interactive%20Boards-FFB13B?style=for-the-badge&logo=svg&logoColor=111111" alt="Interactive SVG">
  <img src="https://img.shields.io/badge/Playwright-Visual%20%26%20DOM%20QA-2EAD33?style=for-the-badge&logo=playwright&logoColor=white" alt="Playwright QA">
</p>

Alaska Math Lab es un laboratorio web local-first para aprender matemática de ingreso universitario y contenidos iniciales de Análisis. Su propósito es ayudar a comprender por qué funcionan las ideas matemáticas, experimentar con sus consecuencias, reconocer errores de razonamiento y transferir lo aprendido a problemas nuevos.

En lugar de presentar reglas como recetas aisladas, el proyecto representa estructuras matemáticas mediante objetos que se pueden manipular: circuitos lógicos, conectores dimensionales, rectas numéricas, cintas de sucesiones, planos cartesianos, espejos, curvas y modelos exponenciales.

La experiencia combina tres capas:

- **Laboratorios matemáticos:** simuladores y representaciones interactivas que hacen observables las relaciones abstractas.
- **Acompañamiento narrativo:** Alaska, una tutora con motor Visual Novel, guía explicaciones, pistas y diagnósticos cuando su intervención aporta valor.
- **Aprendizaje durable:** una arquitectura pedagógica en desarrollo que organiza recuperación activa, práctica distribuida, intercalación, metacognición y transferencia.

**El objetivo no es maximizar el tiempo de pantalla, las rachas ni la cantidad de clics. Es desarrollar razonamiento matemático independiente que persista más allá de cada sesión.**

---

## Estado del proyecto

El repositorio combina capacidades implementadas con una arquitectura de aprendizaje que todavía debe construirse por etapas. Esta distinción es deliberada: una especificación documentada no equivale a una funcionalidad disponible.

| Área | Estado actual |
|---|---|
| Laboratorios interactivos y planos SVG | Implementado en las 11 unidades del programa UNMDP Exactas (15 laboratorios + 2 evaluaciones integradoras) |
| Primitivas compartidas de UI y matemática pura | Implementado (`js/core/board-kit.js`, `js/core/math/{polynomials,trigonometry}.js`) |
| Evaluadores algebraicos y trigonométricos mediante AST | Implementado (`expr.js`, `logic.js`, `polynomials.js`, `trigonometry.js`, `transfer-classifiers/shared-ast.js`) |
| Diagnósticos de errores conceptuales | Implementado en los 15 laboratorios con taxonomía normalizada y poses contextuales de Alaska |
| Tutora Visual Novel, guiones, poses y audio procedural | Implementado (`js/core/vn.js`, `js/core/sound.js`) |
| Glosario contextual y pizarra de trabajo | Implementado (`js/core/glossary.js`: 54 términos resolviendo el 100% de `data-gloss` en las 18 páginas) |
| Progreso local por sección y competencia | Implementado con almacén centralizado (`alaska:learning:v1`) y migración no destructiva legacy |
| Motor central de competencias y DAG en 2 pasos | Implementado (`curriculum-registry.js`: 15 módulos, 88 competencias, DAG acíclico con evidencia estricta) |
| Repetición espaciada adaptativa | Implementado (`js/core/learning/scheduler.js` ventanas deterministas `review_due`) |
| Intercalación global de práctica | Implementado (`js/core/learning/exercise-selector.js`: `excludeUnseen: true` global y prioridad de reparación) |
| Motor modular de transferencia inter-módulo | Implementado (`transfer.js` + `transfer-classifiers/*`: 8 familias incl. Radical/Irracional, 9 familias de retos, guardia `unseen`) |
| Cuaderno de Misterios Abiertos y reentrada en el hub | Implementado (`js/core/learning/mysteries.js`: 13 entradas U01–U11, tope 5 abiertos, invariante de no-maestría; `#hub-reentry`) |
| Atlas longitudinal de errores | Implementado en los 15 laboratorios (`js/core/learning/dashboard.js` `mountCompetencyDashboard`) |
| Calibración metacognitiva de confianza | Planificado |
| Campamento persistente y autónomo | Exploración futura |
| Evaluaciones integradoras de 6 fases (Jefes) | Implementado (`js/core/learning/boss-engine.js`, `jefe-integrador-1.html`, `simulacro-global.html`) |

El estado detallado de implementación y las dependencias entre tareas se mantienen en [ROADMAP.md](ROADMAP.md). La arquitectura pedagógica objetivo, sus fundamentos y las referencias científicas están en [LEARNING_ARCHITECTURE.md](LEARNING_ARCHITECTURE.md).

### Cobertura Pedagógica y Técnica Verificada (11 Unidades · 15 Laboratorios · 2 Integradores · 88 Competencias)

Los 15 módulos de unidad exponen `competencies-map.js` + `learning-adapter.js`, metadatos uniformes de 8-tupla en chequeos y retos, y `mountCompetencyDashboard` en `#sec-repaso`. Suite verificada: **650 / 650 PASS** en **115 archivos de prueba** (`node --test tests/*.test.mjs tests/*/*.test.mjs`) y 18/18 páginas verificadas en Chromium Headless.

## Qué ofrece actualmente

El hub (`index.html`, `js/core/nav.js`) cubre las **11 unidades** del programa de ingreso de UNMDP Exactas mediante **15 laboratorios** y **2 evaluaciones integradoras sin cronómetro**:

| Unidad | Laboratorio / Evaluación | Entrada | Enfoque |
|---|---|---|---|
| U01 · Números reales | Potencias y Raíces | [potencias-raices.html](potencias-raices.html) | Dos mundos (+0 vs ×1), exponentes, raíces, racionalización y restricciones en ℝ. |
| U01 · Números reales | Desigualdades compuestas | [desigualdades.html](desigualdades.html) | Desigualdades como circuitos en serie (AND) y paralelo (OR), polaridad e intervalos Exactas. |
| U01 · Números reales | Unidades y análisis dimensional | [unidades.html](unidades.html) | Conversión mediante factores unitarios, potencias de unidades y neutro multiplicativo `1`. |
| U02 · Funciones | Laboratorio de Funciones | [funciones.html](funciones.html) | Unicidad, dominio e imagen, conjuntos de positividad, monotonía, secante e inversa. |
| U02 · Funciones | Valor Absoluto y Partes | [valor-absoluto.html](valor-absoluto.html) | Distancia 1D (también U01 `#sec-1`), espejo cartesiano `a|x−h|+k`, tramos y escalonadas. |
| U02 · Funciones | Sucesiones (Dominio en $\mathbb{N}$) | [sucesiones.html](sucesiones.html) | Sucesiones aritméticas y geométricas, reglas recursivas y explícitas, signos y límites. |
| U03 · Función lineal | Función Lineal y Geometría | [lineal.html](lineal.html) | Pendiente $m = \operatorname{tg}(\alpha)$, formas explícita/implícita/segmentaria, paralelismo, perpendicularidad y mediatriz. |
| U04 · Sistemas | Sistemas de Ecuaciones 2×2 | [sistemas.html](sistemas.html) | Resolución algebraica y gráfica, clasificación SCD / SCI / SI, sistemas paramétricos y modelado. |
| U05 · Cuadrática | Función Cuadrática y Parábolas | [cuadraticas.html](cuadraticas.html) | Modelo de área, factorización, formas canónica/factorizada/polinómica, completar cuadrado, $\Delta$, Vieta y optimización. |
| U06 · Polinomios | Polinomios, Ruffini y Gauss | [polinomios.html](polinomios.html) | Grado, división euclídea, Ruffini con reescalado $(ax-b)$, Resto, Gauss y multiplicidades. |
| U07 · Racional e irracional | Racionales e Irracionales | [racionales-irracionales.html](racionales-irracionales.html) | MCM polinómico, dominio, agujeros evitables vs. asíntotas, ecuaciones irracionales y raíces extraviadas. |
| U08 · Exponencial | Funciones Exponenciales | [exponenciales.html](exponenciales.html) | Modelos $k \cdot a^x$, base natural $e$, asíntotas horizontales, estudio completo y ecuaciones. |
| U09 · Logarítmica | Funciones Logarítmicas | [logaritmicas.html](logaritmicas.html) | Existencia, propiedades operativas, cambio de base, espejo inverso de $a^x$ y ecuaciones. |
| U10 · Razones trig. | Razones Trigonométricas | [razones-trigonometricas.html](razones-trigonometricas.html) | Triángulos rectángulos, Pitágoras, SOHCAHTOA, elevación/depresión, grados/radianes, arcos y cuerpos. |
| U11 · Funciones trig. | Funciones Trigonométricas | [funciones-trigonometricas.html](funciones-trigonometricas.html) | Clases $C_\alpha$, seis funciones con dominios y polos diferenciados, identidades y ecuaciones periódicas. |
| U01–U06 · Síntesis | Jefe Integrador 1 | [jefe-integrador-1.html](jefe-integrador-1.html) | Evaluación integradora de 6 fases (`Reconocer` $\to$ `Debrief`) sin cronómetro punitivo. |
| U01–U11 · Global | Simulacro Integrador Global | [simulacro-global.html](simulacro-global.html) | Recorrido transversal completo con seguimiento independiente vs. asistido y rutas de reparación. |

La página de Unidades conserva además una redirección legacy en el repositorio: [laboratorio_unidades.html](laboratorio_unidades.html). La navegación principal utiliza **unidades.html**.

### Principios matemáticos del proyecto

- **Primeros principios antes que trucos:** explicar las transformaciones mediante propiedades y equivalencias, no mediante expresiones como “pasa al otro lado y cambia de signo”.
- **Equivalencia antes que coincidencia textual:** fórmulas, polinomios, intervalos y ángulos se analizan mediante árboles sintácticos y capas matemáticas exactas en vez de comparar cadenas.
- **Diagnóstico antes que una cruz roja:** los errores conocidos se asocian a una hipótesis conceptual y a una intervención útil.
- **Manipulación con significado:** mover un objeto permite observar una relación matemática, no ser una animación sin consecuencias.
- **Precisión formal:** gráficos, dominios, fronteras, signos y resultados conservan su significado matemático.
- **Retirada gradual de ayudas:** el acompañamiento conduce a la resolución independiente, sin crear dependencia de la interfaz o de Alaska.

## Cómo debería funcionar el aprendizaje

La arquitectura objetivo sigue un ciclo que conecta exploración y consolidación:

1. **Predecir:** formular una hipótesis antes de revelar el resultado.
2. **Experimentar:** modificar variables u objetos en un widget.
3. **Observar:** identificar qué cambia, qué permanece y por qué.
4. **Formalizar:** conectar la observación con definiciones, propiedades y expresiones simbólicas.
5. **Practicar:** resolver problemas con ayudas que se retiran progresivamente.
6. **Recuperar:** volver a utilizar el concepto después de un intervalo.
7. **Transferir:** aplicarlo a un problema nuevo, con otra apariencia o representación.

No todas las actividades deben contener todas las etapas. La secuencia se adapta al concepto, al conocimiento previo y al estado de aprendizaje.

La arquitectura completa está especificada en [LEARNING_ARCHITECTURE.md](LEARNING_ARCHITECTURE.md). Sus estrategias centrales incluyen recuperación activa, práctica distribuida, intercalación, ejemplos resueltos con retirada gradual de pasos, comparación de métodos, autoexplicación, calibración de confianza y traducción entre representaciones.

## Alaska: tutora, no sustituta del razonamiento

Alaska es una presencia narrativa que interviene de forma contextual:

- Explica un prerrequisito cuando detecta una laguna.
- Señala qué propiedad o paso necesita revisión.
- Cambia de representación cuando una explicación no alcanza.
- Ofrece pistas graduadas sin revelar inmediatamente la solución.
- Reconoce estrategias matemáticas concretas, no sólo respuestas correctas.
- Se retira cuando el estudiante puede continuar de manera autónoma.

Su personalidad puede ser irónica, expresiva y tsundere. El humor nunca debe convertirse en humillación, presión, culpa o evaluación de la capacidad personal del estudiante.

## Arquitectura técnica

El proyecto utiliza HTML, CSS y módulos JavaScript nativos, sin dependencias de ejecución. No utiliza frameworks de UI, bibliotecas externas de graficación, `eval()` ni `new Function()`.

La lógica matemática se separa de la representación y de los eventos DOM. Expresiones, polinomios, intervalos y ángulos se analizan mediante AST y capas de aritmética exacta (`js/core/math/` y `js/modules/*/expr.js`).

### Núcleo compartido (`js/core/`)

| Archivo / Directorio | Responsabilidad |
|---|---|
| `js/core/dom.js` | Helpers DOM/SVG, montaje, delegación de eventos y store reactivo. |
| `js/core/plot.js` y `js/core/board-kit.js` | Conversión de coordenadas, planos SVG, `attachSvgDrag` con soporte de teclado y POE en 2 etapas (`createPredictBox`). |
| `js/core/math-format.js` | Formato matemático (`fmt()` con coma decimal es-AR, signo menos Unicode `−`, fracciones horizontales). |
| `js/core/math/{polynomials,trigonometry}.js` | Aritmética exacta de polinomios/Ruffini/Gauss (U06–U07) y trigonometría exacta/congruencias $C_\alpha$ (U10–U11). |
| `js/core/vn.js` | HUD Visual Novel, diálogo, 17 poses y reacciones de Alaska. |
| `js/core/sound.js` | Síntesis procedural de sonidos (Web Audio API) y preferencias de audio. |
| `js/core/nav.js` | Navegación global de 11 unidades / 18 páginas, mega-menú curricular, integradores y controles compartidos. |
| `js/core/glossary.js` | Glosario contextual con 54 términos (`GLOSSARY_TERMS`) resolviendo el 100% de `data-gloss` en todas las páginas. |
| `js/core/scratchpad.js` | Pizarra de trabajo auxiliar. |
| `js/core/learning/events.js` | Contrato, fábrica y validación de eventos inmutables `LearningEvent` (15 módulos + 2 integradores). |
| `js/core/learning/competencies.js` y `curriculum-registry.js` | Registro global en 2 pasos que valida el DAG acíclico de 15 módulos y 88 competencias. |
| `js/core/learning/progress-store.js` | Persistencia local (`alaska:learning:v1`), log acotado (200 eventos), `state.mysteries` y reportes KPI. |
| `js/core/learning/mastery.js` | Máquina de estados conservadora de 7 estados (`unseen` $\to$ `durable`) sin consolidación por único acierto. |
| `js/core/learning/scheduler.js` | Planificador determinista de ventanas de repaso espaciado (`review_due`). |
| `js/core/learning/exercise-selector.js` | Selector adaptativo e intercalación global (`selectGlobalInterleavedBatch`, `excludeUnseen: true`, reparación de prerrequisitos). |
| `js/core/learning/transfer.js` y `transfer-classifiers/*` | Motor modular por plugins para 8 familias de modelos (`linear`, `quadratic`, `polynomial`, `rational`, `radical`, `exponential`, `logarithmic`, `trigonometric`) + `shared-ast.js` (0 imports hacia `js/modules/*`, guardia `unseen`). |
| `js/core/learning/mysteries.js` | Cuaderno de Misterios Abiertos (`OPEN_MYSTERIES`: 13 misterios U01–U11, tope 5 abiertos, invariante de no-maestría, `mountMysteriesNotebook`). |
| `js/core/learning/dashboard.js` | Dashboard unificado de competencias y Atlas de Errores (`mountCompetencyDashboard`). |
| `js/core/learning/boss-engine.js` | Motor de evaluaciones integradoras de 6 fases sin cronómetro (`Reconocer` $\to$ `Debrief`). |
| `js/core/learning/migrations.js` | Utilidades de migración no destructiva preservando claves legacy de módulos homogeneizados. |

### Módulos matemáticos (`js/modules/`)

- **Unidad 01:** `potencias-raices/`, `circuitos/` (`desigualdades.html`), `dimensional/` (`unidades.html`).
- **Unidad 02:** `funciones/`, `valor-absoluto/`, `sucesiones/`.
- **Unidad 03:** `lineal/`.
- **Unidad 04:** `sistemas/`.
- **Unidad 05:** `cuadraticas/`.
- **Unidad 06:** `polinomios/`.
- **Unidad 07:** `racionales-irracionales/`.
- **Unidad 08:** `exponenciales/`.
- **Unidad 09:** `logaritmicas/`.
- **Unidad 10:** `razones-trigonometricas/`.
- **Unidad 11:** `funciones-trigonometricas/`.
- **Integradores:** `jefes/integrador-1.js` (`jefe-integrador-1.html`) y `jefes/simulacro-global.js` (`simulacro-global.html`).

Los 15 módulos de unidad comparten el contrato pedagógico unificado (`competencies-map.js`, `learning-adapter.js`, 8-tupla uniforme, `mountCompetencyDashboard` y `alaska:learning:v1`), conservando representaciones y motores matemáticos propios por dominio.

## Documentación del proyecto

Estos documentos tienen responsabilidades diferentes y deben leerse en conjunto:

| Documento | Pregunta que responde | Autoridad |
|---|---|---|
| [LEARNING_ARCHITECTURE.md](LEARNING_ARCHITECTURE.md) | ¿Qué procesos de aprendizaje queremos apoyar y cómo medirlos? | Decisiones pedagógicas, modelo de competencias, recuperación y evaluación. |
| [DESIGN_PHILOSOPHY.md](DESIGN_PHILOSOPHY.md) | ¿Cómo debe presentarse y comportarse la experiencia? | Identidad visual, interacción, feedback, narrativa y accesibilidad. |
| [ROADMAP.md](ROADMAP.md) | ¿Qué se construye, en qué orden y con qué criterios de aceptación? | Secuencia de implementación, dependencias y estado del trabajo. |
| README.md | ¿Qué es el proyecto y qué está disponible hoy? | Presentación pública y mapa de documentación; no reemplaza las especificaciones anteriores. |

### Instrucciones para agentes de programación

Antes de modificar el proyecto:

1. Leer este README para reconocer el estado real del repositorio.
2. Leer LEARNING_ARCHITECTURE.md si el cambio afecta ejercicios, diagnóstico, progreso, motivación, recuperación, planificación o evaluación.
3. Leer DESIGN_PHILOSOPHY.md si el cambio afecta composición, tipografía, color, animación, interacción, Alaska o accesibilidad.
4. Leer ROADMAP.md para comprobar dependencias, prioridad, estado y criterios de aceptación.
5. Inspeccionar los archivos y patrones reales del módulo afectado antes de proponer una abstracción nueva.

Durante el trabajo:

- No presentar una función planificada como implementada.
- No inventar resultados científicos ni convertir hipótesis de diseño en hechos demostrados.
- No alterar la semántica matemática para simplificar la UI.
- No reemplazar una lógica pura ya probada por lógica duplicada dentro de un componente.
- No añadir dependencias de ejecución sin una justificación técnica y una decisión documentada.
- Mantener compatibilidad con teclado, touch, lectores de pantalla, movimiento reducido y pantallas estrechas.
- Preferir cambios incrementales que puedan probarse aisladamente.
- Actualizar ROADMAP.md cuando cambie el estado de una tarea y README.md sólo cuando cambie una capacidad visible o una instrucción de uso.
- Si una decisión afecta varias capas, actualizar la especificación correspondiente además del código.

Al terminar, informar archivos modificados, pruebas ejecutadas, resultados observados, limitaciones y cualquier decisión pendiente. Nunca afirmar que una prueba pasó si no se ejecutó.

## Requisitos

| Herramienta | Uso |
|---|---|
| Python 3 o un servidor HTTP estático equivalente | Servir los archivos y habilitar módulos ES nativos. |
| Node.js 20+ | Ejecutar pruebas con node --test. |
| Playwright Chromium | Ejecutar verificaciones visuales y de interacción; requerido sólo para esos scripts. |

## Instalación

Clonar el repositorio y servir el directorio raíz:

    python3 -m http.server 8000 --bind 127.0.0.1

Abrir http://127.0.0.1:8000/ en el navegador.

No abrir las páginas directamente con file:// porque los módulos ES nativos requieren un servidor HTTP.

## Pruebas y verificación

Ejecutar las pruebas unitarias disponibles:

    node --test tests/*.test.mjs tests/*/*.test.mjs

Con el servidor activo, ejecutar las verificaciones Playwright:

    BASE_URL=http://127.0.0.1:8000 node scripts/verify-pages.mjs
    BASE_URL=http://127.0.0.1:8000 node scripts/verify-interactions.mjs

Los scripts verifican aspectos como respuestas HTTP, errores de consola, desbordamiento horizontal, interacción y persistencia de arrastre. Los comandos deben mantenerse sincronizados con los scripts y suites que existan realmente.

## Hojas de estudio imprimibles

Las lecciones de Sucesiones y Valor Absoluto incluyen hojas de repaso con estilos de impresión para retirar controles interactivos y producir material de estudio legible. Consultar cada módulo para conocer el alcance actual de su exportación.

## Licensing & Intellectual Property (Split Licensing)

This project uses a split licensing model to separate the technical source code from its narrative identity and pedagogical content:

1. **Source Code & Technical Engine (`js/`, `css/`, `scripts/`, `tests/`):**
   Distributed under the terms of the **GNU Affero General Public License v3.0 (AGPLv3)**. See the [LICENSE](LICENSE) file for details.

2. **Pedagogical Content & Lesson Prose (`*.html`, `*.md`, scripts):**
   Licensed under **[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/)**. You are free to share and adapt this material for non-commercial educational purposes, provided you give appropriate credit to **Alaska Math Lab**.

3. **Character "Alaska" & Visual Assets (`assets/vn/`, `assets/github/`):**
   © 2026 Alaska45l. **All rights reserved.** The character design of Alaska, her expression sprites (`assets/vn/*.webp`), chibi variants, and conceptual art are included in this repository strictly for the execution and visualization of this educational web lab. Independent redistribution, modification, AI model training, or use in third-party products (commercial or otherwise) is strictly prohibited without explicit written consent.

