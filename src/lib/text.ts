export function plain(value: string): string {
  return (value || "").replace(/<[^>]*>/g, "");
}

const ALLOWED_TAGS = /<\/?(strong|b|em|i|span|br|mark|u)(\s+class="[^"]*")?\s*\/?>/gi;

/**
 * Safely renders rich text for headings and content highlights by allowing only
 * safe inline tags (strong, b, em, i, span, br, mark, u) and stripping scripts/unsafe tags.
 */
export function renderRichText(value: string): string {
  if (!value) return "";
  // Escape angle brackets of non-whitelisted tags
  const tokens: string[] = [];
  let lastIndex = 0;

  value.replace(ALLOWED_TAGS, (match, _tagName, _classAttr, offset) => {
    // text before the matched tag
    const prefix = value.slice(lastIndex, offset);
    tokens.push(escapeHtml(prefix));
    tokens.push(match);
    lastIndex = offset + match.length;
    return match;
  });

  const remainder = value.slice(lastIndex);
  tokens.push(escapeHtml(remainder));

  return tokens.join("");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
