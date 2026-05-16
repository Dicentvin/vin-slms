/**
 * ai.js — Uses Groq API (FREE, fast, Llama 3.3 70B)
 * Get your free key at: https://console.groq.com
 * No credit card required.
 *
 * Drop-in replacement — same exports as before so nothing else changes.
 */

import OpenAI from "openai"; // Groq is OpenAI-compatible, same SDK

const client = new OpenAI({
  apiKey:  process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const MODEL = "llama-3.3-70b-versatile"; // Free, fast, excellent quality

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
  const response = await client.chat.completions.create({
    model:      MODEL,
    temperature: 0.2,
    max_tokens:  maxTokens,
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
"""${text.slice(0, 40000)}"""`;

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
export async function generateQuiz(text, count = 10) {
  const system = `You are an expert quiz generator for Nigerian Senior Secondary School (SS1, SS2, SS3) students.
You create WAEC-style multiple choice questions that test deep understanding.
IMPORTANT: Respond with ONLY a valid JSON array. No markdown, no explanation, no extra text whatsoever.`;

  const user = `Create exactly ${count} multiple-choice questions from the text below.
Each question must have exactly 4 options labelled A, B, C, D.

Return ONLY valid JSON in this exact format with no other text:
[{
  "question": "...",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "correctAnswer": "A. ...",
  "explanation": "Brief explanation of why this answer is correct"
}]

TEXT:
"""${text.slice(0, 40000)}"""`;

  const raw = await generate(system, user, 3500);
  const parsed = parseJSON(raw);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter((q) => q.question && Array.isArray(q.options) && q.correctAnswer)
    .map((q) => ({
      questionText:  String(q.question).trim(),
      options:       q.options.map(String),
      correctAnswer: String(q.correctAnswer).trim(),
      explanation:   String(q.explanation || "").trim(),
    }));
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
"""${text.slice(0, 40000)}"""`;

  return generate(system, user, 1200);
}

// ─────────────────────────────────────────────────────────
// CHAT (RAG-style)
// ─────────────────────────────────────────────────────────
export async function chatWithDocument(chunks, query) {
  const context = chunks
    .slice(0, 6)
    .map((c) => c.content)
    .join("\n\n");

  const system = `You are a friendly and encouraging AI tutor for Nigerian Senior Secondary School students (SS1, SS2, SS3).
You help students understand their study materials clearly and simply.
Answer questions based ONLY on the provided document context.
If the answer is not in the context, say "I couldn't find that in the document, but I can explain the general concept if you'd like."
Keep answers clear and well-structured. Use examples where helpful.`;

  const user = `DOCUMENT CONTEXT:
${context}

STUDENT QUESTION:
${query}`;

  const answer = await generate(system, user, 800);
  return { answer, usedChunks: chunks.slice(0, 6).length };
}

// ─────────────────────────────────────────────────────────
// EXPLAIN CONCEPT
// ─────────────────────────────────────────────────────────
export async function explainConcept(concept, chunks) {
  const context = chunks
    .slice(0, 5)
    .map((c) => c.content)
    .join("\n\n");

  const system = `You are an expert AI tutor for Nigerian Senior Secondary School students.
You explain concepts clearly using simple language, real-world examples, and analogies that Nigerian students can relate to.`;

  const user = `Explain the concept: "${concept}"

Use the document context below as your primary source. Structure your response as:

1. **Simple Definition** — explain in 1-2 simple sentences
2. **Full Explanation** — go deeper
3. **Example** — a real-world example or analogy
4. **Remember This** — 2-3 key bullet points for exam revision

DOCUMENT CONTEXT:
${context}`;

  return generate(system, user, 900);
}
