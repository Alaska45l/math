/** Operaciones matemáticas puras usadas por el laboratorio de potencias y raíces. */
import {
  simplifyRadical,
  compareAdditiveVsMultiplicative,
  diagnosePowRad,
} from "./expr.js";

export { simplifyRadical, compareAdditiveVsMultiplicative, diagnosePowRad };

export function primeFactorization(value) {
  if (!Number.isInteger(value) || value < 1)
    throw new RangeError("El número debe ser un entero positivo.");
  const factors = [];
  let remaining = value;
  for (let p = 2; p * p <= remaining; p++)
    while (remaining % p === 0) {
      factors.push(p);
      remaining /= p;
    }
  if (remaining > 1) factors.push(remaining);
  return factors;
}

/** Reparte factores primos en `index` recipientes y devuelve grupos completos/restos. */
export function groupPrimeFactors(value, index) {
  if (!Number.isInteger(index) || index < 2 || index > 7)
    throw new RangeError("El índice debe estar entre 2 y 7.");
  const factors = primeFactorization(value);
  const counts = new Map();
  factors.forEach((p) => counts.set(p, (counts.get(p) || 0) + 1));
  const groups = [];
  const leftovers = [];
  for (const [prime, count] of counts) {
    const complete = Math.floor(count / index);
    const rest = count % index;
    for (let i = 0; i < complete; i++) groups.push(Array(index).fill(prime));
    for (let i = 0; i < rest; i++) leftovers.push(prime);
  }
  return {
    value,
    index,
    factors,
    groups,
    leftovers,
    rootValue: groups.reduce((product, group) => product * group[0], 1),
    exact: leftovers.length === 0,
  };
}

export function evalIntegerPower(base, exponent) {
  if (!Number.isInteger(exponent))
    throw new TypeError("El exponente debe ser entero.");
  if (base === 0 && exponent < 0)
    return {
      value: NaN,
      domainError: true,
      errorReason: "zero_to_negative_power",
    };
  return { value: base ** exponent, domainError: false, errorReason: null };
}
