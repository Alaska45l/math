# ROADMAP — Alaska Math Lab

**Estado del documento:** hoja de ruta activa.
**Última revisión:** 5 de noviembre de 2026.
**Principio rector:** construir primero la infraestructura que permite aprender y medir aprendizaje; después ampliar la experiencia narrativa y la gamificación.

Este roadmap organiza la evolución técnica y pedagógica del repositorio. No es una promesa de fechas ni una afirmación de que las funciones descritas ya estén implementadas. Cada elemento utiliza un estado explícito y debe cambiarse sólo después de inspeccionar el código y verificar sus criterios de aceptación.

---

## 1. Propósito y límites

Alaska Math Lab busca pasar de una colección de simuladores interactivos a un entorno coherente de aprendizaje matemático: exploración, formalización, práctica, recuperación, transferencia y autonomía progresiva.

El roadmap debe proteger tres objetivos simultáneos:

1. **Rigor matemático:** ninguna mejora narrativa, visual o algorítmica puede alterar el significado de una operación, una expresión, un dominio o un resultado.
2. **Aprendizaje durable:** el éxito se mide mediante recuperación posterior, comprensión, selección adecuada de procedimientos y transferencia, no sólo mediante finalizaciones o tiempo de uso.
3. **Experiencia amable:** el estudiante debe poder avanzar, equivocarse, descansar y volver sin castigos por ausencia, pérdida de progreso ni presión artificial.

El documento se coordina con:
- **LEARNING_ARCHITECTURE.md:** especificación pedagógica, fundamentos científicos, modelo de competencias, eventos, estados y evaluación.
- **DESIGN_PHILOSOPHY.md:** sistema visual, interacción, narrativa, feedback, accesibilidad y reglas de experiencia.
- **README.md:** descripción pública del producto y capacidades disponibles.

---

## 2. Contrato documental para agentes

### 2.1. Orden de lectura obligatorio

Antes de cambiar código:
1. Leer README.md y reconocer las capacidades realmente implementadas.
2. Leer este ROADMAP.md para identificar fase, dependencias, estado y aceptación.
3. Leer LEARNING_ARCHITECTURE.md cuando el cambio afecte contenido, ejercicios, errores, progreso, tutoría, motivación, adaptación o evaluación.
4. Leer DESIGN_PHILOSOPHY.md cuando afecte interfaz, interacción, visualización, movimiento, tipografía, color, sonido, Alaska o mundo narrativo.
5. Inspeccionar los módulos, pruebas y estilos afectados. Los documentos orientan; el código existente determina el comportamiento real que debe preservarse.

### 2.2. Jerarquía ante conflictos

- La corrección matemática y los contratos funcionales del código probado prevalecen sobre una preferencia visual o narrativa.
- LEARNING_ARCHITECTURE.md define el comportamiento de aprendizaje esperado.
- DESIGN_PHILOSOPHY.md define cómo se presenta ese comportamiento.
- Este roadmap define secuencia, alcance y aceptación, pero no autoriza a ignorar las dos especificaciones anteriores.
- README.md describe el estado actual; no es una fuente de especificación técnica detallada.

Si dos documentos entran en conflicto, no elegir silenciosamente. Corregir el documento que tenga la responsabilidad de esa decisión y registrar el cambio en el mismo conjunto de trabajo.

### 2.3. Estados de trabajo

| Estado | Significado |
|---|---|
| Implementado | Existe en el código actual y cumple una verificación concreta. |
| Parcial | Existe una parte, pero no el alcance completo descrito. |
| Planificado | Aprobado como dirección; todavía no está construido. |
| En evaluación | Requiere prototipo, evidencia o comparación antes de decidir. |
| Bloqueado | Depende de una decisión, dato o componente que todavía falta. |
| Validado | Implementado y comprobado con pruebas técnicas y criterios pedagógicos aplicables. |

No marcar como Validado un mecanismo sólo porque el código funciona. La validez pedagógica necesita observación o evaluación del aprendizaje.

### 2.4. Reglas de ejecución para agentes

- Implementar una unidad vertical pequeña: datos, lógica, UI, persistencia y pruebas necesarias para que la función sea comprobable.
- No crear un framework general antes de tener dos o más casos reales que justifiquen la abstracción.
- No duplicar parsers, evaluadores, diagnósticos o lógica matemática de los módulos existentes.
- Mantener la lógica pedagógica pura siempre que sea posible; el DOM no debe decidir qué concepto está dominado.
- Mantener el carácter local-first y sin dependencias de runtime salvo decisión explícita.
- No introducir telemetría remota, cuentas, sincronización ni transmisión de datos personales como consecuencia incidental.
- No añadir dark patterns, castigos por ausencia, pérdida de rachas, recursos que caduquen o personajes que sufran por falta de conexión.
- No declarar una mejora de aprendizaje por aumento de clics, duración de sesión o visitas.
- Ejecutar las pruebas pertinentes y documentar cuáles no pudieron ejecutarse.
- Actualizar estados del roadmap sólo después de comprobar los criterios; actualizar README si cambió la experiencia disponible y las otras especificaciones si cambió el contrato del producto.

### 2.5. Regla de Gobernanza Curricular

Ningún ejercicio, chequeo o familia de retos generativos puede crearse, modificarse o expandirse en el repositorio sin cumplir estrictamente con los siguientes cuatro requisitos obligatorios:
1. **Vinculación a Competencia Oficial:** Cada ejercicio debe declarar su pertenencia a una o más competencias registradas en el mapa canónico del módulo (`competencies-map.js`).
2. **Esquema Completo de Metadatos (8-tupla):** Todo ítem debe declarar explícitamente `exerciseId`, `competencyIds`, `stage`, `representation`, `difficulty`, `transferDistance`, `diagnosticIds` y `hints`.
3. **Andamiaje Progresivo No Filtrante:** Cada ejercicio debe contar con exactamente 3 pistas progresivas. La Pista 3 debe andamiar el paso algebraico o conceptual final sin filtrar ni contener literalmente la respuesta esperada (`expected`), para evitar fugas de solución o atajos mecánicos.
4. **Verificación Automatizada Mandatoria:** Toda adición debe acompañarse de pruebas unitarias y de integración que verifiquen el determinismo pseudoaleatorio (PRNG Mulberry32), la no-fuga en baterías adversariales multidimensionales, y cero emojis Unicode.

---

## 3. Línea base: estado observado del repositorio

Esta sección describe capacidades presentes en el repositorio al momento de la revisión. No equivale a una auditoría exhaustiva de cada ejercicio.

| Área | Estado observado | Próxima necesidad |
|---|---|---|
| Núcleo DOM/SVG y store reactivo | Implementado y Validado (`dom.js`, `board-kit.js`) | Mantener accesibilidad por teclado y zero-eval. |
| Planos y controles arrastrables | Implementado y Validado en las 11 unidades | Conservar `sameNodeReference` y `role="slider"`. |
| Evaluadores AST y matemática pura | Implementado y Validado (`expr.js`, `logic.js`, `polynomials.js`, `trigonometry.js`, `shared-ast.js`) | Mantener cobertura de borde y notación Exactas UNMDP. |
| Diagnósticos conceptuales | Implementado y Validado en los 15 laboratorios | Enriquecer guiones contextuales según uso real. |
| Generadores por semilla | Implementado y Validado en los módulos con entrenador PRNG | Conservar determinismo y no-fuga en Hint 3. |
| Chequeos con pistas y soluciones | Implementado y Validado (esquema uniforme de 8-tupla en los 15 módulos) | Mantener paridad ante futuras adiciones curriculares. |
| Visual Novel de Alaska | Implementado y Validado | Hacer las intervenciones contextuales y gradualmente menos necesarias. |
| Glosario contextual | Implementado y Validado (`glossary.js`: 54 términos, resolución 100% en 18 HTML) | Ampliar vínculos cuando se incorporen términos nuevos. |
| Pizarra de trabajo | Implementada (`scratchpad.js`) | Integrarla con sesiones sin convertirla en panel invasivo. |
| Progreso local unificado | Implementado y Validado (`alaska:learning:v1` + migración no destructiva legacy) | Conservar retrocompatibilidad ante futuras versiones de esquema. |
| Motor central de competencias y DAG | Implementado y Validado (`curriculum-registry.js`: 15 módulos, 88 competencias, DAG acíclico) | Validar en cada cambio curricular. |
| Planificador de repasos | Implementado y Validado (`scheduler.js`) | Ventanas deterministas de repaso espaciado (`review_due`). |
| Intercalación global | Implementado y Validado (`exercise-selector.js`: `excludeUnseen: true` y reparación por prerrequisitos) | Sintonizar batch global según evidencia real. |
| Transferencia inter-módulo | Implementado y Validado (`transfer.js` + 8 clasificadores en `transfer-classifiers/*`, 9 familias, guardia `unseen`) | Conservar cero imports hacia `js/modules/*`. |
| Cuaderno de Misterios Abiertos | Implementado y Validado (`mysteries.js`: 13 misterios U01–U11, tope 5 abiertos, invariante de no-maestría) | Evaluar uso voluntario en cohortes reales. |
| Motor de jefes e integradores | Implementado y Validado (`boss-engine.js`, `jefe-integrador-1.html`, `simulacro-global.html`) | Ampliar bancos integradores con nuevos parciales oficiales. |
| Confianza metacognitiva | Planificado | Debe ser opcional y no interpretarse como medición perfecta. |
| Campamento autónomo | Idea futura | Sólo después de validar el núcleo de aprendizaje y motivación. |

### 3.1. Laboratorios publicados en el hub

El hub (`index.html`, `js/core/nav.js`) cubre las **11 unidades** del programa de Ingreso FCEyN UNMDP mediante **15 laboratorios interactivos** y **2 evaluaciones integradoras** (18 páginas canónicas en total):

- Unidad 01 · Números reales: `potencias-raices.html`, `desigualdades.html`, `unidades.html` (y `valor-absoluto.html#sec-1`)
- Unidad 02 · Funciones: `funciones.html`, `valor-absoluto.html`, `sucesiones.html`
- Unidad 03 · Función lineal: `lineal.html`
- Unidad 04 · Sistemas de ecuaciones: `sistemas.html`
- Unidad 05 · Función cuadrática: `cuadraticas.html`
- Unidad 06 · Polinomios: `polinomios.html`
- Unidad 07 · Función racional e irracional: `racionales-irracionales.html`
- Unidad 08 · Función exponencial: `exponenciales.html`
- Unidad 09 · Función logarítmica: `logaritmicas.html`
- Unidad 10 · Razones trigonométricas: `razones-trigonometricas.html`
- Unidad 11 · Funciones trigonométricas: `funciones-trigonometricas.html`
- Evaluaciones integradoras: `jefe-integrador-1.html` (Unidades 01–06) y `simulacro-global.html` (Unidades 01–11)

Existe también `laboratorio_unidades.html` como redirección legacy en el repositorio; la navegación principal utiliza `unidades.html`.

---

## 4. Reglas de priorización

**Prioridades:** P0 = infraestructura indispensable; P1 = núcleo de aprendizaje; P2 = experiencia y gamificación dependientes del núcleo; P3 = expansión curricular o mejoras no bloqueantes.

Las tareas se ordenan por dependencias y valor pedagógico, no por atractivo visual.

1. **Primero la instrumentación y el modelo de competencias.** Sin observar qué concepto se practica, no se puede programar un repaso inteligente.
2. **Luego recuperación y repetición distribuida.** Una agenda de repaso necesita evidencia de intentos, ayudas, fechas y objetivos.
3. **Después selección e intercalación.** No mezclar preguntas al azar: la selección requiere saber qué estructuras se deben discriminar.
4. **Luego intervenciones profundas.** Predicción, ejemplos graduados, comparación de métodos, autoexplicación y traducción entre representaciones deben estar asociadas a competencias.
5. **Finalmente expansión narrativa.** El mundo y los jefes deben expresar progreso real, nunca reemplazarlo.

Split-Workbench, accesibilidad, rendimiento y correcciones de UX pueden avanzar en paralelo, siempre que no bloqueen el modelo pedagógico ni comprometan legibilidad.

---

## 5. Fases de implementación

### Fase 0 — Contratos, inventario y mapa curricular

**Estado:** Implementado y Validado (Exponenciales y Cuadráticas).
**Prioridad:** P0.
**Objetivo:** crear el lenguaje común que permitirá que módulos diferentes alimenten un sistema de aprendizaje coherente.

#### Tareas

- [x] Definir un inventario versionado de módulos, secciones, widgets y objetivos de aprendizaje.
- [x] Crear un mapa de competencias con IDs estables y descripciones observables (`competencies-map.js`).
- [x] Definir prerrequisitos explícitos; evitar relaciones circulares sin justificación (DAG acíclico certificado).
- [x] Asociar cada ejercicio existente a una o más competencias (30 checks por módulo con metadatos de 8-tupla).
- [x] Distinguir error conceptual, cálculo, notación, sintaxis, omisión de condición y respuesta inválida (taxonomías de 10 diagnósticos por módulo).
- [x] Definir los eventos mínimos a registrar (`LearningEvent` en `js/core/learning/events.js`).
- [x] Establecer qué información persiste localmente y durante cuánto tiempo (`progress-store.js`).
- [x] Agregar tests de integridad del mapa curricular y referencias a preguntas inexistentes.

#### Criterios de aceptación cumplidos y verificados

- No existen IDs duplicados ni ciclos en el DAG de prerrequisitos.
- Cada pregunta de `CHECKS_DATA` (30 en Exponenciales, 30 en Cuadráticas) y cada generador de retos (10 familias por módulo) declara su esquema completo de 8-tupla.
- La taxonomía diferencia errores cognitivos de errores de sintaxis o formato UNMDP.
- Cero emojis Unicode y 90 pistas artesanales por módulo donde Hint 3 no filtra `expected`.
- 100% de tests en verde en suites de integridad (`tests/learning/*.test.mjs`, `tests/exponenciales/*.test.mjs`, `tests/cuadraticas/*.test.mjs`).

---

### Fase 1 — Motor local de evidencia y progreso por competencia

**Estado:** Implementado y Validado (Exponenciales y Cuadráticas).
**Prioridad:** P0.
**Dependencias:** Fase 0.

#### Tareas

- [x] Crear un módulo puro para registrar y consultar eventos pedagógicos (`js/core/learning/events.js`).
- [x] Definir un esquema versionado para intentos, pistas, solución revelada, confianza opcional y respuesta.
- [x] Registrar resultado, competencia, tipo de pregunta, fecha, ayudas y diagnóstico.
- [x] Normalizar eventos provenientes de distintos tipos de chequeo (`recordExpAttempt`, `recordQuadAttempt`).
- [x] Guardar el historial con una capa de persistencia local (`progress-store.js` bajo `alaska:learning:v1`).
- [x] Mantener lectura de las claves actuales de progreso (`exponenciales:progreso:v1` y `cuadraticas:progreso:v1`).
- [x] Migrar de forma no destructiva; nunca borrar el progreso anterior ante un error de migración (`migrations.js`).
- [x] Implementar máquina de estados conservadora de dominio (`mastery.js` con 7 estados).
- [x] Eliminar bug de dominio espurio: 1 acierto $\to$ `developing`; requiere al menos 2 aciertos independientes en ejercicios distintos para `consolidating`.

#### Criterios de aceptación cumplidos y verificados

- Los eventos son inmutables y congelados (`Object.freeze`).
- Bounded event log (máximo 200 eventos en anillo para prevenir desbordes de `localStorage`).
- Retrocompatibilidad no destructiva garantizada al 100%.
- El motor se prueba sin DOM ni navegador (`tests/learning/*.test.mjs`).

---

### Fase 2 — Recuperación activa, repetición espaciada y reentrada

**Estado:** Implementado y Validado (Exponenciales y Cuadráticas).
**Prioridad:** P0.
**Dependencias:** Fase 1.

#### Tareas

- [x] Diseñar un planificador determinista y testeable de repasos (`js/core/learning/scheduler.js`).
- [x] Programar recuperaciones según evidencia de desempeño, tiempo desde el último intento, ayudas y errores (+4h en reparación, +24h en consolidación, +72h, +168h, +336h).
- [x] Diferenciar acierto independiente, acierto con pista, acierto después de ver solución y acierto tras recuperación en `mastery.js`.
- [x] Transición determinista a estado `review_due` cuando la ventana temporal se cumple.
- [x] Reentrada y comunicación transparente del motivo de selección adaptativa en interfaz de retos.

#### Criterios de aceptación cumplidos y verificados

- Planificador determinista testeado con marcas de tiempo sintéticas (`tests/learning/scheduler.test.mjs`).
- Ausencia tratada sin castigos de gamificación ni pérdida destructiva de progreso.

---

### Fase 3 — Selección adaptativa, intercalación y atlas de errores

**Estado:** Implementado y Validado (Exponenciales y Cuadráticas).
**Prioridad:** P1.
**Dependencias:** Fases 0 y 1; para adaptación temporal, Fase 2.

#### Tareas

- [x] Añadir metadatos pedagógicos uniformes (8-tupla) a las preguntas y retos existentes.
- [x] Clasificar preguntas por competencia, tipo de razonamiento, representación, dificultad y prerrequisitos.
- [x] Diseñar generadores por semilla deterministas (Mulberry32) con 10 familias por módulo.
- [x] Implementar selector adaptativo con intercalación cognitiva (`js/core/learning/exercise-selector.js`) priorizando `needs_repair` $\to$ `review_due` $\to$ `developing`.
- [x] Conectar el «Modo Inteligente (Recomendado por Alaska)» en las pestañas de Retos de ambos módulos.
- [x] Explicitar visualmente la justificación pedagógica en notas transparentes sobre el ejercicio.
- [x] Construir Atlas de Errores interactivo en los paneles de Repaso y Diagnóstico (`mountCompetencyDashboard`).

#### Criterios de aceptación cumplidos y verificados

- La selección adaptativa intercala evitando repetir consecutivamente la misma competencia.
- Se comunica de forma legible la razón de recomendación en español rioplatense.
- Atlas de Errores con poses contextuales de Alaska y enlaces directos a la sección de reparación.

---

### Fase 4 — Exploración productiva, andamiaje y transferencia

**Estado:** Implementado y Validado (8 familias de modelos, 9 familias `TRANSFER_FAMILIES` y POE en 2 etapas vía `board-kit.js`).
**Prioridad:** P1.
**Dependencias:** Fase 0; integración con Fase 1.

#### Tareas

- [x] Implementar motor modular de discriminación de modelos (`js/core/learning/transfer.js` + `transfer-classifiers/*`):
  - 8 familias: Lineal, Cuadrática, Polinómica, Racional, Radical/Irracional, Exponencial, Logarítmica y Trigonométrica.
  - Invariantes numéricos ($\Delta y$, $\Delta^2 y$, $\Delta^3 y$, razón $y_{i+1}/y_i$, $\Delta(y^2)$, recurrencia periódica), geometría cualitativa y equivalencia AST en `shared-ast.js` sin imports de `js/modules/*`.
- [x] Conectar modo de Transferencia Inter-Módulo con guardia estricta contra competencias `unseen` (`allowUnseen: false` por defecto).
- [x] Registrar eventos de transferencia con `stage: "transfer"` y `transferDistance: "far"`.
- [x] Probar suites de transferencia unitaria y no-fuga (`tests/learning/transfer.test.mjs`).
- [x] Crear patrón reusable de predicción en 2 etapas antes de revelar (`createPredictBox` en `js/core/board-kit.js`).
- [x] Registrar predicción y observación sin penalizar hipótesis razonables que resulten falsas.
- [x] Diseñar ciclos de hipótesis, experimentación, observación y formalización en las 11 unidades.
- [ ] Incorporar ejemplos resueltos con pasos interactivos de completar en módulos que aún sólo muestran solución completa.
- [ ] Diseñar autoexplicaciones breves estructuradas para pasos algebraicos seleccionados.
- [ ] Incorporar actividades guiadas de corrección de procedimiento sobre personaje ficticio.
- [x] Crear desafíos de traducción entre manipulador, gráfico, tabla, expresión simbólica y explicación verbal.
- [x] Invertir la dirección de la traducción: del gráfico a la fórmula y de la fórmula al gráfico.
- [x] Diseñar problemas de transferencia sin el widget que sirvió de apoyo (`transfer.js` y fase `Transferir` de `boss-engine.js`).
- [x] Evitar presentar varias representaciones simultáneas si no añaden una función cognitiva distinta.

#### Criterios de aceptación

- Las predicciones se registran antes de revelar la respuesta.
- Las ayudas se retiran de forma progresiva, no abrupta.
- La explicación final vuelve explícita la relación matemática.
- La transferencia cambia el contexto o la representación sin cambiar inadvertidamente el concepto evaluado.
- Se evalúa justificación cuando el objetivo sea conceptual, no sólo resultado numérico.

---

### Fase 5 — Metacognición y acompañamiento contextual

**Estado:** Parcial (glosario contextual ampliado a 54 términos y reducción gradual de ayudas; calibración voluntaria de confianza planificada).
**Prioridad:** P1.
**Dependencias:** Fases 1 y 3.

#### Tareas

- [ ] Añadir Convicción de Tiza: estimación voluntaria de confianza antes de comprobar.
- [ ] Comparar confianza y acierto a través del tiempo sin usarlo como diagnóstico psicológico.
- [ ] Detectar patrones de falsa seguridad y conocimiento frágil.
- [x] Añadir modos de intervención de Alaska vinculados a necesidades pedagógicas.
- [x] Adaptar el tono a la situación sin juzgar al estudiante.
- [x] Hacer que Alaska señale el objeto, variable o paso relevante del widget.
- [x] Añadir explicaciones contextuales desde el glosario (`js/core/glossary.js`, 54 términos).
- [x] Reducir ayudas y mensajes cuando el estudiante ya puede resolver independientemente.

#### Criterios de aceptación

- La confianza es opcional y se explica como autorregistro, no como examen.
- No se atribuye un rasgo personal al alumno a partir de una respuesta.
- Alaska no repite diálogos invasivos en cada interacción.
- El contenido puede completarse sin abrir el diálogo de Alaska.

---

### Fase 6 — Experiencia, reentrada y mundo narrativo

**Estado:** Parcial — Experiencia de navegación 11 unidades, reentrada de baja fricción (`#hub-reentry`) y Cuaderno de Misterios Abiertos (`#hub-mysteries`) implementados y validados; mundo narrativo autónomo planificado.
**Prioridad:** P2.
**Dependencias:** Fases 1 y 2 para eventos de progreso; Fase 4 para integrar actividades pedagógicas.

#### Tareas de experiencia

- [x] Mantener el plano cerca de la explicación y del chequeo correspondiente.
- [x] Mejorar navegación entre secciones, mega-menú curricular de 11 unidades (`js/core/nav.js`) y acceso a términos (`glossary.js`).
- [x] Implementar entrada de baja fricción en el hub (`#hub-reentry`: Continuar / Repasar competencias introducidas / Explorar).
- [x] Construir el Cuaderno de Misterios Abiertos (`js/core/learning/mysteries.js`: 13 misterios voluntarios, tope de 5 abiertos, invariante de no-maestría).
- [x] Permitir cerrar o descartar un misterio y ver su resolución sin penalización.
- [ ] Implementar Split-Workbench opcional para Sucesiones y Valor Absoluto, conservando vista de lectura.
- [ ] Implementar un plan de reentrada voluntario y editable al cierre de sesión.

#### Tareas narrativas

- [ ] Separar el estado del mundo del estado académico.
- [ ] Diseñar personajes con personalidades, necesidades y rutinas autónomas.
- [ ] Evitar que la ausencia del estudiante provoque deterioro, sufrimiento o pérdida.
- [ ] Asociar artefactos a descubrimientos matemáticos concretos.
- [ ] Permitir gastar recursos en personalización y construcción elegida.
- [ ] Mantener eventos narrativos breves, pausables y no intrusivos.
- [x] Respetar preferencias de sonido, movimiento y visibilidad.

#### Criterios de aceptación

- El mundo sigue siendo agradable después de una ausencia prolongada.
- Ningún recurso esencial para aprender depende de una recompensa aleatoria.
- Las actividades pedagógicas no quedan bloqueadas por una historia pendiente.
- La narrativa puede omitirse sin perder comprensión matemática.

---

### Fase 7 — Jefes, evaluaciones integradoras y simulación de examen

**Estado:** Implementado y Validado (`js/core/learning/boss-engine.js`, `jefe-integrador-1.html`, `simulacro-global.html`).
**Prioridad:** P2.
**Dependencias:** Fases 0, 1, 3 y 4.

#### Regla de diseño

Un jefe no es un formulario decorado ni una prueba de reflejos. Exige reconocimiento, predicción, modelado, resolución, transferencia y debrief sin cronómetro punitivo.

#### Estructura implementada (`boss-engine.js`)

1. **Reconocer:** identificar el tipo de objeto o problema.
2. **Predecir:** anticipar su comportamiento.
3. **Modelar:** elegir variables, restricciones y representación.
4. **Resolver:** ejecutar operaciones y justificar condiciones.
5. **Transferir:** resolver una variante nueva sin el andamiaje principal.
6. **Debrief:** informe de fases independientes vs. asistidas y enlaces directos de reparación por unidad.

#### Simulacro y evaluaciones integradoras

- [x] Reproducir convenciones de exámenes y actividades integradoras oficiales UNMDP en `jefe-integrador-1.html` (U01–U06) y `simulacro-global.html` (U01–U11).
- [x] Separar modo práctica de laboratorio de evaluaciones integradoras sin borrar el progreso del laboratorio.
- [x] Informar criterios de corrección, equivalencias aceptadas y distinción estricto independiente vs. asistido.
- [x] Generar informe de competencias y rutas de reparación en Fase 6 Debrief.

---

### Fase 8 — Validación pedagógica y expansión curricular

**Estado:** Expansión curricular de las 11 unidades Implementada y Validada (15 laboratorios, 88 competencias, DAG verificado); validación empírica longitudinal Planificada.
**Prioridad:** P1 continua; validación empírica P3.
**Dependencias:** instrumentación de Fase 1 y funciones de Fases 2–4.

#### Expansión curricular (Unidades 01–11 UNMDP Exactas)

- [x] Unidad 01–02 homogéneas: Potencias y Raíces, Desigualdades, Unidades, Funciones, Valor Absoluto y Sucesiones instrumentadas al motor central.
- [x] Unidad 03 · Función lineal (`lineal.html`) y Unidad 04 · Sistemas de ecuaciones (`sistemas.html`).
- [x] Unidad 05 · Función cuadrática (`cuadraticas.html`) y Unidad 06 · Polinomios (`polinomios.html`, contrato compartido `js/core/math/polynomials.js`).
- [x] Unidad 07 · Función racional e irracional (`racionales-irracionales.html`).
- [x] Unidad 08 · Función exponencial (`exponenciales.html`) y Unidad 09 · Función logarítmica (`logaritmicas.html`).
- [x] Unidad 10 · Razones trigonométricas (`razones-trigonometricas.html`) y Unidad 11 · Funciones trigonométricas (`funciones-trigonometricas.html`, contrato compartido `js/core/math/trigonometry.js`).

Cada módulo reutiliza la arquitectura de competencias, diagnósticos y evidencia, conservando una representación visual apropiada a su estructura matemática.

#### Validación empírica (pendiente de campo)

- [ ] Definir resultados de aprendizaje antes de cada experimento piloto.
- [ ] Comparar estrategias con contenidos y dificultad equivalentes.
- [ ] Medir retención inmediata y demorada.
- [ ] Medir transferencia a problemas nuevos.
- [ ] Medir recurrencia de errores y uso de ayudas.
- [ ] Revisar diferencias entre estudiantes y posibles efectos adversos.
- [ ] Documentar tamaño de muestra, limitaciones y criterios de análisis.
- [ ] No afirmar causalidad con muestras pequeñas o sin grupo de comparación adecuado.

---

## 6. Trabajo paralelo y dependencias

Hay líneas que pueden avanzar en paralelo sin invertir la prioridad pedagógica:

| Línea | Puede avanzar junto con | Restricción |
|---|---|---|
| Accesibilidad y responsive | Fases 0–8 | No sacrificar precisión ni área de interacción. |
| Split-Workbench | Fases 0–4 | Mantener vista de lectura y no bloquear móviles. |
| Limpieza de diagnósticos existentes | Fases 0–3 | No borrar casos de prueba o equivalencias válidas. |
| Guiones y sprites de Alaska | Fases 4–6 | Deben responder a objetivos pedagógicos y no interrumpir. |
| Campamento visual | Prototipo de Fase 6 | No construir economía compleja antes de evidencia académica. |
| Jefes como prototipos | Después de diseñar criterios de transferencia | No convertir tiempo de reacción en indicador de dominio. |

---

## 7. Arquitectura de referencia

La arquitectura exacta se define en LEARNING_ARCHITECTURE.md. Esta sección fija dependencias de alto nivel para evitar implementaciones aisladas.

Flujo conceptual:

1. El módulo produce una interacción o respuesta.
2. El validador matemático devuelve resultado, equivalencias y diagnósticos.
3. El adaptador pedagógico lo traduce a eventos tipados.
4. El registro local persiste evidencia.
5. El estado de competencias actualiza su estimación.
6. El planificador selecciona una actividad siguiente o un repaso.
7. La UI presenta la actividad y Alaska interviene si añade valor.

La lógica de dominio no debe depender del DOM, del sprite actual ni de las animaciones.

### Contratos importantes

- Los IDs de competencia son estables y con nombres semánticos.
- Los IDs de pregunta identifican el tipo de evidencia que produce.
- Los eventos registran la versión de esquema y el módulo de origen.
- Los resultados matemáticos y los diagnósticos se conservan separados del feedback visible.
- Los datos antiguos necesitan migración explícita.
- La UI nunca debe asumir que una respuesta correcta equivale a dominio.
- El planificador debe ser determinista y testeable con una fecha de referencia inyectada.

---

## 8. Métricas de éxito

No optimizar por tiempo de pantalla, clics, rachas ni frecuencia de apertura.

### Indicadores pedagógicos

| Indicador | Qué observa |
|---|---|
| Recuperación demorada | Si el estudiante recupera un concepto después de un intervalo. |
| Transferencia | Si lo aplica a problemas nuevos. |
| Independencia | Si resuelve sin pistas ni solución expuesta. |
| Recurrencia de errores | Si una concepción errónea vuelve a aparecer. |
| Selección de procedimiento | Si reconoce qué método corresponde. |
| Calibración | Si su confianza se acerca gradualmente a su rendimiento real. |
| Autoexplicación | Si puede justificar los pasos relevantes. |

### Indicadores de experiencia

- Facilidad de reentrada.
- Uso voluntario de misterios y exploración.
- Comprensión de las pistas.
- Interrupciones narrativas.
- Accesibilidad y errores de interacción.
- Capacidad de pausar y continuar sin pérdida.

Los indicadores de experiencia explican la usabilidad; no sustituyen las métricas de aprendizaje.

---

## 9. Definición de terminado para cada cambio

Un cambio que afecta una experiencia pedagógica se considera listo sólo cuando:

- El objetivo de aprendizaje está definido.
- El comportamiento matemático está validado con casos normales y de borde.
- Los diagnósticos tienen ejemplos positivos y negativos.
- La interacción funciona con teclado y touch cuando corresponda.
- El feedback indica una acción útil.
- El estado persiste o se descarta según una decisión explícita.
- La experiencia se mantiene legible en móvil y escritorio.
- Se respetan movimiento reducido y preferencias de sonido.
- Hay pruebas automáticas pertinentes.
- La documentación afectada refleja el estado real.
- Se informa qué se verificó y qué no.

---

## 10. Cambios que no se priorizarán

- Sistema de rachas con pérdida por ausencia.
- Economía basada en probabilidades opacas para sostener hábitos compulsivos.
- Cofres aleatorios que oculten contenido pedagógico.
- Degradación de habitaciones o sufrimiento de personajes por inactividad.
- Cliffhangers que bloqueen ejercicios o explicaciones.
- Apuestas de recursos por respuesta correcta.
- Jefes que midan principalmente velocidad de reacción.
- Rankings públicos que conviertan el aprendizaje en competición permanente.
- Notificaciones insistentes o recordatorios sin consentimiento.
- Personalización que oculte los criterios matemáticos de corrección.

Una recompensa variable o una animación no se justifica sólo por aumentar la frecuencia de retorno. Cada mecanismo debe aportar significado, autonomía, competencia percibida o conexión con el aprendizaje.

---

## 11. Bibliografía y fundamento

La evidencia y los límites de extrapolación están desarrollados en LEARNING_ARCHITECTURE.md. Esta lista identifica los marcos que más influyen en el orden del roadmap:

- Roediger y Karpicke (2006): recuperación activa y retención demorada.
- Cepeda et al. (2006): práctica distribuida e intervalos.
- Rohrer y Taylor (2007): intercalación en práctica matemática.
- Kapur (2015): exploración productiva seguida de consolidación.
- Renkl y Atkinson (2003): retirada progresiva de ejemplos resueltos.
- Hattie y Timperley (2007): feedback centrado en tarea, proceso y autorregulación.
- Ryan y Deci (2000): autonomía, competencia y vinculación.
- Ainsworth (2006): diseño de múltiples representaciones.
- Kang et al. (2009) y Gruber et al. (2014): curiosidad y memoria, con cautela al trasladar sus tareas experimentales a matemática.
- Ruitenburg et al. (2026): recuperación, práctica distribuida e intercalación en contextos de aula; la generalización a nivel universitario requiere evaluación propia.

Las referencias completas, DOI y notas metodológicas se encuentran en la bibliografía de LEARNING_ARCHITECTURE.md.

---

## 12. Regla final

La prioridad del proyecto es construir un sistema que pueda explicar por qué eligió una actividad, qué concepto está intentando consolidar y qué evidencia indicaría que el estudiante puede continuar con menos ayuda.

El mundo narrativo puede ser entrañable; la interfaz, memorable; los widgets, sorprendentes. Pero cada capa debe servir a una meta mayor:

**que el estudiante comprenda, recuerde, conecte y utilice matemática de manera cada vez más independiente.**
