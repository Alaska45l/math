import { h } from "./dom.js";
import { frac } from "./math-format.js";
import { react } from "./vn.js";

export const GLOSSARY_TERMS = {
  neutro_multiplicativo: {
    title: "Neutro multiplicativo",
    pose: "explicando",
    text: "Es el número que, al multiplicar, deja intacto cualquier factor. Lo descubrimos preguntando qué valor puede ocupar el lugar de una casilla sin modificar a. En la suma ese papel lo cumple cero; en la multiplicación lo cumple uno. Confundirlos mezcla dos operaciones distintas.",
    example:
      "Con 7, sumar cero mantiene 7 y multiplicar por uno también mantiene 7.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "7 · 1 = 7;   7 + 0 = 7;   ",
        frac("7", "7"),
        " = 1",
      ),
    contrast:
      "El cero sí es neutro para sumar, pero al multiplicar absorbe: 7 · 0 da 0 y destruye la escala.",
  },
  inverso_multiplicativo: {
    title: "Inverso multiplicativo",
    pose: "complice",
    text: "El inverso de un número es el factor que deshace su cambio de escala y devuelve el neutro uno. Para a distinto de cero, buscamos un número que al multiplicarse por a produzca exactamente uno. La división por a equivale a multiplicar por ese inverso.",
    example:
      "El inverso de 4 es un cuarto: juntos forman una pareja cuyo producto es el neutro.",
    formula: () => h("span", { class: "eq" }, "4 · ", frac("1", "4"), " = 1"),
    contrast:
      "No es el opuesto aditivo −a: sumar a su opuesto produce cero, mientras el inverso multiplicativo produce uno.",
  },
  radicando: {
    title: "Radicando",
    pose: "explicando",
    text: "El radicando es la cantidad que queda debajo del techo del símbolo de raíz. La pregunta de la raíz es qué número, repetido como factor el número de veces indicado por el índice, reconstruye esa cantidad. Por ejemplo, bajo una raíz cuadrada buscamos dos factores iguales.",
    example:
      "En la raíz cuadrada de 36, el radicando es 36; buscamos un factor que al repetirse dos veces dé 36.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "√",
        h("span", { class: "pr-gloss-highlight" }, "36"),
        " = 6;   36 : 6 = ",
        frac("36", "6"),
      ),
    contrast:
      "El radicando no es el índice: uno es el número que se transforma y el otro cuenta cuántas repeticiones buscamos.",
  },
  indice_raiz: {
    title: "Índice de la raíz",
    pose: "pensativa",
    text: "El índice cuenta cuántas copias iguales del resultado hay que multiplicar para reconstruir el radicando. En la raíz cuadrada el índice dos suele quedar implícito; en raíces cúbicas y superiores lo escribimos para que sepamos cuántas cajas iguales debemos formar.",
    example:
      "La raíz cúbica de 64 pregunta por el factor que debe aparecer tres veces; cuatro cumple porque cuatro por cuatro por cuatro da 64.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "∛64 = 4;   4 · 4 · 4 = 64;   64",
        h("sup", null, frac("1", "3")),
        " = 4",
      ),
    contrast:
      "El índice no indica cuántos factores hay en el radicando, sino en cuántas agrupaciones iguales los repartimos.",
  },
  racionalizar: {
    title: "Racionalizar",
    pose: "complice",
    text: "Racionalizar es reescribir una fracción equivalente para que su denominador ya no contenga una raíz. Multiplicamos arriba y abajo por el mismo factor, que vale uno, y así conservamos el valor mientras cambiamos la forma. Es una técnica de escritura algebraica, no una operación mágica.",
    example:
      "Para quitar la raíz del denominador de uno sobre raíz de dos, multiplicamos arriba y abajo por raíz de dos.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        frac("1", "√2"),
        " · ",
        frac("√2", "√2"),
        " = ",
        frac("√2", "2"),
      ),
    contrast:
      "No se puede multiplicar sólo el denominador: la equivalencia se conserva porque el factor aplicado arriba y abajo vale uno.",
  },
  factor_primo: {
    title: "Factor primo",
    pose: "explicando",
    text: "Un factor primo es uno de los ladrillos básicos de una multiplicación: es primo y aparece multiplicando a otros factores. Desarmar un número en primos permite ver qué paquetes iguales podemos reunir para extraerlos de una raíz sin adivinar raíces de memoria.",
    example:
      "El 36 puede abrirse como dos doses y dos treses; al reordenarlos aparecen dos paquetes iguales, cada uno con un dos y un tres.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "36 = 2 · 2 · 3 · 3 = (2 · 3)(2 · 3);   36",
        h("sup", null, frac("1", "2")),
        " = 6",
      ),
    contrast:
      "Un factor primo no es cualquier divisor compuesto: 6 divide a 36, pero sus propios ladrillos son 2 y 3.",
  },
  campo_aditivo: {
    title: "Campo aditivo",
    pose: "pensativa",
    text: "El campo aditivo organiza situaciones donde avanzamos sumando cantidades y retrocedemos sumando sus opuestos. Su punto de partida natural es cero, porque agregar cero no mueve la posición. Repetir varios saltos iguales se resume con una multiplicación, que cuenta sumandos.",
    example:
      "Tres saltos de tamaño cuatro desde cero llegan a doce; el contador tres abrevia las tres copias de cuatro.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "0 + 4 + 4 + 4 = 4 · 3 = 12;   12 · ",
        frac("1", "3"),
        " = 4",
      ),
    contrast:
      "Ese contador aditivo no es una potencia: cuenta sumandos, mientras que el exponente contará factores.",
  },
  campo_multiplicativo: {
    title: "Campo multiplicativo",
    pose: "explicando",
    text: "El campo multiplicativo describe cambios de escala: cada paso multiplica el estado anterior por el mismo factor. Empezamos en uno porque multiplicar por uno conserva la escala inicial. Repetir el factor a cierta cantidad de veces se resume con una potencia.",
    example:
      "Aplicar tres veces el factor dos desde uno produce dos, cuatro y ocho; el exponente tres cuenta esos cambios.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "1 · 2 · 2 · 2 = 2³ = 8;   16",
        h("sup", null, frac("1", "2")),
        " = 4",
      ),
    contrast:
      "La suma avanza desde cero con saltos del mismo tamaño; la potencia escala repetidamente desde uno.",
  },
  raiz_principal: {
    title: "Raíz principal",
    pose: "evaluando",
    text: "Para una raíz de índice par y radicando no negativo, la raíz principal es el resultado no negativo. Aunque dos números opuestos tienen el mismo cuadrado, el símbolo de raíz elige el que queda sobre cero. Esta elección hace que la operación tenga un único resultado.",
    example:
      "Tanto seis como menos seis al cuadrado dan 36, pero la raíz cuadrada principal de 36 es seis.",
    formula: () =>
      h(
        "span",
        { class: "eq" },
        "√36 = 6;   √(−6)² = |−6| = 6;   √",
        h("span", null, frac("9", "4")),
        " = ",
        frac("3", "2"),
      ),
    contrast:
      "La raíz principal no devuelve automáticamente la variable: √(x²) es |x|, porque x puede ser negativo.",
  },
};

function wordCount(term) {
  return `${term.title} ${term.text} ${term.example} ${term.contrast}`
    .trim()
    .split(/\s+/).length;
}

export function initGlossary(root = document) {
  root.querySelectorAll("[data-gloss]").forEach((node) => {
    const term = GLOSSARY_TERMS[node.dataset.gloss];
    if (!term || node.dataset.glossReady) return;
    node.dataset.glossReady = "true";
    node.setAttribute("tabindex", "0");
    node.setAttribute("role", "button");
    node.setAttribute(
      "aria-label",
      `${term.title}: abrir explicación de Alaska`,
    );
    const explain = () => {
      const formulaHtml = term.formula().outerHTML;
      react({
        pose: term.pose,
        tag: term.title,
        html: `<p>${term.text}</p><p><strong>Ejemplo:</strong> ${term.example}</p><p class="eq">${formulaHtml}</p><p><strong>Cuidado:</strong> ${term.contrast}</p>`,
      });
    };
    node.addEventListener("click", explain);
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        explain();
      }
    });
  });
}

export const GLOSSARY_AUDIT = Object.fromEntries(
  Object.entries(GLOSSARY_TERMS).map(([key, term]) => [
    key,
    { words: wordCount(term), pose: term.pose },
  ]),
);
