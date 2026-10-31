# Guía de Dirección de Sprites y Expresiones de Alaska (`js/core/vn.js`)

Este documento define el contrato estricto de dirección actoral para los **17 sprites** de **Alaska** en `assets/vn/`.

**Regla de Oro de Dirección Visual:** La naturalidad de una Visual Novel depende del **contraste, la micro-actuación y la dosificación**. Si Alaska usa expresiones extremas (`panico`, `attack`, `eureka`, `enojada`, `sonrojada`) todo el tiempo, el personaje pierde credibilidad, satura al estudiante y arruina el impacto de los momentos clave. Al menos el **80% del tiempo en pantalla** debe descansar sobre las poses conversacionales y sutiles de **Tier 1** y **Tier 2**.

---

## 1. Clasificación por Niveles de Frecuencia (Tiers de Uso)

Los 17 sprites se dividen en **4 Niveles de Frecuencia (Tiers)** que todo guion (`vn-scripts.js`), glosario interactivo y sistema de reacciones (`createCheckBlock`, `retos.js`, widgets) debe respetar estrictamente:

| Tier | Categoría | Sprites (17 en total) | Presupuesto de Uso |
| :--- | :--- | :--- | :--- |
| **Tier 1** | **Columna Vertebral (Uso Diario y Transiciones)** | `base.webp`, `pensativa.webp`, `explicando.webp`, `evaluando.webp` | **65% – 70%** de todas las líneas de diálogo. |
| **Tier 2** | **Matices Sutiles, Empatía y Feedback Estándar** | `empatia.webp`, `complice.webp`, `feliz.webp`, `orgullosa.webp`, `sospecha.webp` | **20% – 25%** de las líneas (secretos de cátedra, consuelo, 1.er intento). |
| **Tier 3** | **Alta Intensidad e Ironía (Uso Condicionado)** | `unamused.webp`, `lentes-brillo.webp`, `colapso.webp`, `enojada.webp`, `eureka.webp` | **Máximo 1 vez** por guion o ante errores/trampas específicas. |
| **Tier 4** | **Eventos Especiales, Bosses y Easter Eggs** | `sonrojada.webp`, `panico.webp`, `attack.webp` | **< 3%** (Exclusivos para rachas perfectas, paradojas críticas y combates de Jefe). |

---

## 2. Catálogo Detallado de los 17 Sprites: Cuándo Usarlos y Cuándo NO

### TIER 1 · Columna Vertebral Didáctica (El Ritmo Natural de la Clase)

La clave para que Alaska parezca viva en los guiones teóricos es rotar orgánicamente entre estas 4 poses: **escuchar/plantear (`base`) → buscar la idea mirando arriba (`pensativa`) → desarrollar hablando (`explicando`) → tomar un sorbo esperando que el alumno piense (`evaluando`)**.

#### 1. `base.webp` (Intelectual / Acomodándose los lentes con boca cerrada)
* **Gesto:** Pose serena de frente acomodándose los lentes con la libreta en mano y boca cerrada.
* **Cuándo usarla:**
  * En el **primer globo** al abrir una explicación formal o presentar una definición.
  * Al entregar la **Pista Nivel 1** en un ejercicio.
* **Cuándo NO usarla:** Nunca dejarla fija en 3 o más globos seguidos de explicación hablada (tiene la boca cerrada). Alternar enseguida con `pensativa.webp` o `explicando.webp`.

#### 2. `pensativa.webp` (Visualizando en el aire / Buscando la metáfora) — **[TRANSICIÓN ESTRELLA]**
* **Gesto:** Brazo izquierdo cruzado, dedo índice derecho apoyado suavemente en la mejilla, boca apenas entreabierta («hmm...») y **mirada dirigida hacia arriba a un costado**, rompiendo el contacto visual directo con la cámara.
* **Cuándo usarla:**
  * Como **puente natural** antes de introducir una intuición visual o cambiar el enfoque de una explicación (*«Pará, dejame pensar cómo mostrarte esto en el gráfico sin hacer cuentas feas... Miralo así:»*).
  * Cuando Alaska se hace una pregunta en voz alta para guiar el razonamiento del alumno (*«A ver... si adentro de las barras tenemos $x + 3$, ¿qué número tendríamos que meter en $x$ para que esa suma dé cero?»*).
  * Al entregar la **Pista Nivel 2** (cuando te invita a visualizar la geometría del problema).

#### 3. `explicando.webp` (Didáctica / Dedo índice arriba y boca abierta)
* **Gesto:** Mano derecha levantada con el dedo índice hacia arriba en gesto docente tranquilo, libreta en el brazo izquierdo, boca abierta hablando con calma.
* **Cuándo usarla:**
  * Es el **caballo de batalla** para el desarrollo paso a paso en `vn-scripts.js` y en los guiones de **`Base desde cero`**.
  * Usar en los globos centrales donde Alaska desarma una ecuación, aplica la propiedad uniforme o explica cómo leer los ejes.
  * Al entregar la **Pista Nivel 3**.

#### 4. `evaluando.webp` (Tomando café/mate / Observación analítica)
* **Gesto:** Sosteniendo su taza con ambas manos a la altura del mentón, mirada tranquila, aguda y analítica por encima de la taza.
* **Cuándo usarla:**
  * Cuando Alaska hace una **pausa deliberada** después de explicar algo y te pasa la pelota para que interactúes con el widget (*«Probá ahora de arrastrar el vértice hacia la izquierda y fijate qué le pasa al signo adentro de las barras. Yo te espero acá con mi café.»*).
  * En introducciones de modos de inspección (Detective de sucesiones, Aduana de dominios, Escáner vertical).

---

### TIER 2 · Matices Sutiles, Calidez y Feedback Estándar

#### 5. `empatia.webp` (Suspiro comprensivo / Mano en el pecho)
* **Gesto:** Ojos suavemente cerrados, cejas inclinadas con calidez, mano derecha apoyada sobre el pecho y media sonrisa comprensiva.
* **Cuándo usarla:**
  * Cuando valida que un tema, notación o enunciado **es genuinamente confuso o pesado** y le quita culpa al estudiante (*«Tranquila, no sos vos: llamar "ordenada" al eje Y y "abscisa" al eje X marea a cualquiera el primer día»* o cuando critica las traducciones robóticas de los libros).
  * En el arranque de los botones **`Base desde cero: lo que nadie te explica`**, transmitiendo confianza para preguntar lo básico sin vergüenza.
  * Cuando el usuario falla en un problema difícil pero estuvo muy cerca (ej. acertó todo el planteo y pifió en el último paso).

#### 6. `complice.webp` (Guiño y tiza en mano / Secreto de cátedra)
* **Gesto:** Ojo izquierdo guiñado con calidez, sonrisa de costado amigable, mano derecha sosteniendo una tiza blanca como quien comparte un atajo confidencial.
* **Cuándo usarla:**
  * Para revelar **«atajos de supervivencia de Exactas»** y trucos visuales que ahorran media hoja de cuentas (ej. *«Te tiro un secreto de corrector: antes de despejar nada, multiplicá todo el renglón por el denominador para limpiar las fracciones de entrada»*, o *«Para leer $k$ sin comerte ningún amague, enchufá $n = 1$ de cabeza»*).
  * Mucho más cálida y aliada que `orgullosa.webp`: acá Alaska no se burla de vos, sino que te hace cómplice contra el examen.

#### 7. `feliz.webp` (Sonrisa cálida y natural)
* **Gesto:** Pose relajada de frente, mirada luminosa y sonrisa genuina.
* **Cuándo usarla:**
  * Para dar la **bienvenida** al módulo o cerrar positivamente la Hoja de Repaso.
  * Cuando el usuario **resuelve bien un ejercicio después de haber fallado antes (`failStreak >= 1`)**: celebra que hayas entendido y corregido el error.

#### 8. `orgullosa.webp` (Smug / Brazos cruzados con suficiencia)
* **Gesto:** Brazos cruzados sobre el pecho, cabeza ligeramente ladeada, mirada confiada y sonrisa pícara de *«¿viste que tenía razón?»*.
* **Cuándo usarla:**
  * Cuando el usuario **acierta al primer intento (`failStreak === 0`)** un ejercicio individual.
  * Cuando termina de demostrar por qué su método geométrico le gana por goleada a memorizar fórmulas.
* **Restricción:** Máximo 1 globo por guion para no saturar.

#### 9. `sospecha.webp` (Mirada de Detective / Escéptica con mano en el mentón)
* **Gesto:** Mano derecha en el mentón, ojos entrecerrados mirando con escepticismo analítico.
* **Cuándo usarla:**
  * En el **1.er intento fallido (`failStreak === 1`)** ante errores de signos o desfasajes (`inverted_h_sign`, `off_by_one`, `sign_of_step`): en lugar de retar al alumno en su primer error, Alaska arquea la ceja y le hace dudar de su respuesta (*«Mmm... mirá el vértice en el gráfico y mirá el signo que pusiste. ¿No te quedó espejado?»*).
  * Cuando `diagnose()` detecta una fórmula matemáticamente equivalente pero no canónica (`not_standard_but_equivalent`).

---

### TIER 3 · Alta Intensidad, Ironía y Trampas (Uso Condicionado)

#### 10. `unamused.webp` (Sarcasmo / Palma levantada «Frená el carro»)
* **Gesto:** Ojos a media asta con expresión de cansancio infinito (*deadpan*), mano derecha levantada mostrando la palma en señal de *«alto ahí»* y mano izquierda en la cintura.
* **Cuándo usarla:**
  * Cuando el estudiante cae en un **vicio clásico de escuela secundaria** o «receta mágica» contra los primeros principios:
    * Olvidar las barras de valor absoluto (`missing_abs_bars`) escribiendo una recta común.
    * Decir o intentar aplicar «pasa sumando / se tacha por magia» sin respetar la propiedad uniforme o el neutro.
    * Confundir el eje X con el eje Y al escribir intervalos de crecimiento o positividad (`confused_x_and_y_in_intervals`, el famoso error de Guillermo).
* **Diferencia con `enojada.webp`:** `unamused.webp` no grita ni tiembla; es decepción irónica y seca de profesora que ya corrigió 100 parciales iguales.

#### 11. `lentes-brillo.webp` (Modo Jefa de Cátedra / Cristales iluminados)
* **Gesto:** Empujándose el puente de los lentes con el dedo índice; los cristales reflejan una luz blanca opaca estilo anime con una sonrisa calculadora.
* **Cuándo usarla:**
  * Exclusiva para presentar **«Las 5 Trampas Clásicas de Examen»** en `retos.js` y los bloques de **Cuidado con** más picantes (ej. la trampa mortal de simplificar $\sqrt{x^2}$ como $x$ en vez de $|x|$, o la trampa de Woo-Jin y Kiran).
  * Cuando te advierte con frialdad quirúrgica dónde el 90% de los ingresantes pierde el punto en el parcial.

#### 12. `eureka.webp` (¡Ajá! / Entusiasmo científico con destello)
* **Gesto:** Ojos brillantes bien abiertos, sonrisa entusiasta, índice arriba y destellos amarillos.
* **Cuándo usarla (Con moderación estricta):**
  * **Únicamente en el momento de «Gran Revelación» (clímax conceptual)** donde se conectan dos mundos matemáticos (ej. descubrir que toda función de valor absoluto es una función por partes disfrazada, o que $0$ saltos en geométrica es multiplicar por el neutro $r^0 = 1$).
* **Restricción:** Prohibido usarla para explicaciones rutinarias. Máximo **2 veces en todo un laboratorio**.

#### 13. `colapso.webp` (Agobio intelectual / Mano en la frente con gota)
* **Gesto:** Mano en la frente, ojos cerrados de sufrimiento académico y gota de sudor.
* **Cuándo usarla:**
  * Cuando el usuario presiona **«¡Estoy atorado! Mostrame la solución»**.
  * Ante errores de jerarquía o distracción pesada (`neg_pow_precedence`, `swapped_h_k`, `swapped_k_step`, `wrong_anchor_a2`), o cuando explica lo absurdo de calcular 99 escalones recursivos a mano.

#### 14. `enojada.webp` (Indignada / Puchero con vena de enojo)
* **Gesto:** Brazos cruzados, mejillas infladas con rubor, ceño fruncido y símbolo rojo de enojo (acompañada por la animación `.vn-shake`).
* **Cuándo usarla:**
  * Cuando el usuario acumula **2 o más errores seguidos en la misma pregunta (`failStreak >= 2`)** tirando valores al azar sin leer las pistas.
  * Cuando intenta una ilegalidad grave como unir los puntos aislados de una sucesión en $\mathbb{N}$ con una línea continua.

---

### TIER 4 · Eventos Especiales, Crisis y Combates de Jefe (Uso Ultra Restringido)

#### 15. `sonrojada.webp` (*Tsundere* Avergonzada / Tapándose con la libreta) — **[EASTER EGG]**
* **Gesto:** Abrazando la libreta contra el pecho, mejillas muy sonrojadas, mirando hacia un costado nerviosa y tocándose un mechón de pelo.
* **Regla estricta de rareza:** Es un **trofeo oculto (Easter Egg)**. Prohibido usarla en aciertos individuales normales.
* **Únicos 3 disparadores permitidos:**
  1. **Bloque o Capítulo Impecable (*Flawless Run*):** Completar todas las preguntas de un bloque `Chequeo` al **primer intento (`0` fallos y `0` pistas)**.
  2. **Racha de 5 en el Entrenador (`streak === 5`):** Encadenar 5 retos seguidos sin errores en `retos.js`.
  3. **Easter Egg del HUD:** Hacer clic 5 veces seguidas sobre el sprite de Alaska.

#### 16. `panico.webp` (Shock / Emergencia de Laboratorio) — **[CRISIS & PARADOJAS]**
* **Gesto:** Ambas manos en la cabeza sosteniendo la libreta arriba, sombra azul de terror cómico sobre los ojos, pupilas contraídas y grito de alarma.
* **Únicos disparadores permitidos:**
  1. **Rupturas y Paradojas Matemáticas en Vivo sobre los Simuladores:**
     * Clavar **dos puntos cerrados ($\bullet$) en la misma frontera $x = c$** en `editor-tramos.js` (disparando el láser vertical rosa de colisión que destruye la unicidad de función).
     * Intentar invertir una recta horizontal con pendiente $m = 0$ en `inversa.js` (división por cero).
     * Forzar la curva continua en $\mathbb{R}$ con razón negativa $r < 0$ en `razon.js` (haciendo aparecer $\sqrt{-5} \notin \mathbb{R}$).
  2. **Peligro Crítico en un Boss:** Cuando la integridad del laboratorio está en el último punto de vida o quedan menos de 5 segundos en la bomba.

#### 17. `attack.webp` (Modo Comandante / «¡Rompele el Escudo!») — **[EXCLUSIVA DE BOSSES Y DESAFÍOS]**
* **Gesto:** Pose dinámica de acción apuntando con el dedo índice directo hacia adelante (estilo *Ace Attorney / Persona All-Out Attack*), guardapolvo blanco al viento y mirada feroz decidida.
* **Regla estricta de rareza:** Prohibido usarla en secciones teóricas tranquilas.
* **Únicos disparadores permitidos:**
  1. **Inicio y Contraataque en los Modos Boss (`boss-engine.js` / Deflector / Keep Calculating / Undertale / Persona):**
     * Al declarar el inicio del combate contra un jefe o al ejecutar un contraataque exitoso (como reflejar el escudo con $f^{-1}$ o desviar el rayo láser hacia el núcleo).
  2. **Modo «Desafío Inverso» o Cierre de Racha Épica:** Cuando el usuario acepta un desafío cronometrado o resuelve el problema más difícil del módulo.

---

## 3. Contrato Técnico para `js/core/vn.js` y `js/core/sound.js`

### 3.1 Registro de las 17 Poses en `VN_POSES` (`js/core/vn.js`)
```js
export const VN_POSES = {
  // Tier 1: Columna vertebral
  base: 'assets/vn/base.webp',
  pensativa: 'assets/vn/pensativa.webp',
  explicando: 'assets/vn/explicando.webp',
  evaluando: 'assets/vn/evaluando.webp',

  // Tier 2: Matices sutiles y feedback estándar
  empatia: 'assets/vn/empatia.webp',
  complice: 'assets/vn/complice.webp',
  feliz: 'assets/vn/feliz.webp',
  orgullosa: 'assets/vn/orgullosa.webp',
  sospecha: 'assets/vn/sospecha.webp',

  // Tier 3: Alta intensidad e ironía
  unamused: 'assets/vn/unamused.webp',
  'lentes-brillo': 'assets/vn/lentes-brillo.webp',
  eureka: 'assets/vn/eureka.webp',
  colapso: 'assets/vn/colapso.webp',
  enojada: 'assets/vn/enojada.webp',

  // Tier 4: Eventos raros, crisis y Bosses
  sonrojada: 'assets/vn/sonrojada.webp',
  panico: 'assets/vn/panico.webp',
  attack: 'assets/vn/attack.webp'
};

```

### 3.2 Etiquetas por Defecto (`DEFAULT_TAGS`) e Íconos de Tiza (Cero Emojis)

```js
const DEFAULT_TAGS = {
  base:            { text: 'Modo Teoría',            icon: 'glasses' },
  pensativa:       { text: 'Pensando en voz alta...', icon: 'spark' },
  explicando:      { text: 'Paso a paso',            icon: 'book' },
  evaluando:       { text: 'Tu turno de probar',     icon: 'glasses' },
  empatia:         { text: 'Tranquila, paso a paso', icon: 'smile' },
  complice:        { text: 'Secreto de cátedra',     icon: 'star' },
  feliz:           { text: '¡Bien ahí!',             icon: 'smile' },
  orgullosa:       { text: 'Te lo advertí',          icon: 'smug' },
  sospecha:        { text: 'Mmm... mirá bien',       icon: 'target' },
  unamused:        { text: 'Sin recetas mágicas',    icon: 'glasses' },
  'lentes-brillo': { text: 'Trampa de Parcial',      icon: 'glasses' },
  eureka:          { text: '¡Conexión clave!',       icon: 'star' },
  colapso:         { text: 'Colapso académico',      icon: 'drop' },
  enojada:         { text: '¡Frená la mano!',        icon: 'anger' },
  sonrojada:       { text: 'N-no te agrandes...',    icon: 'spark' },
  panico:          { text: '¡Alerta de Laboratorio!', icon: 'anger' },
  attack:          { text: '¡Contraataque!',         icon: 'shield' }
};

```

### 3.3 Animaciones de Entrada y Síntesis de Voz por Pose

* **Animaciones CSS en `.vn-sprite-wrap`:**
* `enojada` y `panico`: aplican `.vn-shake` (sacudida rápida).
* `orgullosa`, `feliz`, `eureka`, `complice` y `attack`: aplican `.vn-pop` (rebote dinámico suave).
* `pensativa`, `empatia`, `evaluando` y `unamused`: transición suave de opacidad/desplazamiento sin sacudidas bruscas.


* **Precarga en 2 etapas (`initVN`):**
* **Etapa 1 (Inmediata):** Precargar los 9 sprites de Tier 1 y Tier 2.
* **Etapa 2 (Diferida en `requestIdleCallback`):** Precargar los 8 sprites de Tier 3 y Tier 4 para no penalizar el tiempo de carga inicial de la página.
