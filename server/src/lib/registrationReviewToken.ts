import jwt from 'jsonwebtoken';
import { getJwtSecret } from './jwtSecret';

export type RegistrationReviewAction = 'confirm' | 'cancel';

type ReviewPayload = {
  sub: string;
  action: RegistrationReviewAction;
  purpose: 'registration-review';
};

export function signRegistrationReviewToken(
  registrationId: string,
  action: RegistrationReviewAction,
): string {
  return jwt.sign(
    { sub: registrationId, action, purpose: 'registration-review' } satisfies ReviewPayload,
    getJwtSecret(),
    { expiresIn: '7d' },
  );
}

export function verifyRegistrationReviewToken(token: string): ReviewPayload {
  const decoded = jwt.verify(token, getJwtSecret()) as ReviewPayload;
  if (decoded.purpose !== 'registration-review' || !decoded.sub || !decoded.action) {
    throw new Error('Invalid review token');
  }
  if (decoded.action !== 'confirm' && decoded.action !== 'cancel') {
    throw new Error('Invalid review action');
  }
  return decoded;
}
