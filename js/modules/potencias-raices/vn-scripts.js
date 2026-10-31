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
    line("complice", "La tiza y el famoso tachón", `Escena clásica: el profe de secundaria tacha un tres arriba y otro abajo mientras anuncia «¡se cancela!». Después llegás a Exactas, ves huecos en el numerador y alguien completa con un cero. ¡Basta de hacer desaparecer factores! Vamos a seguirles el rastro.`),
    line(
      "pensativa",
      "Emparejá con cuidado",
      `En <span class="eq">${fraction("3⁴", "3¹⁰")}</span> hay cuatro treses arriba. Cada uno encuentra un tres abajo y forma <span class="eq">${fraction("3", "3")} = 1</span>; quedan seis treses en el denominador. No tachamos factores: describimos qué producto quedó después de formar cuatro unos.`,
    ),
    line(
      "explicando",
      "Multiplicar unos no es sumarlos",
      `La cuenta completa queda <span class="eq">1 · 1 · 1 · 1 · ${fraction("1", "3⁶")}</span>. Esos unos se multiplican porque los factores de la fracción también se multiplicaban: el producto sigue siendo <span class="eq">${fraction("1", "3⁶")} = 3⁻⁶</span>. Si los sumás y te da cuatro, cambiaste de mundo.`,
    ),
    line(
      "lentes-brillo",
      "La lupa de Exactas",
      `¿Y por qué no queda cero arriba? Porque cada pareja vale uno. ¿Y por qué no queda cuatro? Porque no escribimos <span class="eq">1 + 1 + 1 + 1</span>, sino su producto. Tocá cada ficha y mirá cómo el pizarrón conserva el residuo sin trucos.`,
    ),
    line("complice", "Emparejá sin borrar", "Tocá cada factor de arriba y abajo. Mirá cómo cada pareja se convierte en una ficha verde × 1; después contraé los unos y leé el residuo. Si explicás por qué nunca aparece cero, ya le ganaste al tachón sin hacer magia."),
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
    line("feliz", "Pintura, baldosas y peceras", `Para pintar una pared, calculás metros cuadrados; para llenar una pecera cúbica, metros cúbicos. Una baldosa agrega superficie en una dirección perpendicular y un cubito agrega una capa. Cada factor lado abre un eje nuevo; la potencia deja de ser una receta y se vuelve espacio.`),
    line(
      "pensativa",
      "Del cuadrado al cubo",
      `Con lado cuatro, hay cuatro filas de cuatro baldosas: <span class="eq">4² = 16</span>. Agregá una tercera dirección y cada capa suma otros dieciséis cubitos; el volumen es <span class="eq">4³ = 64</span>. La potencia muestra cuántas dimensiones multiplicaste.`,
    ),
    line(
      "explicando",
      "La raíz vuelve a la longitud",
      `Si conocés el área treinta y seis, preguntar <span class="eq">√36</span> es preguntar qué lado produjo ese mosaico: seis. Si conocés volumen veintisiete, <span class="eq">∛27 = 3</span> devuelve la arista. La raíz desarma la construcción dimensional.`,
    ),
    line(
      "eureka",
      "La dimensión no es decoración",
      `Arrastrá el valor del lado y mirá cómo se expande el cuadrado o el cubo. Después colapsá el área o volumen hacia una dimensión. Las caras cambian de tamaño junto con el dato; si alguna figura queda fija, algo se rompió en el modelo.`,
    ),
    line("complice", "Hacé crecer las tres figuras", "Deslizá el mismo lado y mirá juntas la línea, el mosaico y el cubo. Después colapsá un área o un volumen. Compará las medidas: comparten un lado, pero cada figura cuenta longitudes, baldosas o cubitos."),
  ],
  "sec6-arbol": [
    line("complice", "Sin calculadora y sin adivinar", `En el examen aparece ⁵√243 o ⁷√128 y la calculadora está guardada. No hace falta tirar números al aire: hoy vamos a desarmar cada cantidad como un set de LEGO hasta llegar a ladrillos primos que podamos repartir con método.`),
    line(
      "pensativa",
      "No adivines la raíz",
      `Desarmemos treinta y seis: <span class="eq">36 = 2 · 2 · 3 · 3</span>. Para una raíz cuadrada necesitamos repartir cada primo en dos cajas iguales: una caja recibe dos y tres, la otra también. El contenido repetido vale seis.`,
    ),
    line(
      "explicando",
      "El índice dice cuántas cajas",
      `Para <span class="eq">∛64</span>, escribí seis doses y armá tres canastas iguales: dos doses por canasta. Cada canasta vale cuatro, y <span class="eq">4 · 4 · 4 = 64</span>. Si una queda distinta, todavía no encontraste una raíz entera exacta.`,
    ),
    line(
      "evaluando",
      "Comprobá el reparto",
      `Elegí otro índice y mirá las hojas del árbol. El resultado de cada caja debe ser el mismo; si sobran primos, quedan bajo la raíz. No hace falta que memorices <span class="eq">⁷√128</span>: repartí sus siete doses, uno por caja, y verificá.`,
    ),
    line("complice", "Construí el árbol", "Elegí una raíz y seguí sus ramas hasta las hojas primas. Después mirá cómo las fichas se reparten en canastas. Te dejo elegir el orden de las piezas; lo único que no negocio es que todas las cajas terminen con el mismo producto."),
  ],
  "sec7-simplificar": [
    line("complice", "La aduana VIP del radical", `Bienvenida a la Aduana VIP: el molinete de una raíz cuadrada deja cruzar parejas tomadas de la mano; el de una cúbica, ternas. Si alguien queda impar, espera bajo el techo del radical tomando mate. No lo expulses a la fuerza, que Exactas te ve.`),
    line(
      "pensativa",
      "Desarmá 54x⁷",
      `Escribimos <span class="eq">54 = 3² · 6</span> y <span class="eq">x⁷ = (x³)² · x</span>. La pareja de tres cruza como tres, y salen tres parejas de x como x al cubo. Los factores seis y x todavía no armaron un cuadrado.`,
    ),
    line(
      "explicando",
      "Separá lo que sale",
      `La expresión queda <span class="eq">3x³√(6x)</span>, suponiendo x no negativa para que la raíz exista. Antes de cerrar, mirá cada primo del resto: si todavía hay un paquete completo escondido, la simplificación no terminó.`,
    ),
    line(
      "lentes-brillo",
      "Un detalle de dominio",
      `Con <span class="eq">√(x²)</span> sale <span class="eq">|x|</span>, no x sin condiciones. Si el ejercicio ya asegura x ≥ 0, las barras se pueden quitar; si no lo asegura, dejalas. Sí, esa pequeña rayita puede decidir el punto en Exactas.`,
    ),
    line("complice", "Pasá las fichas por el molinete", "Elegí raíz cuadrada o cúbica y observá qué fichas se agrupan. Las verdes cruzan juntas; las rosas esperan bajo el techo. Leé los factores de afuera y adentro, y verificá que al elevar de nuevo reconstruyan el radicando."),
  ],
  "sec8-choque": [
    line("feliz", "El crimen del patio sin piso", `Vamos con el crimen algebraico más repetido: afirmar que (a+b)² = a²+b². Si ampliás una habitación cuadrada en tu casa, aparecen dos franjas rectangulares donde también falta piso. No las podés borrar de la cuenta sólo porque querías una regla corta.`),
    line(
      "pensativa",
      "Contá las cuatro regiones",
      `Un cuadrado de lado <span class="eq">a + b</span> contiene una región <span class="eq">a²</span>, otra <span class="eq">b²</span> y dos rectángulos <span class="eq">ab</span>. La fórmula completa suma las cuatro. Si escribís sólo los cuadrados de las esquinas, te comiste los costados.`,
    ),
    line(
      "enojada",
      "No repartas sobre la suma",
      `¡Me vas a hacer dar un colapso nervioso si repartís esa potencia! <span class="eq">(a+b)² = a² + 2ab + b²</span>. Para la resta escribimos <span class="eq">a + (−b)</span>; los dos rectángulos llevan signo negativo. No aparece una distributiva nueva: es la misma geometría.`,
    ),
    line(
      "eureka",
      "La diagonal responde otra pregunta",
      `Con catetos tres y cuatro, el camino por los bordes suma siete, pero la diagonal mide cinco: <span class="eq">√(3² + 4²) = 5</span>. La raíz de una suma de cuadrados mide una hipotenusa, no la suma de los catetos. ¿Ves dónde cambió la pregunta?`,
    ),
    line("complice", "Apagá las franjas a propósito", "Activá el error de distributiva en el mosaico. Las dos franjas se rayan y el hueco aparece delante tuyo; después cambiá al triángulo y compará siete con cinco. Ese dibujo va a volver cuando abramos polinomios y ecuaciones cuadráticas."),
  ],
  "sec9-espejo-real": [
    line("empatia", "Dos máquinas con orden distinto", `¿Te acordás del laboratorio de Valor Absoluto? Estas dos expresiones parecen gemelas, pero sus tuberías están conectadas al revés: una eleva y después extrae raíz; la otra intenta extraer raíz antes de elevar. Si x es negativo, ese primer paso cambia todo.`),
    line(
      "pensativa",
      "Primero elevar, después extraer",
      `En <span class="eq">√(x²)</span>, el cuadrado vuelve no negativo cualquier real y la raíz principal devuelve la distancia al cero: <span class="eq">|x|</span>. Si x es menos cuatro, pasa por dieciséis y termina en cuatro, no en menos cuatro.`,
    ),
    line(
      "panico",
      "La otra tubería se traba",
      `En <span class="eq">(√x)²</span>, la primera operación ya es la raíz. Cuando x vale menos cuatro, la tubería se bloquea antes de elevar nada. Una operación posterior no puede rescatar una expresión que no estaba definida desde el primer paso.`,
    ),
    line(
      "evaluando",
      "Probá los dos caminos",
      `Deslizá x a la izquierda del cero: la máquina de arriba sigue dibujando la V de <span class="eq">|x|</span>; la de abajo queda rosa. No son fórmulas intercambiables. Y sí, lo conectamos con valor absoluto porque en Exactas les encanta preguntar lo mismo con otra ropa.`,
    ),
    line("complice", "Deslizá a ambos lados del cero", "Llevá x de un lado al otro y seguí las dos tuberías. La de arriba dibuja una V completa; la de abajo sólo existe a la derecha del cero. Este valor absoluto volverá al despejar cuadráticas: protege el dominio y también las soluciones."),
  ],
  "sec10-paradojas": [
    line("empatia", "Una servilleta sospechosa", `Imaginate que alguien viene del recreo de Pabellón I, dibuja una cadena en una servilleta y asegura haber demostrado que −2 = 2. No te rías todavía, detective: sigamos cada igualdad y encontremos el paso que no tiene permiso.`),
    line(
      "pensativa",
      "Detective de la igualdad falsa",
      `La cadena que parece convertir menos dos en dos oculta una operación: una potencia de base negativa con exponente racional de denominador par. Tocá cada igualdad. La ilegal no es una cuenta mal multiplicada; es un cambio de agrupación que exige una raíz inexistente.`,
    ),
    line(
      "colapso",
      "No reagrupes fuera del dominio",
      `Si primero aplicás la mitad del exponente a menos dos, aparece <span class="eq">√(−2)</span>, que no pertenece a los reales. Por eso no podés usar potencia de potencia sin restricciones. La igualdad parece inocente hasta que mirás la operación intermedia; ahí se cae todo.`,
    ),
    line(
      "explicando",
      "La raíz impar conserva negativos",
      `En <span class="eq">∛(−4³)</span>, el cubo afecta al cuatro y la raíz cúbica admite negativos: <span class="eq">∛((−1)·4³) = −4</span>. No tachamos exponente contra índice a ciegas; justificamos que el índice es impar y que cada paso existe.`,
    ),
    line("complice", "Auditá los signos iguales", "Tocá las igualdades del inspector y encontrá cuál falla. Después alterná entre índice par e impar; justificá cada paso por dominio y precedencia, no por un se tacha apurado. Si la servilleta sobrevive a tu auditoría, recién ahí la firmamos."),
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
      `Imaginá que cada factor primo es una ficha que quiere cruzar una puerta. La raíz cuadrada deja salir fichas de a pares; la cúbica, de a ternas. Si una ficha queda sola, no completa el tamaño del paquete y permanece adentro.`,
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
      `Con índice tres necesitás ternas; con índice dos, parejas. Anotá por separado cuántas fichas salieron y cuáles quedaron. Si el radicando exige x no negativa, escribilo también: simplificar no permite olvidarse del dominio.`,
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
