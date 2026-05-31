/** Deep-merge plain objects for PATCH payloads (arrays and scalars replace). */
export function deepMergeObjects(
  base: Record<string, unknown>,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(patch)) {
    const next = patch[key];
    const prev = base[key];
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
      );
    } else {
      out[key] = next;
    }
  }
  return out;
}

export function safeParseJsonRecord(raw: string | null | undefined): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}
