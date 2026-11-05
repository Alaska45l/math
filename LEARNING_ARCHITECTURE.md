# LEARNING_ARCHITECTURE.md

## Arquitectura de aprendizaje, motivación y retención para Alaska Math Lab

**Estado:** propuesta de arquitectura pedagógica y técnica  
**Fecha de revisión bibliográfica:** 5 de noviembre de 2026  
**Proyecto:** [Alaska Math Lab](https://github.com/Alaska45l/math)  
**Principio rector:** el juego consigue que el estudiante quiera volver; el diseño instruccional hace que cada regreso produzca aprendizaje durable.

---

## 1. Propósito

Alaska Math Lab debe ayudar a estudiantes que preparan matemática de ingreso universitario y contenidos iniciales de Análisis a construir comprensión conceptual, fluidez procedimental y capacidad de transferencia. No alcanza con que el usuario complete capítulos, mantenga una racha o manipule correctamente un simulador: debe poder recuperar una idea después de un intervalo, reconocer cuándo corresponde aplicarla, justificar sus pasos y resolver problemas que no se parecen exactamente a los ejemplos practicados.

Esta arquitectura integra cuatro dimensiones que deben diseñarse juntas, pero medirse por separado:

1. **Aprendizaje:** comprensión, recuperación, retención y transferencia.
2. **Autorregulación:** planificación, monitoreo de confianza, detección de lagunas y elección de próximos pasos.
3. **Motivación:** autonomía, competencia percibida, curiosidad, pertenencia narrativa y progreso visible.
4. **Experiencia:** widgets, explicaciones de Alaska, Visual Novel, laboratorio y campamento.

La experiencia lúdica no debe convertirse en un sistema de presión. La meta no es maximizar el tiempo de pantalla, los clics o las visitas diarias; es maximizar el aprendizaje independiente y sostenible por unidad de esfuerzo.

### 1.1. Qué no intenta hacer

- No busca crear una máquina de retención basada en ansiedad, culpa, miedo a perder objetos o castigos por ausentarse.
- No confunde una respuesta acertada con dominio estable.
- No reemplaza la explicación rigurosa por animaciones, lore o recompensas.
- No presupone que más dificultad, más interacciones o más gamificación siempre producen más aprendizaje.
- No impone un único camino ni un ritmo idéntico para todos.
- No presenta hipótesis de diseño como si fueran resultados científicos ya demostrados.

---

## 2. Lectura del proyecto actual

La propuesta se apoya en la estructura observable del repositorio y procura extenderla sin reemplazar sus fortalezas.

### 2.1. Capacidades que ya existen

| Área | Situación observada | Implicación para esta arquitectura |
|---|---|---|
| Núcleo matemático | Evaluadores AST, lógica pura y diagnósticos por errores en módulos como Sucesiones y Valor Absoluto. | Reutilizar diagnósticos para identificar competencias frágiles, no solo respuestas incorrectas. |
| Widgets | Planos SVG, nodos arrastrables, cintas de sucesiones y controles interactivos. | Convertir la manipulación en experimentación guiada por predicciones. |
| Chequeos | `createCheckBlock()` admite distintos formatos de pregunta, pistas, soluciones y feedback. | Añadir metadatos pedagógicos y registrar intentos, pistas, confianza y transferencia. |
| Generación de problemas | Generadores por semilla en `retos.js` para Sucesiones y Valor Absoluto. | Construir series comparables, intercaladas y reproducibles. |
| Alaska VN | `js/core/vn.js`, guiones y reacciones dinámicas. | Usar su personalidad para orientar estrategias y regular la frustración, no para avergonzar. |
| Progreso | `getProgress()` / `saveSectionProgress()` guardan finalización de secciones mediante `localStorage`. | Conservar compatibilidad y sumar progreso por competencia, no limitarse al booleano de sección. |
| Arquitectura | HTML, CSS y módulos ES nativos, con separación entre lógica y DOM. | Mantener el motor de aprendizaje puro, local-first y sin dependencias de ejecución. |
| Calidad | Pruebas de lógica, validación de páginas e interacciones. | Añadir pruebas del planificador y de las transiciones de dominio. |

### 2.2. Límites que conviene resolver

- El progreso de sección no describe qué concepto domina el estudiante ni cuánto tiempo hace que no lo recupera.
- Los intentos, pistas y diagnósticos ya influyen en las reacciones de Alaska, pero no forman todavía un historial de aprendizaje unificado.
- Los generadores ofrecen variedad, aunque la selección todavía no está gobernada por una política global de repaso, prerrequisitos y transferencia.
- La corrección de un ejercicio puede cerrar su tarjeta, pero eso no demuestra que el estudiante pueda repetir el razonamiento sin ayuda o después de varios días.
- Las reacciones narrativas por cantidad de fallos pueden confundirse con evaluación de la persona. Se debe diferenciar un error de concepto, un error de cálculo, una entrada inválida y una estrategia de adivinación.

**Regla de evolución:** no reescribir `logic.js`, `expr.js`, `createAbsBoard()` ni el motor VN para construir una segunda plataforma dentro de la primera. El motor nuevo debe consumir eventos y competencias de los módulos existentes.

---

## 3. Modelo pedagógico central

El sistema funcionará como un ciclo de aprendizaje recurrente:

```text
        ELEGIR / RETOMAR
               │
               ▼
      RECUPERAR CONOCIMIENTO
               │
               ▼
       PREDECIR / EXPLORAR
               │
               ▼
       FORMALIZAR / EXPLICAR
               │
               ▼
       PRACTICAR CON APOYOS
               │
               ▼
      DISCRIMINAR / TRANSFERIR
               │
               ▼
       REFLEXIONAR / PLANEAR
               │
               └──────► próxima recuperación espaciada
```

No todas las sesiones tienen que recorrer todas las etapas. Una sesión de repaso puede comenzar directamente con recuperación; una primera exposición puede usar un ejemplo guiado antes de pedir autonomía. El motor seleccionará el siguiente paso según el estado del concepto y el objetivo de la sesión.

### 3.1. Distinguir rendimiento inmediato de aprendizaje

Durante una explicación, el usuario puede resolver correctamente porque el ejemplo está visible, el widget le da pistas o acaba de ver la regla. Ese rendimiento es útil, pero no equivale a conocimiento durable.

El sistema debe separar, como mínimo:

- **Éxito asistido:** correcto con una pista, ejemplo o guía relevante.
- **Éxito independiente:** correcto sin pistas ni solución visible.
- **Recuperación demorada:** correcto después de un intervalo sin volver a estudiar el contenido.
- **Transferencia:** correcto en un problema con superficie, representación o contexto diferentes.
- **Justificación:** puede explicar por qué el método es válido y qué condiciones lo permiten.

No marcar una competencia como dominada por un único acierto, una racha o el cierre de una sección.

---

## 4. Principios con respaldo científico

Las estrategias siguientes no tienen el mismo grado de evidencia ni se aplican automáticamente a todo contenido. Las decisiones deben respetar los moderadores y límites de cada investigación.

### 4.1. Recuperación activa (*retrieval practice*)

**Qué es:** pedir que el estudiante recupere una propiedad, una definición, una relación o un procedimiento desde la memoria, en vez de limitarse a releerlo.

**Aplicación:**

- Al iniciar una sesión, presentar una pregunta corta de un concepto estudiado anteriormente.
- Antes de volver a mostrar una fórmula, pedir que se reconstruya o se anticipe una parte.
- Cerrar la sesión con una pregunta conceptual sin el widget, el ejemplo ni la fórmula de referencia a la vista.
- Incluir ejercicios que requieran explicar una condición, no solo calcular un resultado.
- Dar feedback correctivo después de la recuperación cuando el objetivo sea aprender el contenido, no usar el intento como evaluación sumativa.

**Ejemplo:** antes de mostrar la fórmula explícita de una sucesión geométrica, preguntar qué exponente corresponde al primer término y por qué.

**Cuidado:** una pregunta de opción múltiple que se resuelve por descarte puede no requerir recuperación sustancial. Alternar formatos: respuesta breve, completar una expresión, construir un gráfico, detectar una condición y justificar.

**Evidencia:** Roediger y Karpicke (2006); Adesope et al. (2017); Agarwal, Nunes y Blunt (2021); Carpenter, Pan y Butler (2022). Ver bibliografía.

### 4.2. Práctica distribuida y repetición espaciada

**Qué es:** recuperar una competencia en sesiones separadas, con intervalos que cambian según la retención deseada y el desempeño observado.

**Aplicación:** cada competencia tendrá una próxima fecha de revisión y una cola de repaso. Como política inicial de producto se puede probar una progresión orientativa (por ejemplo, un día, tres días, una semana y varias semanas), pero esos intervalos son parámetros iniciales, no una ley universal ni el calendario óptimo demostrado para matemática universitaria.

- Si la recuperación es independiente y correcta, ampliar gradualmente el intervalo.
- Si es correcta con mucha ayuda o con baja confianza, mantener o acortar el intervalo.
- Si es incorrecta, diagnosticar y programar una recuperación más cercana después de una explicación o ejemplo breve.
- Si el mismo error reaparece, revisar prerrequisitos en vez de repetir indefinidamente el mismo ejercicio.
- No castigar el retraso: un repaso vencido espera al estudiante; no se destruye progreso.

**Evidencia:** Cepeda et al. (2006); Rawson y Dunlosky (2011); Carpenter et al. (2022); Ruitenburg et al. (2026).

### 4.3. Práctica intercalada (*interleaving*)

**Qué es:** mezclar problemas de categorías relacionadas una vez que el estudiante tuvo una primera oportunidad de aprender cada procedimiento. La persona debe decidir qué concepto o método aplicar, no solo ejecutar el que acaba de ver.

**Aplicación:**

- Después de una etapa inicial de práctica enfocada, mezclar sucesiones aritméticas, geométricas y casos que no pertenecen a ninguna categoría.
- Intercalar lectura de dominio, imagen, positividad y monotonía en funciones.
- Combinar problemas de valor absoluto con ecuaciones, desigualdades y análisis de existencia.
- Usar distractores que representen errores conceptuales conocidos, no trampas ambiguas.

**Límite:** no intercalar todo desde el primer minuto. La discriminación requiere que haya representaciones iniciales disponibles. El motor debe alternar bloques cortos de adquisición guiada con lotes mixtos.

**Evidencia:** Rohrer y Taylor (2007); Ruitenburg et al. (2026). La metaanálisis de 2026 señala que el efecto depende, entre otros moderadores, de la retroalimentación y de que la práctica realmente provoque discriminación entre categorías.

### 4.4. Exploración productiva y predicción

**Qué es:** presentar un problema, una contradicción o una situación para explorar antes de revelar la explicación formal. Los intentos iniciales pueden ser incompletos o incorrectos; su función es generar hipótesis y hacer visibles las diferencias entre estrategias.

**Secuencia propuesta:**

1. **Pregunta:** Alaska plantea una situación concreta.
2. **Predicción:** el estudiante elige o formula qué espera que ocurra.
3. **Manipulación:** modifica una variable del widget.
4. **Observación:** identifica qué cambió y qué permaneció constante.
5. **Formalización:** Alaska nombra la propiedad matemática y la relaciona con la observación.
6. **Transferencia:** se propone un caso nuevo sin el andamiaje anterior.

**Ejemplo:** antes de explicar la razón negativa, predecir los signos de los próximos términos de una sucesión geométrica y comprobar la predicción con el simulador.

**Límite importante:** la exploración sin guía no debe convertirse en abandono del principiante. El diseño debe terminar con consolidación explícita, ejemplos correctos y explicación. Usar el enfoque sobre todo para conceptos donde explorar casos permita descubrir contrastes significativos.

**Evidencia:** Kapur (2014) y Kapur (2015).

### 4.5. Ejemplos resueltos y retirada gradual de ayudas

**Qué es:** comenzar mostrando una resolución correcta y progresivamente retirar partes del procedimiento hasta que el estudiante pueda resolver de forma independiente.

**Progresión:**

1. Ejemplo correcto completo, con cada paso justificado.
2. Ejemplo con un paso faltante.
3. Resolución parcialmente completada por el estudiante.
4. Ejercicio equivalente sin pasos visibles.
5. Problema de transferencia con otra representación o contexto.

**Aplicación:** crear en cada competencia un conjunto pequeño de ejemplos de referencia, más ejercicios `completion` o de completar pasos. No mostrar simultáneamente demasiadas explicaciones, colores, animaciones y controles.

**Cuidado con los ejemplos incorrectos:** son útiles como material de análisis cuando el estudiante ya tiene una base, pero no deben reemplazar los ejemplos correctos. Una metaanálisis específica de matemática encontró un efecto medio favorable de los ejemplos resueltos (g = 0,48); también encontró que los ejemplos correctos por sí solos fueron especialmente beneficiosos y que los ejemplos incorrectos aislados o mezclados no fueron superiores en general. Por tanto, el modo detective debe ser complementario y posterior a una explicación fiable.

**Evidencia:** Barbieri et al. (2023); Renkl y Atkinson (2003); Chen et al. (2023).

### 4.6. Comparación de métodos y casos contrastivos

**Idea adicional prioritaria:** presentar dos formas de resolver el mismo problema, dos problemas visualmente parecidos con estructuras distintas o una solución válida frente a otra que falla por una condición específica.

Preguntas útiles:

- ¿Qué paso es equivalente en ambos métodos?
- ¿Qué hipótesis necesita el método A que el método B no necesita?
- ¿En qué tipo de problema conviene cada estrategia?
- ¿Cuál es el primer paso inválido de la resolución defectuosa?
- ¿Qué ejemplo mínimo permite demostrar la diferencia?

**Ejemplo:** comparar `a(n) = 8(-5)^(n-1)` y `a(n) = 8 - 5^(n-1)`. El estudiante debe explicar qué estructura genera cada una, no limitarse a escoger cuál “parece correcta”.

**Aplicación:** componente `ContrastiveChallenge` con dos paneles o dos procedimientos sobre el mismo lienzo, selección de diferencias y campo de justificación. Registrar si el estudiante detecta la diferencia y si puede producir un contraejemplo.

**Evidencia:** Rittle-Johnson y Star (2007); Durkin, Star y Rittle-Johnson (2017). La investigación de comparación de métodos respalda especialmente la flexibilidad procedimental; el efecto depende de qué se compara y del conocimiento previo.

### 4.7. Autoexplicación y enseñanza a otro personaje

**Qué es:** solicitar al estudiante que explique por qué un paso es válido, qué propiedad lo justifica o cómo le enseñaría el concepto a otra persona.

**Aplicación:**

- Alaska presenta una solución y una rata/personaje pregunta por qué se hizo un paso.
- El estudiante elige una justificación, completa una frase o escribe una explicación breve.
- El sistema compara la explicación con un conjunto de ideas clave, no exige una frase idéntica.
- Una actividad de explicación debe ser corta y opcional cuando el costo de escritura sea alto.

**Ejemplo:** “¿Por qué el exponente es `n − 1` y no `n`?”. La respuesta debe relacionar `n = 1` con cero saltos.

**Evidencia:** Chi et al. (1989) documentaron la relación entre autoexplicaciones elaboradas y comprensión de ejemplos. La implementación con un NPC es una extrapolación de diseño, no una prueba de que un personaje virtual produzca por sí mismo ese efecto.

### 4.8. Feedback orientado a tarea, proceso y autorregulación

El feedback debe responder tres preguntas: qué se intenta lograr, cómo va el razonamiento y cuál es el siguiente paso útil.

**Taxonomía interna de errores:**

- `conceptual`: modelo mental o condición matemática incorrecta.
- `procedural`: operación o secuencia de pasos inválida.
- `arithmetic`: error de cálculo con estructura conceptual adecuada.
- `representation`: lectura incorrecta de gráfico, intervalo o notación.
- `syntax`: expresión no interpretable por el parser.
- `equivalent_form`: respuesta matemáticamente válida, pero distinta de la forma esperada.
- `guessing_pattern`: evidencia conductual de intentos sin razonamiento, si puede inferirse con suficiente cautela.

**Reglas para Alaska:**

- Criticar la estrategia o el paso, nunca la inteligencia, identidad o capacidad del estudiante.
- Evitar usar la misma reacción de enojo para una equivocación conceptual, un typo y una dificultad de teclado.
- Ofrecer una acción concreta: evaluar en `n = 1`, revisar el signo, inspeccionar el eje X, verificar el dominio, etc.
- Reconocer soluciones equivalentes cuando corresponda; separar equivalencia matemática de formato solicitado.
- Tras varios errores, reducir la carga del problema y ofrecer una pista graduada, no acumular reproches.
- Permitir que el estudiante elija intentar otra vez, pedir pista, revisar un ejemplo o volver al widget.

**Evidencia:** Hattie y Timperley (2007); Barbieri et al. (2023); Agarwal et al. (2021).

### 4.9. Confianza y calibración metacognitiva

Antes de comprobar algunas respuestas, ofrecer una elección no intrusiva: “¿Qué tan seguro estás?”. Usar tres niveles (baja, media, alta), no pedir una escala precisa que parezca más exacta de lo que es.

| Resultado | Lectura posible | Respuesta del sistema |
|---|---|---|
| Correcto + alta confianza | Dominio probable | Programar aplicación nueva y recuperación demorada. |
| Correcto + baja confianza | Acierto frágil o azar | Pedir justificación y volver a recuperar más adelante. |
| Incorrecto + alta confianza | Posible concepción errónea | Contraste conceptual y contraejemplo. |
| Incorrecto + baja confianza | Dificultad reconocida | Pista graduada, ejemplo resuelto y nuevo intento. |

La confianza no es una medida directa de conocimiento. Debe usarse como señal complementaria, comparada a lo largo de múltiples ejercicios, nunca para etiquetar a una persona.

### 4.10. Diseño multimedia y carga cognitiva

Los widgets visuales son una ventaja solo cuando ayudan a procesar la estructura matemática. La animación, el audio y los personajes deben reducir ambigüedad o aportar orientación, no competir por la atención.

**Reglas:**

- Resaltar en el gráfico exactamente el elemento que Alaska nombra en ese momento.
- Mantener fórmula, gráfico y explicación relacionados espacial y temporalmente.
- Dividir explicaciones largas en segmentos controlables.
- Introducir la nomenclatura de elementos antes de exigir que el alumno interprete un diagrama muy complejo.
- Eliminar decoración que no aporte información al objetivo del ejercicio.
- Evitar mostrar voz, texto duplicado, animación y resaltados simultáneos si todo repite el mismo mensaje.
- Dar controles de pausa, repetición y silencio; respetar `prefers-reduced-motion`.
- Cuando el widget sea complejo, enseñar primero la interacción esencial y añadir controles avanzados después.

**Evidencia:** Mayer (2017, 2024); Ainsworth (2006).

---

## 5. El sistema de retorno: invitar a volver sin fabricar obligación

La experiencia debe facilitar tres momentos: comenzar, detenerse y retomar.

### 5.1. Entrada de baja fricción

Al abrir el laboratorio, mostrar una decisión simple, no una pantalla de estadísticas abrumadora:

- **Continuar:** volver a la sección y al widget donde se interrumpió la última sesión.
- **Repasar:** resolver uno o dos conceptos que ya están listos para recuperación.
- **Explorar:** abrir un experimento breve relacionado con lo que el estudiante ya conoce.

El usuario puede ignorar las sugerencias y navegar libremente. No hay una secuencia obligatoria de inicio de sesión.

### 5.2. Micro-reentrada

Preparar una actividad de 60–120 segundos que reactive el contexto sin exigir una sesión larga:

1. una pregunta de recuperación de un concepto anterior;
2. una explicación breve del estado actual (“la última vez estabas comparando razón negativa y diferencia negativa”);
3. un único siguiente paso visible.

La micro-reentrada no debe reemplazar una sesión completa ni presentarse como “mantener la racha”.

### 5.3. Plan de reentrada elegido por el estudiante

Al finalizar, ofrecer un plan voluntario en formato “Cuando [situación], voy a [acción pequeña]”. Ejemplo:

> “Cuando termine de cenar el jueves, voy a resolver el repaso de dos minutos de sucesiones.”

El estudiante puede guardar el plan, editarlo o no crear ninguno. No enviar notificaciones por defecto ni insistir si no vuelve.

La literatura sobre *implementation intentions* respalda que los planes “si ocurre X, haré Y” pueden facilitar la ejecución de objetivos generales. Su uso como interfaz de reentrada en Alaska Math Lab es una hipótesis de producto que debe probarse en estudiantes del proyecto.

**Evidencia:** Gollwitzer (1999); Gollwitzer y Sheeran (2006).

### 5.4. Cierre de sesión con continuidad, no con cliffhanger

Terminar una sesión con:

- una pregunta conceptual de salida;
- una señal concreta de qué se aprendió;
- una competencia que conviene volver a recuperar;
- una propuesta de siguiente actividad de duración estimada.

No bloquear el widget, dejar una tarea artificialmente incompleta ni esconder el cierre para provocar regreso. El estudiante debe poder terminar cuando quiera.

### 5.5. El laboratorio vivo y el campamento

El campamento debe representar el crecimiento del conocimiento, no la obligación de conectarse.

- Los personajes y las ratas pueden tener rutinas autónomas y relaciones emergentes.
- Los objetos se desbloquean por descubrimientos, experimentación y dominio, no por azar puro.
- El usuario decide dónde invertir recursos y cómo personalizar el hábitat.
- La ausencia no produce hambre, enfermedad, frío, tristeza ni pérdida de bienes.
- El mundo puede mostrar cambios narrativos cuando el usuario vuelve, pero no debe comunicar que alguien sufrió por su ausencia.
- Las recompensas son simbólicas y no alteran la evaluación matemática ni la disponibilidad del contenido.

**Diseño recomendado:** `ScientificArtifacts` (artefactos obtenidos por hitos demostrables), `HabitatState` (decoración y progreso del mundo) y `CharacterSchedule` (rutinas autónomas no punitivas). Mantener las simulaciones narrativas locales y acotadas para no crear complejidad técnica innecesaria.

La teoría de autodeterminación sugiere apoyar autonomía, competencia y vinculación. El campamento contribuye sobre todo a vinculación y expresión de autonomía; la experiencia de competencia debe proceder del dominio matemático real.

**Evidencia:** Ryan y Deci (2020); Wang et al. (2024); Sailer y Homner (2020).

---

## 6. Arquitectura técnica propuesta

La propuesta conserva Vanilla JS, módulos ES, lógica matemática pura y almacenamiento local. No requiere incorporar un framework ni un backend para la primera versión.

### 6.1. Nuevos módulos sugeridos

```text
js/
├── core/
│   ├── learning/
│   │   ├── competencies.js       # catálogo y relaciones de prerrequisitos
│   │   ├── events.js             # eventos de aprendizaje normalizados
│   │   ├── progress-store.js     # persistencia y migraciones local-first
│   │   ├── scheduler.js          # cálculo de próximas recuperaciones
│   │   ├── mastery.js            # estado de dominio por competencia
│   │   ├── session-planner.js    # entrada, sesión y cierre
│   │   ├── exercise-selector.js  # selección de práctica, repaso y transferencia
│   │   └── analytics.js          # métricas locales y exportación voluntaria
│   └── ...
├── modules/
│   ├── sucesiones/
│   │   ├── ...
│   │   └── learning-map.js       # mapeo de ejercicios/diagnósticos a competencias
│   └── valor-absoluto/
│       ├── ...
│       └── learning-map.js
└── ...
```

Estos son nombres propuestos, no módulos que ya existan. Crear primero los que se necesiten para la primera fase; no implementar toda la estructura de una vez.

### 6.2. Competencias, no solo secciones

Una competencia representa una habilidad evaluable con evidencia repetida. Ejemplos:

```js
{
  id: "sequences.geometric.negative_ratio",
  title: "Interpretar una razón geométrica negativa",
  prerequisites: [
    "sequences.geometric.common_ratio",
    "powers.sign_parity"
  ],
  relatedCompetencies: [
    "sequences.explicit_formula",
    "sequences.negative_base_parentheses"
  ],
  exerciseFamilies: [
    "classify_sequence",
    "predict_signs",
    "write_explicit_formula",
    "transfer_context"
  ]
}
```

El mapa de prerrequisitos no debe ser un árbol rígido que bloquee la navegación. Su función es localizar la laguna probable cuando un estudiante falla en un concepto más avanzado y sugerir una recuperación corta.

### 6.3. Metadatos pedagógicos de preguntas

Extender progresivamente los objetos de preguntas existentes (`generateProblem()`, `generateAbsProblem()` y `createCheckBlock()`) con propiedades no obligatorias:

```js
{
  id: "seq-negative-ratio-01",
  competencyIds: ["sequences.geometric.negative_ratio"],
  prerequisiteIds: ["powers.sign_parity"],
  family: "predict_signs",
  representation: "symbolic",
  difficulty: 2,
  stage: "guided_practice", // retrieval | exploration | guided_practice | interleaved | transfer
  transferDistance: "near", // near | far
  diagnosticMap: {
    wrong_positive_sign: "sequences.geometric.negative_ratio"
  }
}
```

No todas las preguntas necesitan todos los campos. La ausencia de metadatos no debe romper los ejercicios existentes.

### 6.4. Registro de eventos

Registrar acciones pedagógicamente relevantes, no cada movimiento del mouse. Un evento mínimo puede ser:

```js
{
  eventId: "uuid-or-monotonic-id",
  type: "answer_submitted",
  competencyIds: ["sequences.geometric.negative_ratio"],
  exerciseId: "seq-negative-ratio-01",
  occurredAt: "2026-11-05T19:00:00-03:00",
  correct: false,
  diagnosticId: "wrong_positive_sign",
  hintsUsed: 1,
  confidence: "medium",
  assistance: "hint",
  representation: "symbolic",
  durationMs: 42000
}
```

Reglas:

- No registrar texto libre sensible de forma predeterminada.
- `durationMs` es una señal aproximada; no inferir atención a partir del tiempo de pestaña abierta.
- No usar clics de exploración como evidencia de competencia.
- Distinguir evento de inicio, respuesta, pista, solución consultada y recuperación demorada.
- Mantener un límite de tamaño y compactar historial antiguo cuando sea necesario.

### 6.5. Estado de progreso por competencia

```js
{
  schemaVersion: 1,
  competencies: {
    "sequences.geometric.negative_ratio": {
      status: "developing",
      attempts: 5,
      independentCorrect: 2,
      assistedCorrect: 1,
      delayedCorrect: 0,
      transferCorrect: 0,
      recentDiagnosticIds: ["wrong_positive_sign"],
      lastAttemptAt: "2026-11-05T19:00:00-03:00",
      nextReviewAt: "2026-11-06T19:00:00-03:00"
    }
  },
  sessionPlan: null,
  settings: {
    remindersEnabled: false
  }
}
```

El esquema es ilustrativo. `status` puede tomar inicialmente estos valores:

- `unseen`
- `introduced`
- `developing`
- `consolidating`
- `review_due`
- `durable`
- `needs_repair`

No mostrar un porcentaje de dominio con falsa precisión. En la interfaz conviene utilizar estados explicables (“recién visto”, “en práctica”, “conviene repasar”, “recuperado sin ayuda en varias ocasiones”).

### 6.6. Política inicial del planificador

La primera versión debe ser comprensible y fácil de probar, no un algoritmo opaco.

Pseudocódigo orientativo:

```js
function scheduleNextReview(evidence, previousInterval) {
  if (evidence.correct === false) {
    return shortRecoveryWindow(evidence.diagnosticId);
  }

  if (evidence.assistance !== "none" || evidence.confidence === "low") {
    return keepOrSlightlyShorten(previousInterval);
  }

  if (evidence.isDelayedRecall && evidence.isTransfer) {
    return extendInterval(previousInterval);
  }

  if (evidence.independentCorrect) {
    return extendModerately(previousInterval);
  }

  return keepInterval(previousInterval);
}
```

Los nombres son conceptuales; no copiar este fragmento directamente como implementación final. Definir ventanas configurables, pruebas unitarias y límites para evitar intervalos negativos, repeticiones excesivas y fechas fuera de rango.

**Regla esencial:** una respuesta incorrecta no debe generar un castigo. Debe producir diagnóstico, feedback y una siguiente oportunidad calibrada.

### 6.7. Selección de ejercicios

La selección deberá equilibrar cuatro fuentes:

1. **Repaso debido:** competencias cuya revisión está programada.
2. **Reparación:** prerrequisitos o diagnósticos recurrentes.
3. **Adquisición:** el nuevo contenido que la ruta curricular recomienda.
4. **Transferencia:** problemas que cambian contexto, representación o estrategia.

Como punto de partida, se puede usar una política transparente por prioridad, no porcentajes supuestamente óptimos. Después, ajustar con pruebas de aprendizaje. Evitar que los conceptos ya dominados desaparezcan para siempre: una pequeña muestra de mantenimiento debe seguir apareciendo.

### 6.8. Integración con módulos existentes

| Ubicación actual | Integración propuesta |
|---|---|
| `js/modules/sucesiones/components.js` | Adjuntar eventos de respuesta, pistas, solución y diagnóstico a competencias. |
| `js/modules/sucesiones/retos.js` | Añadir etiquetas `competencyIds`, familias y representación a cada tipo generado. |
| `js/modules/valor-absoluto/components.js` | Registrar respuestas numéricas, simbólicas y cambios de gráficos como evidencia distinta. |
| `js/modules/valor-absoluto/retos.js` | Etiquetar las ocho familias de problemas y las trampas conceptuales. |
| `js/modules/*/logic.js` | Mantener diagnóstico matemático puro; devolver IDs que el mapa pedagógico interpreta. |
| `js/core/vn.js` | Recibir eventos de aprendizaje resumidos y disparar reacciones contextuales. No incorporar el planificador dentro de la VN. |
| `js/core/glossary.js` | Vincular definiciones con las competencias y prerrequisitos relacionados. |
| `js/core/nav.js` / `js/hub.js` | Mostrar Continuar, Repasar y Explorar en la entrada al laboratorio. |
| `localStorage` existente | Migrar sin borrar `sucesiones:progreso:v1` ni `valor_absoluto:progreso:v1`. |

### 6.9. Compatibilidad y migración

- Introducir una clave nueva, por ejemplo `alaska:learning:v1`.
- Leer las claves actuales de progreso sin modificarlas durante la primera versión.
- Si una sección figura como completada, usarlo como contexto histórico, no inferir dominio de todas sus competencias.
- Añadir `schemaVersion` y funciones de migración explícitas.
- Soportar `localStorage` no disponible, bloqueado o lleno con degradación segura.
- No sincronizar datos con un servidor hasta que exista un motivo real y consentimiento explícito.

---

## 7. Alaska como tutora adaptativa

Alaska conservará su identidad y tono, pero sus reacciones responderán a necesidades de aprendizaje, no a una tabla de premios y enfados.

### 7.1. Modos de intervención

| Modo | Cuándo aparece | Función |
|---|---|---|
| Explicadora | Primera exposición o prerrequisito ausente | Construir el modelo mental. |
| Investigadora | Predicción o experimento | Ayudar a observar variables y relaciones. |
| Inspectora | Contradicción o error diagnosticable | Señalar el paso y pedir justificación. |
| Entrenadora | Repetición y práctica intercalada | Retirar pistas progresivamente. |
| Mentora | Frustración, baja confianza o regreso | Reducir fricción y proponer un siguiente paso alcanzable. |
| Cómplice | Deducción original o transferencia | Reconocer la calidad del razonamiento. |

### 7.2. Guía de tono

- Elogiar una estrategia concreta: “Probaste el caso `n = 1` y detectaste el desfase”.
- Evitar elogios vacíos repetidos después de cada clic.
- Usar humor dirigido al problema: “Ese signo menos está haciendo de las suyas”.
- No afirmar que un fallo demuestra falta de estudio, atención o capacidad.
- No fingir decepción, sufrimiento o necesidad emocional para obtener visitas.
- Permitir silencio: no toda respuesta necesita una línea de diálogo y un sprite distinto.

### 7.3. Reacciones basadas en evidencia

Una reacción no debe depender exclusivamente de `failCount`. Combinar:

- diagnóstico matemático;
- historial reciente de esa competencia;
- uso de pistas;
- confianza declarada;
- tiempo de respuesta solo como señal secundaria;
- estado narrativo de la lección.

La personalidad sigue siendo presentación; la decisión pedagógica pertenece al motor de aprendizaje.

---

## 8. Sistema de retos y jefes

Los jefes deben comprobar síntesis y transferencia, no solo velocidad, reflejos o resistencia a un cronómetro.

### 8.1. Estructura de un jefe académico

1. **Reconocer:** identificar la estructura matemática del problema.
2. **Predecir:** anticipar el comportamiento antes de manipular.
3. **Modelar:** elegir variables, restricciones y representación.
4. **Resolver:** ejecutar operaciones y justificar condiciones.
5. **Transferir:** resolver una variante nueva sin ayudas visuales.
6. **Debrief:** analizar los errores y registrar las competencias demostradas.

### 8.2. Condiciones de victoria

- La corrección matemática es obligatoria.
- El tiempo puede ser un modo opcional de desafío, nunca el único criterio de dominio.
- El sistema distingue victoria asistida de victoria independiente.
- Si falla una fase, puede repetirla o practicar el concepto relacionado sin perder progreso previo.
- La recompensa principal depende de una demostración de aprendizaje; los objetos raros pueden ser cosméticos o narrativos.

### 8.3. Ejemplo: jefe de sucesiones geométricas

- Fase 1: clasificar secuencia aritmética, geométrica o ninguna.
- Fase 2: identificar una razón negativa y predecir alternancia.
- Fase 3: construir la fórmula explícita respetando el ancla inicial.
- Fase 4: detectar una solución incorrecta con un exponente o paréntesis mal ubicados.
- Fase 5: resolver un problema de transferencia en un contexto diferente, sin la cinta de postes.

No agregar un bucle de tiempo real de 60 FPS si la tarea puede resolverse con eventos deterministas. La animación debe justificar su costo y no interferir con accesibilidad ni rendimiento.

---

## 9. Evaluación: demostrar aprendizaje, no engagement superficial

La arquitectura debe instrumentarse para comprobar si las decisiones mejoran la retención y la transferencia.

### 9.1. Métricas principales

| Métrica | Definición operativa | Qué responde |
|---|---|---|
| Recuperación demorada | Porcentaje correcto sin ayuda en una prueba posterior. | ¿Lo recuerda después? |
| Transferencia | Éxito en una familia/contexto/representación nueva. | ¿Puede usarlo fuera del ejemplo? |
| Recurrencia de diagnóstico | Frecuencia de IDs de error por competencia a través del tiempo. | ¿La concepción errónea se está corrigiendo? |
| Independencia | Proporción de ejercicios resueltos sin pistas ni solución. | ¿Necesita cada vez menos ayuda? |
| Calibración | Correspondencia entre confianza declarada y resultados observados. | ¿Reconoce lo que sabe y lo que no? |
| Tiempo hasta autonomía | Tiempo o sesiones desde introducción hasta resolución independiente. | ¿Qué tan eficientemente progresa? |
| Retorno voluntario | Sesiones iniciadas de manera voluntaria, interpretadas con cuidado. | ¿La experiencia sigue siendo valiosa? |

**No usar como métricas principales:** tiempo total de pantalla, cantidad de clics, cantidad de cofres, racha, número bruto de ejercicios o frecuencia de visitas sin considerar los resultados de aprendizaje.

### 9.2. Experimentos comparativos

Comenzar con experimentos pequeños, preregistrados si es posible y con consentimiento adecuado. Mantener contenido, dificultad y criterios de corrección comparables.

Ejemplos:

- explicación seguida de práctica agrupada vs. explicación seguida de práctica intercalada;
- repaso por fecha fija vs. repaso adaptado a independencia, confianza y éxito demorado;
- explicación primero vs. predicción-exploración-formalización;
- ejemplo resuelto completo vs. ejemplo con retirada gradual de pasos.

Medir resultado inmediato, recuperación demorada y transferencia. No declarar una estrategia ganadora por un aumento de clics o aciertos durante la misma sesión.

### 9.3. Diseño de evaluación responsable

- Explicar qué datos se guardan y para qué.
- Mantener almacenamiento local como opción predeterminada.
- Hacer optativa cualquier exportación o estudio con otros usuarios.
- Evitar recolectar datos sensibles que no sean necesarios.
- No inferir estados emocionales o rasgos personales a partir de tiempos, fallos o patrones de clics.
- Dar al estudiante acceso para revisar y borrar su historial local.
- Si en el futuro se realiza investigación con participantes, revisar requisitos éticos, consentimiento y protección de datos aplicables.

---

## 10. Priorización y plan de implementación

La secuencia está ordenada por valor pedagógico, dependencia técnica y posibilidad de validar resultados. No comenzar por el campamento ni por un sistema de jefes nuevo.

### Fase 0 — Instrumentación mínima y mapa curricular

**Objetivo:** saber qué se está aprendiendo.

- Definir catálogo inicial de competencias para Sucesiones y Valor Absoluto.
- Mapear IDs de diagnóstico a competencias.
- Añadir metadatos opcionales a preguntas existentes.
- Introducir eventos mínimos: respuesta, corrección, pista, solución y confianza.
- Mantener el comportamiento actual cuando no haya metadatos.
- Crear tests del catálogo y del registro de eventos.

**Criterio de salida:** un ejercicio resuelto puede asociarse a una competencia y generar un evento verificable sin modificar la lógica matemática.

### Fase 1 — Repetición espaciada y reentrada

**Objetivo:** recuperar conceptos a lo largo del tiempo y hacer fácil volver.

- Implementar `progress-store.js`, `mastery.js` y `scheduler.js`.
- Mostrar Continuar / Repasar / Explorar.
- Añadir pregunta de recuperación al principio y ticket conceptual al final.
- Guardar el próximo paso y un plan de reentrada opcional.
- Proteger las claves de progreso existentes con migración y fallback.

**Criterio de salida:** una competencia puede quedar programada, recuperarse sin ayuda y reagendarse tras un resultado nuevo.

### Fase 2 — Intercalación y atlas de errores

**Objetivo:** entrenar reconocimiento y selección de método.

- Etiquetar las familias de problemas existentes.
- Crear lotes mixtos después de una primera adquisición guiada.
- Integrar la red de prerrequisitos.
- Presentar repasos cortos para errores recurrentes.
- Validar con problemas de transferencia.

**Criterio de salida:** el selector mezcla categorías relacionadas y puede explicar por qué recomendó un repaso.

### Fase 3 — Exploración y ejemplos graduados

**Objetivo:** convertir widgets en laboratorios de hipótesis.

- Añadir una predicción previa en widgets seleccionados.
- Coordinar explicación de Alaska con resaltado del elemento del widget.
- Crear ejemplos resueltos completos y actividades de completar pasos.
- Diseñar comparaciones de métodos y casos contrastivos.
- Agregar teach-back breve donde exista una justificación natural.

**Criterio de salida:** la lección contiene al menos una actividad predictiva y una evaluación sin el soporte visual original.

### Fase 4 — Narrativa, campamento y jefes

**Objetivo:** fortalecer la identidad del mundo sin comprometer autonomía.

- Desbloquear artefactos por hitos matemáticos.
- Crear personajes y rutinas autónomas no punitivas.
- Implementar jefes como pruebas integradoras.
- Usar a Alaska como mentora contextual.
- Evaluar si la narrativa aumenta regreso voluntario sin reducir resultados de aprendizaje ni autonomía.

**Criterio de salida:** las recompensas son explicables, no aleatorias por azar, y no existe decay punitivo.

### Fase 5 — Validación y ajuste

**Objetivo:** aprender de datos reales.

- Ejecutar pilotos pequeños de recuperación, spacing e interleaving.
- Medir pruebas demoradas y transferencia.
- Revisar preguntas que generan ambigüedad o errores del evaluador.
- Ajustar intervalos y selección de ejercicios.
- Publicar límites y resultados sin exagerar causalidad.

---

## 11. Reglas de producto: patrones que sí y patrones que no

| Preferir | Evitar |
|---|---|
| Progreso por competencias | Progreso basado solo en horas o rachas |
| Repasos vencidos que esperan | Decaimiento de objetos y pérdidas por ausencia |
| Recompensas por descubrimiento demostrable | Gacha o premio aleatorio necesario para avanzar |
| Pistas graduadas y elegibles | Bloquear contenido hasta completar tareas artificiales |
| Feedback sobre razonamiento | Humillar al estudiante o teatralizar decepción |
| Personajes con vida narrativa | Hacer que sufran por la ausencia del usuario |
| Plan de retorno elegido por el usuario | Notificaciones insistentes o urgencia falsa |
| Dificultad ajustada a prerrequisitos | “Desirable difficulty” como excusa para frustración |
| Medir retención y transferencia | Optimizar tiempo de pantalla |
| Permitir finalizar una sesión | Cliffhangers obligatorios o tareas sin cierre |

### 11.1. Reglas éticas

- El estudiante puede pausar o abandonar una sesión sin perder recursos, progreso o afecto narrativo.
- Las notificaciones, si existieran, son optativas, configurables y fáciles de desactivar.
- Las recompensas nunca se compran con dinero real ni se usan para presionar.
- No usar culpa, miedo, comparación social o escasez artificial para aumentar visitas.
- La dificultad debe estar al servicio del objetivo, no de prolongar el tiempo de uso.
- No mostrar públicamente rankings de rendimiento por defecto.

---

## 12. Criterios de aceptación generales

Una implementación de esta arquitectura será aceptable cuando:

1. Cada ejercicio nuevo o adaptado pueda mapearse a una o más competencias.
2. Una respuesta correcta asistida no sea confundida con dominio independiente.
3. El sistema pueda programar repasos y explicar por qué presenta un ejercicio.
4. Los ejercicios intercalados se presenten después de una introducción suficiente.
5. Un fallo pueda activar una recuperación de prerrequisitos sin quitar progreso.
6. El usuario pueda continuar, repasar o explorar sin perder autonomía.
7. La sesión termine con una salida clara y un próximo paso opcional.
8. El campamento y las recompensas no se deterioren por ausencias.
9. Las métricas principales incluyan retención demorada y transferencia.
10. Los datos se mantengan locales por defecto y el sistema funcione sin servicios externos.
11. La lógica matemática existente siga siendo pura, testeable y separada del DOM.
12. Las nuevas reglas tengan tests unitarios y casos límite.

---

## 13. Bibliografía y fuentes

La lista diferencia revisiones y metaanálisis de estudios experimentales. Los enlaces DOI apuntan al registro editorial; cuando hay acceso abierto conocido se añade una versión pública. Los resultados citados no deben extrapolarse automáticamente a todo tema, edad o modalidad.

### Recuperación, espaciado e intercalación

1. **Roediger, H. L., & Karpicke, J. D. (2006).** Test-enhanced learning: Taking memory tests improves long-term retention. *Psychological Science, 17*(3), 249–255. [https://doi.org/10.1111/j.1467-9280.2006.01693.x](https://doi.org/10.1111/j.1467-9280.2006.01693.x). Evidencia experimental sobre recuperación activa y retención demorada.
2. **Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006).** Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin, 132*(3), 354–380. [https://doi.org/10.1037/0033-2909.132.3.354](https://doi.org/10.1037/0033-2909.132.3.354). Metaanálisis de 317 experimentos y 839 evaluaciones; el intervalo depende de la demora de retención buscada.
3. **Rawson, K. A., & Dunlosky, J. (2011).** Optimizing schedules of retrieval practice for durable and efficient learning: How much is enough? *Journal of Experimental Psychology: General, 140*(3), 283–302. [https://doi.org/10.1037/a0023956](https://doi.org/10.1037/a0023956). Estudia cómo combinar criterio de aprendizaje inicial y reaprendizaje.
4. **Rohrer, D., & Taylor, K. (2007).** The shuffling of mathematics practice problems boosts learning. *Instructional Science, 35*, 481–498. [https://doi.org/10.1007/s11251-007-9015-8](https://doi.org/10.1007/s11251-007-9015-8). Experimentos sobre práctica distribuida e intercalada en matemática.
5. **Carpenter, S. K., Pan, S. C., & Butler, A. C. (2022).** The science of effective learning with spacing and retrieval practice. *Nature Reviews Psychology, 1*, 496–511. [https://doi.org/10.1038/s44159-022-00089-1](https://doi.org/10.1038/s44159-022-00089-1). Revisión sobre recuperación, espaciado y metacognición.
6. **Ruitenburg, S. K., Goos, M., Lambert, G., Kirschner, P. A., Jarodzka, H., et al. (2026).** A meta-analysis of the effectiveness and boundary conditions of retrieval practice, distributed practice, and interleaved practice in authentic school classrooms. *Educational Psychology Review, 38*, Article 137. [https://doi.org/10.1007/s10648-026-10225-5](https://doi.org/10.1007/s10648-026-10225-5). Publicada el 29 de octubre de 2026; 53 estudios, 7.303 participantes y 233 tamaños de efecto en educación primaria y secundaria. Sus autores destacan moderadores y recomiendan adaptar el diseño al contexto.
7. **Agarwal, P. K., Nunes, L. D., & Blunt, J. R. (2021).** Retrieval practice consistently benefits student learning: A systematic review of applied research in schools and classrooms. *Educational Psychology Review, 33*, 1409–1453. [https://doi.org/10.1007/s10648-021-09595-9](https://doi.org/10.1007/s10648-021-09595-9). Revisión sistemática de 50 experimentos en contextos educativos reales.
8. **Adesope, O. O., Trevisan, D. A., & Sundararajan, N. (2017).** Rethinking the use of tests: A meta-analysis of practice testing. *Review of Educational Research, 87*(3), 659–701. [https://doi.org/10.3102/0034654316689306](https://doi.org/10.3102/0034654316689306). Metaanálisis sobre los efectos de la práctica de pruebas.

### Exploración, ejemplos y comparación de estrategias

9. **Kapur, M. (2014).** Productive failure in learning math. *Cognitive Science, 38*(5), 1008–1022. [https://doi.org/10.1111/cogs.12107](https://doi.org/10.1111/cogs.12107). Dos estudios controlados sobre exploración antes de instrucción; los resultados favorecieron comprensión conceptual y transferencia en determinadas condiciones.
10. **Kapur, M. (2015).** Learning from productive failure. *Learning: Research and Practice, 1*(1), 51–65. [https://doi.org/10.1080/23735082.2015.1002195](https://doi.org/10.1080/23735082.2015.1002195). Explica las fases de generación/exploración y consolidación.
11. **Barbieri, C. A., Miller-Cotto, D., Clerjuste, S. N., & Chawla, K. (2023).** A meta-analysis of the worked examples effect on mathematics performance. *Educational Psychology Review, 35*, Article 11. [https://doi.org/10.1007/s10648-023-09745-1](https://doi.org/10.1007/s10648-023-09745-1). Metaanálisis de 55 estudios y 181 tamaños de efecto; efecto medio g = 0,48. Los ejemplos correctos por sí solos mostraron mejores resultados generales que ejemplos incorrectos aislados o mezclas.
12. **Renkl, A., & Atkinson, R. K. (2003).** Structuring the transition from example study to problem solving in cognitive skill acquisition: A cognitive load perspective. *Educational Psychologist, 38*(1), 15–22. [https://doi.org/10.1207/S15326985EP3801_3](https://doi.org/10.1207/S15326985EP3801_3). Fundamento para retirar pasos de ejemplos resueltos progresivamente.
13. **Chi, M. T. H., Bassok, M., Lewis, M. W., Reimann, P., & Glaser, R. (1989).** Self-explanations: How students study and use examples in learning to solve problems. *Cognitive Science, 13*(2), 145–182. [https://doi.org/10.1207/s15516709cog1302_1](https://doi.org/10.1207/s15516709cog1302_1). Estudio de autoexplicaciones durante el estudio de ejemplos resueltos.
14. **Rittle-Johnson, B., & Star, J. R. (2007).** Does comparing solution methods facilitate conceptual and procedural knowledge? An experimental study on learning to solve equations. *Journal of Educational Psychology, 99*(3), 561–574. [https://doi.org/10.1037/0022-0663.99.3.561](https://doi.org/10.1037/0022-0663.99.3.561). Experimento sobre comparación de métodos para resolver ecuaciones.
15. **Durkin, K., Star, J. R., & Rittle-Johnson, B. (2017).** Using comparison of multiple strategies in the mathematics classroom: Lessons learned and next steps. *ZDM Mathematics Education, 49*, 585–597. [https://doi.org/10.1007/s11858-017-0853-9](https://doi.org/10.1007/s11858-017-0853-9). Revisión de investigación sobre comparación de estrategias en matemática.
16. **Richland, L. E., Kornell, N., & Kao, L. S. (2009).** The pretesting effect: Do unsuccessful retrieval attempts enhance learning? *Journal of Experimental Psychology: Applied, 15*(3), 243–257. [https://doi.org/10.1037/a0016496](https://doi.org/10.1037/a0016496). Cinco experimentos sobre preguntas antes del estudio; un intento fallido puede preparar el aprendizaje posterior.

### Feedback, metacognición y rendimiento durable

17. **Hattie, J., & Timperley, H. (2007).** The power of feedback. *Review of Educational Research, 77*(1), 81–112. [https://doi.org/10.3102/003465430298487](https://doi.org/10.3102/003465430298487). Marco de feedback que distingue tarea, proceso, autorregulación y persona.
18. **Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013).** Improving students' learning with effective learning techniques. *Psychological Science in the Public Interest, 14*(1), 4–58. [https://doi.org/10.1177/1529100612453266](https://doi.org/10.1177/1529100612453266). Revisión de técnicas de aprendizaje y su utilidad relativa.
19. **Soderstrom, N. C., & Bjork, R. A. (2015).** Learning versus performance: An integrative review. *Perspectives on Psychological Science, 10*(2), 176–199. [https://doi.org/10.1177/1745691615569000](https://doi.org/10.1177/1745691615569000). Fundamenta por qué el rendimiento durante la práctica puede no reflejar aprendizaje duradero.

### Diseño multimedia, motivación y retorno

20. **Mayer, R. E. (2017).** Using multimedia for e-learning. *Journal of Computer Assisted Learning, 33*(5), 403–423. [https://doi.org/10.1111/jcal.12197](https://doi.org/10.1111/jcal.12197). Revisión de principios de diseño multimedia.
21. **Mayer, R. E. (2024).** The past, present, and future of the cognitive theory of multimedia learning. *Educational Psychology Review, 36*, Article 8. [https://doi.org/10.1007/s10648-023-09842-1](https://doi.org/10.1007/s10648-023-09842-1). Revisión de principios de selección, organización e integración de palabras y gráficos.
22. **Ainsworth, S. (2006).** DeFT: A conceptual framework for considering learning with multiple representations. *Learning and Instruction, 16*(3), 183–198. [https://doi.org/10.1016/j.learninstruc.2006.03.001](https://doi.org/10.1016/j.learninstruc.2006.03.001). Marco para diseñar y coordinar representaciones múltiples.
23. **Ryan, R. M., & Deci, E. L. (2020).** Intrinsic and extrinsic motivation from a self-determination theory perspective: Definitions, theory, practices, and future directions. *Contemporary Educational Psychology, 61*, 101860. [https://doi.org/10.1016/j.cedpsych.2020.101860](https://doi.org/10.1016/j.cedpsych.2020.101860). Revisión del apoyo a autonomía, competencia y vinculación.
24. **Wang, Y., Wang, H., Wang, S., Wind, S. A., & Gill, C. (2024).** A systematic review and meta-analysis of self-determination-theory-based interventions in the education context. *Learning and Motivation, 87*, 102015. [https://doi.org/10.1016/j.lmot.2024.102015](https://doi.org/10.1016/j.lmot.2024.102015). Metaanálisis de intervenciones educativas basadas en teoría de autodeterminación.
25. **Sailer, M., & Homner, L. (2020).** The gamification of learning: A meta-analysis. *Educational Psychology Review, 32*, 77–112. [https://doi.org/10.1007/s10648-019-09498-w](https://doi.org/10.1007/s10648-019-09498-w). Metaanálisis de resultados cognitivos, motivacionales y conductuales; los efectos dependen del diseño y del contexto.
26. **Gollwitzer, P. M. (1999).** Implementation intentions: Strong effects of simple plans. *American Psychologist, 54*(7), 493–503. [https://doi.org/10.1037/0003-066X.54.7.493](https://doi.org/10.1037/0003-066X.54.7.493). Marco de planes del tipo “si ocurre X, haré Y”.
27. **Gollwitzer, P. M., & Sheeran, P. (2006).** Implementation intentions and goal achievement: A meta-analysis of effects and processes. In *Advances in Experimental Social Psychology, 38*, 69–119. [https://doi.org/10.1016/S0065-2601(06)38002-1](https://doi.org/10.1016/S0065-2601(06)38002-1). Metaanálisis de planes de implementación en consecución de objetivos.

---

## 14. Decisión final de diseño

Alaska Math Lab no debería intentar competir con redes sociales mediante trucos más sofisticados de captura de atención. Su ventaja diferencial está en combinar algo que suele estar separado: una representación matemática manipulable, un motor de diagnóstico propio, una tutora narrativa y una ruta de aprendizaje que recuerda qué necesita practicar cada estudiante.

La prioridad es construir un sistema que pueda decir:

> “La última vez entendiste cómo se comporta una razón negativa cuando tenés el gráfico delante. Hoy vamos a comprobar si todavía podés anticipar los signos sin verlo. Después te voy a mostrar un caso parecido que esconde una diferencia importante”.

Ese mensaje hace tres cosas a la vez: retoma el contexto, plantea un desafío alcanzable y anuncia una razón intelectual para volver. No necesita amenazar con perder una racha ni dejar a un personaje sufriendo.

**Criterio definitivo de éxito:** que el estudiante vuelva porque encuentra valor en lo que puede descubrir, y que cada vez necesite menos a Alaska para resolverlo por sí mismo.