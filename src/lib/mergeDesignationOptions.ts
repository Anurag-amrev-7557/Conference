import type { RegistrationDesignationOption } from './registrationTypes';

/** Appends default options missing from saved CMS config (e.g. new "sponsor" type). */
export function mergeDesignationOptions(
  saved: RegistrationDesignationOption[] | undefined,
  defaults: RegistrationDesignationOption[],
): RegistrationDesignationOption[] {
  const base = saved?.length ? [...saved] : [...defaults];
  const seen = new Set(base.map((o) => o.value));
  for (const option of defaults) {
    if (!seen.has(option.value)) {
      base.push(option);
      seen.add(option.value);
    }
  }
  return base;
}
