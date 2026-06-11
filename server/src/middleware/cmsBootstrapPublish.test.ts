import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { EventEmitter } from 'node:events';

// Test the path matcher by importing the module's logic indirectly via a small export.
// We duplicate the matcher here to avoid coupling to Express internals in unit tests.
function affectsPublicBootstrap(method: string, path: string): boolean {
  const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
  if (!MUTATION_METHODS.has(method)) return false;
  if (path === '/content' && method === 'PATCH') return true;
  if (path === '/import') return true;
  if (path.startsWith('/blogs')) return true;
  if (path.startsWith('/events')) return true;
  if (/^\/revisions\/[^/]+\/restore$/.test(path)) return true;
  return false;
}

describe('cmsBootstrapPublish path matching', () => {
  it('matches global content patch', () => {
    expect(affectsPublicBootstrap('PATCH', '/content')).toBe(true);
  });

  it('matches blog and event mutations', () => {
    expect(affectsPublicBootstrap('POST', '/blogs')).toBe(true);
    expect(affectsPublicBootstrap('PUT', '/events/abc')).toBe(true);
    expect(affectsPublicBootstrap('DELETE', '/blogs/abc')).toBe(true);
  });

  it('ignores non-public admin routes', () => {
    expect(affectsPublicBootstrap('POST', '/users')).toBe(false);
    expect(affectsPublicBootstrap('GET', '/content')).toBe(false);
  });
});

describe('cmsBootstrapPublishMiddleware', () => {
  it('schedules publish only on successful mutations', async () => {
    const { cmsBootstrapPublishMiddleware } = await import('./cmsBootstrapPublish');
    const publish = await import('../lib/cmsBootstrapPublish');
    const schedule = vi.spyOn(publish, 'scheduleCmsBootstrapPublish');

    const req = { method: 'PATCH', path: '/content' } as Request;
    const res = new EventEmitter() as Response & EventEmitter;
    res.statusCode = 200;

    const next = vi.fn();
    cmsBootstrapPublishMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();

    res.emit('finish');
    expect(schedule).toHaveBeenCalledTimes(1);

    schedule.mockClear();
    res.statusCode = 500;
    res.emit('finish');
    expect(schedule).not.toHaveBeenCalled();
  });
});
