import { describe, expect, it } from 'vitest';
import {
  isPrivilegedAdminRole,
  wouldRemoveLastPrivilegedAdmin,
} from './adminUserGuard';

describe('adminUserGuard', () => {
  it('treats super_admin and legacy admin as privileged', () => {
    expect(isPrivilegedAdminRole('super_admin')).toBe(true);
    expect(isPrivilegedAdminRole('admin')).toBe(true);
    expect(isPrivilegedAdminRole('editor')).toBe(false);
  });

  it('blocks demote/delete when last privileged admin', () => {
    expect(wouldRemoveLastPrivilegedAdmin('super_admin', 'editor', 1)).toBe(true);
    expect(wouldRemoveLastPrivilegedAdmin('admin', undefined, 1)).toBe(true);
    expect(wouldRemoveLastPrivilegedAdmin('super_admin', 'super_admin', 1)).toBe(false);
    expect(wouldRemoveLastPrivilegedAdmin('super_admin', 'editor', 2)).toBe(false);
    expect(wouldRemoveLastPrivilegedAdmin('editor', 'viewer', 1)).toBe(false);
  });
});
