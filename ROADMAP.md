# ROADMAP · Pizarrón Interactivo & Alaska VN Lab

> **Filosofía del proyecto:** Transformar el estudio de Matemática y Física de nivel universitario (Ingreso Ciencias Exactas / Análisis I) de una experiencia pasiva de «memorizar recetas y llenar casilleros» a un **laboratorio táctil de primeros principios**, guiado por **Alaska** (tutora *tsundere* en motor Visual Novel) y coronado por combates de jefes inspirados en *Undertale*, *Persona* y *Keep Talking and Nobody Explodes*.

---

## Estado Actual del Proyecto (v0.2 — Commit `310feb7`)

| Módulo | Archivo | Estado Pedagógico | Estado UI / Interacción | Deuda Técnica / Pendientes |
| :--- | :--- | :--- | :--- | :--- |
| **Core (DOM, Plot, Math, Sound, VN)** | `js/core/*.js` | Sólido | Íconos de tiza SVG (0 emojis), drags persistentes | Falta soporte de layout *Split-Screen* en Desktop y un `boss-engine.js` a 60 FPS. |
| **1. Desigualdades Compuestas** | `desigualdades.html` | Simulador puro | Bueno, pero sin lección teórica previa ni Alaska VN | Migrar al formato de Lección Lineal + Alaska + Boss *Keep Calculating*. |
| **2. Unidades y Análisis Dimensional** | `unidades.html` | Simulador puro | Muy buen sistema de conectores y neutro $=1$ | Agregar paso intermedio conmutativo, forma física pin/hueco y Alaska VN. |
| **3. Funciones (Unidad 8)** | `funciones.html` | 4 Simuladores en Tabs | Muy completo ($C^+, C^-$, Secante, Inversa) | Unificar con lección teórica guiada por Alaska y Boss estilo *Undertale / Persona*. |
| **4. Sucesiones (Unidad 9)** | `sucesiones.html` | Excelente (Cap. 1 a 4) | Lección lineal + Alaska VN + Sliders corregidos | Pasar de «tubo vertical» a *Split-Workbench* en Desktop; sumar Boss final. |
| **5. Valor Absoluto y Partes (Unidad 10)** | `valor-absoluto.html` | Excelente (Cap. 1 a 4) | Buenos widgets y guiones profundos de Alaska | Reemplazar por completo el Boss `mountBossDeflector` (actualmente muy pobre) y aplicar *Split-Workbench*. |

---
## Fase 0 · Ideas a desarrollar a futuro.

- Una seccion de foro similar al Reddit clasico de hace unos años, donde se puedan subir preguntas con asunto y contenido. El login seria con cuentas usando a un externo como google y la imagen de perfil son pre-cargadas con distintos animales en un arte cute simple.
- Alaska en su forma chibi sentada en un cojin con su laptop, con interacciones randoms de levantarse salir de la pantalla por derecha para hacerse un cafe y que vuelva dejando el cafe a un costado y tomandolo de a momentos. Asi como si es pasado la medianoche que la pantalla sea mas notoria alumbrandole la cara.
- Una simulacion de examen de ingreso real donde simule una hoja A4 con preguntas iguales al examen como se encuentran al final de modulo. Al terminar Alaska lo corregi, da la nota y que puntos a mejorar.
- Mientras Alaska explica un tema, que se posicione la pantalla, ilumine e interaccione con el elemento o widget que hace referencia.
- Aumentar la cantidad de sprites de Alaska.


## Fase 1 · Rediseño Arquitectónico Desktop: El «Split-Workbench» (Widescreen)

**Problema actual:** En monitores de escritorio, las lecciones lineales (`sucesiones.html` y `valor-absoluto.html`) apilan los 5 bloques (`En una frase`, `Cómo se ve`, `Probalo`, `Cuidado con`, `Chequeo`) en una única columna vertical tipo blog. Esto desaprovecha el ancho horizontal del monitor y obliga a hacer scroll hacia arriba y abajo para mirar el gráfico mientras se lee la teoría o se responde el `Chequeo`.

**Solución de Diseño (`css/layout.css` + `css/components.css`):**
1. **Grilla de Doble Panel en Desktop (`@media (min-width: 1120px)`):**
   - Cada `<section class="seq-section">` pasa a ser un contenedor de 2 columnas asimétricas:
     ```text
     +----------------+-----------------------------------+----------------------------------------+
     | Sidebar (Col.) | COLUMNA IZQUIERDA (42% - Scroll)  | COLUMNA DERECHA (58% - Sticky Pizarrón)|
     | [ < ] Capítulos| • Encabezado + Botones de Alaska  | +------------------------------------+ |
     |                | • 1. En una frase                 | |                                    | |
     |  1. Distancia  | • 2. Cómo se ve (Fórmula anotada) | |     SIMULADOR / PLANO CARTESIANO   | |
     |  2. Espejo     | • 4. Cuidado con                  | |     INTERACTIVO EN VIVO (Probalo)  | |
     |  3. Vértice    | • 5. Chequeo (Ejercicios 1, 2, 3) | |     Siempre visible mientras leés  | |
     |                |                                   | |     y mientras resolvés el Chequeo | |
     |                |                                   | +------------------------------------+ |
     +----------------+-----------------------------------+----------------------------------------+
     ```
2. **Sidebar Colapsable (`[ ⇤ Índice ]`):**
   - Permitir plegar el índice lateral en Desktop con un clic o atajo (`[`) para darle el **100% del ancho widescreen (hasta 1440px)** al banco de trabajo de doble columna.
3. **Conmutador de Vista en la TopBar:**
   - Agregar junto a `Pizarrón por lección` un selector de densidad en Desktop: `Vista Laboratorio (Doble Panel)` vs. `Vista Lectura (Columna única)`.

---

## Fase 2 · Motor de Jefes de Verdad (`js/core/boss-engine.js`)

**Regla de diseño:** Prohibido hacer «jefes» que sean formularios con sliders y un botón de enviar (eliminar el actual `mountBossDeflector` de `valor-absoluto/retos.js`). Un Boss debe ser un **escenario de juego real a 60 FPS (`requestAnimationFrame`)** donde el jugador manipula objetos matemáticos directamente sobre el lienzo y Alaska actúa como navegadora/co-piloto con sus sprites integrados en el HUD de combate.

### Arquitectura de `js/core/boss-engine.js`
- **Escenario Modal / Pantalla Completa de Combate:**
  - Barra superior con **Integridad del Laboratorio (HP del Jugador)**, **Escudo del Experimento Descontrolado (HP del Boss)** y **Reloj de Tensión** animado.
  - **Avatar reactivo de Alaska integrado en la cabina** (cambiando de pose en tiempo real según el peligro, sin tapar el área de juego) con globos de diálogo cortos estilo *Persona 5* / *Star Fox*.
  - Bucle `requestAnimationFrame(dt)` con pausa, reinicio y estados `INTRO` → `WAVE_ANNOUNCEMENT` → `ACTIVE_PHASE` → `IMPACT_RESOLUTION` → `VICTORY / GAME_OVER`.

### Diseño de los 5 Jefes por Módulo
1. **Boss 1 (`desigualdades.html`) · *«Keep Calculating and Nobody Explodes»*:**
   - Maleta-bomba con compuertas físicas en **Serie ($\land$)** y **Paralelo ($\lor$)**, bornes que cambian entre hueco ($\circ$) y sólido ($\bullet$) al golpearlos con el mouse, y ficha inversora de polaridad de $180^\circ$ cuando se divide por un número negativo. Alaska lee las condiciones desde el manual manchado de café.
2. **Boss 2 (`unidades.html`) · *«Sobrecarga en la Cafetera Centrífuga»*:**
   - Cinta transportadora de fichas con conectores físicos **Pin Macho (Numerador)** y **Hueco Hembra (Denominador)**. El jugador debe rotarlas y encastrarlas en la tubería antes de que suba la presión para formar escudos verdes del **Neutro Multiplicativo $= 1$**, evitando crear monstruos dimensionales como $\text{min}^2$.
3. **Boss 3 (`funciones.html`) · *«Anomalía Cartesiana (Combate Undertale + Mazos Persona)»*:**
   - **Fase Esquive (*Undertale*):** El jugador mueve un nodo $(x, y)$ dentro de la caja cartesiana. El jefe anuncia: *«¡Descarga en el Conjunto de Negatividad $C^-$!»* o *«¡Láser en la asíntota vertical de $\frac{1}{x - 2}$!»*. Hay 3 segundos para deducir mentalmente la gráfica y correr a la zona segura antes de que se materialice el rayo.
   - **Fase Contraataque (*Persona*):** El jefe levanta un escudo con una función $f(x)$. El jugador elige de su mazo de 4 cartas visuales la curva que es el **reflejo exacto sobre el espejo $y = x$ ($f^{-1}$)** para colapsar el escudo en la identidad.
4. **Boss 4 (`sucesiones.html`) · *«El Enjambre Alternante $(-r)^{n-1}$»*:**
   - El piso continuo desaparece (si pisás entre dos enteros, caés al vacío $\notin \mathbb{N}$). Una plaga geométrica con razón negativa salta alternando signos entre el techo ($C^+$) y el subsuelo ($C^-$); el jugador debe calibrar el teletransportador $(n - 1)$ para interceptar en qué poste exacto va a materializarse.
5. **Boss 5 (`valor-absoluto.html` — Reemplazo total del Deflector actual) · *«El Prisma de Rebote $|\cdot|$»*:**
   - En lugar de sliders y botones, el jugador **mueve directamente con el mouse el vértice $(h, k)$ de un espejo físico en forma de «V»** dentro de la arena cartesiana mientras caen proyectiles/haces de luz en tiempo real, y con la rueda del mouse (o teclas `W/S`) abre o cierra el ángulo de las ramas ($a$) haciendo rebotar físicamente los rayos hacia los núcleos del jefe.

---

## Fase 4 · Expansión a Nuevos Módulos del Ingreso

Siguiendo la plantilla **Split-Workbench + Alaska VN + Boss**:
1. **`cuadraticas.html` (Función Cuadrática y Parábolas):**
   - Las 3 vestimentas de la misma parábola: **Canónica** $a(x - x_v)^2 + y_v$ (conexión directa con $a|x - h| + k$ de Valor Absoluto), **Factorizada** $a(x - x_1)(x - x_2)$ (lectura directa de raíces) y **Polinómica** $ax^2 + bx + c$.
   - El discriminante $\Delta = b^2 - 4ac$ visualizado como la altura del vértice respecto del espejo del suelo (2 raíces reales, 1 raíz doble que rebota, o parábola flotando sin raíces reales).
2. **`sistemas.html` (Sistemas de Ecuaciones Lineales y MRU):**
   - Interpretación geométrica de sistemas $2 \times 2$: rectas que se cruzan en un punto único (SCD), rectas paralelas que jamás se tocan (SI, misma pendiente $m_1 = m_2$ y distinta ordenada) y rectas superpuestas (SCI).
3. **`trigonometria.html` (Círculo Unitario y Ondas):**
   - Del triángulo rectángulo (SOH-CAH-TOA) a la circunferencia trigonométrica de radio $1$, donde $\cos(\theta)$ es la sombra en el piso (Eje X) y $\sin(\theta)$ es la altura en la pared (Eje Y).