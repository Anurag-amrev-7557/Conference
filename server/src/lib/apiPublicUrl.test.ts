import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { getApiPublicUrl, publicAssetUrl } from './apiPublicUrl';

describe('apiPublicUrl', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env, NODE_ENV: 'development' };
    delete process.env.API_PUBLIC_URL;
    process.env.PORT = '3001';
  });

  afterEach(() => {
    process.env = env;
  });

  it('returns API_PUBLIC_URL when set', () => {
    process.env.API_PUBLIC_URL = 'https://api.example.com/';
    expect(getApiPublicUrl()).toBe('https://api.example.com');
    expect(publicAssetUrl('/media/x.jpg')).toBe('https://api.example.com/media/x.jpg');
  });

  it('defaults to localhost in development', () => {
    expect(getApiPublicUrl()).toBe('http://localhost:3001');
  });

  it('throws in production without API_PUBLIC_URL', () => {
    process.env.NODE_ENV = 'production';
    expect(() => getApiPublicUrl()).toThrow(/API_PUBLIC_URL/);
  });
});
