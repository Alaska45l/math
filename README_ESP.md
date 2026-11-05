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
| Laboratorios interactivos y planos SVG | Implementado en los módulos publicados en el hub |
| Evaluadores algebraicos mediante AST | Implementado en módulos que aceptan fórmulas |
| Diagnósticos de errores conceptuales | Implementado para un catálogo concreto de errores por módulo |
| Tutora Visual Novel, guiones, poses y audio procedural | Implementado |
| Glosario contextual y pizarra de trabajo | Implementado en los módulos que los integran |
| Progreso local por sección | Implementado en determinados módulos |
| Motor central de competencias y dominio | Planificado |
| Repetición espaciada adaptativa | Planificado |
| Selección global de práctica intercalada | Planificado |
| Calibración metacognitiva de confianza | Planificado |
| Atlas longitudinal de errores | Planificado |
| Campamento persistente y autónomo | Exploración futura |
| Jefes como evaluaciones integradoras | Dirección de diseño; motor unificado pendiente |

El estado detallado de implementación y las dependencias entre tareas se mantienen en [ROADMAP.md](ROADMAP.md). La arquitectura pedagógica objetivo, sus fundamentos y las referencias científicas están en [LEARNING_ARCHITECTURE.md](LEARNING_ARCHITECTURE.md).

## Qué ofrece actualmente

El hub presenta siete laboratorios:

| Laboratorio | Entrada | Enfoque |
|---|---|---|
| Desigualdades compuestas | [desigualdades.html](desigualdades.html) | Desigualdades como circuitos en serie y paralelo, inversión de polaridad, intervalos y conjuntos solución. |
| Unidades y análisis dimensional | [unidades.html](unidades.html) | Conversión mediante factores, conectores dimensionales, operaciones equivalentes y neutro multiplicativo. |
| Funciones | [funciones.html](funciones.html) | Unicidad, dominio e imagen, conjuntos de positividad, monotonía, secante y función inversa. |
| Sucesiones | [sucesiones.html](sucesiones.html) | Sucesiones aritméticas y geométricas, reglas recursivas y explícitas, conteo de saltos, signos y límites. |
| Valor absoluto y funciones por partes | [valor-absoluto.html](valor-absoluto.html) | Distancia, vértice, transformaciones, ramas, dominio, imagen, fronteras y unicidad. |
| Potencias y raíces | [potencias-raices.html](potencias-raices.html) | Exponentes, raíces, propiedades, restricciones de dominio y relaciones entre representaciones. |
| Funciones exponenciales | [exponenciales.html](exponenciales.html) | Crecimiento y decaimiento, base, factor inicial, tablas, modelos y asíntotas. |

La página de Unidades conserva además una entrada alternativa en el repositorio: [laboratorio_unidades.html](laboratorio_unidades.html). La navegación principal del hub utiliza actualmente **unidades.html**.

### Principios matemáticos del proyecto

- **Primeros principios antes que trucos:** explicar las transformaciones mediante propiedades y equivalencias, no mediante expresiones como “pasa al otro lado y cambia de signo”.
- **Equivalencia antes que coincidencia textual:** cuando el módulo lo permite, las fórmulas se interpretan mediante árboles sintácticos y se comparan matemáticamente.
- **Diagnóstico antes que una cruz roja:** los errores conocidos deben asociarse a una hipótesis conceptual y a una intervención útil.
- **Manipulación con significado:** mover un objeto debe permitir observar una relación matemática, no ser una animación sin consecuencias.
- **Precisión formal:** gráficos, dominios, fronteras, signos y resultados deben conservar su significado matemático.
- **Retirada gradual de ayudas:** el acompañamiento tiene que conducir a la resolución independiente, no crear dependencia de la interfaz o de Alaska.

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

Alaska es una presencia narrativa que debe intervenir de forma contextual:

- Explica un prerrequisito cuando detecta una laguna.
- Señala qué propiedad o paso necesita revisión.
- Cambia de representación cuando una explicación no alcanza.
- Ofrece pistas graduadas sin revelar inmediatamente la solución.
- Reconoce estrategias matemáticas concretas, no sólo respuestas correctas.
- Se retira cuando el estudiante puede continuar de manera autónoma.

Su personalidad puede ser irónica, expresiva y tsundere. El humor nunca debe convertirse en humillación, presión, culpa o evaluación de la capacidad personal del estudiante.

## Arquitectura técnica

El proyecto utiliza HTML, CSS y módulos JavaScript nativos, sin dependencias de ejecución. No utiliza frameworks de UI, bibliotecas externas de graficación, eval() ni new Function().

La lógica matemática se separa de la representación y de los eventos DOM. En los módulos que lo necesitan, las expresiones se analizan como AST y los validadores trabajan sobre estructuras matemáticas en vez de comparar cadenas.

### Núcleo compartido

| Archivo | Responsabilidad |
|---|---|
| js/core/dom.js | Helpers DOM/SVG, montaje, delegación de eventos y store reactivo. |
| js/core/plot.js | Conversión de coordenadas, planos SVG y arrastre persistente. |
| js/core/math-format.js | Formato matemático y convenciones numéricas es-AR. |
| js/core/vn.js | HUD Visual Novel, diálogo, poses y reacciones de Alaska. |
| js/core/sound.js | Síntesis procedural de sonidos y preferencias de audio. |
| js/core/nav.js | Navegación global, menú curricular y controles compartidos. |
| js/core/glossary.js | Glosario contextual y consulta de términos. |
| js/core/scratchpad.js | Pizarra de trabajo auxiliar. |

### Módulos matemáticos

- **js/modules/circuitos/**: lógica y renderizado de desigualdades compuestas.
- **js/modules/dimensional/**: cálculo y representación de análisis dimensional.
- **js/modules/funciones/**: scanner de unicidad, radiografía, secante e inversa.
- **js/modules/potencias-raices/**: lógica, parser, componentes, retos y widgets.
- **js/modules/sucesiones/**: lógica, parser, diagnóstico, retos, guiones y widgets.
- **js/modules/valor-absoluto/**: lógica, parser, diagnóstico, retos, guiones y widgets.
- **js/modules/exponenciales/**: lecciones, componentes, parser, retos y widgets.

No todos los módulos comparten aún el mismo modelo de lección, persistencia o chequeo. La futura arquitectura adaptativa deberá integrarse progresivamente, sin forzar una migración masiva ni duplicar motores existentes.

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

    node --test tests/sound.test.mjs tests/sucesiones/*.test.mjs tests/valor-absoluto/*.test.mjs

Con el servidor activo, ejecutar las verificaciones Playwright:

    BASE_URL=http://127.0.0.1:8000 node scripts/verify-pages.mjs
    BASE_URL=http://127.0.0.1:8000 node scripts/verify-interactions.mjs

Los scripts verifican aspectos como respuestas HTTP, errores de consola, desbordamiento horizontal, interacción y persistencia de arrastre. Los comandos deben mantenerse sincronizados con los scripts y suites que existan realmente.

## Hojas de estudio imprimibles

Las lecciones de Sucesiones y Valor Absoluto incluyen hojas de repaso con estilos de impresión para retirar controles interactivos y producir material de estudio legible. Consultar cada módulo para conocer el alcance actual de su exportación.
