# Filosofía de diseño — Alaska Math Lab

**Estado:** guía normativa para nuevas implementaciones y refactorizaciones.
**Ámbito:** interfaz, interacción, visualizaciones, tipografía, color, feedback, narrativa, accesibilidad y decisiones de experiencia.
**Documento relacionado:** LEARNING_ARCHITECTURE.md define qué procesos de aprendizaje debe apoyar el producto; ROADMAP.md determina cuándo construirlos.

Esta guía está dirigida a desarrolladores y agentes que agreguen páginas, ejercicios, gráficos, controles o experiencias narrativas. Define invariantes del producto y criterios para las nuevas decisiones. No es una orden de rediseñar lo que ya existe ni una plantilla que deba imponerse a cada módulo.

---

## 1. Identidad del producto

Alaska Math Lab acompaña el estudio de matemática para física, ingreso a Exactas y contenidos iniciales de Análisis mediante laboratorios interactivos. Su propósito es ayudar a comprender por qué funcionan las ideas, experimentar sus consecuencias y reconocer errores de razonamiento, no limitarse a solicitar respuestas correctas.

La experiencia combina:

- **Rigor sin frialdad:** definiciones, fórmulas, condiciones y resultados deben poder leerse con precisión.
- **Acompañamiento humano:** Alaska aporta una voz reconocible, humor y guía contextual cuando esa presencia ayuda a aprender.
- **Exploración tangible:** gráficos, rectas, fichas, circuitos y controles hacen visibles relaciones matemáticas.
- **Autonomía progresiva:** las ayudas deben facilitar la comprensión y retirarse cuando el estudiante puede continuar por sí mismo.
- **Calidez sin presión:** el mundo del laboratorio invita a regresar, pero no genera culpa por descansar o ausentarse.

La imagen rectora es un **pizarrón usado durante una sesión de estudio**: una superficie común donde conviven explicaciones, anotaciones, cálculos y diagramas. Debe sentirse cálida y trabajada, pero el contenido y la interacción matemática siguen siendo protagonistas.

Evitar tanto la frialdad de un dashboard genérico como una escenografía literal de aula que compita con la lección.

---

## 2. Contrato para agentes

Antes de diseñar o modificar una interfaz, el agente debe:

1. Leer README.md para entender las capacidades reales.
2. Leer LEARNING_ARCHITECTURE.md si la interfaz afecta aprendizaje, pistas, progresión, evaluación, recuperación, confianza o transferencia.
3. Leer ROADMAP.md para comprobar el estado, prioridad y dependencias.
4. Inspeccionar CSS, tokens, componentes y patrones del módulo afectado.
5. Identificar la tarea del estudiante y la información que necesita percibir antes de elegir un tratamiento visual.

### 2.1. Jerarquía de decisiones

- La exactitud matemática es obligatoria.
- La accesibilidad y la comprensión prevalecen sobre una metáfora estética.
- LEARNING_ARCHITECTURE.md define la función pedagógica.
- Este documento define cómo se expresa visual e interactivamente esa función.
- ROADMAP.md determina secuencia y alcance; no convierte una idea planificada en requisito ya implementado.
- README.md describe capacidades reales y no debe utilizarse para inventar componentes.

### 2.2. Niveles de decisión

- **Obligatorio:** preservar significado, comprensión, accesibilidad, consistencia semántica y comportamiento esperado.
- **Preferido:** reutilizar patrones y recursos existentes con moderación.
- **Excepción justificada:** un borde, fondo, radio, sombra, color, textura o agrupación se puede usar si cumple una función concreta y no existe una alternativa más simple igual de clara.

No hay cuotas universales de tarjetas, colores, radios o decoraciones. La pregunta no es si un recurso está permitido, sino si su uso está justificado.

### 2.3. Protocolo de cambio visual

Antes de introducir un patrón compartido, comprobar:
- qué módulos lo reutilizan;
- si puede alterar SVG, controles o foco;
- si cambia dimensiones, scroll, pointer capture o jerarquía;
- si afecta móvil, impresión o movimiento reducido;
- si necesita actualizar la guía o el roadmap.

Un agente no debe aplicar un rediseño global a partir de una observación local sin revisar sus efectos cruzados.

---

## 3. Principios de diseño de experiencia

### 3.1. Una superficie, con jerarquía por contenido

Las secciones pertenecen a una superficie visual compartida. El espacio, la alineación, el tamaño, el peso tipográfico y la posición suelen separar mejor las ideas que una sucesión de paneles.

Usar un borde o fondo cuando ayude a:
- reconocer una unidad interactiva;
- delimitar una tabla o zona desplazable;
- señalar una entrada editable;
- distinguir estados que podrían confundirse;
- contener una superposición;
- dar forma perceptible a un objeto físico de la metáfora matemática.

No encerrar cada párrafo, etiqueta, valor y botón por defecto. Evitar paneles anidados si el segundo marco no añade una distinción útil.

**Preferir:** explicación seguida de diagrama, separada por ritmo y espacio; tabla con límites discretos cuando ayuden a seguir filas y columnas.

**Evitar:** una tarjeta para la sección, otra para cada dato y una tercera alrededor de cada resultado sin diferencia funcional.

### 3.2. La interfaz debe hacer visible la tarea mental

La composición debe ayudar a reconocer qué tipo de actividad realiza el estudiante. No hace falta inventar seis temas visuales: alcanza con cambios pequeños y consistentes de contexto, etiquetas funcionales, resaltados puntuales y disposición.

| Estado de aprendizaje | Necesidad visual |
|---|---|
| Predicción | Mostrar la situación sin revelar el resultado; hacer clara la acción de anticipar. |
| Experimentación | Identificar qué variables u objetos se pueden manipular. |
| Observación | Hacer perceptible qué cambió y qué permaneció estable. |
| Formalización | Conectar la observación con la definición, propiedad o expresión simbólica. |
| Práctica guiada | Mantener el contexto y ubicar la pista cerca del paso relevante. |
| Recuperación | Reducir ayudas y evitar que el widget revele accidentalmente la respuesta. |
| Transferencia | Cambiar la representación o el contexto y mantener visible el objetivo matemático. |
| Reflexión | Presentar confianza, explicación o revisión como herramientas opcionales y comprensibles. |

La interfaz no tiene que gritarle al estudiante qué hacer. Debe hacer evidente cuál es la tarea intelectual y dónde puede realizarla.

### 3.3. Las representaciones se conectan, no se acumulan

Un mismo objeto matemático puede aparecer como manipulador, gráfico, tabla, expresión simbólica y explicación verbal.

Cada representación adicional debe cumplir una función distinta. No mostrar cinco formas a la vez por defecto.

Preferir una representación principal y una transición explícita:
- del manipulador al gráfico;
- del gráfico a la tabla;
- de la tabla a la fórmula;
- de la fórmula a una explicación;
- en sentido inverso, de la expresión a una predicción gráfica.

El cambio de representación debe preservar el objeto matemático, no ocultar diferencias importantes de dominio, continuidad, escala, signos o condiciones.

### 3.4. Manipulación directa con causalidad visible

Mover un nodo, cambiar una base o conectar unidades debe producir una consecuencia matemática perceptible. El vínculo entre acción y resultado debe ser claro y suficientemente inmediato.

No agregar interacciones que sólo simulan una manipulación sin modificar el modelo real. No presentar animaciones decorativas como si fueran evidencia matemática.

Mantener una diferencia clara entre:
- valores que ingresa o controla el estudiante;
- resultados derivados por el sistema;
- condiciones y restricciones;
- estados de error o invalidez.

### 3.5. Predicción antes de revelar

Cuando la lección lo justifique, pedir una predicción breve antes de ejecutar el experimento. La interfaz debe permitir comprometer una hipótesis sin castigarla cuando resulte falsa.

Después de la manipulación, mostrar evidencia observable y conectar el resultado con el principio formal. No revelar automáticamente la solución antes de la predicción ni ocultarla de manera artificial después.

### 3.6. Las ayudas deben retirarse progresivamente

Una pista, ejemplo o explicación debe estar cerca de la tarea a la que ayuda. La progresión puede pasar de:
1. ejemplo completo;
2. paso siguiente incompleto;
3. resolución parcial;
4. problema independiente;
5. variante de transferencia.

No mostrar ayudas permanentes que resuelvan por adelantado una tarea de recuperación. Tampoco retirarlas de golpe cuando el estudiante necesita todavía aprender el procedimiento.

### 3.7. El error tiene que ser informativo

Un error no es solamente un color rojo, una vibración o una cruz.

El feedback debe ayudar a identificar:
- qué parte del razonamiento no coincide;
- qué concepto o condición está involucrado;
- qué evidencia permite revisar el paso;
- cuál es la siguiente acción útil.

Cuando exista un diagnóstico, señalar el objeto, variable o línea pertinente. No añadir un diagnóstico si el sistema no dispone de evidencia suficiente.

### 3.8. La incertidumbre y la confianza no son estados de vergüenza

Si la interfaz solicita confianza, debe presentarla como autorregistro voluntario. No usar expresiones que etiqueten al estudiante como incapaz, descuidado o poco inteligente.

Un acierto con baja confianza y un error con alta confianza son situaciones distintas; la UI puede reflejarlas con una sugerencia, pero no debe presentar una interpretación probabilística como diagnóstico definitivo.

---

## 4. Principios visuales

### 4.1. Tipografía como estructura

El proyecto autoalberga Caveat, Kalam y un subconjunto matemático. Mantener esos roles antes de introducir familias nuevas:

- **Caveat (var --font-hand):** títulos, fórmulas destacadas, valores, rótulos y marcas breves que se benefician de un trazo expresivo.
- **Kalam (var --font-note):** explicaciones, párrafos, instrucciones y lectura sostenida.
- **var --font-math:** respaldo para símbolos y glifos matemáticos formales que no cubren las familias manuscritas.

La diferencia entre familias crea jerarquía, no debe convertirse en mezcla ornamental. Mantener escala y tamaños fluidos definidos por CSS. Dar a los encabezados una progresión clara y dejar que el cuerpo conserve lectura cómoda.

No reducir texto secundario hasta que parezca una nota legal. Limitar el ancho de lectura de párrafos largos sin constreñir planos, tablas, expresiones o controles que necesitan espacio.

**Preferir:** Caveat en el título de una sección y Kalam en la explicación que sigue.

**Evitar:** asignar una fuente distinta a cada widget, poner párrafos extensos en una manuscrita de exhibición o usar negritas en casi cada sustantivo.

### 4.2. Color con significado estable

Partir de los tokens de css/base.css, no de valores nuevos dispersos. La paleta documentada utiliza pizarra oscura, tinta cálida, tiza gastada y acentos semánticos.

Los valores CSS reales son la fuente de verdad. Si esta guía y la hoja de estilos difieren, inspeccionar la hoja actual, corregir la guía y no introducir un token duplicado.

| Token | Rol principal |
|---|---|
| --ink | Texto y estructura matemática principal. |
| --muted | Guías, referencias y contenido secundario. |
| --yellow | Resultado, objetivo o elemento que conviene mirar. |
| --blue | Datos de entrada, condiciones o elementos manipulables. |
| --pink | Error, cuidado, trampa o diagnóstico negativo. |
| --green | Acierto verificado, confirmación o neutro multiplicativo cuando corresponde. |

El color debe comunicar un rol que se mantenga entre módulos. No colorear todo lo importante: la jerarquía también debe funcionar mediante posición, texto, tamaño y forma.

No usar colores de frameworks ni valores nuevos por conveniencia cuando un token existente expresa el significado. No depender exclusivamente del color para distinguir estados.

En gráficos, respetar los códigos locales ya establecidos. Antes de asignar color a una curva nueva, revisar el renderer y la leyenda del módulo.

### 4.3. Espacio, dimensiones y separación

El espacio en blanco permite que la superficie se lea como una explicación en curso. Usar una escala coherente de márgenes y separación, con más distancia entre temas que entre elementos de una misma operación.

Mantener dimensiones fluidas y breakpoints locales en css/layout.css, css/components.css y hojas específicas. No fijar anchos o alturas sólo para llenar huecos.

Si una expresión, riel o tabla requiere ancho mínimo, permitir una adaptación legible —por ejemplo, scroll en su propia región— en lugar de comprimir caracteres o toda la página.

### 4.4. Bordes, radios, sombras y textura

Los bordes no están prohibidos. Se prefieren como señales funcionales: contorno de un campo, límite de tabla, región de interacción, ficha que debe encastrar o selección activa.

En reposo, elementos de navegación y opciones de respuesta que funcionan como texto suelen necesitar sólo una marca de estado, no un rectángulo permanente.

Usar radios pequeños existentes cuando un control los necesita. Reservar radios más marcados para casos donde comuniquen una forma o interacción táctil real. Las sombras y capas elevadas son excepcionales: una sombra puede aclarar una superposición u objeto flotante, pero no debe fabricar profundidad decorativa sobre cada superficie.

La textura de pizarrón, grano, fantasmas de fórmulas y marcas de borrador son parte del ambiente. Deben permanecer de baja intensidad y detrás de la lectura. Si reducen contraste, tapan entradas o hacen que un gráfico parezca impreciso, se atenúan o se eliminan en esa zona.

### 4.5. Diagramas, dibujos y movimiento

Los SVG y gráficos son herramientas de explicación. La mano dibujada puede aparecer en flechas, círculos, subrayados y anotaciones; las relaciones matemáticas deben conservar geometría exacta cuando la precisión importe.

No deformar curvas, ejes, límites, escalas o fichas para hacerlas “más humanas”.

Un dibujo decorativo debe identificar, explicar u orientar. Evitar ilustraciones intercambiables, iconos sin significado o garabatos añadidos sólo para llenar espacio.

El movimiento debe mostrar un cambio, una respuesta o una relación causal. Evitar animar elementos estáticos sin motivo. Respetar prefers-reduced-motion y mantener la respuesta a gestos directa, especialmente en gráficos manipulables.

---

## 5. Layout y navegación

### 5.1. Navegación y hub

La navegación global debe ser coherente en todos los laboratorios, legible en escritorio y móvil y mantener visible qué página está activa.

El hub es un índice ilustrado de laboratorios, no una plantilla de landing SaaS. Las entradas se distinguen por título, descripción y dibujo pertinente; no necesitan etiquetas genéricas de categoría.

Los módulos pueden adoptar estructuras diferentes si el contenido lo pide:
- Funciones organiza simuladores en pestañas.
- Sucesiones y Valor Absoluto presentan lecciones y un índice.
- Desigualdades y Unidades priorizan simuladores especializados.
- Potencias y Raíces y Exponenciales disponen de lecciones y widgets propios.

No imponer una misma grilla a todas las páginas.

### 5.2. Split-Workbench

La dirección de escritorio prevista para Sucesiones y Valor Absoluto es un Split-Workbench: explicación y ejercicio en una columna, simulador o plano persistente en otra.

La proporción propuesta es asimétrica, aproximadamente 42/58, para que el gráfico sea el espacio de trabajo principal sin quitar contexto a las notas. El índice lateral debe poder plegarse. Debe existir una vista de lectura de una sola columna.

Esta arquitectura está planeada y su estado debe verificarse en ROADMAP.md antes de describirla como implementada.

El Split-Workbench es específico de lecciones que combinan explicación secuencial y simulador asociado. No forzarlo en el hub, pestañas de Funciones, Desigualdades o Unidades si la estructura de la tarea no lo necesita.

En pantallas estrechas, volver a una composición de una columna. Explicación y controles deben preceder o acompañar al gráfico en un orden comprensible, sin comprimir dos columnas de escritorio en ancho móvil.

### 5.3. Proximidad entre explicación y objeto

Cuando Alaska se refiere a una variable, control o parte de un gráfico, el elemento debe permanecer visible cerca de la explicación o poder enfocarse mediante una acción explícita.

Un resaltado contextual debe:
- señalar el objeto correcto;
- desaparecer cuando deja de ser pertinente;
- no ocultar rótulos ni valores;
- respetar movimiento reducido;
- tener una alternativa perceptible sin animación.

Evitar desplazamientos automáticos bruscos o cambios de foco inesperados.

---

## 6. Controles, feedback y estados

### 6.1. Controles

Botones, selects, campos, sliders, pestañas y toggles deben conservar semántica, estados visibles y objetivos táctiles cómodos.

Un control puede tener contorno aunque el resto de la página no use marcos: ese borde ayuda a reconocer qué se puede accionar.

Mostrar foco de teclado con :focus-visible; diferenciar estados activo, presionado y deshabilitado. No depender del hover para comunicar una acción. Los estilos hover deben limitarse a dispositivos que lo soporten.

El estado no debe comunicarse exclusivamente mediante color: combinarlo con texto, forma, trazo, posición o atributos accesibles.

### 6.2. Feedback

Mantener etiquetas asociadas a campos, instrucciones cerca de la acción y errores junto al control o respuesta afectada.

Una respuesta correcta puede resaltarse brevemente. Una respuesta incorrecta debe acompañarse de un diagnóstico o una instrucción útil cuando haya evidencia suficiente. No convertir todo en badges de correcto/incorrecto.

Preferir feedback orientado a:
- tarea: qué resultado no coincide;
- proceso: qué operación o representación revisar;
- autorregulación: qué estrategia conviene probar a continuación.

No elogiar de manera vacía cada clic. Reconocer estrategias concretas, verificaciones y conexiones matemáticas.

### 6.3. Alaska como tutora contextual

Alaska puede explicar, inspeccionar, acompañar o celebrar un descubrimiento. Sus intervenciones deben responder a la tarea y al estado pedagógico.

Su personalidad puede incluir ironía y humor tsundere, pero:
- nunca humilla al estudiante;
- no convierte ausencia o error en culpa;
- no acusa a alguien de flojo o incapaz;
- no interrumpe cada ejercicio con diálogos;
- no revela la solución antes de que una actividad de recuperación tenga oportunidad de funcionar;
- reduce su intervención a medida que el estudiante gana independencia.

La expresión visual debe reforzar el mensaje. El sprite no debe ser un adorno permanente que compita con el plano o el texto.

### 6.4. Sonido y animación

El sonido es opcional y debe respetar el control de preferencias. No usar sonidos de error agresivos ni estímulos repetitivos para incentivar permanencia.

Las animaciones deben:
- expresar causalidad o estado;
- ser breves y no bloquear la siguiente acción;
- respetar prefers-reduced-motion;
- no hacer depender la comprensión de una secuencia animada;
- mantener el mismo significado cuando se desactivan.

### 6.5. Estados vacíos, carga, error y éxito

Diseñar estados con palabras claras y ubicación estable. No reemplazar mensajes por iconos aislados, color solamente o ilustraciones que retrasen la tarea.

Si un estado no necesita una superficie aparte, texto y espaciado suelen bastar.

---

## 7. Narrativa, motivación y mundo persistente

### 7.1. Motivación sin coerción

El diseño busca apoyar autonomía, competencia y vinculación. La interfaz puede hacer visible el progreso, ofrecer desafíos alcanzables y crear afecto por el mundo del laboratorio.

No busca maximizar engagement a cualquier costo.

Preferir:
- progreso acumulativo y recuperable;
- metas que el estudiante puede elegir;
- recompensas por descubrimientos concretos;
- eventos narrativos opcionales;
- repasos que explican su propósito;
- reentrada sencilla después de una ausencia.

Evitar:
- pérdida de recursos por no conectarse;
- personajes que sufren por ausencia;
- rachas que no pueden recuperarse;
- notificaciones insistentes;
- tareas pendientes que bloquean otras actividades;
- cofres aleatorios que oculten contenido académico;
- presión social o rankings como motor principal.

### 7.2. Campamento y personajes autónomos

El campamento puede ser un mundo persistente con personajes, rutinas, personalidades y relaciones. Su vida autónoma no debe depender de que el estudiante esté observando.

El progreso académico puede desbloquear artefactos y opciones de construcción. El estudiante decide cómo utilizarlos.

La ausencia no deteriora el mundo. Las ratas no pasan frío, hambre ni tristeza como castigo. Un evento puede haber ocurrido mientras el estudiante no estaba, pero debe poder conocerse sin generar una deuda o pérdida.

### 7.3. Misterios y curiosidad

El Cuaderno de Misterios presenta preguntas matemáticas opcionales que el estudiante puede guardar, resolver o descartar.

La pregunta puede invitar a volver, pero:
- la respuesta no está bloqueada;
- el estudiante puede cerrar o descartar el misterio;
- no acumula un backlog infinito;
- no se presenta como tarea vencida;
- al retomarlo, ofrece contexto y una actividad breve.

### 7.4. Recompensas

Una recompensa debe representar un logro, exploración o contribución con significado. No debe sustituir una explicación ni ser la única razón para completar una actividad.

Preferir artefactos ligados a conceptos y descubrimientos. No usar azar opaco, apuestas o pérdida de recursos como sustitutos de feedback.

---

## 8. Accesibilidad, adaptación y privacidad

La atmósfera no puede reducir legibilidad ni funcionalidad.

Conservar:
- contraste suficiente sobre toda la textura de fondo;
- tamaño de texto cómodo;
- foco visible;
- etiquetas accesibles;
- orden de teclado;
- alternativas textuales para SVG informativos;
- controles operables con teclado y touch;
- movimiento reducido;
- alternativa a sonido y animación;
- reflujo sin scroll horizontal global innecesario.

Probar anchuras estrechas y escritorio amplio. Revisar fórmulas, tablas, navegación, SVG, botones extensos y regiones desplazables.

El proyecto es local-first. No añadir analytics remotos, cuentas, rastreo ni envío de historial de aprendizaje sin una decisión explícita y documentación de privacidad. Recopilar sólo la evidencia necesaria para la función pedagógica.

Los datos de confianza o errores deben describir interacción con actividades, no producir perfiles psicológicos del estudiante.

---

## 9. Convenciones de implementación

- El proyecto utiliza HTML, CSS y módulos JavaScript nativos, sin paso de compilación.
- Reutilizar tokens globales en css/base.css, patrones compartidos en css/layout.css y css/components.css, y estilos específicos en css/modules/.
- Mantener lógica matemática separada de representación.
- Mantener reglas pedagógicas fuera de renderers y manejadores DOM siempre que sea posible.
- No añadir dependencias de UI o runtime sin justificación y aprobación documentada.
- Antes de introducir un estilo global, revisar efectos sobre SVG inline, gráficos y controles de otras páginas.
- Seguir el patrón SVG existente con dimensiones y semántica apropiadas.
- No añadir iconos emoji como sustituto de iconografía del sistema.
- Reutilizar prefers-reduced-motion, estilos de foco, breakpoints y estados ya definidos.
- Añadir pruebas para estados y comportamientos nuevos, incluidos casos de borde matemáticos.

---

## 10. Antipatrones y alternativas

| Evitar | Por qué perjudica | Preferir |
|---|---|---|
| Una caja para cada bloque de texto o dato | Fragmenta una explicación continua y aplana jerarquía. | Espacio, alineación, escala tipográfica y proximidad. |
| Tarjetas dentro de tarjetas | Crea profundidad artificial. | Una superficie; límites adicionales sólo si tienen función. |
| Radios grandes por defecto | Da apariencia de kit genérico y uniforma componentes distintos. | Radio pequeño existente o esquinas rectas; cambiar por una razón funcional. |
| Gradientes decorativos en botones o paneles | Añaden énfasis sin significado. | Color plano por rol; gradiente sólo si representa una magnitud o pertenece a una ilustración deliberada. |
| Sombras para que cada bloque flote | Fragmentan la superficie del pizarrón. | Separación espacial; sombra sólo para superposiciones relevantes. |
| Grillas repetidas de tarjetas | Fuerzan contenidos distintos a tener el mismo peso. | Composición según la tarea. |
| Badges y mayúsculas como adorno | Añaden ruido y tono SaaS. | Texto normal y jerarquía tipográfica. |
| Varios acentos para destacar todo | Borra los roles de color. | Paleta semántica y jerarquía por posición. |
| Doodles intercambiables | Consumen atención sin orientar ni explicar. | SVG específico, icono funcional o ningún dibujo. |
| Movimiento sobre información precisa | Puede sugerir error o entorpecer lectura. | Animación breve y causal, geometría exacta. |
| Componentes inflados | Ocultan lo que se necesita para aprender. | Dimensiones dictadas por contenido y uso táctil. |
| Alaska hablando constantemente | Interrumpe recuperación, lectura y autonomía. | Intervención contextual y breve. |
| Efectos visuales que revelan una respuesta | Destruyen la función de una actividad de recuperación. | Separar el estado de predicción del de revelación. |
| Animaciones de castigo por ausencia | Introducen culpa y obligación. | Mundo estable y progreso recuperable. |
| Temporizador obligatorio en tareas conceptuales | Mide velocidad más que razonamiento. | Tiempo opcional o reservado a actividades específicas. |
| Feedback genérico de correcto/incorrecto | No ayuda a reparar el razonamiento. | Diagnóstico sustentado y siguiente paso. |

---

## 11. Criterios por componente

### Navegación
- Indicar ubicación y estado activo.
- Mantener acciones disponibles con teclado.
- No convertir cada destino en tarjeta si un enlace normal es más claro.

### Explicaciones
- Mantener las notas cerca del objeto que explican.
- Diferenciar definición, ejemplo, advertencia y consecuencia.
- No usar texto decorativo manuscrito para párrafos extensos.

### Gráficos
- Respetar escala, ejes, dominio, puntos abiertos/cerrados y discontinuidades.
- Distinguir controles manipulables de resultados calculados.
- Incluir labels o alternativas accesibles.
- No sacrificar exactitud para hacer el dibujo más ornamental.

### Ejercicios
- Mantener el enunciado visible junto al input.
- Mostrar ayudas bajo demanda y por etapas.
- Conservar respuestas del estudiante al cambiar de estado cuando corresponda.
- Dar feedback en relación con el paso o concepto afectado.

### Tablas
- Usarlas cuando comparaciones por fila y columna aporten estructura.
- Mantener encabezados y alineación.
- Contener scroll horizontal en la tabla o región, no en el documento completo.

### Visual Novel
- No tapar el área activa del widget.
- Permitir minimizar y recuperar el diálogo.
- No usar sonido como único feedback.
- Mantener el texto legible y el ritmo controlable.

---

## 12. Lista de revisión para agentes

Antes de dar por terminado un cambio visual o de interacción:

### Propósito
- [ ] ¿La interfaz facilita una tarea concreta?
- [ ] ¿Está claro qué debe observar, manipular, predecir o justificar el estudiante?
- [ ] ¿La decisión corresponde a la arquitectura pedagógica?

### Jerarquía
- [ ] ¿Hay un foco principal?
- [ ] ¿La explicación está próxima al gráfico o control al que se refiere?
- [ ] ¿Cada borde, superficie, color, icono o animación cumple una función?

### Matemática
- [ ] ¿Las relaciones y escalas son exactas?
- [ ] ¿Se conservan dominios, signos, extremos y condiciones?
- [ ] ¿La UI diferencia valor ingresado y valor calculado?

### Interacción y accesibilidad
- [ ] ¿Funciona con teclado y touch?
- [ ] ¿El foco es visible?
- [ ] ¿La información no depende sólo del color, hover o sonido?
- [ ] ¿Se respeta movimiento reducido?
- [ ] ¿Se mantiene legible en móvil y escritorio?

### Narrativa
- [ ] ¿Alaska interviene cuando aporta valor?
- [ ] ¿El feedback se dirige al procedimiento y no a la persona?
- [ ] ¿La función puede utilizarse sin abrir el diálogo?
- [ ] ¿No hay castigos por ausencia ni presión artificial?

### Ingeniería y documentación
- [ ] ¿Se reutilizaron tokens y patrones existentes?
- [ ] ¿Se revisaron efectos globales?
- [ ] ¿Se añadieron pruebas pertinentes?
- [ ] ¿Se actualizó la documentación cuyo contrato cambió?
- [ ] ¿Se informó lo que se probó y lo que quedó pendiente?

---

## 13. Cómo decidir una excepción

Antes de añadir un tratamiento visual, responder:

1. ¿Qué tarea o significado concreto hace más fácil percibir?
2. ¿Se entiende sin ese borde, color, icono, sombra o animación?
3. ¿El espacio, la tipografía, el orden o una etiqueta ya resuelven la misma necesidad?
4. ¿Respeta los roles cromáticos y tipográficos?
5. ¿Conserva legibilidad, teclado, touch y adaptación a móvil?
6. ¿Diferencia realmente esta parte o sólo añade una capa?

Ejemplos:

- **Correcto:** un borde fino en el campo editable de una conversión, porque señala dónde introducir el valor.
- **Correcto:** fichas con borde cuando la metáfora física de pin y hueco necesita hacerse visible.
- **Correcto:** una superficie con gradiente dentro de una ilustración si codifica una magnitud continua y su escala tiene sentido.
- **Incorrecto:** degradar todos los botones de amarillo a rosa sólo para llamar la atención.
- **Correcto:** encerrar brevemente en amarillo una respuesta o resultado importante.
- **Incorrecto:** poner cada número, label y frase en un óvalo, hasta que ningún resultado destaque.

Si dos soluciones cumplen la misma función, elegir la más sencilla, legible y coherente con los patrones del proyecto. Si una excepción afecta un patrón compartido, documentar el motivo y su alcance.

---

## 14. Regla final

La estética del pizarrón, la personalidad de Alaska y la vida del laboratorio deben hacer que estudiar sea una experiencia reconocible y agradable. No deben competir con el contenido ni sustituir el trabajo intelectual.

**La mejor interfaz no es la que más llama la atención: es la que ayuda a ver una relación matemática, formular una hipótesis, comprobarla y, con el tiempo, prescindir de la ayuda.**
