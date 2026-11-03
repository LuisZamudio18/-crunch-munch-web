/**
 * The structured data is written inside a <script>, and the bars, descriptions and questions in it are texts she edits: a "<" in
 * one (a "</script>", say) must not be able to close the tag, so it is written as its JSON escape (the same text, read the same by Google).
 */
const BACKSLASH = String.fromCharCode(92);
const LINE_SEPARATOR = new RegExp(String.fromCharCode(0x2028), 'g');
const PARAGRAPH_SEPARATOR = new RegExp(String.fromCharCode(0x2029), 'g');

export function jsonLdText(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, `${BACKSLASH}u003c`)
    .replace(LINE_SEPARATOR, `${BACKSLASH}u2028`)
    .replace(PARAGRAPH_SEPARATOR, `${BACKSLASH}u2029`);
}
