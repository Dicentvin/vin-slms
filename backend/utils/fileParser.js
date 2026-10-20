/**
 * fileParser.js
 *
 * PDF   → pdf-parse        (pure Node, no system deps)
 * DOCX  → mammoth          (pure Node, no system deps)
 * DOC   → mammoth          (pure Node, no system deps)
 * PPTX  → adm-zip + XML    (pure Node, no system deps)
 * PPT   → basic text extract via adm-zip fallback
 *
 * NO Java, NO LibreOffice, NO system dependencies required.
 * Works on Windows, Mac, Linux out of the box.
 */

import fs   from "fs";
import path from "path";
import { createRequire } from "module";

const require   = createRequire(import.meta.url);
const MAX_CHARS = 400_000;

// ── Load packages once at startup ────────────────────────────────────────────
let pdfParse, pdfjs, mammoth, AdmZip;

try {
  // Import the library file directly. The package's index.js tries to read a test PDF
  // when it thinks it is being run directly, which crashes every PDF upload in some hosts.
  pdfParse = require("pdf-parse/lib/pdf-parse.js");
  console.log("✅ pdf-parse loaded");
} catch {
  console.error("❌ pdf-parse not found — run: npm install pdf-parse");
}

try {
  // Modern PDF engine — reads PDFs that the old pdf-parse engine rejects ("bad XRef entry", etc.)
  pdfjs = require("pdfjs-dist/legacy/build/pdf.js");
  console.log("✅ pdfjs-dist loaded");
} catch {
  console.warn("⚠️  pdfjs-dist not found — falling back to pdf-parse only. Run: npm install");
}

try {
  mammoth = require("mammoth");
  console.log("✅ mammoth loaded");
} catch {
  console.error("❌ mammoth not found — run: npm install mammoth");
}

try {
  AdmZip = require("adm-zip");
  console.log("✅ adm-zip loaded");
} catch {
  console.error("❌ adm-zip not found — run: npm install adm-zip");
}

// ── Public entry point ────────────────────────────────────────────────────────
export async function extractTextFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".pdf":  return parsePdf(filePath);
    case ".docx":
    case ".doc":  return parseDocx(filePath, ext);
    case ".pptx": return parsePptx(filePath);
    case ".ppt":  return parsePpt(filePath);
    default:
      throw new Error(
        `Unsupported file type: "${ext}". Allowed: .pdf .ppt .pptx .doc .docx`
      );
  }
}

// ── PDF ───────────────────────────────────────────────────────────────────────
async function parsePdfWithPdfjs(buffer) {
  const doc = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    disableFontFace: true,
    verbosity: 0,
  }).promise;

  let text = "";
  try {
    for (let i = 1; i <= doc.numPages; i++) {
      const page    = await doc.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(it => it.str + (it.hasEOL ? "\n" : " ")).join("") + "\n";
      page.cleanup();
    }
    return { text, numPages: doc.numPages };
  } finally {
    doc.destroy();
  }
}

async function parsePdf(filePath) {
  const buffer = fs.readFileSync(filePath);
  let result = null, firstErr = null;

  if (pdfjs) {
    try { result = await parsePdfWithPdfjs(buffer); }
    catch (err) { firstErr = err; }
  }
  if (!result && pdfParse) {
    try {
      const data = await pdfParse(buffer);
      result = { text: data.text || "", numPages: data.numpages || 0 };
    } catch (err) { firstErr = firstErr || err; }
  }
  if (!result) {
    const why = firstErr?.message || "no PDF reader installed";
    if (/password/i.test(why)) throw new Error("This PDF is password-protected. Remove the password and upload again.");
    throw new Error(`PDF parsing failed: ${why}`);
  }

  const text = result.text.replace(/\s+/g, " ").trim();
  if (!text) throw new Error("This PDF has no readable text (may be image-only/scanned).");

  return { text: text.slice(0, MAX_CHARS), numPages: result.numPages, fileType: "pdf" };
}

// ── DOCX / DOC ────────────────────────────────────────────────────────────────
async function parseDocx(filePath, ext) {
  if (!mammoth) throw new Error("mammoth not installed. Run: npm install mammoth");

  let result;
  try {
    result = await mammoth.extractRawText({ path: filePath });
  } catch (err) {
    if (ext === ".doc") {
      throw new Error("Old .doc files are not supported. Open it in Word, choose Save As → .docx, and upload again.");
    }
    throw new Error(`Word document parsing failed: ${err.message}. Make sure the file is not password-protected.`);
  }

  const text = (result.value || "").replace(/\s+/g, " ").trim();
  if (!text) throw new Error("This Word document contains no readable text.");

  return {
    text:     text.slice(0, MAX_CHARS),
    numPages: 0,
    fileType: ext.replace(".", ""),
  };
}

// ── PPTX ─────────────────────────────────────────────────────────────────────
// PPTX files are ZIP archives. Each slide is an XML file at ppt/slides/slideN.xml
// We unzip, parse the XML, extract all <a:t> text nodes.
async function parsePptx(filePath) {
  if (!AdmZip) throw new Error("adm-zip not installed. Run: npm install adm-zip");

  let zip;
  try {
    zip = new AdmZip(filePath);
  } catch (err) {
    throw new Error(`Could not open PPTX file: ${err.message}. Make sure the file is not corrupted.`);
  }

  const entries = zip.getEntries();

  // Collect slide XML files in order: ppt/slides/slide1.xml, slide2.xml, ...
  const slideEntries = entries
    .filter(e => e.entryName.match(/^ppt\/slides\/slide\d+\.xml$/))
    .sort((a, b) => {
      const numA = parseInt(a.entryName.match(/\d+/)?.[0] || "0");
      const numB = parseInt(b.entryName.match(/\d+/)?.[0] || "0");
      return numA - numB;
    });

  if (slideEntries.length === 0) {
    throw new Error("No slides found in PPTX file. The file may be corrupted.");
  }

  const slideTexts = [];

  for (const entry of slideEntries) {
    const xml = entry.getData().toString("utf8");
    // Extract all text from <a:t>...</a:t> tags
    const matches = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || [];
    const slideText = matches
      .map(m => m.replace(/<[^>]+>/g, ""))
      .filter(t => t.trim())
      .join(" ");
    if (slideText.trim()) slideTexts.push(slideText.trim());
  }

  const text = slideTexts.join("\n\n").replace(/\s+/g, " ").trim();
  if (!text) throw new Error("This PowerPoint file contains no readable text.");

  return {
    text:     text.slice(0, MAX_CHARS),
    numPages: slideEntries.length,
    fileType: "pptx",
  };
}

// ── PPT (legacy binary format) ────────────────────────────────────────────────
// Old binary .ppt: best-effort extraction of the readable text stored inside the file.
async function parsePpt(filePath) {
  const buffer = fs.readFileSync(filePath);

  // Legacy .ppt stores slide text either as 8-bit text or UTF-16LE. Collect both kinds of runs.
  const latin = buffer.toString("latin1");
  const runs  = [];
  for (const m of latin.matchAll(/(?:[\x20-\x7E]\x00){4,}/g)) {        // UTF-16LE (ASCII range)
    runs.push({ i: m.index, s: m[0].replace(/\x00/g, "") });
  }
  for (const m of latin.matchAll(/[\x20-\x7E]{6,}/g)) {                 // plain 8-bit runs
    runs.push({ i: m.index, s: m[0] });
  }
  runs.sort((x, y) => x.i - y.i);

  const seen = new Set();
  const text = runs
    .map(r => r.s.trim())
    .filter(t => {
      const letters = t.replace(/[^a-zA-Z]/g, "").length;
      if (letters / t.length < 0.6 || !t.includes(" ") && t.length < 8) return false;   // skip binary noise
      if (/^(Arial|Calibri|Times|Courier|Tahoma|Verdana|Wingdings|Symbol|Default Design|Click to edit)/i.test(t)) return false;
      if (seen.has(t)) return false;
      seen.add(t);
      return true;
    })
    .join("\n")
    .replace(/\s+/g, " ")
    .trim();

  if (!text || text.length < 50) {
    throw new Error(
      "Could not read text from this .ppt file. Open it in PowerPoint, choose Save As → .pptx, and upload again."
    );
  }
  return { text: text.slice(0, MAX_CHARS), numPages: 0, fileType: "ppt" };
}
