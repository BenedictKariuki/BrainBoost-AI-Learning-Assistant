/**
 * Split text into chunks for better AI processing
 * @param {string} text - Full text to chunk
 * @param {number} chunkSize - Target size per chunk (in words)
 * @param {number} overlap - Number of words to overlap between chunks
 * @returns {Array<{content: string, chunkIndex: number, pageNumber: number}>}
 */

// We need overlap so that context is not lost between breaks
export const chunkText = (text, chunkSize = 500, overlap = 50) => {
  if (!text || text.trim().length === 0) {
    return [];
  }
  // Clean text while preserving paragraph structure. Different OSs handle the "Enter" key differently. Windows: \r\n Mac/Linux: \n Old Macs: \r
  const cleanedText = text
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .replace(/\n /g, "\n")
    .replace(/ \n/g, "\n")
    .trim();

  // Try to split by paragraphs (single or double newlines). The result is an array of all paragraphs("strings") whose length after trimming trailing spaces is greater than 0
  const paragraphs = cleanedText
    .split(/\n+/)
    .filter((p) => p.trim().length > 0);
  const chunks = [];
  let currentChunk = [];
  let currentWordCount = 0;
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const paragraphWords = paragraph.trim().split(/\s+/);
    const paragraphWordCount = paragraphWords.length;

    // if the paragraph exceeds the chunk size, split it by words
    if (paragraphWordCount > chunkSize) {
      if (currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.join("\n\n"),
          chunkIndex: chunkIndex++,
          pageNumber: 0,
        });
        currentChunk = [];
        currentWordCount = 0;
      }
      // split large paragraphs into word-based chunks
      for (let i = 0; i < paragraphWords.length; i += chunkSize - overlap) {
        const chunkWords = paragraphWords.slice(i, i + chunkSize);
        chunks.push({
          content: chunkWords.join(" "),
          chunkIndex: chunkIndex++,
          pageNumber: 0,
        });
        if (i + chunkSize >= paragraphWords.length) break;
      }
      continue;
    }
    // if adding this paragraph will exceed the chunk size, save the current chunk
    if (
      currentWordCount + paragraphWordCount > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push({
        content: currentChunk.join("\n\n"),
        chunkIndex: chunkIndex++,
        pageNumber: 0,
      });
      // create overlap from previous chunk
      const prevChunkText = currentChunk.join(" ");
      const prevWords = prevChunkText.split(/\s+/);
      const overlapText = prevWords
        .slice(-Math.min(overlap, prevWords.length))
        .join(" ");
      currentChunk = [overlapText, paragraph.trim()];
      currentWordCount = overlapText.split(/\s+/).length + paragraphWordCount;
    } else {
      // add paragraph to current chunk
      currentChunk.push(paragraph.trim());
      currentWordCount += paragraphWordCount;
    }
  }
  // add the last chunk
  if (currentChunk.length > 0) {
    chunks.push({
      content: currentChunk.join("\n\n"),
      chunkIndex: chunkIndex,
      pageNumber: 0,
    });
  }
  // Fallback: if no chunks created, split by words
  if (chunks.length === 0 && cleanedText.length > 0) {
    const allWords = cleanedText.split(/\s+/);
    for (let i = 0; i < allWords.length; i += chunkSize - overlap) {
      const chunkWords = allWords.slice(i, i + chunkSize);
      chunks.push({
        content: chunkWords.join(" "),
        chunkIndex: chunkIndex++,
        pageNumber: 0,
      });
      if (i + chunkSize >= allWords.length) break;
    }
  }
  return chunks;
};

/**
 * Find relevant chunks based on keyword matching
 * @param {Array<Object>} chunks - Array of chunks
 * @param {string} query - Search query
 * @param {number} maxChunks - Maximum chunks to return
 * @returns {Array<Object>}
 */
export const findRelevantChunks = (chunks, query, maxChunks) => {
  if (!chunks || chunks.length === 0 || !query) {
    return [];
  }
  // common stop words to exclude
  const stopWords = new Set([
    "the",
    "is",
    "at",
    "which",
    "on",
    "an",
    "and",
    "a",
    "or",
    "but",
    "in",
    "with",
    "to",
    "for",
    "of",
    "as",
    "by",
    "this",
    "that",
    "it",
  ]);
  // extract and clean query words
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  // no query words passed, return up to the max #. of chunks allowed
  if (queryWords.length === 0) {
    // return clean chunk objects without Mongoose metadata
    return chunks.slice(0, maxChunks).map((chunk) => ({
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      _id: chunk._id,
    }));
  }
  // some query words passed, so find relevance score for each query word, in each chunk
  const scoredChunks = chunks.map((chunk, index) => {
    const content = chunk.content.toLowerCase();
    const contentWords = content.split(/\s+/).length;
    let score = 0;
    // score each query word
    for (const word of queryWords) {
      // exact match (higher score)
      const exactRegExp = new RegExp(`\\b${word}\\b`, "g");
      const exactMatches = (content.match(exactRegExp) || []).length;
      score += exactMatches * 3;

      // partial matches (lower score)
      const partialRegExp = new RegExp(word, "g");
      const partialMatches = (content.match(partialRegExp) || []).length;
      score += Math.max(0, partialMatches - exactMatches) * 1.5;
    }
    // bonus: multiple query words found
    const multipleWordsFoundCount = queryWords.filter((word) =>
      content.includes(word),
    ).length;
    if (multipleWordsFoundCount > 1) {
      score += multipleWordsFoundCount * 2;
    }
    // normalize by content length
    const normalizedScore = score / Math.sqrt(contentWords);
    // small bonus for earlier chunks
    const positionBonus = 1 - (index / chunks.length) * 0.1;
    // return clean object without Mongoose metadata
    return {
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: content.pageNumber,
      _id: chunk._id,
      score: normalizedScore * positionBonus,
      rawScore: score,
      matchedWords: multipleWordsFoundCount,
    };
  });

  // return only the chunks that have a score
  return scoredChunks
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.matchedWords !== a.matchedWords)
        return b.matchedWords - a.matchedWords;
      return a.chunkIndex - b.chunkIndex;
    })
    .slice(0, maxChunks);
};
