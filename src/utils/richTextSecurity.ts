import DOMPurify from 'dompurify';

const SAFE_RICH_TEXT_URI_PATTERN = /^(?:(?:https?|mailto|tel):|\/|#)/i;

export const isSafeRichTextUrl = (value: string) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return false;
  }

  try {
    const parsedUrl = new URL(trimmedValue, window.location.origin);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

export const sanitizeRichTextHtml = (html: string) =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'b',
      'em',
      'i',
      's',
      'blockquote',
      'ul',
      'ol',
      'li',
      'a',
      'img',
      'h1',
      'h2',
      'h3',
      'code',
      'pre',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel'],
    ALLOWED_URI_REGEXP: SAFE_RICH_TEXT_URI_PATTERN,
    FORBID_ATTR: ['style'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
  });
