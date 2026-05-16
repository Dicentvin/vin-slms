/**
 * Splits text into overlapping chunks for RAG / AI context.
 * @param {string} text
 * @param {number} chunkSize   – target chars per chunk (default 1200)
 * @param {number} overlap     – chars of overlap between chunks (default 100)
 * @returns {{ content: string, index: number }[]}
 */
export function splitTextIntoChunks(text, chunkSize = 1200, overlap = 100) {
  if (!text || typeof text !== "string") return [];

  const chunks = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const content = text.slice(start, end).trim();

    if (content.length > 0) {
      chunks.push({ content, index });
      index++;
    }

    // Move forward by chunkSize minus overlap
    start += chunkSize - overlap;
    if (start >= text.length) break;
  }

  return chunks;
}
