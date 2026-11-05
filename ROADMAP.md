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

---

## 3. Línea base: estado observado del repositorio

Esta sección describe capacidades presentes en el repositorio al momento de la revisión. No equivale a una auditoría exhaustiva de cada ejercicio.

| Área | Estado observado | Próxima necesidad |
|---|---|---|
| Núcleo DOM/SVG y store reactivo | Implementado | Reutilizar antes de crear nuevos mecanismos UI. |
| Planos y controles arrastrables | Implementado en módulos existentes | Conectar manipulación a tareas de predicción y observación. |
| Evaluadores AST | Implementados en módulos de expresiones | Reutilizar equivalencia y parsing para problemas adaptativos. |
| Diagnósticos conceptuales | Parciales por módulo | Normalizar taxonomía y asociar errores a competencias/prerrequisitos. |
| Generadores por semilla | Implementados en Sucesiones y Valor Absoluto, y presentes en otros módulos | Añadir selección por objetivo pedagógico, no sólo generación de variedad. |
| Chequeos con pistas y soluciones | Implementados con variantes por módulo | Añadir metadatos y registro uniforme de evidencia. |
| Visual Novel de Alaska | Implementado | Hacer las intervenciones contextuales y gradualmente menos necesarias. |
| Glosario contextual | Implementado | Ampliar vínculos a prerrequisitos y representaciones cuando corresponda. |
| Pizarra de trabajo | Implementada | Integrarla con sesiones y explicaciones sin convertirla en un panel invasivo. |
| Progreso local por sección | Parcial, mediante claves separadas por módulo | Evolucionar a progreso por competencia con migración no destructiva. |
| Motor central de competencias | Planificado | Primera infraestructura pedagógica nueva. |
| Planificador de repasos | Planificado | Depende de competencias, eventos y estado persistido. |
| Intercalación global | Planificado | Depende de metadatos de ejercicios y selección de objetivos. |
| Confianza metacognitiva | Planificado | Debe ser opcional y no interpretarse como medición perfecta. |
| Campamento autónomo | Idea futura | Sólo después de validar el núcleo de aprendizaje y motivación. |
| Motor de jefes unificado | Planificado | Debe evaluar transferencia y justificar decisiones, no sólo velocidad. |

### 3.1. Laboratorios publicados en el hub

El hub actual ofrece siete áreas: Desigualdades, Unidades, Funciones, Sucesiones, Valor Absoluto y Funciones por Partes, Potencias y Raíces, y Exponenciales.

Entradas principales:
- desigualdades.html
- unidades.html
- funciones.html
- sucesiones.html
- valor-absoluto.html
- potencias-raices.html
- exponenciales.html

Existe también laboratorio_unidades.html como entrada alternativa en el repositorio; la navegación principal utiliza unidades.html.

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

**Estado:** Parcial / en curso.
**Prioridad:** P0.
**Objetivo:** crear el lenguaje común que permitirá que módulos diferentes alimenten un sistema de aprendizaje coherente.

#### Tareas

- [ ] Definir un inventario versionado de módulos, secciones, widgets y objetivos de aprendizaje.
- [ ] Crear un mapa de competencias con IDs estables y descripciones observables.
- [ ] Definir prerrequisitos explícitos; evitar relaciones circulares sin justificación.
- [ ] Asociar cada ejercicio existente a una o más competencias.
- [ ] Distinguir error conceptual, cálculo, notación, sintaxis, omisión de condición y respuesta inválida.
- [ ] Definir los eventos mínimos a registrar.
- [ ] Establecer qué información persiste localmente y durante cuánto tiempo.
- [ ] Agregar tests de integridad del mapa curricular y referencias a preguntas inexistentes.

#### Estructura de competencia sugerida

Una competencia debe describir una acción verificable, no una sección genérica. Ejemplos:
- Interpretar una razón geométrica negativa y predecir la alternancia.
- Determinar el vértice de una función de valor absoluto.
- Comprobar la pertenencia de un punto a un dominio.
- Justificar la inversión del sentido de una desigualdad al multiplicar por un negativo.

Cada competencia puede declarar:
- ID estable.
- Nombre y explicación.
- Módulo y objetivos relacionados.
- Prerrequisitos.
- Representaciones disponibles.
- Errores diagnósticos asociados.
- Preguntas y tipos de transferencia.
- Evidencias mínimas para considerarse dominada.

#### Criterios de aceptación

- No existen IDs duplicados.
- Los prerrequisitos referenciados existen.
- Cada pregunta nueva declara su objetivo principal.
- La taxonomía diferencia errores de razonamiento de entradas inválidas.
- El sistema no infiere dominio sólo por haber visitado o completado una sección.

---

### Fase 1 — Motor local de evidencia y progreso por competencia

**Estado:** Planificado.
**Prioridad:** P0.
**Dependencias:** Fase 0.

#### Tareas

- [ ] Crear un módulo puro para registrar y consultar eventos pedagógicos.
- [ ] Definir un esquema versionado para intentos, pistas, solución revelada, confianza opcional y respuesta.
- [ ] Registrar resultado, competencia, tipo de pregunta, fecha, ayudas y diagnóstico.
- [ ] Normalizar eventos provenientes de distintos tipos de chequeo.
- [ ] Guardar el historial con una capa de persistencia local.
- [ ] Mantener lectura de las claves actuales de progreso.
- [ ] Migrar de forma no destructiva; nunca borrar el progreso anterior ante un error de migración.
- [ ] Permitir exportar e importar progreso local con validación de esquema.
- [ ] Añadir política de retención y opción clara para reiniciar/exportar datos.

#### Módulos sugeridos

- js/core/learning/events.js
- js/core/learning/competencies.js
- js/core/learning/progress-store.js
- js/core/learning/migrations.js

Son nombres propuestos, no archivos existentes. Ajustarlos a las convenciones del repositorio después de inspeccionar los módulos actuales.

#### Criterios de aceptación

- Los eventos no contienen datos personales innecesarios.
- Un mismo evento no se cuenta dos veces por doble clic o render repetido.
- Las acciones de UI no escriben directamente en múltiples claves independientes.
- Los datos viejos siguen siendo legibles o tienen una ruta de migración comprobada.
- El motor puede probarse sin DOM ni navegador.

---

### Fase 2 — Recuperación activa, repetición espaciada y reentrada

**Estado:** Planificado.
**Prioridad:** P0.
**Dependencias:** Fase 1.

#### Tareas

- [ ] Diseñar un planificador determinista y testeable de repasos.
- [ ] Programar recuperaciones según evidencia de desempeño, tiempo desde el último intento, ayudas y errores.
- [ ] Diferenciar acierto independiente, acierto con pista, acierto después de ver solución y acierto tras recuperación.
- [ ] Permitir posponer, realizar ahora o descartar un repaso sugerido.
- [ ] Crear una micro-reentrada que permita retomar en pocos pasos.
- [ ] Incorporar pregunta conceptual breve de cierre cuando aporte valor.
- [ ] Crear planes de reentrada elegidos por el estudiante.
- [ ] Mantener una muestra pequeña de mantenimiento de conocimientos previos sin saturar la sesión.
- [ ] Comunicar por qué reaparece un ejercicio: “Vamos a comprobar si todavía podés recuperar esta idea”.

#### Reglas

- No usar intervalos 1/3/7 como ley universal. Son parámetros iniciales a evaluar.
- No confundir más repasos con mejor planificación.
- No programar el mismo concepto repetidamente después de una recuperación correcta y autónoma sin evidencia de fragilidad.
- No considerar la ausencia como una falla ni activar penalizaciones.
- El estudiante puede pausar, posponer o cambiar la ruta.

#### Criterios de aceptación

- El planificador produce resultados reproducibles con el mismo estado y fecha de referencia.
- Los intervalos y umbrales son configurables y documentados.
- Un estudiante puede retomar después de varios días sin recuperar una tarea vencida como castigo.
- El sistema registra retención demorada, no sólo finalización inmediata.

---

### Fase 3 — Selección adaptativa, intercalación y atlas de errores

**Estado:** Planificado.
**Prioridad:** P1.
**Dependencias:** Fases 0 y 1; para adaptación temporal, Fase 2.

#### Tareas

- [ ] Añadir metadatos pedagógicos uniformes a las preguntas existentes.
- [ ] Clasificar preguntas por competencia, tipo de razonamiento, representación, dificultad estimada y prerrequisitos.
- [ ] Diseñar conjuntos contrastivos que parezcan similares pero requieran decisiones diferentes.
- [ ] Intercalar tipos de problemas sólo cuando los prerrequisitos estén suficientemente disponibles.
- [ ] Alternar problemas de módulos distintos cuando exista una conexión curricular clara.
- [ ] Construir un atlas personal de errores recurrentes y sus conceptos asociados.
- [ ] Ofrecer actividades de reparación dirigidas a los prerrequisitos.
- [ ] Añadir comparación entre métodos de resolución.
- [ ] Garantizar equivalencia matemática cuando se evalúan expresiones alternativas.

#### Criterios de aceptación

- La secuencia no se limita a mezclar preguntas aleatoriamente.
- Cada cambio de tipo requiere una decisión matemática identificable.
- Los errores recurrentes proponen una acción concreta y no una etiqueta permanente del alumno.
- Los problemas contrastivos se revisan para evitar ambigüedades y falsas trampas.
- Se puede reconstruir por qué el planificador eligió una pregunta.

---

### Fase 4 — Exploración productiva, andamiaje y transferencia

**Estado:** Planificado.
**Prioridad:** P1.
**Dependencias:** Fase 0; integración con Fase 1.

#### Tareas

- [ ] Crear un patrón reusable de predicción antes de revelar el resultado del widget.
- [ ] Registrar predicción y observación sin penalizar hipótesis razonables que resulten falsas.
- [ ] Diseñar ciclos de hipótesis, experimentación, observación y formalización.
- [ ] Incorporar ejemplos resueltos con pasos que se retiran progresivamente.
- [ ] Diseñar autoexplicaciones breves: justificar por qué un paso es válido.
- [ ] Incorporar actividades para explicar o corregir el procedimiento de un personaje.
- [ ] Crear desafíos de traducción entre manipulador, gráfico, tabla, expresión simbólica y explicación verbal.
- [ ] Invertir la dirección de la traducción: del gráfico a la fórmula y de la fórmula al gráfico.
- [ ] Diseñar problemas de transferencia sin el widget que sirvió de apoyo.
- [ ] Evitar presentar varias representaciones simultáneas si no añaden una función cognitiva distinta.

#### Criterios de aceptación

- Las predicciones se registran antes de revelar la respuesta.
- Las ayudas se retiran de forma progresiva, no abrupta.
- La explicación final vuelve explícita la relación matemática.
- La transferencia cambia el contexto o la representación sin cambiar inadvertidamente el concepto evaluado.
- Se evalúa justificación cuando el objetivo sea conceptual, no sólo resultado numérico.

---

### Fase 5 — Metacognición y acompañamiento contextual

**Estado:** Planificado.
**Prioridad:** P1.
**Dependencias:** Fases 1 y 3.

#### Tareas

- [ ] Añadir Convicción de Tiza: estimación voluntaria de confianza antes de comprobar.
- [ ] Comparar confianza y acierto a través del tiempo sin usarlo como diagnóstico psicológico.
- [ ] Detectar patrones de falsa seguridad y conocimiento frágil.
- [ ] Añadir modos de intervención de Alaska vinculados a necesidades pedagógicas.
- [ ] Adaptar el tono a la situación sin juzgar al estudiante.
- [ ] Hacer que Alaska señale el objeto, variable o paso relevante del widget.
- [ ] Añadir explicaciones contextuales desde el glosario.
- [ ] Reducir ayudas y mensajes cuando el estudiante ya puede resolver independientemente.

#### Criterios de aceptación

- La confianza es opcional y se explica como autorregistro, no como examen.
- No se atribuye un rasgo personal al alumno a partir de una respuesta.
- Alaska no repite diálogos invasivos en cada interacción.
- El contenido puede completarse sin abrir el diálogo de Alaska.

---

### Fase 6 — Experiencia, reentrada y mundo narrativo

**Estado:** En evaluación / planificado.
**Prioridad:** P2.
**Dependencias:** Fases 1 y 2 para eventos de progreso; Fase 4 para integrar actividades pedagógicas.

#### Tareas de experiencia

- [ ] Implementar Split-Workbench para Sucesiones y Valor Absoluto, conservando vista de lectura.
- [ ] Mantener el plano cerca de la explicación y del chequeo correspondiente.
- [ ] Mejorar navegación entre secciones y acceso a términos.
- [ ] Incorporar un cierre de sesión que resuma lo aprendido y sugiera el siguiente paso.
- [ ] Implementar un plan de reentrada voluntario y editable.
- [ ] Construir un Cuaderno de Misterios: preguntas matemáticas opcionales que se pueden guardar, resolver o descartar.
- [ ] Limitar las preguntas abiertas para evitar crear una lista de deudas.
- [ ] Permitir cerrar un misterio y ver su resolución sin penalización.

#### Tareas narrativas

- [ ] Separar el estado del mundo del estado académico.
- [ ] Diseñar personajes con personalidades, necesidades y rutinas autónomas.
- [ ] Evitar que la ausencia del estudiante provoque deterioro, sufrimiento o pérdida.
- [ ] Asociar artefactos a descubrimientos matemáticos concretos.
- [ ] Permitir gastar recursos en personalización y construcción elegida.
- [ ] Mantener eventos narrativos breves, pausables y no intrusivos.
- [ ] Respetar preferencias de sonido, movimiento y visibilidad.

#### Criterios de aceptación

- El mundo sigue siendo agradable después de una ausencia prolongada.
- Ningún recurso esencial para aprender depende de una recompensa aleatoria.
- Las actividades pedagógicas no quedan bloqueadas por una historia pendiente.
- La narrativa puede omitirse sin perder comprensión matemática.

---

### Fase 7 — Jefes, evaluaciones integradoras y simulación de examen

**Estado:** Planificado.
**Prioridad:** P2.
**Dependencias:** Fases 0, 1, 3 y 4.

#### Regla de diseño

Un jefe no es un formulario decorado ni una prueba de reflejos. Debe exigir reconocimiento, anticipación, manipulación, formalización y transferencia.

#### Estructura recomendada

1. Identificar el tipo de objeto o problema.
2. Predecir su comportamiento.
3. Manipular el modelo y comprobar la hipótesis.
4. justificar una decisión o corregir un paso.
5. Resolver una variante nueva sin el andamiaje principal.

#### Dirección por módulo

- **Desigualdades:** condiciones AND/OR, inversión del sentido, extremos y conjunto solución.
- **Unidades:** coherencia dimensional, factores equivalentes y unidades resultantes.
- **Funciones:** unicidad, dominio, imagen, monotonía, secante e inversa.
- **Potencias y raíces:** restricciones, equivalencias, signos y estructura de exponentes.
- **Sucesiones:** clasificación, razón, ancla, fórmula explícita y comportamiento de términos.
- **Valor absoluto:** distancia, vértice, ramas, fronteras y conjuntos solución.
- **Exponenciales:** base, factor inicial, crecimiento/decaimiento, asíntotas y modelos.

#### Simulación de examen

- [ ] Reproducir formato, tiempos y convenciones de evaluaciones reales sólo cuando exista material autorizado y verificado.
- [ ] Separar modo práctica y modo examen.
- [ ] Informar criterios de corrección y equivalencias aceptadas.
- [ ] Permitir revisión paso a paso después de entregar.
- [ ] Generar un informe de competencias que necesitan trabajo.
- [ ] No usar el examen para borrar progreso del laboratorio.

---

### Fase 8 — Validación pedagógica y expansión curricular

**Estado:** Planificado.
**Prioridad:** P1 continua; expansión P3.
**Dependencias:** instrumentación de Fase 1 y funciones suficientes de Fases 2–4.

#### Validación

- [ ] Definir resultados de aprendizaje antes de cada experimento.
- [ ] Comparar estrategias con contenidos y dificultad equivalentes.
- [ ] Medir retención inmediata y demorada.
- [ ] Medir transferencia a problemas nuevos.
- [ ] Medir recurrencia de errores y uso de ayudas.
- [ ] Revisar diferencias entre estudiantes y posibles efectos adversos.
- [ ] Documentar tamaño de muestra, limitaciones y criterios de análisis.
- [ ] No afirmar causalidad con muestras pequeñas o sin grupo de comparación adecuado.

#### Expansión curricular

La expansión no debe adelantarse al mantenimiento de calidad de los módulos existentes. Posibles áreas:
- Función cuadrática y parábolas.
- Sistemas de ecuaciones.
- Trigonometría y círculo unitario.
- Otros contenidos de ingreso y Análisis I.

Cada módulo nuevo debe reutilizar la arquitectura de competencias y evidencia, pero conservar una representación visual apropiada a su estructura matemática.

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
