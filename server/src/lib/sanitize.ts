import DOMPurify from 'isomorphic-dompurify';

const ARTICLE_ALLOWED_TAGS = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'a',
  'img',
  'ul',
  'ol',
  'li',
  'code',
  'pre',
  'blockquote',
  'strong',
  'em',
  'br',
];

export function sanitizeArticleHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ARTICLE_ALLOWED_TAGS,
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
    FORBID_TAGS: ['script', 'iframe'],
  });
}

/** Plain-text community fields — strip angle-bracket tags (D-08). */
export function stripCommunityText(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}

export type CustomCssValidation =
  | { ok: true }
  | { ok: false; field: 'settings.customCss'; message: string };

export function validateCustomCss(css: unknown): CustomCssValidation {
  if (css === undefined || css === null) {
    return { ok: true };
  }
  if (typeof css !== 'string') {
    return { ok: false, field: 'settings.customCss', message: 'customCss must be a string' };
  }
  const lower = css.toLowerCase();
  if (/<script/i.test(css) || /javascript:/i.test(lower) || /expression\s*\(/i.test(lower)) {
    return {
      ok: false,
      field: 'settings.customCss',
      message: 'customCss contains disallowed script or expression patterns',
    };
  }
  return { ok: true };
}

export type ScriptsValidation =
  | { ok: true }
  | { ok: false; field: string; message: string };

/** Reject obviously dangerous patterns in admin-injected script HTML. */
export function validateInjectedScripts(html: unknown, field: string): ScriptsValidation {
  if (html === undefined || html === null || html === '') {
    return { ok: true };
  }
  if (typeof html !== 'string') {
    return { ok: false, field, message: 'Scripts must be a string' };
  }
  const lower = html.toLowerCase();
  if (/javascript:/i.test(lower) || /on\w+\s*=/i.test(html) || /<iframe/i.test(lower)) {
    return { ok: false, field, message: 'Scripts contain disallowed patterns (javascript: URLs, event handlers, iframes)' };
  }
  return { ok: true };
}
