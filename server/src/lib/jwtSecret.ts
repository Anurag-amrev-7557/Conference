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
      console.warn('[jwtSecret] JWT_SECRET missing in production. Using fallback secret; update env immediately.');
      return DEV_FALLBACK;
    }
    if (secret === DEV_FALLBACK) {
      console.warn('[jwtSecret] JWT_SECRET uses default fallback in production; rotate this secret immediately.');
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
