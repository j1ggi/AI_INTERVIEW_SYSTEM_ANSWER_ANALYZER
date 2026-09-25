export const buildQuestionGenerationPrompt = ({
  targetRole,
  topics,
  difficulty,
  interviewType,
  experienceLevel,
  questionCount,
}) => {
  const topicsStr = Array.isArray(topics) && topics.length > 0 ? topics.join(', ') : 'Core Computer Science';

  return `
You are a Principal Software Engineering Interviewer and Technical Bar Raiser conducting a rigorous placement interview.

TASK:
Generate exactly ${questionCount} authentic, high-quality interview questions tailored for a candidate with the following profile:
- Target Role: ${targetRole}
- Experience Level: ${experienceLevel}
- Difficulty Level: ${difficulty}
- Interview Focus Type: ${interviewType}
- Selected Topics: ${topicsStr}

REQUIREMENTS:
1. Questions must be realistic for placement rounds at top technology companies (e.g. SDE-1 / entry-level developer interviews).
2. Avoid generic trivia. Include conceptual depth, trade-off analysis, architectural reasoning, and practical problem-solving.
3. For each question, provide:
   - "questionText": The clear, concise interview question posed to the candidate.
   - "topic": The specific technical or behavioral domain (e.g., "DSA", "DBMS", "System Design").
   - "difficulty": "${difficulty}".
   - "type": "${interviewType}".
   - "referenceConcepts": An array of 3-5 critical concepts or terminology that a strong candidate MUST mention.
   - "evaluationCriteria": An array of 3 key criteria used to grade candidate correctness and clarity.

OUTPUT FORMAT:
Respond ONLY with a valid JSON array of objects. Do not include markdown code fences, preambles, or conversational commentary.

Example output schema:
[
  {
    "questionText": "Explain how a HashMap handles collisions in Java. When does a LinkedList bucket transition into a Red-Black Tree?",
    "topic": "Data Structures & Algorithms",
    "difficulty": "${difficulty}",
    "type": "${interviewType}",
    "referenceConcepts": ["Chaining", "hashCode()", "equals() contract", "TREEIFY_THRESHOLD (8)", "O(log n) lookup"],
    "evaluationCriteria": [
      "Understanding of collision resolution via chaining",
      "Correct identification of TREEIFY_THRESHOLD (8 items) and UNTREEIFY_THRESHOLD (6 items)",
      "Time complexity comparison between linked list O(n) and balanced red-black tree O(log n)"
    ]
  }
]
`.trim();
};
