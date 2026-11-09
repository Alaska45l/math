/**
 * @file js/core/learning/competencies.js
 * Unified competency registry, alias resolver, prerequisite topological query engine,
 * and 3-color DFS cycle detector for Alaska Math Lab.
 *
 * Complies with ORIGINAL_REQUEST §P0.1, PROJECT.md §114, and LEARNING_ARCHITECTURE.md §6.2.
 * Pure Vanilla ES2022. Zero external dependencies. Zero eval. Zero emojis.
 */

const COLOR = Object.freeze({
  WHITE: 0, // Unvisited
  GRAY: 1,  // Visiting (on current recursion stack)
  BLACK: 2, // Visited (fully explored)
});

// Registry state
const moduleRegistries = new Map();
const globalCompetencies = new Map();
const globalDiagnostics = new Map();
const globalAliases = new Map();

/**
 * Resets the entire registry (primarily for test isolation).
 */
export function clearRegistry() {
  moduleRegistries.clear();
  globalCompetencies.clear();
  globalDiagnostics.clear();
  globalAliases.clear();
}

/**
 * Unregisters a single module from the registry.
 * @param {string} moduleId
 */
export function unregisterModule(moduleId) {
  const mod = moduleRegistries.get(moduleId);
  if (!mod) return;

  for (const compId of mod.competencies.keys()) {
    globalCompetencies.delete(compId);
  }
  for (const diagId of mod.diagnostics.keys()) {
    globalDiagnostics.delete(diagId);
  }
  for (const alias of mod.aliases.keys()) {
    globalAliases.delete(alias);
  }
  moduleRegistries.delete(moduleId);
}

/**
 * Normalizes a diagnostic definition into a canonical object.
 * @param {string} key
 * @param {object} def
 * @param {string} moduleId
 * @returns {Readonly<object>}
 */
function normalizeDiagnostic(key, def, moduleId) {
  const diag = {
    id: def.id || key,
    category: def.category || 'conceptual',
    pose: def.pose || 'pensativa',
    competencyId: def.competencyId || null,
    shortLabel: def.shortLabel || def.label || key,
    moduleId: def.moduleId || moduleId,
  };
  return Object.freeze(diag);
}

/**
 * Registers a module's competencies, diagnostics, and aliases.
 *
 * @param {string} moduleId - Unique module identifier (e.g. 'exponenciales', 'cuadraticas')
 * @param {object} data
 * @param {Array<object>} [data.competencies=[]]
 * @param {object|Array} [data.diagnosticTaxonomy={}]
 * @param {object} [data.aliases={}]
 * @returns {{ success: boolean, competencyCount: number, diagnosticCount: number, validation: object }}
 */
export function registerModuleCompetencies(moduleId, data = {}) {
  if (!moduleId || typeof moduleId !== 'string') {
    throw new TypeError('moduleId must be a non-empty string');
  }

  const competenciesList = Array.isArray(data.competencies)
    ? data.competencies
    : (data.competencies ? Object.values(data.competencies) : []);

  const modEntry = {
    moduleId,
    competencies: new Map(),
    diagnostics: new Map(),
    aliases: new Map(),
  };

  // 1. Register aliases first so competencies can reference them
  const rawAliases = data.aliases || {};
  for (const [alias, canonicalId] of Object.entries(rawAliases)) {
    if (typeof alias === 'string' && typeof canonicalId === 'string') {
      modEntry.aliases.set(alias, canonicalId);
      globalAliases.set(alias, canonicalId);
    }
  }

  // 2. Register competencies
  for (let i = 0; i < competenciesList.length; i++) {
    const rawComp = competenciesList[i];
    if (!rawComp || typeof rawComp !== 'object' || !rawComp.id) {
      throw new TypeError(`Competency at index ${i} in module '${moduleId}' must have a valid 'id'`);
    }

    const prereqs = Array.isArray(rawComp.prerequisiteIds)
      ? [...rawComp.prerequisiteIds]
      : (Array.isArray(rawComp.prerequisites) ? [...rawComp.prerequisites] : []);

    const comp = Object.freeze({
      id: rawComp.id,
      moduleId,
      title: rawComp.title || rawComp.name || rawComp.id,
      description: rawComp.description || '',
      order: typeof rawComp.order === 'number' ? rawComp.order : (typeof rawComp.section === 'number' ? rawComp.section : i + 1),
      section: rawComp.section || null,
      prerequisiteIds: Object.freeze(prereqs),
      diagnosticIds: Object.freeze(Array.isArray(rawComp.diagnosticIds) ? [...rawComp.diagnosticIds] : []),
      representations: Object.freeze(Array.isArray(rawComp.representations) ? [...rawComp.representations] : []),
      targetMasteryRuns: rawComp.targetMasteryRuns || 2,
    });

    modEntry.competencies.set(comp.id, comp);
    globalCompetencies.set(comp.id, comp);
  }

  // 3. Register diagnostics
  const rawDiagnostics = data.diagnosticTaxonomy || {};
  if (Array.isArray(rawDiagnostics)) {
    for (const d of rawDiagnostics) {
      if (d && d.id) {
        const diag = normalizeDiagnostic(d.id, d, moduleId);
        modEntry.diagnostics.set(diag.id, diag);
        globalDiagnostics.set(diag.id, diag);
      }
    }
  } else if (typeof rawDiagnostics === 'object') {
    for (const [key, d] of Object.entries(rawDiagnostics)) {
      if (d && typeof d === 'object') {
        const diag = normalizeDiagnostic(key, d, moduleId);
        modEntry.diagnostics.set(diag.id, diag);
        globalDiagnostics.set(diag.id, diag);
      }
    }
  }

  moduleRegistries.set(moduleId, modEntry);

  const validation = validateGraph(moduleId);

  return {
    success: true,
    competencyCount: modEntry.competencies.size,
    diagnosticCount: modEntry.diagnostics.size,
    validation,
  };
}

/**
 * Resolves an ID (canonical or alias) to its canonical competency ID.
 * @param {string} id
 * @returns {string}
 */
export function resolveCompetencyId(id) {
  if (typeof id !== 'string') return id;
  return globalAliases.get(id) || id;
}

/**
 * Retrieves a competency by canonical ID or alias.
 * @param {string} id - Canonical ID or alias
 * @param {string} [moduleId] - Optional module scope
 * @returns {Readonly<object>|null}
 */
export function getCompetency(id, moduleId = null) {
  if (!id || typeof id !== 'string') return null;

  const canonicalId = resolveCompetencyId(id);

  if (moduleId) {
    const mod = moduleRegistries.get(moduleId);
    if (!mod) return null;
    return mod.competencies.get(canonicalId) || null;
  }

  return globalCompetencies.get(canonicalId) || null;
}

/**
 * Returns all competencies for a module sorted by order.
 * @param {string} moduleId
 * @returns {Readonly<object>[]}
 */
export function getCompetenciesByModule(moduleId) {
  if (!moduleId || typeof moduleId !== 'string') return [];
  const mod = moduleRegistries.get(moduleId);
  if (!mod) return [];

  const list = Array.from(mod.competencies.values());
  list.sort((a, b) => a.order - b.order);
  return list;
}

/**
 * Returns all registered competencies across all modules.
 * @returns {Readonly<object>[]}
 */
export function getAllCompetencies() {
  return Array.from(globalCompetencies.values());
}

/**
 * Returns diagnostic metadata by ID.
 * @param {string} diagnosticId
 * @param {string} [moduleId]
 * @returns {Readonly<object>|null}
 */
export function getDiagnosticInfo(diagnosticId, moduleId = null) {
  if (!diagnosticId || typeof diagnosticId !== 'string') return null;

  if (moduleId) {
    const mod = moduleRegistries.get(moduleId);
    if (!mod) return null;
    return mod.diagnostics.get(diagnosticId) || null;
  }

  return globalDiagnostics.get(diagnosticId) || null;
}

/**
 * Returns prerequisites for a competency.
 * If recursive is true, returns topological sort (earliest prerequisite first).
 *
 * @param {string} competencyId
 * @param {object} [options]
 * @param {boolean} [options.recursive=false]
 * @returns {string[]} Array of competency IDs
 */
export function getPrerequisites(competencyId, options = {}) {
  const canonicalId = resolveCompetencyId(competencyId);
  const comp = globalCompetencies.get(canonicalId);
  if (!comp) return [];

  if (!options.recursive) {
    return [...comp.prerequisiteIds];
  }

  const result = [];
  const visited = new Set();
  const visiting = new Set();

  function dfs(currentId) {
    if (visited.has(currentId)) return;
    if (visiting.has(currentId)) {
      // Cycle detected; do not enter infinite loop
      return;
    }

    visiting.add(currentId);
    const node = globalCompetencies.get(currentId);
    if (node && Array.isArray(node.prerequisiteIds)) {
      for (const pId of node.prerequisiteIds) {
        const canonicalPid = resolveCompetencyId(pId);
        dfs(canonicalPid);
      }
    }
    visiting.delete(currentId);
    visited.add(currentId);

    if (currentId !== canonicalId) {
      result.push(currentId);
    }
  }

  dfs(canonicalId);
  return result;
}

/**
 * Returns downstream competencies that declare competencyId as a prerequisite.
 *
 * @param {string} competencyId
 * @param {object} [options]
 * @param {boolean} [options.recursive=false]
 * @returns {string[]} Array of competency IDs
 */
export function getDependents(competencyId, options = {}) {
  const canonicalId = resolveCompetencyId(competencyId);
  if (!globalCompetencies.has(canonicalId)) return [];

  const directDependents = [];
  for (const comp of globalCompetencies.values()) {
    const canonicalPrereqs = comp.prerequisiteIds.map(resolveCompetencyId);
    if (canonicalPrereqs.includes(canonicalId)) {
      directDependents.push(comp.id);
    }
  }

  if (!options.recursive) {
    return directDependents;
  }

  const result = [];
  const visited = new Set();

  function collect(currentId) {
    for (const comp of globalCompetencies.values()) {
      const canonicalPrereqs = comp.prerequisiteIds.map(resolveCompetencyId);
      if (canonicalPrereqs.includes(currentId) && !visited.has(comp.id)) {
        visited.add(comp.id);
        result.push(comp.id);
        collect(comp.id);
      }
    }
  }

  collect(canonicalId);
  return result;
}

/**
 * Validates the prerequisite graph for cycles and dangling references.
 * Uses 3-color DFS marking (White, Gray, Black).
 *
 * @param {string} [moduleId=null] - If provided, checks module scope; otherwise checks entire registry
 * @returns {{ valid: boolean, errors: string[], cycles: string[][] }}
 */
export function validateGraph(moduleId = null) {
  const errors = [];
  const cycles = [];

  const targetCompetencies = moduleId
    ? getCompetenciesByModule(moduleId)
    : getAllCompetencies();

  const color = new Map();
  const parent = new Map();

  for (const comp of targetCompetencies) {
    color.set(comp.id, COLOR.WHITE);
  }

  // 1. Check self-dependencies and missing prerequisites
  for (const comp of targetCompetencies) {
    for (const prereqId of comp.prerequisiteIds) {
      const canonicalPrereq = resolveCompetencyId(prereqId);

      if (canonicalPrereq === comp.id) {
        errors.push(`Competency '${comp.id}' cannot depend on itself`);
      }

      if (!globalCompetencies.has(canonicalPrereq)) {
        errors.push(`Competency '${comp.id}' references unregistered prerequisite '${prereqId}'`);
      }
    }
  }

  // 2. DFS cycle detection
  function dfs(u, path) {
    color.set(u, COLOR.GRAY);
    path.push(u);

    const comp = globalCompetencies.get(u);
    if (comp && Array.isArray(comp.prerequisiteIds)) {
      for (const pId of comp.prerequisiteIds) {
        const v = resolveCompetencyId(pId);
        if (!globalCompetencies.has(v)) continue;

        const vColor = color.get(v) ?? COLOR.WHITE;

        if (vColor === COLOR.GRAY) {
          // Cycle found! Reconstruct cycle path
          const cycleStartIdx = path.indexOf(v);
          const cyclePath = path.slice(cycleStartIdx).concat(v);
          cycles.push(cyclePath);
          errors.push(`Cycle detected in prerequisites: ${cyclePath.join(' -> ')}`);
        } else if (vColor === COLOR.WHITE) {
          dfs(v, path);
        }
      }
    }

    path.pop();
    color.set(u, COLOR.BLACK);
  }

  for (const comp of targetCompetencies) {
    if (color.get(comp.id) === COLOR.WHITE) {
      dfs(comp.id, []);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    cycles,
  };
}
