/**
 * @file js/core/learning/competencies.js
 * Unified competency registry, 2-step global registration, alias resolver,
 * prerequisite topological query engine, and 3-color DFS cycle detector for Alaska Math Lab.
 *
 * Complies with ORIGINAL_REQUEST §R2, PROJECT.md Contract 1, and LEARNING_ARCHITECTURE.md §6.2.
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
const crossModuleEdges = new Map(); // targetCompId -> Set<prereqId>

/**
 * Resets the entire registry (primarily for test isolation).
 */
export function clearRegistry() {
  moduleRegistries.clear();
  globalCompetencies.clear();
  globalDiagnostics.clear();
  globalAliases.clear();
  crossModuleEdges.clear();
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
    competencyId: def.competencyId ?? null,
    shortLabel: def.shortLabel || def.label || key,
    moduleId: def.moduleId || moduleId,
  };
  return Object.freeze(diag);
}

/**
 * Builds an immutable competency node combining intra-module prerequisites
 * with any registered cross-module prerequisite edges.
 * @param {object} node
 * @param {Iterable<string>} [extraPrereqs]
 * @returns {Readonly<object>}
 */
function buildFrozenCompetencyNode(node, extraPrereqs = []) {
  const merged = [];
  const seen = new Set();
  for (const pid of node.basePrerequisiteIds) {
    if (!seen.has(pid)) {
      seen.add(pid);
      merged.push(pid);
    }
  }
  for (const pid of extraPrereqs) {
    if (!seen.has(pid)) {
      seen.add(pid);
      merged.push(pid);
    }
  }
  return Object.freeze({
    ...node,
    prerequisiteIds: Object.freeze(merged),
  });
}

/**
 * Registers a module's competencies, diagnostics, and aliases.
 * Supports 2-step global registration via `deferValidation: true`, rejects duplicates
 * within the payload or across different modules, and remains idempotent when
 * re-registering the same `moduleId`.
 *
 * @param {string} moduleId - Unique module identifier (e.g. 'exponenciales', 'cuadraticas')
 * @param {object} [data={}]
 * @param {Array<object>} [data.competencies=[]]
 * @param {object|Array} [data.diagnosticTaxonomy={}]
 * @param {object} [data.aliases={}]
 * @param {object} [options={}]
 * @param {boolean} [options.deferValidation=false]
 * @param {boolean} [options.strictEvidence=false]
 * @returns {{ success: boolean, competencyCount: number, diagnosticCount: number, validation: object|null }}
 */
export function registerModuleCompetencies(moduleId, data = {}, options = {}) {
  if (!moduleId || typeof moduleId !== 'string' || moduleId.trim().length === 0) {
    throw new TypeError('moduleId must be a non-empty string');
  }

  const { deferValidation = false, strictEvidence = false } = options || {};

  const competenciesList = Array.isArray(data.competencies)
    ? data.competencies
    : (data.competencies ? Object.values(data.competencies) : []);

  // Pre-validate payload before mutating global state
  const seenIdsInPayload = new Set();
  for (let i = 0; i < competenciesList.length; i++) {
    const rawComp = competenciesList[i];
    if (!rawComp || typeof rawComp !== 'object' || !rawComp.id || typeof rawComp.id !== 'string') {
      throw new TypeError(`Competency at index ${i} in module '${moduleId}' must have a valid 'id'`);
    }
    if (seenIdsInPayload.has(rawComp.id)) {
      throw new Error(`[competencies] Duplicate competency id "${rawComp.id}" within module "${moduleId}".`);
    }
    seenIdsInPayload.add(rawComp.id);

    const existing = globalCompetencies.get(rawComp.id);
    if (existing && existing.moduleId !== moduleId) {
      throw new Error(
        `[competencies] Duplicate competency id "${rawComp.id}" already registered by module "${existing.moduleId}".`
      );
    }
  }

  // Idempotent same-module re-registration: clear previous registration for moduleId first
  if (moduleRegistries.has(moduleId)) {
    unregisterModule(moduleId);
  }

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

    const basePrereqs = Array.isArray(rawComp.prerequisiteIds)
      ? [...rawComp.prerequisiteIds]
      : (Array.isArray(rawComp.prerequisites) ? [...rawComp.prerequisites] : []);

    const evidenceMechanisms = Array.isArray(rawComp.evidenceMechanisms)
      ? [...rawComp.evidenceMechanisms]
      : (Array.isArray(rawComp.evidenceSources) ? [...rawComp.evidenceSources] : []);

    const evidenceSources = Array.isArray(rawComp.evidenceSources)
      ? [...rawComp.evidenceSources]
      : [...evidenceMechanisms];

    const exerciseFamilies = Array.isArray(rawComp.exerciseFamilies)
      ? [...rawComp.exerciseFamilies]
      : [];

    const sectionId = rawComp.sectionId || rawComp.section || null;

    const baseNode = {
      id: rawComp.id,
      moduleId,
      title: rawComp.title || rawComp.name || rawComp.id,
      description: rawComp.description || '',
      order: typeof rawComp.order === 'number'
        ? rawComp.order
        : (typeof rawComp.section === 'number' ? rawComp.section : i + 1),
      chapter: typeof rawComp.chapter === 'number' ? rawComp.chapter : null,
      section: rawComp.section || sectionId || null,
      sectionId,
      basePrerequisiteIds: Object.freeze(basePrereqs),
      diagnosticIds: Object.freeze(Array.isArray(rawComp.diagnosticIds) ? [...rawComp.diagnosticIds] : []),
      representations: Object.freeze(Array.isArray(rawComp.representations) ? [...rawComp.representations] : []),
      exerciseFamilies: Object.freeze(exerciseFamilies),
      evidenceMechanisms: Object.freeze(evidenceMechanisms),
      evidenceSources: Object.freeze(evidenceSources),
      targetMasteryRuns: rawComp.targetMasteryRuns || 2,
    };

    const crossSet = crossModuleEdges.get(rawComp.id);
    const comp = buildFrozenCompetencyNode(baseNode, crossSet ? crossSet.values() : []);

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

  const validation = deferValidation ? null : validateGraph(moduleId, { strictEvidence });

  return {
    success: true,
    competencyCount: modEntry.competencies.size,
    diagnosticCount: modEntry.diagnostics.size,
    validation,
  };
}

/**
 * Resolves an ID (canonical or alias) to its canonical competency ID.
 * Guards against alias cycles.
 * @param {string} id
 * @returns {string}
 */
export function resolveCompetencyId(id) {
  if (typeof id !== 'string') return id;
  let current = id;
  const visited = new Set();
  while (globalAliases.has(current)) {
    if (visited.has(current)) {
      return id; // Cycle guard: return original input without infinite loop
    }
    visited.add(current);
    current = globalAliases.get(current);
  }
  return current;
}

/**
 * Applies cross-module prerequisite links onto registered competencies without mutating
 * the source module arrays. Used in Step 2 of global curriculum registration.
 *
 * @param {Record<string, string[]>|Map<string, string[]>} edgeMap
 * @param {object} [options={}]
 * @param {boolean} [options.ignoreMissing=false]
 * @returns {{ appliedCount: number, skippedCount: number }}
 */
export function registerCrossModulePrerequisites(edgeMap = {}, { ignoreMissing = false } = {}) {
  const entries = edgeMap instanceof Map
    ? Array.from(edgeMap.entries())
    : Object.entries(edgeMap || {});

  let appliedCount = 0;
  let skippedCount = 0;

  for (const [rawTargetId, prereqList] of entries) {
    const targetId = resolveCompetencyId(rawTargetId);
    const targetComp = globalCompetencies.get(targetId);

    if (!targetComp) {
      if (ignoreMissing) {
        skippedCount += Array.isArray(prereqList) ? prereqList.length : 0;
        continue;
      }
      throw new Error(`[competencies] Cross-module prerequisite target "${rawTargetId}" is not registered.`);
    }

    if (!crossModuleEdges.has(targetId)) {
      crossModuleEdges.set(targetId, new Set());
    }
    const edgeSet = crossModuleEdges.get(targetId);

    for (const rawPrereqId of (Array.isArray(prereqList) ? prereqList : [])) {
      const prereqId = resolveCompetencyId(rawPrereqId);
      if (!globalCompetencies.has(prereqId)) {
        if (ignoreMissing) {
          skippedCount += 1;
          continue;
        }
        throw new Error(
          `[competencies] Cross-module prerequisite "${rawPrereqId}" for "${targetId}" is not registered.`
        );
      }
      edgeSet.add(prereqId);
      appliedCount += 1;
    }

    const updatedComp = buildFrozenCompetencyNode(targetComp, edgeSet.values());
    globalCompetencies.set(targetId, updatedComp);
    const mod = moduleRegistries.get(targetComp.moduleId);
    if (mod) {
      mod.competencies.set(targetId, updatedComp);
    }
  }

  return { appliedCount, skippedCount };
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
 * Validates the prerequisite graph for cycles, self-dependencies, missing prerequisites,
 * alias cycles/dangling targets, dangling diagnostics, and (optionally) evidence mechanisms.
 * Uses 3-color DFS marking (White, Gray, Black).
 * Root competencies (prerequisiteIds: []) and leaf competencies (0 dependents) are VALID.
 *
 * @param {string|null} [moduleId=null] - If provided, checks module scope; otherwise checks entire registry
 * @param {object} [options={}]
 * @param {boolean} [options.strictEvidence=false]
 * @returns {{ valid: boolean, errors: string[], cycles: string[][], details: object[] }}
 */
export function validateGraph(moduleId = null, options = {}) {
  const { strictEvidence = false } = options || {};
  const errors = [];
  const details = [];
  const cycles = [];

  const addError = (type, message, meta = {}) => {
    errors.push(message);
    details.push({ type, message, ...meta });
  };

  const targetCompetencies = moduleId
    ? getCompetenciesByModule(moduleId)
    : getAllCompetencies();

  const color = new Map();
  for (const comp of targetCompetencies) {
    color.set(comp.id, COLOR.WHITE);
  }

  // 1. Check moduleId, evidenceMechanisms (when strict), self-dependencies, and missing prerequisites
  for (const comp of targetCompetencies) {
    if (!comp.moduleId || typeof comp.moduleId !== 'string' || comp.moduleId.trim().length === 0) {
      addError('MISSING_MODULE_ID', `Competency '${comp.id}' is missing a valid moduleId`, {
        competencyId: comp.id,
      });
    }

    if (strictEvidence) {
      const hasEvidence = (Array.isArray(comp.evidenceMechanisms) && comp.evidenceMechanisms.length > 0)
        || (Array.isArray(comp.evidenceSources) && comp.evidenceSources.length > 0);
      if (!hasEvidence) {
        addError('MISSING_EVIDENCE_MECHANISM', `Competency '${comp.id}' has no evidenceMechanisms`, {
          competencyId: comp.id,
        });
      }
    }

    for (const prereqId of comp.prerequisiteIds) {
      const canonicalPrereq = resolveCompetencyId(prereqId);

      if (canonicalPrereq === comp.id) {
        addError('SELF_DEPENDENCY', `Competency '${comp.id}' cannot depend on itself`, {
          competencyId: comp.id,
        });
      }

      if (!globalCompetencies.has(canonicalPrereq)) {
        addError(
          'MISSING_PREREQUISITE',
          `Competency '${comp.id}' references unregistered prerequisite '${prereqId}'`,
          { competencyId: comp.id, prerequisiteId: prereqId }
        );
      }
    }
  }

  // 2. 3-color DFS cycle detection across target scope (and reachable globals)
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
          const cycleStartIdx = path.indexOf(v);
          const cyclePath = path.slice(cycleStartIdx).concat(v);
          cycles.push(cyclePath);
          addError('CYCLE_DETECTED', `Cycle detected in prerequisites: ${cyclePath.join(' -> ')}`, {
            cycle: cyclePath,
          });
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

  // 3. Alias integrity (cycles & dangling targets)
  const modEntry = moduleId ? moduleRegistries.get(moduleId) : null;
  const aliasEntries = moduleId
    ? (modEntry ? Array.from(modEntry.aliases.entries()) : [])
    : Array.from(globalAliases.entries());

  for (const [aliasId, initialTarget] of aliasEntries) {
    let cur = initialTarget;
    const seen = new Set([aliasId]);
    let isCycle = false;

    while (globalAliases.has(cur)) {
      if (seen.has(cur)) {
        isCycle = true;
        break;
      }
      seen.add(cur);
      cur = globalAliases.get(cur);
    }

    if (isCycle) {
      addError('ALIAS_CYCLE', `Alias cycle detected involving '${aliasId}'`, { aliasId });
    } else if (!globalCompetencies.has(cur)) {
      addError(
        'DANGLING_ALIAS',
        `Dangling alias '${aliasId}' points to unregistered competency '${cur}'`,
        { aliasId, targetId: cur }
      );
    }
  }

  // 4. Diagnostic competencyId integrity (null competencyId remains valid)
  const diagValues = moduleId
    ? (modEntry ? Array.from(modEntry.diagnostics.values()) : [])
    : Array.from(globalDiagnostics.values());

  for (const diag of diagValues) {
    if (diag.competencyId !== null && diag.competencyId !== undefined) {
      const resolved = resolveCompetencyId(diag.competencyId);
      if (!globalCompetencies.has(resolved)) {
        addError(
          'DANGLING_DIAGNOSTIC',
          `Dangling diagnostic '${diag.id}' references unregistered competency '${diag.competencyId}'`,
          { diagnosticId: diag.id, competencyId: diag.competencyId }
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    cycles,
    details,
  };
}

/**
 * Validates the entire global competency graph across all registered modules.
 * @param {object} [options={ strictEvidence: true }]
 * @returns {{ valid: boolean, errors: string[], cycles: string[][], details: object[] }}
 */
export function validateGlobalGraph(options = { strictEvidence: true }) {
  return validateGraph(null, options);
}
