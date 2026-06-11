import { afterEach, describe, expect, it, vi } from 'vitest';

describe('getJwtSecret', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('exits in production when JWT_SECRET is missing', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('JWT_SECRET', '');
    const exit = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never);

    const { getJwtSecret } = await import('./jwtSecret');
    getJwtSecret();

    expect(exit).toHaveBeenCalledWith(1);
  });

  it('exits in production when JWT_SECRET uses dev fallback', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('JWT_SECRET', 'supersecret');
    const exit = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never);

    const { getJwtSecret } = await import('./jwtSecret');
    getJwtSecret();

    expect(exit).toHaveBeenCalledWith(1);
  });
});
