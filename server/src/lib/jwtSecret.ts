const DEV_FALLBACK = 'supersecret';

let devWarningLogged = false;

function failProduction(message: string): never {
  console.error(`[jwtSecret] ${message}`);
  process.exit(1);
}

/**
 * Resolves JWT signing secret with production fail-fast (SEC-01).
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    if (!secret) {
      failProduction('JWT_SECRET is required in production. Refusing to start.');
    }
    if (secret === DEV_FALLBACK) {
      failProduction('JWT_SECRET must not use the default fallback in production.');
    }
    return secret;
  }

  if (!secret) {
    if (!devWarningLogged) {
      console.warn(
        '[jwtSecret] JWT_SECRET is unset in development; using fallback. Set JWT_SECRET before production deploy.',
      );
      devWarningLogged = true;
    }
    return DEV_FALLBACK;
  }

  return secret;
}
