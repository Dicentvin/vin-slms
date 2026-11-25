/**
 * chapters.js — split a book into chapters so quizzes can be chapter-specific,
 * and pick a small, well-spread sample of text to send to the AI.
 *
 * Chapter detection tries, in order:
 *   1. PDF bookmarks (outline)        → exact titles, best result
 *   2. "Chapter N" headings in text   → works for most textbooks
 *   3. Fixed blocks of pages          → always works (e.g. "Pages 1–20")
 */

// How much text we send to the AI per request. Groq's free tier allows only
// 8,000 tokens per minute (input + output), so keep this small. If you upgrade
// Groq, raise it from Render without touching the code (e.g. AI_MAX_INPUT_CHARS=20000).
export const MAX_INPUT_CHARS = Number(process.env.AI_MAX_INPUT_CHARS) || 8000;

// Most chapters a single quiz can cover (keeps each chapter's share of text useful).
export const MAX_QUIZ_CHAPTERS = 5;

const MAX_CHAPTER_CHARS = 60_000; // stored per chapter
const MIN_CHAPTER_CHARS = 200;    // skip chapters with (almost) no text, e.g. image-only
const BLOCK_PAGES       = 20;

// ── Sampling ────────────────────────────────────────────────────────────────
/**
 * Take `parts` evenly spaced slices from `text` so the sample covers the whole
 * text instead of only its beginning.
 *  skip = fraction of the start to ignore (cover page / contents)
 */
export function sampleText(text, maxChars, { parts = 4, skip = 0 } = {}) {
  if (!text) return "";
  if (text.length <= maxChars) return text;

  const size = Math.max(200, Math.floor(maxChars / parts));
  const from = Math.floor(text.length * skip);
  const span = Math.max(0, Math.floor(text.length) - from - size);
  const step = parts > 1 ? Math.floor(span / (parts - 1)) : 0;

  return Array.from({ length: parts }, (_, i) =>
    text.slice(from + i * step, from + i * step + size)
  ).join("\n...\n");
}

/**
 * Build one text block from several chapters, giving each an equal share of
 * `maxChars`, and label each with a "###" heading.
 *   chapters: [{ title, text }]
 */
export function sampleChapters(chapters, maxChars = MAX_INPUT_CHARS) {
  if (!chapters.length) return "";
  const share = Math.max(500, Math.floor(maxChars / chapters.length));
  return chapters
    .map((c) => {
      const parts = share > 3000 ? 3 : 2;
      return `### ${c.title}\n${sampleText(c.text, share, { parts })}`;
    })
    .join("\n\n");
}

// ── Detection ───────────────────────────────────────────────────────────────
const JUNK_TITLE =
  /^(cover|title page|half title|copyright|contents?|table of contents|preface|foreword|prelims?|acknowledg\w*|dedication|list of \w+|index|bibliography|references|further reading)$/i;

const squash = (s) => String(s || "").replace(/\s+/g, " ").trim();

// Titles from PDFs often contain invisible symbol glyphs (e.g. Wingdings bullets).
const cleanTitle = (s) =>
  squash(String(s || "").replace(/[\uE000-\uF8FF\uFFFD]/g, " "))
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .trim();

/** 1. From PDF bookmarks: [{ title, page (1-based), depth }] */
function rangesFromOutline(outline, totalPages) {
  if (!outline?.length) return null;

  // Group by depth, sort by page, drop entries that land on the same page.
  const byDepth = new Map();
  for (const o of outline) {
    if (!o.title || !(o.page >= 1 && o.page <= totalPages)) continue;
    if (!byDepth.has(o.depth)) byDepth.set(o.depth, []);
    byDepth.get(o.depth).push(o);
  }
  const levels = [...byDepth.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, list]) => {
      const sorted = list.slice().sort((a, b) => a.page - b.page);
      const seen = new Set();
      return sorted.filter((o) => (seen.has(o.page) ? false : (seen.add(o.page), true)));
    });

  // Shallowest level with at least 8 entries (a list of chapters, not of parts);
  // otherwise the deepest level that has at least 2 (small files, e.g. one part of a split book).
  let chosen = levels.find((l) => l.length >= 8);
  if (!chosen) chosen = [...levels].reverse().find((l) => l.length >= 2);
  if (!chosen) return null;

  // Ranges are computed over ALL entries so a removed junk entry still ends the previous chapter.
  const ranges = chosen.map((o, i) => ({
    title: cleanTitle(o.title).replace(/^chapter[\s_-]*0*(\d+)[\s_:.-]*/i, "Chapter $1 — "),
    startPage: o.page,
    endPage: i + 1 < chosen.length ? chosen[i + 1].page - 1 : totalPages,
  }));
  return ranges.filter((r) => !JUNK_TITLE.test(r.title) && r.endPage >= r.startPage);
}

/** 2. From "Chapter 12 ..." headings at the top of pages. */
function rangesFromHeadings(pages) {
  const re = /^(?:\s*\d{1,4}\s+)?(chapter|unit)\s+(\d{1,3}|[ivxl]{1,6})\b[\s:.\-–—]*([^\n]{0,90})/i;
  const found = [];
  let currentKey = null;

  pages.forEach((txt, i) => {
    const head = (txt || "").trimStart().slice(0, 220);
    const m = head.match(re);
    if (!m) return;
    const key = `${m[1].toLowerCase()} ${m[2].toLowerCase()}`;
    if (key === currentKey) return; // running header on following pages — same chapter
    currentKey = key;
    const rest = cleanTitle(m[3]).replace(/\s*\d{1,4}$/, ""); // drop trailing page number
    const label = `${m[1][0].toUpperCase()}${m[1].slice(1).toLowerCase()} ${m[2]}`;
    found.push({ title: rest ? `${label} — ${rest}` : label, startPage: i + 1 });
  });

  if (found.length < 3) return null;
  return found.map((f, i) => ({
    ...f,
    endPage: i + 1 < found.length ? found[i + 1].startPage - 1 : pages.length,
  }));
}

/** 3. Fixed blocks of pages. */
function rangesFromBlocks(totalPages) {
  const out = [];
  for (let s = 1; s <= totalPages; s += BLOCK_PAGES) {
    const e = Math.min(s + BLOCK_PAGES - 1, totalPages);
    out.push({ title: `Pages ${s}–${e}`, startPage: s, endPage: e });
  }
  return out;
}

/**
 * Main entry point.
 *   extracted: result of extractTextFromFile — needs `pages` (array of page texts)
 *              and optionally `outline` ([{ title, page, depth }]).
 * Returns { source, chapters: [{ index, title, startPage, endPage, text }] }
 */
export function buildChapters(extracted) {
  const pages = extracted?.pages;
  if (!Array.isArray(pages) || pages.length < 2) return { source: "none", chapters: [] };

  let source = "outline";
  let ranges = rangesFromOutline(extracted.outline, pages.length);
  if (!ranges?.length) { source = "headings"; ranges = rangesFromHeadings(pages); }
  if (!ranges?.length) { source = "blocks";   ranges = rangesFromBlocks(pages.length); }

  const chapters = [];
  for (const r of ranges) {
    const raw = squash(pages.slice(r.startPage - 1, r.endPage).join("\n"));
    if (raw.length < MIN_CHAPTER_CHARS) continue;
    const text = raw.length > MAX_CHAPTER_CHARS
      ? sampleText(raw, MAX_CHAPTER_CHARS, { parts: 6 })
      : raw;
    chapters.push({
      index:     chapters.length,
      title:     r.title.slice(0, 120),
      startPage: r.startPage,
      endPage:   r.endPage,
      text,
    });
  }

  // Nothing usable (e.g. every chapter had no text) → no chapter mode.
  if (!chapters.length) return { source: "none", chapters: [] };
  return { source, chapters };
}
