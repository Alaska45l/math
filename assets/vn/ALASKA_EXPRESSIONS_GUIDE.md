# Guía de Dirección de Sprites y Expresiones de Alaska (`js/core/vn.js`)

Este documento define el contrato estricto de uso para los **11 sprites** de **Alaska** en `assets/vn/`. 

**Regla de Oro de Dirección Visual:** La naturalidad de una Visual Novel depende del **contraste y la dosificación**. Si Alaska usa expresiones extremas (`panico`, `eureka`, `enojada`, `sonrojada`) todo el tiempo, el personaje pierde credibilidad, satura al estudiante y arruina el impacto de los momentos clave. El **80% del tiempo en pantalla** debe descansar sobre las poses conversacionales de baja intensidad (`base`, `explicando`, `evaluando`, `feliz`).

---

## 1. Clasificación por Niveles de Frecuencia (Tiers de Uso)

Los 11 sprites se dividen en **4 Niveles de Frecuencia (Tiers)** que todo guion (`vn-scripts.js`) y sistema de reacciones (`createCheckBlock`, `retos.js`, widgets) debe respetar estrictamente:

| Tier | Categoría | Sprites | Presupuesto de Uso |
| :--- | :--- | :--- | :--- |
| **Tier 1** | **Columna Vertebral (Uso Diario)** | `base.webp`, `explicando.webp`, `evaluando.webp` | **70% – 75%** de todas las líneas de diálogo. |
| **Tier 2** | **Feedback Estándar y Personalidad** | `feliz.webp`, `orgullosa.webp`, `sospecha.webp` | **15% – 20%** de las líneas (cierres de idea, 1.er intento, advertencias suaves). |
| **Tier 3** | **Alta Intensidad (Uso Condicionado)** | `colapso.webp`, `enojada.webp`, `eureka.webp` | **Máximo 1 vez** por guion o solo ante condiciones específicas de error/revelación. |
| **Tier 4** | **Eventos Raros / Easter Eggs** | `sonrojada.webp`, `panico.webp` | **< 2%** (Exclusivos para hitos de perfección, rachas impecables o emergencias críticas). |

---

## 2. Catálogo Detallado de los 11 Sprites: Cuándo Usarlos y Cuándo NO

### TIER 1 · Columna Vertebral Didáctica (Uso Constante)

#### 1. `base.webp` (Intelectual / Acomodándose los lentes con boca cerrada)
* **Gesto:** Pose serena acomodándose los lentes con la libreta en mano, boca cerrada.
* **Cuándo usarla:**
  * En el **primer globo** al abrir una explicación teórica o presentar una definición formal.
  * Al entregar la **Pista Nivel 1** en un ejercicio.
  * Como estado de reposo inicial cuando se abre una sección.
* **Cuándo NO usarla:** No dejarla fija durante 4 globos seguidos de explicación hablada (porque tiene la boca cerrada y parece una estatua). Alternar siempre con `explicando.webp`.

#### 2. `explicando.webp` (Didáctica / Dedo índice arriba y boca abierta)
* **Gesto:** Mano derecha levantada con el dedo índice hacia arriba en gesto docente tranquilo, libreta en el brazo izquierdo, boca abierta hablando con calma.
* **Cuándo usarla:**
  * Es el **caballo de batalla** de todos los guiones de teoría (`vn-scripts.js`) y de los botones **`Base desde cero`**.
  * Usar en todos los globos intermedios (pasos 2, 3 y 4 de una explicación) donde Alaska desglosa una propiedad paso a paso, despeja una ecuación o guía al usuario a mirar una parte del gráfico.
  * Al entregar la **Pista Nivel 2 y Nivel 3**.

#### 3. `evaluando.webp` (Tomando café/mate / Observación analítica)
* **Gesto:** Sosteniendo su taza con ambas manos a la altura del mentón, mirada tranquila, aguda y ligeramente juzgadora por encima de la taza.
* **Cuándo usarla:**
  * Cuando Alaska hace una **pausa reflexiva o lanza una pregunta retórica** para que el usuario piense antes del siguiente paso (*«Ahora pensá dos segundos antes de mover el slider: ¿qué le pasa a la distancia si $x$ coincide exactamente con $h$?»*).
  * En introducciones de problemas de análisis o lectura de gráficos (Modo Detective, Aduana de funciones por partes, comparación de fórmulas).
  * Cuando el usuario está a mitad de un ejercicio de múltiples pasos (ej. ya clavó el vértice pero todavía está buscando la pendiente).

---

### TIER 2 · Feedback Estándar y Matices (Uso Moderado)

#### 4. `feliz.webp` (Sonrisa cálida y natural)
* **Gesto:** Pose relajada de frente, sonrisa genuina y cercana.
* **Cuándo usarla:**
  * Para dar la **bienvenida** al laboratorio en la Sección 1 o cerrar la Hoja de Repaso final.
  * Cuando el usuario **resuelve bien un ejercicio después de haber fallado antes** (`failStreak >= 1`): transmite alivio y apoyo genuino tras haber corregido el error.
  * Para invitar amablemente a probar un widget interactivo.

#### 5. `orgullosa.webp` (Smug / Brazos cruzados con suficiencia)
* **Gesto:** Brazos cruzados, barbilla alzada, ojos entornados y sonrisa pícara de *«te lo dije»*.
* **Cuándo usarla:**
  * Cuando el usuario **acierta al primer intento** (`failStreak === 0`) un ejercicio estándar.
  * Cuando Alaska termina de desarmar una «trampa de parcial» en la que suele caer todo el mundo (*«¿Viste qué fácil era sin memorizar la receta de cambiar el signo?»*).
* **Restricción:** No usarla en más de 1 globo por guion teórico para que no parezca arrogante todo el tiempo.

#### 6. `sospecha.webp` (Mirada de Detective / Escéptica)
* **Gesto:** Mano en el mentón, cabeza levemente inclinada mirando con ojos entrecerrados de escepticismo puro.
* **Cuándo usarla (Reemplaza el uso prematuro de `enojada` o `colapso`):**
  * En el **1.er intento fallido (`failStreak === 1`)** cuando el error es sutil o conceptual: en vez de gritarle al alumno en su primer tropiezo, Alaska lo mira con sospecha (*«Mmm... mirá bien el signo que pusiste adentro de las barras. ¿Seguro que en $x = 3$ eso da cero?»*).
  * Cuando `diagnose()` devuelve una advertencia de equivalencia no estándar (`not_standard_but_equivalent` / `unfactored_inner_coeff`): *«A ver... técnicamente tu fórmula da los mismos números, pero me escondiste el primer término simplificando así.»*
  * En los bloques de **Cuidado con** al presentar un caso tramposo (como la tarea de Guillermo, Woo-Jin o Kiran).

---

### TIER 3 · Alta Intensidad (Máximo 1 aparición justificada por situación)

#### 7. `eureka.webp` (¡Ajá! / Entusiasmo científico con destello)
* **Gesto:** Ojos brillantes bien abiertos, sonrisa entusiasta, índice arriba y dos destellos amarillos de inspiración.
* **Cuándo usarla (Con moderación):**
  * **Únicamente en el momento de «Gran Revelación» (clímax conceptual)** donde se conectan dos temas que parecían separados. Ejemplos exactos:
    * Cuando descubre que dividir por $3$ es multiplicar por el inverso $\frac{1}{3}$ y aparece el neutro multiplicativo $r^0 = 1$.
    * Cuando se abre la llave de valor absoluto y se revela que toda «V» son dos rectas lineales pegadas en $x = h$.
    * Cuando se conecta $\sqrt{x^2} = |x|$.
* **Prohibición:** **Prohibido** usar `eureka.webp` como reemplazo de `explicando.webp` en explicaciones comunes o pasos algebraicos rutinarios. Máximo **2 o 3 apariciones en todo un módulo completo**.

#### 8. `colapso.webp` (Agobio intelectual / Mano en la frente con gota)
* **Gesto:** Mano en la frente, ojos cerrados de sufrimiento académico y gota de sudor.
* **Cuándo usarla:**
  * Cuando el usuario presiona el botón **«¡Estoy atorado! Mostrame la solución»**.
  * Cuando en el guion se menciona hacer una locura tediosa a mano (como calcular 99 escalones recursivos de uno en uno) o cuando un alumno comete un clásico «dolor de ojos de corrector de Exactas» (como olvidar los paréntesis en una base negativa `-5^(n-1)` o intercambiar $h$ con $k$).

#### 9. `enojada.webp` (Indignada / Puchero con vena de enojo)
* **Gesto:** Brazos cruzados, mejillas infladas con rubor, ceño fruncido y símbolo rojo de enojo (acompañada por `.vn-shake`).
* **Cuándo usarla:**
  * Cuando el usuario acumula **2 o más errores seguidos en la misma pregunta (`failStreak >= 2`)** demostrando que está tirando números al azar sin leer las pistas.
  * Cuando el usuario comete una **ilegalidad matemática grave** en un guion (como unir los puntos aislados de una sucesión en $\mathbb{N}$ con una línea continua o decir «pasa restando por magia»).
* **Prohibición:** **Nunca** usar `enojada.webp` en el primer error (`failStreak === 1`) de un ejercicio normal; para el primer error usar siempre `sospecha.webp` o `explicando.webp`.

---

### TIER 4 · Eventos Especiales y Easter Eggs (Uso Ultra Restringido)

#### 10. `sonrojada.webp` (*Tsundere* Avergonzada / Tapándose con la libreta) — **[EASTER EGG]**
* **Gesto:** Cuerpo girado, cubriéndose parte de la cara con la libreta contra el pecho, mejillas muy sonrojadas, desviando la mirada nerviosa.
* **Regla estricta de rareza:** Este sprite es un **premio oculto (Easter Egg)**. Si aparece en cada ejercicio bien hecho, pierde toda la gracia.
* **Únicos 3 momentos donde está permitido activarlo:**
  1. **Sección o Capítulo Perfecto (*Flawless Run*):** Cuando el usuario completa **todas** las preguntas de un bloque `Chequeo` (o todas las secciones de un Capítulo) al **primer intento (`0` fallos acumulados y `0` pistas pedidas)**.
     * *Diálogo ejemplo:* «¿Eh? ¿Resolviste todo el bloque de una sin pedirme ni una pista?... B-bueno, tampoco te agrandes, ¿sí? ¡Solo significa que no explico tan mal como pensaba!»
  2. **Racha Impecable en el Entrenador (`streak === 5`):** Cuando el usuario encadena 5 retos seguidos sin errores en `retos.js`.
  3. **Easter Egg de Interacción:** Si el usuario hace clic 5 veces seguidas sobre el avatar/sprite de Alaska en el HUD.

#### 11. `panico.webp` (Shock / Emergencia de Laboratorio) — **[CRISIS & BOSSES]**
* **Gesto:** Manos en las mejillas, boca abierta en grito de alarma, pupilas contraídas de shock cómico.
* **Regla estricta de rareza:** Prohibido usarla en diálogos teóricos normales o por equivocarse en una cuenta común.
* **Únicos 3 momentos donde está permitido activarla:**
  1. **Paradojas y Catástrofes Matemáticas en Vivo sobre los Simuladores:**
     * Cuando en `editor-tramos.js` (Sección 9 de Valor Absoluto) el usuario clava **dos puntos cerrados ($\bullet$) en la misma frontera $x = c$ a distinta altura**, disparando el láser vertical rosa de colisión que rompe la definición de función.
     * Cuando en `inversa.js` (Funciones) el usuario intenta invertir una recta horizontal con pendiente $m = 0$ (división por cero / recta vertical).
     * Cuando en `razon.js` (Sucesiones) el usuario fuerza el trazado continuo en $\mathbb{R}$ con base negativa $r < 0$, haciendo explotar el punto $n = 1,5$ con $\sqrt{-5} \notin \mathbb{R}$.
     * Cuando en `escalera.js` el usuario apaga la segunda ancla de Fibonacci dejando a la máquina ciega.
  2. **Modo Boss (Emergencia Real):** Cuando el reloj del jefe baja de los últimos segundos críticos o cuando el escudo del laboratorio recibe daño directo.

---

## 3. Reglas de Ritmo y Transición entre Globos (Pacing)

1. **Prohibido el efecto «camaleón»:** En un guion de 5 mensajes (`playScript`), **no cambies el sprite en todos los mensajes** si la emoción no cambió. Está perfecto (y se siente mucho más natural) que dos globos consecutivos mantengan `explicando.webp` mientras desarrolla una idea.
2. **Patrón clásico para un guion de 5 mensajes (`secX-...`):**
   * **Mensaje 1 (`base` o `evaluando`):** Plantea el problema o pregunta inicial.
   * **Mensaje 2 (`explicando`):** Desarma el concepto paso a paso.
   * **Mensaje 3 (`explicando` o `sospecha`):** Señala el punto crítico o la trampa donde todos suelen fallar.
   * **Mensaje 4 (`eureka` —solo si hay gran revelación— o `orgullosa`):** Muestra el puente visual definitivo.
   * **Mensaje 5 (`feliz` o `explicando`):** Invita a probar la herramienta con las manos en el widget.
3. **Configuración en `js/core/vn.js` y `js/core/sound.js`:**
   * Registrar las 11 poses en `VN_POSES`:
     ```js
     export const VN_POSES = {
       base: 'assets/vn/base.webp',
       explicando: 'assets/vn/explicando.webp',
       evaluando: 'assets/vn/evaluando.webp',
       feliz: 'assets/vn/feliz.webp',
       orgullosa: 'assets/vn/orgullosa.webp',
       sospecha: 'assets/vn/sospecha.webp',
       eureka: 'assets/vn/eureka.webp',
       colapso: 'assets/vn/colapso.webp',
       enojada: 'assets/vn/enojada.webp',
       sonrojada: 'assets/vn/sonrojada.webp',
       panico: 'assets/vn/panico.webp'
     };
     ```
   * Etiquetas por defecto (`DEFAULT_TAGS`, **sin emojis**, usando `chalkIcon`):
     * `base`: `'Modo Teoría'` (`icon: 'glasses'`)
     * `explicando`: `'Paso a paso'` (`icon: 'book'`)
     * `evaluando`: `'Analizando...'` (`icon: 'glasses'`)
     * `feliz`: `'¡Bien ahí!'` (`icon: 'smile'`)
     * `orgullosa`: `'Te lo advertí'` (`icon: 'smug'`)
     * `sospecha`: `'Mmm... mirá bien'` (`icon: 'target'`)
     * `eureka`: `'¡Conexión clave!'` (`icon: 'star'`)
     * `colapso`: `'Colapso académico'` (`icon: 'drop'`)
     * `enojada`: `'¡Frená la mano!'` (`icon: 'anger'`)
     * `sonrojada`: `'N-no te agrandes...'` (`icon: 'spark'`)
     * `panico`: `'¡Alerta de Laboratorio!'` (`icon: 'anger'`)
   * **Precarga Inteligente:** Precargar de inmediato el Tier 1 y Tier 2 (`base`, `explicando`, `evaluando`, `feliz`, `orgullosa`, `sospecha`) al iniciar `initVN()`, y precargar el resto en segundo plano (`requestIdleCallback` o `setTimeout(..., 800)`) para no bloquear el primer renderizado.