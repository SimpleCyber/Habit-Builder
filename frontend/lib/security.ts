/**
 * Security & Sanitization Utilities
 * Protects against XSS, input bloat, script injection, and invalid schemes.
 */

/**
 * Strips HTML tags and dangerous characters from user input strings
 */
export function sanitizeText(input: unknown, maxLength = 1000): string {
  if (typeof input !== "string") {
    return "";
  }

  // 1. Trim whitespace
  let clean = input.trim();

  // 2. Truncate if exceeds maximum length to protect against buffer/memory exhaustion
  if (clean.length > maxLength) {
    clean = clean.slice(0, maxLength);
  }

  // 3. Remove script tags and html tags
  clean = clean
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<\/?[^>]+(>|$)/g, "")
    // Strip control characters (except newline \n and tab \t)
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g, "");

  return clean;
}

/**
 * Validates that an image string is either a valid HTTPS URL or safe base64 data URI
 */
export function validateImageUrl(url: unknown): boolean {
  if (typeof url !== "string") return false;

  const trimmed = url.trim();

  // Allow standard http/https image URLs
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    try {
      const parsed = new URL(trimmed);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  // Allow safe base64 image data URIs (PNG, JPEG, WEBP, GIF)
  if (trimmed.startsWith("data:image/")) {
    const headerEnd = trimmed.indexOf(";base64,");
    if (headerEnd !== -1) {
      const mime = trimmed.slice(11, headerEnd).toLowerCase();
      const allowedMimes = ["png", "jpeg", "jpg", "webp", "gif", "avif"];
      return allowedMimes.includes(mime);
    }
  }

  return false;
}

/**
 * Validates request origin against allowed host or same-origin
 */
export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin) {
    const referer = request.headers.get("referer");
    if (!referer) return true;
    try {
      const refUrl = new URL(referer);
      return refUrl.host === host;
    } catch {
      return false;
    }
  }

  try {
    const originUrl = new URL(origin);
    if (originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1") {
      return true;
    }
    return originUrl.host === host;
  } catch {
    return false;
  }
}
