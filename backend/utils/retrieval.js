/**
 * retrieval.js — find the passages of a book that are relevant to a question,
 * so the AI answers from the right part of the book instead of its first page.
 *
 *   getRelevantContext(doc, "what does the placenta do?")
 *     → { passages: [{ content, label }], outline: "Chapters in this document: ..." | null }
 *
 * How it works:
 *   1. Every chapter's text is cut into ~1200-character passages.
 *   2. Passages are ranked against the question with BM25 (keyword relevance).
 *   3. If the question names a chapter ("explain chapter 4") only that chapter is searched.
 *   4. For broad questions ("what is this book about?") we send the chapter list plus
 *      passages spread evenly across the book.
 */

import DocumentChapter from "../models/DocumentChapter.js";
import { splitTextIntoChunks } from "./chunker.js";
import { MAX_INPUT_CHARS } from "./chapters.js";

const STOP = new Set((
  "the and for are but not you your with this that from have has had was were will would can could " +
  "what which who whom whose when where why how does did doing done about into onto out over under " +
  "than then them they their there these those its it's his her she him our ours also any all some " +
  "such only own same too very just should now give tell please explain describe define discuss " +
  "mean means meaning between each other more most many much being been both few off once while"
).split(" "));

// Light stemming so "arteries" ≈ "artery", and "diagnosed" ≈ "diagnosis" ≈ "diagnostic"
// (long words are cut to their first 6 letters — crude, but works well on textbook vocabulary).
function stem(w) {
  if (w.length > 5 && w.endsWith("ies")) w = w.slice(0, -3) + "y";
  else if (w.length > 4 && w.endsWith("es")) w = w.slice(0, -2);
  else if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) w = w.slice(0, -1);
  return w.length > 6 ? w.slice(0, 6) : w;
}

export function tokenize(text) {
  return (String(text || "").toLowerCase().match(/[a-z0-9]{3,}/g) || [])
    .filter((w) => !STOP.has(w))
    .map(stem);
}

/** Rank passages against a query with BM25. Returns [{ passage, score }] best first. */
export function rankPassages(passages, query) {
  const qTerms = [...new Set(tokenize(query))];
  if (!qTerms.length || !passages.length) return passages.map((p) => ({ passage: p, score: 0 }));

  const docs = passages.map((p) => {
    const tf = new Map();
    const toks = tokenize(p.scoreText ?? p.content);
    for (const t of toks) tf.set(t, (tf.get(t) || 0) + 1);
    return { tf, len: toks.length || 1 };
  });
  const avgLen = docs.reduce((a, d) => a + d.len, 0) / docs.length;
  const N = docs.length;
  const df = new Map(qTerms.map((t) => [t, docs.reduce((n, d) => n + (d.tf.has(t) ? 1 : 0), 0)]));

  const k1 = 1.4, b = 0.75;
  return passages
    .map((passage, i) => {
      const d = docs[i];
      let score = 0;
      for (const t of qTerms) {
        const f = d.tf.get(t);
        if (!f) continue;
        const idf = Math.log(1 + (N - df.get(t) + 0.5) / (df.get(t) + 0.5));
        score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * d.len) / avgLen)));
      }
      return { passage, score };
    })
    .sort((a, b2) => b2.score - a.score);
}

/** n passages spread evenly across the list (for broad questions). */
function spread(passages, n) {
  if (passages.length <= n) return passages;
  const step = (passages.length - 1) / (n - 1);
  return Array.from({ length: n }, (_, i) => passages[Math.round(i * step)]);
}

/** "chapter 4", "ch 4", "chapter four" → the chapters whose title starts with that number. */
const WORDS = { one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,
                eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,
                eighteen:18,nineteen:19,twenty:20 };
function chapterNumbersIn(query) {
  const out = new Set();
  const re = /\b(?:chapters?|ch\.?)\s*(\d{1,3}|[a-z]+)(?:\s*(?:and|&|,|-|to)\s*(\d{1,3}))?/gi;
  let m;
  while ((m = re.exec(query))) {
    const a = /^\d+$/.test(m[1]) ? Number(m[1]) : WORDS[m[1].toLowerCase()];
    if (!a) continue;
    out.add(a);
    if (m[2]) out.add(Number(m[2]));
  }
  return out;
}
function titleNumber(title) {
  const m = String(title).match(/^chapter\s+(\d{1,3})\b/i);
  return m ? Number(m[1]) : null;
}

const BROAD = /\b(chapters?|contents?|table of contents|topics?|overview|structure|syllabus|about this|what is this|summar\w*|main (?:points|concepts|ideas)|key points|important facts)\b/i;

function buildOutline(chapters) {
  if (!chapters.length) return null;
  const lines = chapters.slice(0, 80).map(
    (c) => `- ${c.title} (pp. ${c.startPage}–${c.endPage})`
  );
  return `Chapters in this document:\n${lines.join("\n")}`;
}

/**
 * doc     : the Document (needs _id and optionally chunks[])
 * query   : the question or concept
 * opts.topK         how many passages to return
 * opts.loadChapters injectable loader, for tests
 */
export async function getRelevantContext(doc, query, opts = {}) {
  const topK = opts.topK ?? Math.min(20, Math.max(4, Math.floor(MAX_INPUT_CHARS / 1300)));
  const load = opts.loadChapters ?? ((id) =>
    DocumentChapter.find({ documentId: id }).sort({ index: 1 }).lean());

  let chapters = [];
  try { chapters = await load(doc._id); } catch { /* fall back to stored chunks */ }

  // Build the pool of passages
  let pool;
  if (chapters.length) {
    pool = chapters.flatMap((c) =>
      splitTextIntoChunks(c.text, 1200, 100).map((ch) => ({
        content: ch.content,
        scoreText: `${c.title} ${c.title} ${ch.content}`,   // title counts double
        label: `${c.title}, pp. ${c.startPage}–${c.endPage}`,
        chapterNo: titleNumber(c.title),
        chapterIndex: c.index,
      }))
    );
  } else {
    pool = (doc.chunks || []).map((c) => ({ content: c.content, label: "", chapterNo: null, chapterIndex: -1 }));
  }
  if (!pool.length) return { passages: [], outline: null };

  // "explain chapter 4" → only search chapter 4
  const asked = chapterNumbersIn(query);
  if (asked.size) {
    const narrowed = pool.filter((p) => p.chapterNo != null && asked.has(p.chapterNo));
    if (narrowed.length) pool = narrowed;
  }

  const ranked = rankPassages(pool, query);
  const best = ranked[0]?.score ?? 0;
  const broad = BROAD.test(query);

  let picked;
  if (best <= 0 || (broad && !asked.size)) {
    // Nothing matches by keyword, or the question is about the book as a whole.
    picked = spread(pool, topK);
  } else {
    picked = ranked.slice(0, topK).map((r) => r.passage);
    // read in book order so the passages make sense together
    picked.sort((a, b) => (a.chapterIndex - b.chapterIndex) || pool.indexOf(a) - pool.indexOf(b));
  }

  const wantsOutline = chapters.length > 0 && (broad || best <= 0 || asked.size > 0);
  return {
    passages: picked.map((p) => ({ content: p.content, label: p.label })),
    outline: wantsOutline ? buildOutline(chapters) : null,
  };
}
