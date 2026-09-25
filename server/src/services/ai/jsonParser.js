export const cleanAndParseJSON = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('AI output is empty or not a string');
  }

  let cleaned = rawText.trim();

  // Strip markdown code fences if present (e.g., ```json ... ``` or ``` ...)
  const fenceRegex = /^```(?:json)?\s*([\s\S]*?)\s*```$/i;
  const match = cleaned.match(fenceRegex);
  if (match && match[1]) {
    cleaned = match[1].trim();
  }

  // Remove potential trailing commas before closing braces/brackets
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

  try {
    return JSON.parse(cleaned);
  } catch (initialErr) {
    // Attempt secondary regex search for first valid JSON array or object
    const jsonMatch = cleaned.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (jsonMatch) {
      try {
        const repaired = jsonMatch[0].replace(/,\s*([}\]])/g, '$1');
        return JSON.parse(repaired);
      } catch (secondErr) {
        throw new Error(`Failed to parse AI JSON response: ${secondErr.message}. Raw preview: ${cleaned.slice(0, 150)}...`);
      }
    }
    throw new Error(`Malformed AI JSON: ${initialErr.message}. Raw preview: ${cleaned.slice(0, 150)}...`);
  }
};

export const validateQuestionsSchema = (data) => {
  const list = Array.isArray(data) ? data : data?.questions;
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error('Invalid question output: Expected a non-empty array of questions.');
  }

  return list.map((q, idx) => {
    if (!q.questionText || typeof q.questionText !== 'string') {
      throw new Error(`Question at index ${idx} is missing questionText.`);
    }

    return {
      orderIndex: idx,
      questionText: q.questionText.trim(),
      topic: q.topic || 'General Technical',
      difficulty: ['Easy', 'Medium', 'Hard'].includes(q.difficulty) ? q.difficulty : 'Medium',
      type: ['Technical', 'HR', 'Behavioral'].includes(q.type) ? q.type : 'Technical',
      referenceConcepts: Array.isArray(q.referenceConcepts) ? q.referenceConcepts : [],
      evaluationCriteria: Array.isArray(q.evaluationCriteria) ? q.evaluationCriteria : [
        'Accuracy of core explanation',
        'Technical depth and terminology',
        'Handling of edge cases or trade-offs',
      ],
    };
  });
};
