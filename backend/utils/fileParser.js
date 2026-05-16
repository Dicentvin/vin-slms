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
let pdfParse, mammoth, AdmZip;

try {
  pdfParse = require("pdf-parse");
  console.log("✅ pdf-parse loaded");
} catch {
  console.error("❌ pdf-parse not found — run: npm install pdf-parse");
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
async function parsePdf(filePath) {
  if (!pdfParse) throw new Error("pdf-parse not installed. Run: npm install pdf-parse");

  const buffer = fs.readFileSync(filePath);
  let data;
  try {
    data = await pdfParse(buffer);
  } catch (err) {
    throw new Error(`PDF parsing failed: ${err.message}`);
  }

  const text = (data.text || "").replace(/\s+/g, " ").trim();
  if (!text) throw new Error("This PDF has no readable text (may be image-only/scanned).");

  return { text: text.slice(0, MAX_CHARS), numPages: data.numpages || 0, fileType: "pdf" };
}

// ── DOCX / DOC ────────────────────────────────────────────────────────────────
async function parseDocx(filePath, ext) {
  if (!mammoth) throw new Error("mammoth not installed. Run: npm install mammoth");

  let result;
  try {
    result = await mammoth.extractRawText({ path: filePath });
  } catch (err) {
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
// The old binary .ppt format is very hard to parse in pure Node.
// We do a best-effort extraction of readable ASCII strings from the binary.
async function parsePpt(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);

    // Extract readable ASCII strings of 4+ chars from the binary
    // This is a heuristic — it won't be perfect but captures most slide text
    const text = buffer
      .toString("binary")
      .match(/[\x20-\x7E]{4,}/g)            // printable ASCII runs of 4+ chars
      ?.filter(s => {
        // Filter out binary garbage — keep strings that look like real words
        const wordChars = s.replace(/[^a-zA-Z\s]/g, "").length;
        return wordChars / s.length > 0.5 && s.trim().length > 3;
      })
      .join(" ")
      .replace(/\s+/g, " ")
      .trim() ?? "";

    if (!text || text.length < 50) {
      throw new Error(
        "Could not extract readable text from this .ppt file. " +
        "Please convert it to .pptx format (save as PPTX in PowerPoint) and upload again."
      );
    }

    return {
      text:     text.slice(0, MAX_CHARS),
      numPages: 0,
      fileType: "ppt",
    };
  } catch (err) {
    if (err.message.includes("convert")) throw err;
    throw new Error(
      "Legacy .ppt files have limited support. " +
      "Please convert to .pptx format and upload again."
    );
  }
}
