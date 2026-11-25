/**
 * ai.js — Uses the Groq API (OpenAI-compatible).
 * Get a key at: https://console.groq.com  → set GROQ_API_KEY on Render.
 * Model can be changed without code: set GROQ_MODEL on Render.
 */

import OpenAI from "openai"; // Groq is OpenAI-compatible, same SDK
import { sampleText, MAX_INPUT_CHARS } from "./chapters.js";

const client = new OpenAI({
  apiKey:  process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

// ── Helper: parse JSON safely ─────────────────────────────
function parseJSON(raw) {
  if (!raw) return null;
  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const m = cleaned.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (m) { try { return JSON.parse(m[1]); } catch {} }
    return null;
  }
}

// ── Core generate helper ──────────────────────────────────
async function generate(systemPrompt, userPrompt, maxTokens = 2048) {
  // gpt-oss models "think" before answering and that thinking counts toward
  // max_tokens, so give them a little extra room and keep the thinking short.
  const reasoning = MODEL.startsWith("openai/gpt-oss");
  const response = await client.chat.completions.create({
    model:       MODEL,
    temperature: 0.2,
    max_tokens:  reasoning ? maxTokens + 1000 : maxTokens,
    ...(reasoning ? { reasoning_effort: "low" } : {}),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt },
    ],
  });
  return response.choices[0]?.message?.content?.trim() ?? "";
}

// ─────────────────────────────────────────────────────────
// FLASHCARDS
// ─────────────────────────────────────────────────────────
export async function generateFlashcards(text, count = 20) {
  const system = `You are an expert study assistant for Nigerian Senior Secondary School students (SS1, SS2, SS3).
You create clear, accurate flashcards that help students understand and remember key concepts.
IMPORTANT: Respond with ONLY a valid JSON array. No markdown, no explanation, no extra text whatsoever.`;

  const user = `Create exactly ${count} flashcards from the text below.
Each flashcard should test one clear concept.

Return ONLY valid JSON in this exact format with no other text:
[{"question":"...","answer":"..."}]

TEXT:
"""${sampleText(text, MAX_INPUT_CHARS, { skip: 0.05 })}"""`;

  const raw = await generate(system, user, 3000);
  const parsed = parseJSON(raw);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter((f) => f.question && f.answer)
    .map((f) => ({
      question: String(f.question).trim(),
      answer:   String(f.answer).trim(),
    }));
}

// ─────────────────────────────────────────────────────────
// QUIZ
// ─────────────────────────────────────────────────────────
export async function generateQuiz(text, count = 10, { chapterNames = [] } = {}) {
  const system = `You are an expert quiz generator for students.
You write clear multiple-choice questions that test real understanding of the text, at the level and in the style of the text itself (for example exam-style questions for school content, or clinical/exam-style questions for medical content).
IMPORTANT: Respond with ONLY a valid JSON array. No markdown, no explanation, no extra text whatsoever.`;

  // Chapter quizzes arrive already sampled (and labelled with ### headings).
  const body  = chapterNames.length ? text : sampleText(text, MAX_INPUT_CHARS, { skip: 0.05 });
  const multi = chapterNames.length > 1
    ? `The text comes from ${chapterNames.length} chapters, each starting with a "###" heading. Spread the questions evenly across all the chapters.\n`
    : "";

  const user = `Create exactly ${count} multiple-choice questions from the text below.
${multi}Each question must have exactly 4 options labelled A, B, C, D.
Only ask about facts and ideas that are actually in the text.

Return ONLY valid JSON in this exact format with no other text:
[{
  "question": "...",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "correctAnswer": "A. ...",
  "explanation": "Brief explanation of why this answer is correct"
}]

TEXT:
"""${body}"""`;

  const raw = await generate(system, user, 3500);
  const parsed = parseJSON(raw);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter((q) => q.question && Array.isArray(q.options) && q.options.length >= 2 && q.correctAnswer)
    .map((q) => {
      const options = q.options.map((o) => String(o).trim());
      let correct = String(q.correctAnswer).trim();
      // The app compares the chosen option with correctAnswer as exact text, so make
      // sure they match even if the model answered with just a letter ("B" / "B.").
      if (!options.includes(correct)) {
        const letter = correct.match(/^([A-D])\b/i)?.[1]?.toUpperCase();
        const hit = letter && options.find((o) => o.toUpperCase().startsWith(letter + "."));
        if (hit) correct = hit;
      }
      return {
        questionText:  String(q.question).trim(),
        options,
        correctAnswer: correct,
        explanation:   String(q.explanation || "").trim(),
      };
    })
    .filter((q) => q.options.includes(q.correctAnswer));
}

// ─────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────
export async function summarizeText(text) {
  const system = `You are an expert study assistant for Nigerian Senior Secondary School students.
You write clear, well-structured summaries using simple language appropriate for SS1-SS3 students.`;

  const user = `Summarize the following document clearly. Structure your response as:

**Overview**
(1 paragraph overview)

**Key Concepts**
(bullet points of the main concepts and definitions)

**Important Facts**
(bullet points of facts students must remember)

**Conclusion**
(1 sentence wrap-up)

TEXT:
"""${sampleText(text, MAX_INPUT_CHARS, { skip: 0.05 })}"""`;

  return generate(system, user, 1200);
}

// ─────────────────────────────────────────────────────────
// CHAT (RAG-style)
// ─────────────────────────────────────────────────────────
export async function chatWithDocument(passages, query, { outline = null } = {}) {
  // passages: [{ content, label }] picked by utils/retrieval.js (label = chapter + pages)
  const context = passages
    .map((p) => (p.label ? `[${p.label}]\n${p.content}` : p.content))
    .join("\n\n");

  const system = `You are a friendly and encouraging AI tutor.
You help students understand their study materials clearly.
Answer questions based ONLY on the provided document context. The passages come from different parts of the document and are labelled with their chapter and pages; mention the chapter when it helps the student find the topic.
If the answer is not in the context, say "I couldn't find that in the document, but I can explain the general concept if you'd like."
Keep answers clear and well-structured. Use examples where helpful.`;

  const user = `${outline ? outline + "\n\n" : ""}DOCUMENT CONTEXT:\n${context}\n\nSTUDENT QUESTION:\n${query}`;

  const answer = await generate(system, user, 800);
  return { answer, usedChunks: passages.length };
}

// ─────────────────────────────────────────────────────────
// EXPLAIN CONCEPT
// ─────────────────────────────────────────────────────────
export async function explainConcept(concept, passages, { outline = null } = {}) {
  const context = passages
    .map((p) => (p.label ? `[${p.label}]\n${p.content}` : p.content))
    .join("\n\n");

  const system = `You are an expert AI tutor.
You explain concepts clearly using simple language, real-world examples, and analogies, at the level of the study material.`;

  const user = `Explain the concept: "${concept}"

Use the document context below as your primary source (passages are labelled with their chapter). Structure your response as:

1. **Simple Definition** — explain in 1-2 simple sentences
2. **Full Explanation** — go deeper
3. **Example** — a real-world example or analogy
4. **Remember This** — 2-3 key bullet points for exam revision

${outline ? outline + "\n\n" : ""}DOCUMENT CONTEXT:
${context}`;

  return generate(system, user, 900);
}
