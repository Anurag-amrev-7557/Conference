/** Deep-merge plain objects (arrays and scalars replace). Mirrors server mergePatch. */
export function deepMergeObjects<T extends Record<string, unknown>>(
  base: T,
  patch: Record<string, unknown>,
): T {
  const out = { ...base } as Record<string, unknown>
  for (const key of Object.keys(patch)) {
    const next = patch[key]
    const prev = base[key]
    if (
      next !== null &&
      typeof next === 'object' &&
      !Array.isArray(next) &&
      prev !== null &&
      typeof prev === 'object' &&
      !Array.isArray(prev)
    ) {
      out[key] = deepMergeObjects(
        prev as Record<string, unknown>,
        next as Record<string, unknown>,
      )
    } else if (next !== undefined) {
      out[key] = next
    }
  }
  return out as T
}
