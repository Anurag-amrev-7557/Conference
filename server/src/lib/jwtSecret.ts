const DEV_FALLBACK = 'supersecret';

let devWarningLogged = false;

/**
 * Resolves JWT signing secret with production fail-fast (SEC-01).
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    if (!secret) {
      throw new Error('JWT_SECRET must be set when NODE_ENV=production');
    }
    if (secret === DEV_FALLBACK) {
      throw new Error('JWT_SECRET cannot be the default development value in production');
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
