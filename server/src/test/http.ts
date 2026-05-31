import type { Server } from 'http';
import { app } from '../index';

let server: Server | null = null;
let baseUrl = '';

export async function startTestServer(): Promise<string> {
  if (baseUrl) return baseUrl;

  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server?.address();
      const port = typeof addr === 'object' && addr && 'port' in addr ? addr.port : 0;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  return baseUrl;
}

export async function stopTestServer(): Promise<void> {
  if (!server) return;
  await new Promise<void>((resolve, reject) => {
    server!.close((err) => (err ? reject(err) : resolve()));
  });
  server = null;
  baseUrl = '';
}

export async function requestJson(
  path: string,
  init: RequestInit = {},
): Promise<{ status: number; data: Record<string, unknown> }> {
  const url = `${await startTestServer()}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { status: res.status, data };
}
