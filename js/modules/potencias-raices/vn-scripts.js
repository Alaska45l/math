const line = (pose, tag, html) => ({ pose, tag, html });
const fraction = (top, bottom) =>
  `<span class="fr"><span class="top">${top}</span><span class="bar" aria-hidden="true"></span><span class="bot">${bottom}</span></span>`;
const eq = (content) => `<span class="eq">${content}</span>`;

export const VN_SCRIPTS = {
  "sec1-mundos": [
    line("feliz", "Dos maneras de quedarse quieta", `¡Bienvenida al sexto laboratorio! Traje café y una pregunta tramposamente simple: si tenés <span class="eq">5</span>, ¿qué número le sumás para que siga siendo cinco? <strong>Cero</strong>, porque <span class="eq">5 + 0 = 5</span>. En el mundo de la suma, cero es el reposo: no cambia el número.`),
    line(
      "sospecha",
      "Cero no sirve para multiplicar",
      `Ahora no te apures a copiar ese cero: <span class="eq">5 · 0 = 0</span>. En una multiplicación, cero no deja intacto al cinco; lo aplasta por completo. ¿Qué número sí lo conserva? <strong>Uno</strong>, porque <span class="eq">5 · 1 = 5</span>. Ese uno es el <em>neutro multiplicativo</em>, el punto de partida de una escala.`,
    ),
    line(
      "explicando",
      "Un contador de sumas",
      `Si partís desde cero y sumás cuatro veces el tres, hacés <span class="eq">0 + 3 + 3 + 3 + 3 = 12</span>. Para ahorrar esa fila larguísima escribimos <span class="eq">3 · 4</span>. El cuatro cuenta cuántas veces sumaste tres; acá todavía estamos contando pasos aditivos, no factores.`,
    ),
    line(
      "pensativa",
      "Un contador de multiplicaciones",
      `En cambio, desde el uno multiplicás cuatro veces por tres: <span class="eq">1 · 3 · 3 · 3 · 3 = 81</span>. Esa repetición se abrevia <span class="eq">3⁴</span>. El cuatro, escrito arriba, cuenta cuántas veces aplicaste la escala tres. Misma palabra «contador», operación distinta; ahí suelen empezar los líos.`,
    ),
    line("eureka", "El misterio de a⁰", `¡Y así se acaba el supuesto decreto <span class="eq">a⁰ = 1</span>! Cero en el exponente significa que, partiendo de uno, multiplicaste <strong>cero veces</strong> por la base. Si no diste ningún paso, seguís en uno. Por eso <span class="eq">3⁰ = 1</span>, mientras que <span class="eq">3 · 0 = 0</span>.`),
    line("evaluando", "Hacé hablar a las cintas", `Mové el contador de las dos cintas por <span class="eq">0, 1, 2</span> y <span class="eq">3</span>. Primero anticipá dónde debería terminar cada viaje; después mirá los arcos. N-no es un examen sorpresa, pero si podés explicar ambos orígenes ya no dependés de una receta.`),
  ],
  "sec2-negativos": [
    line("empatia", "El menos que asusta de más", `Te entiendo: aparece <span class="eq">2⁻³</span> y el reflejo grita «menos ocho» o, peor, «menos seis». Frená un segundo. El signo menos no siempre pega una etiqueta negativa al resultado; muchas veces avisa que debemos deshacer una operación. Vamos a verlo desde el punto de partida, sin conjuros.`),
    line(
      "pensativa",
      "La inversa depende del mundo",
      `En una suma, deshacer «sumar dos» es restar dos: por eso podés caminar hacia la izquierda del cero. En una multiplicación, deshacer «multiplicar por dos» es <strong>dividir por dos</strong>. No son caprichos: buscás la acción que devuelve el neutro, como <span class="eq">2 · ${fraction("1", "2")} = 1</span>.`,
    ),
    line(
      "explicando",
      "Volvé desde el uno",
      `Leé <span class="eq">2⁻¹</span> como «desde uno, dividí una vez por dos»: da <span class="eq">${fraction("1", "2")}</span>. Después <span class="eq">2⁻² = 1 : 2 : 2 = ${fraction("1", "4")}</span> y <span class="eq">2⁻³ = ${fraction("1", "8")}</span>. Cada parada es positiva y queda entre cero y uno; se acerca, pero jamás salta al lado negativo.`,
    ),
    line(
      "lentes-brillo",
      "La escritura que deja agrupar",
      `Escribir <span class="eq">: 2</span> sirve para entender el viaje, pero la división encadenada no se agrupa con libertad. Por eso escribimos cada paso como multiplicación por <span class="eq">${fraction("1", "2")}</span>: <span class="eq">2⁻⁴ = ${fraction("1", "2")}·${fraction("1", "2")}·${fraction("1", "2")}·${fraction("1", "2")} = ${fraction("1", "16")}</span>. Ahora sí podemos acomodar los factores sin cambiar el resultado.`,
    ),
    line("orgullosa", "Una fracción también se invierte", `Con <span class="eq">(${fraction("2", "3")})⁻²</span> no inventás un signo: invertís toda la fracción y repetís la escala. Queda <span class="eq">(${fraction("3", "2")})² = ${fraction("9", "4")}</span>. En general, el inverso de <span class="eq">${fraction("a", "b")}</span> es <span class="eq">${fraction("b", "a")}</span>, porque su producto vuelve a uno.`),
    line("evaluando", "Hacé retroceder la cinta", `Elegí una base y bajá el exponente hasta <span class="eq">−4</span>. Seguí cada división desde el uno y compará la vista intuitiva con la algebraica. Después explicame por qué ninguna parada puede ser negativa; n-no es que esté evaluando tu alma, sólo tu razonamiento.`),
  ],
  "sec3-cancelacion": [
    line("complice", "La tiza y el famoso tachón", `Escena clásica: alguien tacha un tres arriba y otro abajo y anuncia «¡se cancela!». Después aparece un hueco en el numerador y alguien le enchufa un cero. Frená: no desapareció nada; vamos a seguir el rastro de cada factor.`),
    line(
      "pensativa",
      "Emparejá con cuidado",
      `Abrí la fracción: arriba hay cuatro factores 3 y abajo diez. Podemos reagruparla como <span class="eq">${fraction("3", "3")}·${fraction("3", "3")}·${fraction("3", "3")}·${fraction("3", "3")}·${fraction("1", "3⁶")}</span>. Cada pareja es una división real, no una goma de borrar.`,
    ),
    line(
      "explicando",
      "Multiplicar unos no es sumarlos",
      `Como cada <span class="eq">${fraction("3", "3")}</span> vale el <strong>neutro multiplicativo</strong> 1, la cuenta queda <span class="eq">1·1·1·1·${fraction("1", "3⁶")}</span>. Los unos se multiplican: su producto es 1. Si escribís ${fraction("4", "3⁶")}, los sumaste como si todavía estuvieras en el mundo aditivo.`,
    ),
    line(
      "lentes-brillo",
      "La lupa de Exactas",
      `¿Por qué tampoco queda cero arriba? Porque cero jamás fue el valor de <span class="eq">${fraction("3", "3")}</span>. Cada pareja conserva el producto por ser un 1; el único residuo verdadero es <span class="eq">${fraction("1", "3⁶")} = 3⁻⁶</span>. Ésta es la versión que resiste un parcial, sin palabras mágicas.`,
    ),
    line("evaluando", "Emparejá sin borrar", `Tocá las fichas del laboratorio una por una y narrá qué vale cada pareja. Después contraé los cuatro neutros y compará <span class="eq">${fraction("1", "3⁶")}</span> con <span class="eq">3⁻⁶</span>. N-no quiero una respuesta decorativa: quiero que puedas defender por qué no aparece ni cero ni cuatro.`),
  ],
  "sec4-mitad": [
    line("feliz", "La palabra mitad tiene dos trabajos", `Cuando estudiaba por mi cuenta descubrí algo que nadie me había dicho: <span class="eq">${fraction("1", "2")}</span> significa «mitad», sí, pero cambia radicalmente según dónde esté escrita. En <span class="eq">36 · ${fraction("1", "2")}</span> acompaña una multiplicación; en <span class="eq">36<sup>${fraction("1", "2")}</sup></span> vive en el exponente. No le pidas que responda la misma pregunta.`),
    line(
      "explicando",
      "Partir un camino aditivo",
      `En <span class="eq">36 · ${fraction("1", "2")}</span> estamos repartiendo el camino de cero a treinta y seis en dos tramos que <strong>sumados</strong> vuelven a dar treinta y seis. Buscamos <span class="eq">18 + 18 = 36</span>; por eso el resultado es dieciocho. Es mitad de una cantidad aditiva, como partir una barra de chocolate en dos.`,
    ),
    line(
      "pensativa",
      "Dos medios multiplicativos",
      `En <span class="eq">36<sup>${fraction("1", "2")}</sup></span>, la fracción está donde contamos multiplicaciones. Dos medios pasos deben recomponer un paso entero: <span class="eq">${fraction("1", "2")} + ${fraction("1", "2")} = 1</span>. Entonces buscamos un factor que, multiplicado por sí mismo, llegue a <span class="eq">36¹</span>.`,
    ),
    line("eureka", "El factor que faltaba", `¡Frená y mirá esto! El factor buscado cumple <span class="eq">6 · 6 = 36</span>: desde uno viajás <span class="eq">1 → 6 → 36</span>. Por eso <span class="eq">36<sup>${fraction("1", "2")}</sup> = √36 = 6</span>. La raíz cuadrada es mitad del recorrido <strong>multiplicativo</strong>, no el punto medio aditivo dieciocho.`),
    line("explicando", "Tres etapas y una fórmula", `Con <span class="eq">64<sup>${fraction("1", "3")}</sup></span> buscamos tres escalas iguales: <span class="eq">1 → 4 → 16 → 64</span>, así que vale cuatro. En <span class="eq">a<sup>${fraction("m", "n")}</sup></span>, el denominador <span class="eq">n</span> pide la raíz n-ésima y el numerador <span class="eq">m</span> repite luego ese factor.`),
    line("complice", "Adiviná antes de verlo", `Usá el botón de predicción con treinta y seis y dos etapas. Si elegís dieciocho, comprobá que <span class="eq">18 · 18 = 324</span>: se pasa muchísimo. El factor seis, en cambio, clava <span class="eq">6 · 6 = 36</span>. N-no te estoy tendiendo una trampa; quiero que la veas con tus manos.`),
  ],
  "sec5-geometria": [
    line("feliz", "Pintura, baldosas y peceras", `Cuando comprás pintura mirás metros cuadrados; cuando llenás una pecera, metros cúbicos. Arranquemos con un segmento de <span class="eq">4 cm</span>: sumar otro segmento da <span class="eq">8 cm</span>, todavía un hilo en una sola dirección.`),
    line(
      "pensativa",
      "Del cuadrado al cubo",
      `Multiplicar <span class="eq">4 cm · 4 cm</span> no alarga el hilo: barre un lado de cuatro a lo largo de otro perpendicular. Aparecen cuatro filas de cuatro baldosas, una superficie de <span class="eq">16 cm²</span>. Esa unidad cuadrada cuenta las dieciséis piezas.`,
    ),
    line(
      "explicando",
      "La raíz vuelve a la longitud",
      `Al multiplicar por cuarta vez no: al usar un tercer factor <span class="eq">4 cm</span>, apilás cuatro capas de dieciséis baldosas. Así <span class="eq">4·4·4 = 64 cm³</span> construye un cubo de 64 cubitos. La tercera dimensión es altura, no una decoración del exponente.`,
    ),
    line(
      "eureka",
      "La dimensión no es decoración",
      `La raíz pregunta al revés: si te entregan <span class="eq">16 cm²</span>, ¿qué lado lineal produjo ese mosaico? <span class="eq">√16 = 4</span>. Si te entregan <span class="eq">64 cm³</span>, <span class="eq">∛64 = 4</span> devuelve la arista del cubo.`,
    ),
    line("orgullosa", "La pregunta inversa", `Ahora elegí un área y un volumen conocidos en el pizarrón. Construí primero con lado 4 y después colapsá. Si la raíz devuelve 4, explicá qué devuelve: no metros cuadrados ni cúbicos, sino la medida lineal de un lado.`),
    line("complice", "Hacé crecer las tres figuras", `Deslizá un mismo lado y mirá la línea, el mosaico y el cubo crecer juntos. Después elegí un área o volumen y pedile al modelo que lo colapse. Compartir el lado no significa medir lo mismo: una figura cuenta longitud, otra baldosas y otra cubitos.`),
  ],
  "sec6-arbol": [
    line("complice", "Sin calculadora y sin adivinar", `En el examen aparece ⁵√243 o ⁷√128 y la calculadora está guardada. No hace falta tirar números al aire: hoy vamos a desarmar cada cantidad como un set de LEGO hasta llegar a ladrillos primos que podamos repartir con método.`),
    line(
      "pensativa",
      "No adivines la raíz",
      `Un primo es un ladrillo multiplicativo que ya no se puede abrir en enteros más chicos: 2, 3 y 5 lo son. Desarmemos <span class="eq">36 = 2·2·3·3</span>; las hojas del árbol son esos ladrillos, no números elegidos al azar.`,
    ),
    line(
      "explicando",
      "El índice dice cuántas cajas",
      `Sacar una raíz n-ésima invierte una potencia n-ésima: por eso repartimos los ladrillos en n cajas iguales. En <span class="eq">∛64</span>, seis doses se distribuyen dos por caja; cada caja forma 4 y <span class="eq">4·4·4 = 64</span>.`,
    ),
    line(
      "evaluando",
      "Comprobá el reparto",
      `Con <span class="eq">⁵√243</span>, el árbol revela cinco factores 3: una ficha 3 por caja, resultado 3. Con <span class="eq">⁷√128</span>, siete factores 2 hacen lo mismo. La verificación final siempre es repetir el producto de una caja n veces.`,
    ),
    line("lentes-brillo", "La regla que no depende de memoria", `Si una caja queda con una ficha distinta o sobra un primo, no inventes una raíz exacta: ese resto seguirá bajo el radical. Ésta es la razón por la que el árbol sirve con cualquier número, incluso cuando nadie memorizó su raíz.`),
    line("complice", "Construí el árbol", `Elegí una raíz, seguí las ramas hasta las hojas primas y repartilas en canastas. Al final multiplicá el contenido de una caja tantas veces como marque el índice. N-no acepto «me pareció que era 3»: quiero la comprobación.`),
  ],
  "sec7-simplificar": [
    line("complice", "La aduana VIP del radical", `Bienvenida a la Aduana VIP: el molinete de una raíz cuadrada deja cruzar parejas tomadas de la mano; el de una cúbica, tríos. Si alguien queda impar, espera bajo el techo del radical tomando mate. No lo expulses a la fuerza, que Exactas te ve.`),
    line(
      "pensativa",
      "Desarmá 54x⁷",
      `Desarmemos sin saltos: <span class="eq">54 = 2·3·3·3</span>. Una pareja de treses es <span class="eq">3²</span> y el 2·3 restante es 6. Como hay siete x, seis forman <span class="eq">x⁶ = (x³)²</span> y una x queda sola.`,
    ),
    line(
      "explicando",
      "Separá lo que sale",
      `La raíz de los paquetes completos da <span class="eq">√(3²)=3</span> y <span class="eq">√((x³)²)=x³</span> si <span class="eq">x≥0</span>. El 6 y la x sin pareja quedan bajo el techo: <span class="eq">3x³√(6x)</span>. Simplificar es dejar afuera todo paquete completo, no inventar factores.`,
    ),
    line(
      "lentes-brillo",
      "Un detalle de dominio",
      `Y racionalizar tampoco es un hechizo nuevo. En <span class="eq">${fraction("1", "√2")}</span> multiplicás por el neutro disfrazado <span class="eq">${fraction("√2", "√2")}</span>: queda <span class="eq">${fraction("√2", "(√2)²")} = ${fraction("√2", "2")}</span>. La fracción no cambió; sólo despejaste la raíz del denominador.`,
    ),
    line("lentes-brillo", "La pequeña condición que importa", `Con <span class="eq">√(x²)</span> el resultado general es <span class="eq">|x|</span>, porque la raíz principal no devuelve negativos. Sólo podés escribir x cuando el ejercicio asegura <span class="eq">x≥0</span>. Una barra de módulo no es un detalle de imprenta, ¿entendido?`),
    line("complice", "Pasá las fichas por el molinete", `Probá √75 y √(54x⁷), y después racionalizá la fracción del ejemplo en tu hoja. Observá qué paquetes cruzan y qué restos quedan. Finalmente elevá tu resultado para comprobar que reconstruye el radicando original.`),
  ],
  "sec8-choque": [
    line("feliz", "El crimen del patio sin piso", `Vamos con el crimen algebraico más repetido: afirmar que (a+b)² = a²+b². Si ampliás una habitación cuadrada en tu casa, aparecen dos franjas rectangulares donde también falta piso. No las podés borrar de la cuenta sólo porque querías una regla corta.`),
    line(
      "pensativa",
      "Contá las cuatro regiones",
      `Un producto sí respeta la potencia: <span class="eq">(a·b)² = a²·b²</span>, porque todo son factores. Pero un lado <span class="eq">a+b</span> mezcla suma con área: el cuadrado contiene <span class="eq">a²</span>, <span class="eq">b²</span> y dos rectángulos <span class="eq">ab</span>.`,
    ),
    line(
      "enojada",
      "No repartas sobre la suma",
      `¡Me vas a hacer dar un colapso nervioso si repartís esa potencia! Las cuatro piezas suman <span class="eq">a²+ab+ab+b² = a²+2ab+b²</span>. Para restar no memorizás otra fórmula: escribís <span class="eq">a-b=a+(−b)</span>, y los dos rectángulos quedan <span class="eq">−ab</span>.`,
    ),
    line(
      "eureka",
      "La diagonal responde otra pregunta",
      `La raíz tampoco se reparte sobre una suma. Con catetos 3 y 4, la hipotenusa cumple <span class="eq">√(3²+4²)=√25=5</span>; el camino por dos lados mide <span class="eq">3+4=7</span>. Son preguntas geométricas distintas.`,
    ),
    line("orgullosa", "Una resta sin fórmula extra", `Probá el modo <span class="eq">[a+(−b)]²</span>. Vas a ver por qué el cuadrado de −b vuelve positivo y por qué los dos rectángulos cambian de signo. La fórmula de la resta sale del mismo mosaico, no de una lista distinta.`),
    line("complice", "Apagá las franjas a propósito", `Activá el error de distributiva y mirá las dos franjas rayadas; después cambiá al triángulo y compará 7 con 5. Este mosaico vuelve cuando abramos polinomios y cuadráticas, así que más te vale hacerlo hablar.`),
  ],
  "sec9-espejo-real": [
    line("empatia", "Dos máquinas con orden distinto", `¿Te acordás del laboratorio de Valor Absoluto? Estas dos expresiones parecen gemelas, pero sus tuberías están conectadas al revés: una eleva y después extrae raíz; la otra intenta extraer raíz antes de elevar. Si x es negativo, ese primer paso cambia todo.`),
    line(
      "pensativa",
      "Primero elevar, después extraer",
      `Primero mirá el producto prohibido de separar: <span class="eq">√[(-1)(-4)] = √4 = 2</span>. Si lo distribuís, fabricás <span class="eq">√(-1)·√(-4)</span>, pero ninguna de esas raíces pares existe en ℝ. El producto interior sí tiene permiso; las dos raíces nuevas no.`,
    ),
    line(
      "panico",
      "La otra tubería se traba",
      `Ahora las dos tuberías: en <span class="eq">√(x²)</span>, el cuadrado vuelve no negativo a cualquier x y la raíz principal devuelve <span class="eq">|x|</span>. Con x = −4, pasa por 16 y termina en 4, no en −4.`,
    ),
    line(
      "evaluando",
      "Probá los dos caminos",
      `En <span class="eq">(√x)²</span>, en cambio, la primera operación es √x. Si x = −4, la tubería se bloquea antes de elevar nada. Una operación posterior no puede rescatar una expresión que ya no existía en los reales.`,
    ),
    line("lentes-brillo", "Mismo símbolo, dominio distinto", `Para x ≥ 0 ambas tuberías terminan en x, pero esa coincidencia no las vuelve iguales. Una está definida para todo real; la otra sólo a la derecha del cero. El dominio forma parte de la expresión, aunque nadie lo subraye.`),
    line("complice", "Deslizá a ambos lados del cero", `Llevá x a −4 y después a +4. Seguí las cajas de cada máquina y preguntate cuál operación ocurre primero. Esa V de |x| vuelve al despejar cuadráticas, donde olvidar el dominio puede hacerte perder soluciones.`),
  ],
  "sec10-paradojas": [
    line("empatia", "Una servilleta sospechosa", `Imaginate que, repasando con un compañero antes del parcial, alguien dibuja una cadena y asegura haber demostrado que <span class="eq">−2=2</span>. No te rías todavía, detective: sigamos cada igualdad y encontremos el paso que no tiene permiso.`),
    line(
      "pensativa",
      "Detective de la igualdad falsa",
      `La cadena empieza bien: <span class="eq">(−2)^1=(−2)^(2/2)</span>. El problema aparece cuando se reagrupa como si potencia de potencia siempre pudiera usarse con una base negativa y una fracción de denominador par. Tocá cada igualdad: una de ellas introduce una raíz sin permiso.`,
    ),
    line(
      "colapso",
      "No reagrupes fuera del dominio",
      `Si invertís ese orden, aparece <span class="eq">[(−2)^(1/2)]² = (√−2)²</span>. Pero √−2 no pertenece a ℝ, así que el paso hacia <span class="eq">[(−2)²]^(1/2)</span> cambió el dominio. La igualdad no falla al multiplicar: falla antes, al pedir algo inexistente.`,
    ),
    line(
      "explicando",
      "La raíz impar conserva negativos",
      `Los paréntesis también son quirúrgicos: <span class="eq">−4²=−(4²)=−16</span>, pero <span class="eq">(−4)²=+16</span>. En <span class="eq">∛(−4³)</span> el cubo afecta al 4 y la raíz cúbica sí admite negativos: <span class="eq">∛[(−1)·4³]=−4</span>.`,
    ),
    line("lentes-brillo", "El permiso de cada paso", `Una raíz de índice par no admite negativos reales; una raíz cúbica sí. Por eso nunca «tachamos» índice y exponente antes de revisar base, paréntesis e índice. La condición de existencia es parte de cada regla.`),
    line("complice", "Auditá los signos iguales", `Tocá las igualdades del inspector, encontrá la fraudulenta y después alterná entre índice par e impar. Si podés decir qué operación existe en cada paso y cuál no, la servilleta deja de tener poderes mágicos.`),
  ],

  "sec1-base": [
    line(
      "empatia",
      "Arrancamos sin vergüenza",
      `Tranquila, nadie nace sabiendo qué quiere decir «neutro». Imaginá que tenés siete monedas: agregar cero monedas deja siete. El cero es el elemento que no altera una suma. Si esa palabra nunca te cerró, frenamos acá todo lo que haga falta.`,
    ),
    line(
      "explicando",
      "La escala necesita otro origen",
      `Ahora pensá en una receta que rinde cinco porciones. Multiplicarla por uno conserva cinco; multiplicarla por cero borra todas las porciones. Por eso uno es el neutro multiplicativo y cero no puede cumplir ese papel.`,
    ),
    line(
      "pensativa",
      "¿Qué cuenta el numerito?",
      `Un contador dice cuántas veces repetís una acción. Tres saltos de cuatro son cuatro más cuatro más cuatro, que abreviamos como <span class="eq">4 · 3</span>. Tres cambios de escala por cuatro son <span class="eq">4 · 4 · 4 = 4³</span>. No uses el mismo contador para ambos mundos.`,
    ),
    line(
      "explicando",
      "Cero pasos conserva el punto",
      `Si todavía no caminaste, seguís en el origen. En la suma el origen es cero; en la multiplicación es uno. Así entendemos <span class="eq">a⁰ = 1</span>: no aplicaste ningún cambio multiplicativo, por lo que la escala quedó como estaba.`,
    ),
    line("complice", "Probalo con cinco", `Elegí el cinco y ensayá las dos preguntas: <span class="eq">5 + 0</span> conserva cinco, pero <span class="eq">5 · 0</span> lo destruye. Después verificá <span class="eq">5 · 1</span>. Esa comparación chiquita te dice cuál neutro podés usar sin memorizar una lista.`),
  ],
  "sec2-base": [
    line(
      "empatia",
      "Una división no cambia el signo",
      `Nadie nace sabiendo por qué dividir por una fracción equivale a multiplicar por la dada vuelta. Empecemos con repartir una pizza en dos porciones: cada parte es positiva y más pequeña que el total. Una división reparte; no cruza el cero.`,
    ),
    line(
      "explicando",
      "El inverso hace una pareja",
      `El inverso multiplicativo de dos es un medio porque <span class="eq">2 · ${fraction("1", "2")} = 1</span>. El uno es la escala completa de referencia. Multiplicar por ese medio deshace el cambio de escala de dos.`,
    ),
    line(
      "pensativa",
      "Retrocedé varios pasos",
      `Desde uno, dividir por dos da un medio; volver a dividir por dos da un cuarto. Seguís entre cero y uno. Cuatro divisiones producen <span class="eq">${fraction("1", "16")}</span>. Un número positivo dividido por otro positivo sigue positivo, aunque se haga muy chico.`,
    ),
    line(
      "explicando",
      "La escritura algebraica",
      `Para no escribir divisiones encadenadas, reemplazamos cada «dividido por dos» por «multiplicado por un medio». Así <span class="eq">2⁻⁴ = ${fraction("1", "2⁴")} = ${fraction("1", "16")}</span>. Dividimos desde el uno para entenderlo; multiplicamos inversos para agruparlo.`,
    ),
    line("evaluando", "Chequeá el sentido", `Probá multiplicar <span class="eq">2</span> por <span class="eq">${fraction("1", "2")}</span>: volvés a uno. Ahora repetí el medio varias veces y mirá que el resultado sigue positivo. Ésa es la prueba concreta de que el menos del exponente no cambió ningún signo.`),
  ],
  "sec3-base": [
    line(
      "empatia",
      "Las fracciones son cocientes",
      `Si una caja trae cuatro galletitas y repartís cuatro entre cuatro personas, cada persona recibe una. El cociente <span class="eq">${fraction("4", "4")} = 1</span> no borra las galletitas: describe que el numerador y el denominador tienen el mismo tamaño.`,
    ),
    line(
      "explicando",
      "Emparejá factores iguales",
      `La fracción <span class="eq">${fraction("a", "a")}</span>, con a distinto de cero, pregunta cuántas veces cabe a dentro de a. Cabe una vez. Por eso cada factor igual de arriba y abajo forma un uno, que es el neutro de la multiplicación.`,
    ),
    line(
      "pensativa",
      "Contar no es multiplicar",
      `Cuatro unos sumados dan cuatro, pero cuatro unos multiplicados siguen dando uno: <span class="eq">1 · 1 · 1 · 1 = 1</span>. En el cociente de potencias, esas fichas se estaban multiplicando. Sumarlas para obtener cuatro sería cambiar la operación en medio del ejercicio.`,
    ),
    line(
      "explicando",
      "Lo que queda sí importa",
      `En <span class="eq">3⁴/3¹⁰</span> emparejamos cuatro treses y quedan seis abajo: <span class="eq">1 · 1 · 1 · 1 · ${fraction("1", "3⁶")} = ${fraction("1", "3⁶")}</span>. El cero no aparece, y el residuo no desaparece. Ahora podés explicar por qué sin decir «se cancela».`,
    ),
    line("complice", "Hacé una pareja", `Tomá una ficha de arriba y una de abajo en el laboratorio. No las borres: escribí lo que valen juntas, <span class="eq">${fraction("a", "a")} = 1</span>. Cuando puedas narrar qué quedó después de cada pareja, la regla de restar exponentes deja de ser un truco.`),
  ],
  "sec4-base": [
    line(
      "empatia",
      "¿Qué significa partir por la mitad?",
      `Si tenés treinta y seis figuritas y armás dos pilas iguales, cada pila tiene dieciocho. Eso es la mitad aditiva: <span class="eq">18 + 18 = 36</span>. Repartiste una cantidad en dos partes que se suman para recuperar el total.`,
    ),
    line(
      "explicando",
      "Partir una escala es distinto",
      `Ahora buscá un cambio que, aplicado dos veces, llegue a treinta y seis. El factor seis funciona: <span class="eq">1 · 6 · 6 = 36</span>. Esa raíz cuadrada no da la mitad de treinta y seis; busca el mismo factor repetido.`,
    ),
    line(
      "pensativa",
      "Mirá dónde aparece la fracción",
      `En <span class="eq">36 · ${fraction("1", "2")}</span>, la fracción multiplica al número y divide el tramo aditivo. En <span class="eq">36<sup>${fraction("1", "2")}</sup></span>, aparece en el exponente y divide el recorrido multiplicativo en dos etapas.`,
    ),
    line(
      "explicando",
      "El índice arma estaciones",
      `Para la raíz cúbica de sesenta y cuatro buscamos tres escalas iguales: <span class="eq">1 → 4 → 16 → 64</span>. El índice tres cuenta las etapas. Si luego el numerador fuera dos, repetiríamos ese factor dos veces y llegaríamos a dieciséis.`,
    ),
    line("complice", "No confundas los dos dieciochos", `Poné treinta y seis en los dos carriles. El dieciocho sirve porque <span class="eq">18 + 18 = 36</span>; el seis sirve porque <span class="eq">6 · 6 = 36</span>. Elegí según la operación que estás repitiendo, no según cuál de los dos números te parezca más familiar.`),
  ],
  "sec5-base": [
    line(
      "empatia",
      "Una dimensión es una dirección",
      `Una línea tiene largo y se mide, por ejemplo, en centímetros. No necesitás imaginar nada más para empezar: una regla sobre la mesa ya muestra una dimensión. Cada rayita representa una unidad de longitud.`,
    ),
    line(
      "explicando",
      "Las baldosas cuentan área",
      `Si repetís ese largo perpendicularmente y cubrís una mesa, armás un cuadrado. Un lado por otro cuenta baldosas, por eso el área se expresa en centímetros cuadrados. Con lado seis hay seis filas de seis: treinta y seis baldosas.`,
    ),
    line(
      "pensativa",
      "Los cubitos agregan altura",
      `Apilá varias capas del mismo cuadrado y aparece el volumen. La longitud, el ancho y la altura multiplicados cuentan cubitos: <span class="eq">L · L · L = L³</span>. Cada unidad cambia porque cambió el objeto medido.`,
    ),
    line(
      "explicando",
      "La raíz devuelve una arista",
      `Si te dan un área, la raíz cuadrada pregunta qué lado produjo ese mosaico; si te dan volumen, la raíz cúbica pregunta qué arista produjo esos cubitos. La geometría le pone una pregunta concreta a la raíz, sin pedirte que adivines.`,
    ),
    line("complice", "Construí y colapsá", `Mové el lado del modelo y contá unidades, baldosas y cubitos. Después elegí un área o volumen conocido para colapsarlo. Si la raíz devuelve seis desde treinta y seis, no devolvió «metros cuadrados»: devolvió el lado que los había construido.`),
  ],
  "sec6-base": [
    line(
      "empatia",
      "Primero: primo o compuesto",
      `Un número primo, como dos, tres o cinco, no se desarma en factores enteros más chicos. Un número compuesto, como doce, sí: <span class="eq">12 = 2 · 2 · 3</span>. Es como abrir una caja y separar los ladrillos que trae.`,
    ),
    line(
      "explicando",
      "Construí el árbol despacio",
      `Probá dividir doce por dos: da seis. Seis todavía es compuesto, así que se divide por dos y da tres. Dos y tres ya son primos. El árbol termina cuando cada rama llega a un ladrillo que no puede abrirse más.`,
    ),
    line(
      "pensativa",
      "El índice indica las cajas",
      `Para una raíz cuadrada, prepará dos cajas; para una cúbica, tres. Repartí factores idénticos por igual. En <span class="eq">36 = 2·2·3·3</span>, las dos cajas reciben un dos y un tres, así que cada una vale seis.`,
    ),
    line(
      "explicando",
      "Comprobá multiplicando de vuelta",
      `La caja debe reconstruir el número cuando la repetís tantas veces como marca el índice. Si cada caja vale cuatro y hay tres cajas, <span class="eq">4 · 4 · 4 = 64</span>. Esa multiplicación de regreso comprueba que la raíz está bien.`,
    ),
    line("evaluando", "Un reparto justo", `Antes de declarar una raíz exacta, revisá que ninguna caja tenga una ficha extra. Dos cajas con productos distintos no prueban nada. El árbol te ayuda a ver los ladrillos, y la multiplicación final te permite controlar el reparto sin depender de memoria.`),
  ],
  "sec7-base": [
    line(
      "empatia",
      "Una raíz es una aduana",
      `Imaginá que cada factor primo es una ficha que quiere cruzar una puerta. La raíz cuadrada deja salir fichas de a pares; la cúbica, de a tríos. Si una ficha queda sola, no completa el tamaño del paquete y permanece adentro.`,
    ),
    line(
      "explicando",
      "Agrupá los números",
      `En <span class="eq">√75</span>, desarmamos setenta y cinco como <span class="eq">5 · 5 · 3</span>. Los dos cincos forman pareja y salen como cinco; el tres no tiene pareja y queda: <span class="eq">5√3</span>. No hace falta tantear la raíz de setenta y cinco.`,
    ),
    line(
      "pensativa",
      "Las variables también se cuentan",
      `En <span class="eq">x⁷</span>, armamos tres parejas de x y sobra una. Cada pareja produce una x fuera del radical, así salen tres; la x solitaria queda adentro. El número de copias, no el nombre de la letra, decide el grupo.`,
    ),
    line(
      "explicando",
      "Revisá los restos",
      `Con índice tres necesitás tríos; con índice dos, parejas. Anotá por separado cuántas fichas salieron y cuáles quedaron. Si el radicando exige x no negativa, escribilo también: simplificar no permite olvidarse del dominio.`,
    ),
    line("complice", "Dejá entrar sólo paquetes completos", `Probá <span class="eq">√12</span>: el dos y el dos cruzan juntos; el tres espera adentro. Después volvé a elevar <span class="eq">2√3</span> al cuadrado para comprobar que recuperás doce. La aduana no inventa factores, solamente reordena paquetes permitidos.`),
  ],
  "sec8-base": [
    line(
      "empatia",
      "Un rectángulo tiene base y altura",
      `El área de una alfombra rectangular se calcula multiplicando el largo por el ancho. Si ambos lados miden tres, el cuadrado tiene área nueve. Esa regla describe una superficie completa, no sólo dos esquinas que elegimos mirar.`,
    ),
    line(
      "explicando",
      "Partí cada lado en dos tramos",
      `Si el lado mide <span class="eq">a + b</span>, marcá dónde termina a y empieza b en cada dirección. Las dos marcas dividen el cuadrado grande en cuatro piezas: dos cuadrados y dos rectángulos.`,
    ),
    line(
      "pensativa",
      "Sumá todas las piezas",
      `Una esquina mide <span class="eq">a²</span>, la otra <span class="eq">b²</span>, y cada costado cruzado mide <span class="eq">ab</span>. Por eso el área total es <span class="eq">a² + ab + ab + b²</span>. Los rectángulos no desaparecen aunque te olvides de dibujarlos.`,
    ),
    line(
      "explicando",
      "De la resta a la suma",
      `Restar b es sumar su opuesto: <span class="eq">a − b = a + (−b)</span>. Al expandir, los dos rectángulos quedan negativos y el cuadrado del opuesto queda positivo: <span class="eq">a² − 2ab + b²</span>. La misma figura organiza ambos casos.`,
    ),
    line("complice", "Dibujá el hueco", `En el mosaico apagá los dos rectángulos cruzados. El área que falta no es una opinión: se ve como piso sin cubrir. Hacé después el caso con resta y observá que cambian los signos de las franjas, no la existencia de sus dos regiones.`),
  ],
  "sec9-base": [
    line(
      "empatia",
      "Dos negativos hacen un positivo",
      `Pensá en una deuda de cuatro que se revierte cuatro veces hacia el otro lado: el producto de dos signos negativos es positivo. La cuenta concreta <span class="eq">(−4)(−4)=16</span> muestra por qué el cuadrado de un negativo no sigue siendo negativo.`,
    ),
    line(
      "explicando",
      "Qué números al cuadrado llegan a algo",
      `Un número real al cuadrado nunca queda por debajo de cero: positivo por positivo da positivo, y negativo por negativo también. Por eso no existe un real cuyo cuadrado sea menos uno; no hay candidato que pueda producir ese signo.`,
    ),
    line(
      "pensativa",
      "El orden de la máquina importa",
      `En <span class="eq">√(x²)</span>, primero elevamos x y obtenemos algo no negativo; la raíz principal existe. En <span class="eq">(√x)²</span>, primero necesitamos la raíz de x. Si x es negativo, la segunda máquina se traba antes del cuadrado.`,
    ),
    line(
      "explicando",
      "Conectalo con el módulo",
      `Para x igual a menos cuatro, <span class="eq">√((-4)²)=√16=4=|−4|</span>. El módulo mide distancia y nunca da negativa. La expresión <span class="eq">(√−4)²</span> no está definida en los reales: mismo símbolo de raíz, orden distinto.`,
    ),
    line("evaluando", "Seguí el primer paso", `Deslizá el valor hasta menos cuatro y no mires todavía el final. Preguntá cuál máquina hace primero una raíz de negativo. La otra puede seguir porque antes construyó dieciséis. El dominio no se negocia por tener un cuadrado esperando después.`),
  ],
  "sec10-base": [
    line(
      "empatia",
      "Las operaciones tienen prioridad",
      `Cuando en una cuenta aparecen varias operaciones, acordamos un orden para que todos obtengamos lo mismo. Las potencias se calculan antes que un signo menos suelto que esté delante. Los paréntesis indican cuándo querés que ese signo también forme parte de la base.`,
    ),
    line(
      "explicando",
      "El exponente alcanza a su base",
      `En <span class="eq">−4²</span>, primero calculás <span class="eq">4 · 4 = 16</span> y después tomás el opuesto: el resultado es menos dieciséis. El signo no estaba dentro de la potencia; quedó afuera, como una instrucción aparte.`,
    ),
    line(
      "pensativa",
      "Los paréntesis cambian el paquete",
      `En <span class="eq">(−4)²</span>, la base completa es menos cuatro. Entonces multiplicás menos cuatro por menos cuatro y da más dieciséis. Antes de operar, dibujá un círculo alrededor de lo que el exponente realmente toma.`,
    ),
    line(
      "explicando",
      "Revisá cada paso real",
      `Con raíces, también preguntá si la operación existe antes de usar una regla. Una raíz de índice par no admite un número negativo en los reales, pero una cúbica sí. Paréntesis, índice y dominio: esas tres pistas te salvan del atajo tramposo.`,
    ),
    line("complice", "Auditá antes de firmar", `En la cadena de la paradoja tocá cada signo igual y buscá el cambio que exigiría <span class="eq">√(−2)</span>. No alcanza con que el inicio y el final parezcan calculables: una igualdad es válida sólo si cada operación intermedia existe en los reales.`),
  ],
};

export const DIAGNOSE_REACTIONS = {
  additive_instead_of_multiplicative: line(
    "unamused",
    "Contaste sumandos",
    `Te vi: calculaste <span class="eq">2³</span> como seis porque sumaste tres doses. El exponente cuenta factores, así que escribí <span class="eq">2 · 2 · 2 = 8</span>. La suma repetida tiene otro contador; no los mezcles.`,
  ),
  zero_exponent_is_zero: line(
    "sospecha",
    "¿Cero pasos?",
    `Si el exponente es cero, no aplicaste ningún cambio multiplicativo y seguís en el neutro uno. El cero es el origen aditivo; no lo pongas acá por reflejo. Sí, la diferencia vale un punto entero en un examen.`,
  ),
  negative_exponent_is_negative_number: line(
    "colapso",
    "Retroceder no es cambiar el signo",
    `El menos del exponente invierte la escala. Desde uno, dividir varias veces por dos deja una fracción positiva, como <span class="eq">2⁻⁴ = ${fraction("1", "16")}</span>. No transformes en negativo algo que la operación nunca llevó a cruzar el cero.`,
  ),
  canceled_to_zero_or_counted_ones: line(
    "lentes-brillo",
    "¡La lupa detectó el tachón!",
    `Cada par igual forma <span class="eq">${fraction("3", "3")} = 1</span>. Esos unos se multiplican por el residuo: no suman cuatro y tampoco desaparecen como cero. Volvé a escribir el producto y vas a ver qué queda abajo.`,
  ),
  distributed_power_over_sum: line(
    "enojada",
    "¿Y los dos rectángulos?",
    `¡Frená todo! En el cuadrado de lado <span class="eq">a+b</span> faltan dos regiones de área <span class="eq">ab</span>. La potencia no se distribuye sobre la suma: <span class="eq">(a+b)²=a²+2ab+b²</span>. Dibujalo antes de tacharme el término central.`,
  ),
  neg_base_precedence: line(
    "sospecha",
    "Marcá la base primero",
    `En <span class="eq">−4²</span> el exponente toma sólo al cuatro; en <span class="eq">(−4)²</span> toma al número negativo completo. Anotá los paréntesis antes de calcular, aunque la expresión te parezca obvia. Justamente para eso están.`,
  ),
  forgot_abs_in_even_root: line(
    "lentes-brillo",
    "La raíz principal no devuelve negativos",
    `Si x puede ser negativo, <span class="eq">√(x²)=|x|</span>. Con x igual a menos cuatro, el cuadrado da dieciséis y la raíz principal devuelve cuatro. Sacar el exponente sin barras sólo vale si sabés que x ≥ 0.`,
  ),
  illegal_real_root_distribution: line(
    "panico",
    "Alerta: raíz bloqueada en ℝ",
    `El producto de menos uno por menos cuatro sí da cuatro, pero las raíces cuadradas separadas tendrían radicandos negativos. Esas dos operaciones no existen en los reales. Primero comprobá que cada raíz individual tenga permiso para aparecer.`,
  ),
  multiplied_bases_in_same_base_prod: line(
    "colapso",
    "Mantené la base",
    `En <span class="eq">2³ · 2⁴</span> repetís sietes factores dos; no multiplicás las bases para inventar <span class="eq">4⁷</span>. Conservá la base común y sumá contadores. Te lo digo con cariño académico: el otro resultado no sale de ninguna expansión.`,
  ),
  unsimplified_radical: line(
    "evaluando",
    "Todavía queda un grupo entero",
    `Tu expresión puede valer lo mismo, pero todavía guarda una pareja o terna completa bajo el radical. Factorizá lo que quedó adentro y revisá cada primo por separado. No cierres el ejercicio hasta que ningún paquete del tamaño del índice pueda salir.`,
  ),
};

export const STREAK_REACTIONS = {
  firstTry: line(
    "orgullosa",
    "Bien, con fundamento",
    `Correcto y sin tachones mágicos. Guardá el razonamiento, porque el próximo ejercicio va a cambiar los números y mantener la idea. N-no es que me impresione tu respuesta; me impresiona que puedas justificarla.`,
  ),
  recovered: line(
    "feliz",
    "Ahí encontraste el hilo",
    `Te equivocaste, miraste la pista y corregiste el paso. Eso es aprender, no adivinar. Contame cuál fue la diferencia entre tu primer intento y este; así la próxima vez la detectás antes de que yo tenga que señalarla.`,
  ),
  repeatedError: line(
    "enojada",
    "Paremos la receta automática",
    `Ya repetiste el mismo tropiezo. Cerrá el lápiz un instante, identificá el neutro o revisá el dominio y recién después calculá. No voy a dejar que una frase de memoria te haga perder un ejercicio entero, ¿entendido?`,
  ),
  flawlessRun: line(
    "sonrojada",
    "N-no fue suerte",
    `Resolviste toda la racha explicando cada paso. Bueno, admito que estuvo muy bien. No te agrandes; todavía falta el parcial. Pero sí, entendiste la estructura mejor que cuando arrancamos.`,
  ),
  showSolution: line(
    "colapso",
    "Abramos la resolución",
    `Está bien pedir ayuda; no te voy a retar por eso. Vamos a separar las operaciones, marcar el neutro y revisar si cada paso existe en ℝ. Después reconstruimos el resultado desde el principio, así no copiás una cadena como loro.`,
  ),
  solutionAfter: line(
    "empatia",
    "Probemos con calma",
    `Ahora que viste el desarrollo, volvamos al primer símbolo. Decime qué cambia, qué queda igual y por qué la operación siguiente está permitida. Si necesitás otra pasada, la hacemos; nadie aprende radicales por ósmosis.`,
  ),
};
