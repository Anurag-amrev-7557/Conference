import type { ErrorRequestHandler, RequestHandler } from 'express';
import { randomUUID } from 'node:crypto';

export const requestIdMiddleware: RequestHandler = (req, res, next) => {
  const id = (req.headers['x-request-id'] as string) || randomUUID();
  res.setHeader('x-request-id', id);
  (req as typeof req & { requestId?: string }).requestId = id;
  next();
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const requestId = (req as typeof req & { requestId?: string }).requestId;
  console.error('[api-error]', {
    requestId,
    path: req.path,
    method: req.method,
    message: err instanceof Error ? err.message : String(err),
  });

  if (res.headersSent) {
    return;
  }

  res.status(500).json({
    error: 'Internal server error.',
    requestId,
  });
};
