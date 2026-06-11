import { describe, expect, it } from 'vitest';
import {
  isValidDesignationValue,
  validateRegistrationForm,
  type RegistrationFormState,
} from './registrationValidation';

const baseForm: RegistrationFormState = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '+1 555 0100',
  linkedIn: 'https://linkedin.com/in/jane',
  designation: 'enterprise',
};

const baseCopy = {
  fields: {
    name: { required: true },
    email: { required: true },
    phone: { required: true },
    linkedIn: { required: false },
    designation: { required: true },
  },
  designationOptions: [
    { value: 'enterprise', label: 'Enterprise' },
    { value: 'student', label: 'Student' },
  ],
  validationMessages: {},
} as const;

describe('registrationValidation', () => {
  it('accepts a valid form', () => {
    expect(validateRegistrationForm(baseForm, baseCopy)).toEqual({});
  });

  it('requires name when configured', () => {
    const errors = validateRegistrationForm({ ...baseForm, name: '  ' }, baseCopy);
    expect(errors.name).toBeTruthy();
  });

  it('rejects invalid email', () => {
    const errors = validateRegistrationForm({ ...baseForm, email: 'not-an-email' }, baseCopy);
    expect(errors.email).toBeTruthy();
  });

  it('rejects short phone numbers', () => {
    const errors = validateRegistrationForm({ ...baseForm, phone: '123' }, baseCopy);
    expect(errors.phone).toBeTruthy();
  });

  it('requires designation from allowed set', () => {
    expect(isValidDesignationValue('enterprise')).toBe(true);
    expect(isValidDesignationValue('invalid')).toBe(false);
    const errors = validateRegistrationForm({ ...baseForm, designation: '' }, baseCopy);
    expect(errors.designation).toBeTruthy();
  });
});
