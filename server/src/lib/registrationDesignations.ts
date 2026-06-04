export const REGISTRATION_DESIGNATION_VALUES = [
  'enterprise',
  'student',
  'individual',
  'sponsor',
] as const;

export type RegistrationDesignationValue = (typeof REGISTRATION_DESIGNATION_VALUES)[number];

export interface RegistrationDesignationOptionShape {
  value: string;
  label: string;
  description?: string;
}

/** Appends default options missing from saved CMS config (e.g. new "sponsor" type). */
export function mergeDesignationOptions(
  saved: RegistrationDesignationOptionShape[] | undefined,
  defaults: RegistrationDesignationOptionShape[],
): RegistrationDesignationOptionShape[] {
  const base = Array.isArray(saved) && saved.length ? [...saved] : [...defaults];
  const seen = new Set(base.map((o) => o.value));
  for (const option of defaults) {
    if (!seen.has(option.value)) {
      base.push(option);
      seen.add(option.value);
    }
  }
  return base;
}
