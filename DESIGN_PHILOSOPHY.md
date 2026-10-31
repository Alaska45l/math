# Filosofía de diseño

Esta guía define cómo extender la identidad visual del Laboratorio de Matemática. Está dirigida a desarrolladores y agentes que agreguen páginas, ejercicios, gráficos o controles. Describe decisiones respaldadas por el proyecto y establece criterios para las nuevas; no es una orden de rediseñar lo que ya existe.

## Identidad del producto

El proyecto acompaña el estudio de matemática para física y el ingreso a Exactas mediante laboratorios interactivos. Su propósito es ayudar a entender por qué funcionan las ideas, explorar sus consecuencias y reconocer errores de razonamiento; no limitarse a pedir respuestas correctas. Los módulos actuales cubren desigualdades, análisis dimensional, funciones, sucesiones y valor absoluto. El hub los presenta como lugares de exploración, y los simuladores permiten manipular objetos matemáticos para ver cómo cambian.

La experiencia buscada combina tres cualidades:

- **Rigor sin frialdad:** las definiciones, fórmulas, condiciones y resultados deben poder leerse con precisión.
- **Acompañamiento humano:** el tono puede ser cercano y conversacional. Alaska, la tutora del proyecto, aporta una voz y una presencia reconocibles cuando ayuda a explicar o guiar.
- **Exploración tangible:** gráficos, rectas, fichas, circuitos y controles hacen visible el razonamiento. El pizarrón es una metáfora de trabajo, no una obligación de dibujar cada píxel a mano.

La imagen rectora es un **pizarrón usado durante una sesión de estudio**: una superficie común donde conviven explicaciones, marcas, cálculos y diagramas. Debe sentirse cálida y trabajada, pero el contenido y la interacción matemática siguen siendo protagonistas. Evitar tanto la frialdad de un dashboard genérico como una escenografía literal de aula que compita con la lección.

## Niveles de decisión

Para mantener criterio sin convertir las preferencias en prohibiciones automáticas, esta guía distingue tres niveles:

- **Obligatorio:** preservar el significado, la comprensión, la accesibilidad y las convenciones del proyecto. Una excepción visual nunca debe ocultar información o impedir una interacción.
- **Preferido:** usar los patrones existentes y los recursos visuales con moderación. Apartarse de ellos requiere una razón ligada al contenido o a la tarea.
- **Excepción justificada:** un contorno, radio, sombra, color, textura o agrupación se puede usar si cumple una función concreta y esa función no se resuelve con igual claridad de una manera más simple. La excepción debe ser local y coherente con la paleta y la tipografía existentes.

No hay cuotas universales de tarjetas, colores, radios o decoraciones. La pregunta no es si una herramienta visual está permitida, sino si su uso aquí está justificado.

## Principios visuales

### Una superficie, con jerarquía por contenido

Las secciones pertenecen a una superficie visual compartida. El espacio, la alineación, el tamaño, el peso tipográfico y la posición suelen separar mejor las ideas que una sucesión de paneles. Los gráficos pueden ocupar el primer plano; las notas, explicaciones y controles asociados deben quedar próximos a aquello que explican.

Usar un borde o fondo cuando ayude a reconocer una unidad interactiva, delimitar una tabla, contener una zona desplazable, señalar una entrada editable o separar estados que podrían confundirse. No encerrar cada párrafo, etiqueta, valor y botón por defecto. Evitar paneles anidados si el segundo marco no añade una distinción útil.

**Preferir:** una explicación seguida de un diagrama, separada por ritmo y espacio; una tabla con límites discretos que permitan seguir filas y columnas.

**Evitar:** una tarjeta para la sección, otra para cada dato y una tercera alrededor de cada resultado, sin una diferencia funcional entre ellas.

### Tipografía como estructura

El proyecto ya autoalberga Caveat, Kalam y un subconjunto matemático. Mantener esos roles antes de introducir familias nuevas:

- **Caveat (`--font-hand`):** títulos, fórmulas destacadas, valores, rótulos y marcas breves que se benefician de un trazo expresivo.
- **Kalam (`--font-note`):** explicaciones, párrafos, instrucciones y lectura sostenida.
- **`--font-math`:** respaldo para símbolos y glifos matemáticos formales que no cubren las familias manuscritas. No sustituirlo por una fuente del sistema sin comprobar los símbolos afectados.

La diferencia entre familias crea jerarquía, no debe convertirse en una mezcla ornamental. Mantener la escala y los tamaños fluidos de `css/base.css`; dar a los encabezados una progresión clara y dejar que el cuerpo conserve una lectura cómoda. No reducir texto secundario hasta que parezca una nota legal. Limitar el ancho de lectura de los párrafos largos, sin constreñir innecesariamente planos, tablas, expresiones o controles que necesitan espacio.

**Preferir:** Caveat en el título de una sección y Kalam en la explicación que sigue.

**Evitar:** asignar una fuente diferente a cada widget, poner párrafos extensos en una manuscrita de exhibición o usar negritas en casi cada sustantivo.

### Color con significado estable

Partir de los tokens de `css/base.css`, no de valores nuevos dispersos. La paleta actual es verde pizarrón (`--bg: #26352d`), tinta cálida (`--ink: #ece8dc`), tiza gastada (`--muted: #a9b3a6`) y acentos semánticos: amarillo (`--yellow: #e6d38a`), azul (`--blue: #9bbfd9`), rosa (`--pink: #e3a1a1`) y verde (`--green: #aed1a2`). Los roles documentados en la hoja de estilos son la referencia:

| Token | Rol principal |
| --- | --- |
| `--ink` | Texto y estructura matemática principal |
| `--muted` | Guías, referencias y contenido secundario |
| `--yellow` | Resultado, respuesta o elemento que conviene mirar |
| `--blue` | Datos de entrada, condiciones o elementos que manipula la persona |
| `--pink` | Error, cuidado, trampa o diagnóstico negativo |
| `--green` | Acierto, confirmación o neutro multiplicativo cuando corresponde |

El color debe comunicar un rol que se mantenga entre módulos. No colorear todo lo importante: la jerarquía también debe funcionar mediante posición, texto, tamaño y forma. No usar varios acentos a la vez si no hay varias categorías que distinguir. Evitar colores Tailwind o colores nuevos por conveniencia cuando un token existente expresa el significado.

En gráficos, respetar los códigos locales ya establecidos: por ejemplo, en Funciones, azul para entradas y puntos manipulables, amarillo para resultados y raíces, tinta para estructura base, y rosa para errores o casos problemáticos. Antes de asignar un color a una curva nueva, revisar el renderer del módulo para no contradecir una leyenda existente.

### Espacio, dimensiones y separación

El espacio en blanco permite que una superficie se lea como una explicación en curso. Usar una escala coherente de márgenes y separación, con más distancia entre temas que entre elementos de una misma operación. La alineación ayuda a que las ecuaciones, controles y notas se relacionen sin necesitar cajas.

Mantener las dimensiones fluidas y los breakpoints locales ya presentes en `css/layout.css`, `css/components.css` y las hojas de cada módulo. No fijar anchos o alturas sólo para llenar huecos. Si una expresión matemática, riel o tabla requiere ancho mínimo, permitir una adaptación legible —por ejemplo, desplazamiento en su propia región— en lugar de comprimir sus caracteres o toda la página.

### Bordes, radios, sombras y textura

Los bordes no están prohibidos. Se prefieren como señales funcionales: contorno de un campo, límite de una tabla, región de interacción, ficha que debe encastrar o selección activa. En reposo, los elementos de navegación y las opciones de respuesta que funcionan como texto suelen necesitar sólo una marca de estado, no un rectángulo permanente.

Usar los radios pequeños que ya define `--radius` cuando un control los necesita. Reservar radios más marcados para casos donde comuniquen una forma real o una interacción táctil; no aplicar el mismo radio grande a todo. Las sombras y capas elevadas son excepcionales: una sombra puede aclarar una superposición o un objeto flotante, pero no debe fabricar profundidad decorativa sobre cada superficie.

La textura de pizarrón, el grano, los fantasmas de fórmulas y las marcas de borrador son parte del ambiente ya existente. Deben permanecer de baja intensidad y detrás de la lectura. Si una textura, garabato o irregularidad reduce contraste, tapa una entrada o hace que un gráfico parezca impreciso, se atenúa o se elimina en esa zona.

### Diagramas, dibujos y movimiento

Los SVG y gráficos son herramientas de explicación. La mano dibujada puede aparecer en flechas, círculos, subrayados y anotaciones; las relaciones matemáticas deben conservar geometría exacta cuando la precisión importe. No deformar una curva, eje, límite, escala o ficha real para hacerla “más humana”.

Los doodles del hub funcionan porque cada uno alude al laboratorio que representa. Extender ese principio: un dibujo decorativo debe identificar, explicar o orientar. Evitar ilustraciones intercambiables, iconos sin significado o garabatos añadidos sólo para llenar espacio. Los iconos existentes se implementan como SVG de trazo; mantenerlos alineados con el texto, dimensionados por su rol y accesibles con etiqueta o alternativa cuando transmiten información.

El movimiento debe mostrar un cambio, una respuesta o una relación causal —por ejemplo, la curva que cambia al mover un parámetro—. Evitar animar elementos estáticos sin motivo. Respetar `prefers-reduced-motion` y mantener la respuesta a gestos directa, especialmente en los gráficos manipulables.

## Criterios por componente

### Navegación y páginas

La navegación global debe ser coherente en todos los laboratorios, legible en escritorio y móvil y mantener visible qué página está activa. El hub es un índice ilustrado de los cinco laboratorios, no una plantilla de landing SaaS. Las entradas se distinguen por su título, descripción y dibujo pertinente; no necesitan etiquetas genéricas de categoría.

Los módulos pueden adoptar estructuras diferentes si el contenido lo pide: Funciones organiza simuladores en pestañas; Sucesiones y Valor Absoluto presentan lecciones y un índice de secciones; Desigualdades y Unidades priorizan simuladores especializados. No imponer una misma grilla a todas las páginas. En escritorio, el plano puede ser protagonista y permanecer cerca de la explicación cuando el layout lo permite; en móvil, lectura y manipulación deben seguir siendo posibles sin desbordar toda la vista.

### Dirección de escritorio para las lecciones: Split-Workbench

El `ROADMAP.md` establece una dirección pendiente para **Sucesiones y Valor Absoluto**: dejar de apilar toda la lección como una columna tipo blog en monitores amplios y pasar a un **Split-Workbench**. En escritorio, cada sección debe organizar la explicación y el ejercicio en una columna de lectura, con el simulador o plano interactivo persistente y visible en una segunda columna. La proporción propuesta es asimétrica (aproximadamente 42/58), para que el gráfico sea el espacio de trabajo principal sin quitar contexto a las notas. El índice lateral debe poder plegarse para liberar ancho; el roadmap también contempla un cambio entre Vista Laboratorio de doble panel y Vista Lectura de columna única.

Esta arquitectura está **planeada, no implementada actualmente** para las dos lecciones lineales. La hoja de estilos todavía muestra un `seq-layout` de índice lateral más contenido, y los bloques de cada sección continúan en flujo vertical. Por eso, al crear o reorganizar estilos para esas lecciones, no tomar esa pila actual como el destino de escritorio ni añadir dependencias visuales que hagan difícil mover el simulador a una columna persistente. La transición puede ser progresiva y debe conservar el flujo de lectura como alternativa.

El Split-Workbench es específico de las lecciones que combinan explicación por pasos y un simulador asociado. No se debe forzar en el hub, en las pestañas de Funciones ni en los laboratorios de Desigualdades y Unidades si la estructura de su tarea no lo necesita. Funciones ya da protagonismo de escritorio a su plano en los simuladores donde corresponde; sus decisiones se evalúan según esa interacción.

En pantallas estrechas, volver a una composición de una columna: explicación y controles deben preceder o acompañar al gráfico en un orden comprensible, sin intentar comprimir dos columnas de escritorio en ancho móvil. La persistencia del simulador es una ventaja de escritorio, no un requisito que justifique tapar contenido, crear scrolls confusos o reducir el área manipulable.

### Controles e interacción

Los botones, selects, campos, sliders, pestañas y toggles deben conservar semántica, estados visibles y objetivos táctiles cómodos. Un control puede tener contorno aunque el resto de la página no use marcos: ese borde ayuda a reconocer qué se puede accionar. Las pestañas inactivas pueden leerse como palabras; la selección debe quedar clara por subrayado, contraste, grosor u otro estado perceptible, no sólo por el color.

Mostrar foco de teclado con `:focus-visible`, diferenciar estados activo, presionado y deshabilitado, y no depender de hover para comunicar una acción. Los estilos de hover deben quedar limitados a dispositivos que lo soporten. El estado no debe comunicarse exclusivamente mediante el color: combinarlo con texto, forma, trazo, posición o atributos accesibles.

### Formularios y resultados

Mantener etiquetas asociadas a sus campos, instrucciones cerca de la acción y errores junto al control o respuesta afectada. Una respuesta correcta puede encerrarse o resaltarse; una respuesta incorrecta puede tacharse o acompañarse de un diagnóstico. La marca debe apuntar a la parte pertinente y no cubrir el texto. El feedback explica el razonamiento cuando el módulo dispone de él; no convertirlo todo en un badge de “correcto/incorrecto”.

### Tablas, información y estados

Las tablas son apropiadas cuando se comparan valores en filas y columnas; pueden requerir separadores o contorno para conservar la lectura. Los datos y estados deben usar la misma jerarquía cromática que el resto del proyecto. Si hay scroll horizontal, contenerlo en la tabla o riel, no en el documento completo.

Diseñar estados de carga, error, vacío y éxito con palabras claras, una ubicación estable y el acento semántico correspondiente. No reemplazar mensajes por iconos aislados, color solamente o ilustraciones que retrasen la tarea. Si un estado no necesita una superficie aparte, texto y espaciado suelen bastar.

## Accesibilidad y adaptación

La atmósfera no puede reducir legibilidad ni funcionalidad. Conservar contraste suficiente sobre toda la textura de fondo, tamaño de texto cómodo, foco visible, etiquetas accesibles, orden de teclado y alternativas textuales para SVG informativos. Mantener nombres de controles en lenguaje claro y no usar la tipografía manuscrita para sacrificar comprensión de expresiones largas o instrucciones técnicas.

Probar el reflujo con anchuras estrechas, incluida la escala móvil que ya se considera en este proyecto (aproximadamente 360–390 px), y con escritorio amplio. Revisar específicamente fórmulas, tablas, navegación, SVG, botones con textos largos y regiones desplazables. El contenido debe seguir siendo comprensible con movimiento reducido, sin hover y al usar teclado.

## Convenciones de implementación

- El proyecto es estático: HTML, CSS y módulos JavaScript nativos, sin paso de compilación. Extender las convenciones existentes antes de incorporar una dependencia, framework o sistema de componentes.
- Reutilizar tokens globales en `css/base.css`, patrones compartidos en `css/layout.css` y `css/components.css`, y estilos específicos en `css/modules/<módulo>.css`.
- Mantener la lógica matemática separada de su representación: los módulos organizan lógica, componentes/renderers e interacciones. Una decisión visual no debe cambiar el resultado matemático ni interrumpir el estado de un control o arrastre.
- Antes de introducir un estilo global, revisar si afecta SVG inline, gráficos o controles de otras páginas. En particular, reglas generales sobre `svg`, `button` o superficies pueden redimensionar iconos y alterar estados de muchos módulos.
- Seguir el patrón SVG existente y aportar dimensiones y semántica apropiadas. No añadir iconos emoji como sustituto de iconografía del sistema.
- Reutilizar `prefers-reduced-motion`, estilos de foco, breakpoints y estados ya definidos en vez de crear variantes paralelas.

## Antipatrones y alternativas

| Evitar | Por qué perjudica | Preferir |
| --- | --- | --- |
| Una caja para cada bloque de texto o dato | Fragmenta una explicación continua y aplana la jerarquía: todo parece igual de importante. | Espacio, alineación, escala tipográfica y proximidad entre idea y gráfico. |
| Tarjetas dentro de tarjetas | Crea profundidad visual artificial y hace difícil reconocer qué elementos forman una unidad real. | Una sola superficie; añadir un límite adicional sólo cuando diferencie una interacción o agrupación concreta. |
| Radios grandes por defecto | Da apariencia de kit genérico y suaviza de la misma forma componentes con funciones distintas. | Radio pequeño existente o esquinas rectas; cambiarlo cuando la forma comunique algo. |
| Gradientes decorativos en botones o paneles | Añaden énfasis sin significado y compiten con los códigos de color de matemática. | Color plano por rol. Un gradiente sólo si representa una variable o pertenece a una ilustración deliberada. |
| Sombras para que cada bloque “flote” | Convierte la interfaz en capas de tarjetas y contradice la superficie común del pizarrón. | Separación espacial; sombra sólo para una superposición cuya profundidad importe. |
| Grillas repetidas de tarjetas | Fuerzan contenidos distintos a tener el mismo peso y estructura. | Elegir composición según la tarea: flujo, comparación, explicación, índice o gráfico. |
| Badges, chips o mayúsculas como adorno | Añaden ruido y tono SaaS sin aclarar estado o categoría. | Texto normal y jerarquía tipográfica; conservar un chip si filtra, identifica o comunica un estado real. |
| Varios acentos para destacar todo | Borra los roles de color y obliga al usuario a reaprender cada pantalla. | Paleta semántica existente; usar tinta y estructura antes de sumar color. |
| Iconografía o doodles intercambiables | Consume atención sin enseñar ni orientar y vuelve genérica la personalidad. | SVG específico del concepto, icono funcional o ningún dibujo. |
| Movimiento, textura o irregularidad sobre información precisa | Puede sugerir error, entorpecer lectura o afectar interacción. | Mantener la metáfora en anotaciones y superficies; preservar exactos los objetos matemáticos. |
| Componentes inflados para ocupar espacio | Alarga recorridos y oculta lo que se necesita para aprender o practicar. | Dimensiones dictadas por el contenido y el uso táctil; dejar que el espacio sobrante permanezca vacío. |

## Cómo decidir una excepción

Antes de añadir un tratamiento visual, responder estas preguntas:

1. ¿Qué tarea o significado concreto hace más fácil percibir?
2. ¿Se entiende sin ese borde, color, icono, sombra o animación? Si sí, ¿el recurso aporta otra función verificable?
3. ¿El espacio, la tipografía, el orden o una etiqueta ya resuelven la misma necesidad?
4. ¿Respeta los roles cromáticos y tipográficos de los otros laboratorios?
5. ¿Conserva legibilidad, teclado, touch y adaptación a móvil?
6. ¿El tratamiento diferencia realmente esta parte o sólo añade una capa visual?

Ejemplos:

- **Correcto:** un borde fino en el campo editable de una conversión, porque señala dónde introducir el valor; un contorno alrededor de una tabla que ayuda a seguir sus filas; fichas con borde que hacen visible la metáfora física de pin y hueco en Análisis Dimensional.
- **Incorrecto:** aplicar el mismo marco a cada párrafo junto al campo, cada fila de la tabla y la explicación completa; aquí los límites duplican información y generan cajas anidadas.
- **Correcto:** una superficie con gradiente dentro de una ilustración si codifica una magnitud continua y su escala tiene sentido.
- **Incorrecto:** degradar todos los botones de amarillo a rosa sólo para que parezcan más llamativos.
- **Correcto:** encerrar en amarillo una respuesta final o un resultado matemático importante, de manera breve y legible.
- **Incorrecto:** poner cada número, label y frase en un óvalo, hasta que ningún resultado destaque.

Si dos soluciones cumplen la misma función, elegir la más sencilla, legible y coherente con los patrones de este proyecto. Si una excepción resulta necesaria, limitarla al área donde cumple esa función y documentar el motivo cuando afecte un patrón compartido.
