import { AIProvider } from './AIProvider.js';
import { FALLBACK_QUESTION_BANK } from './FallbackQuestionBank.js';

// Curated question-specific semantic evaluation knowledge base
const QUESTION_EVALUATORS = {
  // Inheritance in OOP
  inheritance: {
    matchKeywords: ['inheritance', 'oop', 'object-oriented', 'parent class', 'child class'],
    corePropositions: [
      {
        id: 'child_acquires_parent',
        regex: /(child|sub|derived)\s*(class)?\s*(acquires?|inherits?|derives?|gets?|takes?|receives?|extends?)\s*(properties|methods|behavior|attributes|features|functions)?\s*(from|of)\s*(a|the)?\s*(parent|base|super)\s*(class)?/i,
        altRegex: /(inherits?|inheritance)\s*(allows?|means?|enables?)\s*(a\s*)?(child|sub|derived)\s*(class)?\s*(to\s*)?(acquire|inherit|get|take|receive|reuse|share|access)\s*(properties|methods|behavior|attributes|fields|functions)/i,
        correctPoint: 'Accurately explained that a child/subclass inherits properties and methods from a parent/base class.',
        conceptName: 'Class hierarchy and property acquisition',
      },
      {
        id: 'code_reusability',
        regex: /(code\s*(reuse|reusability|re-use)|avoid\s*(duplication|redundancy)|dry\s*principle)/i,
        correctPoint: 'Highlighted code reusability as a primary advantage of inheritance.',
        conceptName: 'Code reusability',
      },
      {
        id: 'extends_keyword',
        regex: /(extends|keyword|syntax|super(\(\))?|base\s*constructor)/i,
        correctPoint: 'Referenced implementation details such as the extends keyword or constructor chaining.',
        conceptName: 'Implementation mechanics (extends / super)',
      },
      {
        id: 'polymorphism_override',
        regex: /(overrid(e|ing)|polymorphism|virtual|runtime|is-a\s*relationship)/i,
        correctPoint: 'Identified the "is-a" relationship or method overriding.',
        conceptName: 'IS-A relationship & overriding',
      },
    ],
    misconceptions: [
      {
        regex: /(parent\s*(inherits?|acquires?)\s*from\s*child)/i,
        point: 'Incorrectly stated that a parent class inherits from a child class.',
      },
      {
        regex: /(prevents?\s*code\s*(reuse|sharing))/i,
        point: 'Incorrectly claimed that inheritance prevents code reuse.',
      },
    ],
    exemplar: 'Inheritance is a fundamental OOP mechanism where a child (derived) class acquires properties and methods from a parent (base) class using the "extends" keyword. It models an "IS-A" relationship, eliminates redundant code through reusability, and enables method overriding for runtime polymorphism.',
    improvement: 'Mention the "is-a" relationship, code reusability, and how method overriding works in conjunction with inheritance.',
  },

  // B+ Trees in DBMS
  bplus_tree: {
    matchKeywords: ['b+ tree', 'b+ trees', 'b-tree', 'indexing', 'disk storage', 'fan-out'],
    corePropositions: [
      {
        id: 'high_fanout',
        regex: /(fan-?out|shallow\s*(tree|height)|depth|disk\s*(i\/?o|page|reads?|seeks?)|block\s*reads?)/i,
        correctPoint: 'Explained that high fan-out leads to low tree depth, minimizing disk I/O seek operations.',
        conceptName: 'High fan-out and shallow tree height',
      },
      {
        id: 'leaf_linked_list',
        regex: /(linked\s*list|sequential|range\s*(queries|scans?|search)|leaf\s*nodes?)/i,
        correctPoint: 'Correctly noted that leaf nodes are linked sequentially for efficient range queries.',
        conceptName: 'Linked leaf nodes for range scans',
      },
      {
        id: 'internal_vs_leaf',
        regex: /(internal\s*nodes?|routing|keys\s*only|data\s*in\s*leaves|leaf\s*pages?)/i,
        correctPoint: 'Noted that internal nodes store routing keys while actual record pointers reside at leaves.',
        conceptName: 'Internal routing vs leaf data separation',
      },
    ],
    misconceptions: [
      {
        regex: /(binary\s*search\s*tree\s*is\s*better\s*than\s*b\+)/i,
        point: 'Incorrectly claimed that Binary Search Trees perform fewer disk seeks than B+ Trees.',
      },
    ],
    exemplar: 'B+ Trees provide high node fan-out which drastically reduces tree height and disk page I/O. Furthermore, all data pointers are stored in the leaf nodes, which are linked together to enable ultra-fast sequential range scans.',
    improvement: 'Contrast the cache line / disk page size with BST pointer overhead and explain the sequential leaf node pointer mechanism.',
  },

  // ACID Properties in DBMS
  acid: {
    matchKeywords: ['acid', 'atomicity', 'consistency', 'isolation', 'durability'],
    corePropositions: [
      {
        id: 'atomicity',
        regex: /(atomic(ity)?|all\s*or\s*nothing|rollback|commit)/i,
        correctPoint: 'Accurately defined Atomicity as the all-or-nothing execution of transaction operations.',
        conceptName: 'Atomicity (all-or-nothing)',
      },
      {
        id: 'consistency',
        regex: /(consistency|valid\s*state|invariants?|constraints?)/i,
        correctPoint: 'Correctly defined Consistency in maintaining valid database states and constraints.',
        conceptName: 'Consistency (valid state transitions)',
      },
      {
        id: 'isolation',
        regex: /(isolation|concurren(t|cy)|concurrent\s*transactions?|interfere|read\s*committed)/i,
        correctPoint: 'Explained Isolation as preventing concurrently executing transactions from interfering.',
        conceptName: 'Isolation (concurrency control)',
      },
      {
        id: 'durability',
        regex: /(durability|persisten(t|ce)|disk|non-volatile|wal|write-ahead|crash)/i,
        correctPoint: 'Defined Durability as guaranteeing that committed transactions persist even during power/system failures.',
        conceptName: 'Durability (crash recovery and persistence)',
      },
    ],
    misconceptions: [],
    exemplar: 'ACID guarantees database reliability: Atomicity ensures all operations succeed or roll back together; Consistency enforces integrity constraints; Isolation ensures concurrent transactions do not interfere; and Durability guarantees committed changes persist across system crashes (via Write-Ahead Logging).',
    improvement: 'Detail the underlying implementation techniques such as WAL for Durability and Two-Phase Locking/MVCC for Isolation.',
  },

  // Process vs Thread in OS
  process_thread: {
    matchKeywords: ['process', 'thread', 'memory', 'pcb', 'tcb', 'context switch'],
    corePropositions: [
      {
        id: 'isolated_address_space',
        regex: /(address\s*space|isolated\s*memory|separate\s*memory|process\s*isolation)/i,
        correctPoint: 'Clarified that processes possess independent, isolated virtual address spaces.',
        conceptName: 'Independent address space for processes',
      },
      {
        id: 'shared_memory_threads',
        regex: /(threads?\s*share|share(s)?\s*(the\s*)?(heap|memory|data\s*segment|address\s*space))/i,
        correctPoint: 'Explained that threads within the same process share the common address space and heap.',
        conceptName: 'Shared heap/data segments among threads',
      },
      {
        id: 'private_stack',
        regex: /(private|independent|own|separate)\s*(stack|registers?|program\s*counter|pc)/i,
        correctPoint: 'Noted that each thread retains its own stack, registers, and program counter.',
        conceptName: 'Private stack and register state per thread',
      },
      {
        id: 'context_switch',
        regex: /(context\s*switch(ing)?|lightweight|overhead|faster)/i,
        correctPoint: 'Highlighted that thread context switching incurs significantly lower overhead than process context switching.',
        conceptName: 'Context switching efficiency',
      },
    ],
    misconceptions: [
      {
        regex: /(threads?\s*do\s*not\s*share\s*memory|processes?\s*share\s*memory\s*by\s*default)/i,
        point: 'Misconception regarding memory sharing: processes are isolated by default while threads share memory.',
      },
    ],
    exemplar: 'A process is an execution unit with its own private virtual memory space (code, data, heap). Threads are lightweight units of execution within a process that share the heap and global variables, but maintain their own program counter, registers, and stack.',
    improvement: 'Discuss context switching overhead differences and inter-process communication (IPC) vs thread synchronization.',
  },

  // Two-pointer algorithms
  two_pointer: {
    matchKeywords: ['two-pointer', 'sorted array', 'nested loop', 'o(n)', 'o(1)'],
    corePropositions: [
      {
        id: 'linear_time',
        regex: /(o\(n\)|linear\s*time|single\s*pass|avoids?\s*o\(n\^?2\))/i,
        correctPoint: 'Demonstrated that two-pointer algorithms optimize time complexity to O(n) from O(n^2).',
        conceptName: 'O(n) time complexity reduction',
      },
      {
        id: 'sorted_invariant',
        regex: /(sorted|monotonic|order|smaller|larger|greater)/i,
        correctPoint: 'Emphasized that the array must be sorted so pointer moves eliminate search space predictably.',
        conceptName: 'Sorted array invariant',
      },
      {
        id: 'pointer_convergence',
        regex: /(left|right|converge|start|end|opposite\s*ends)/i,
        correctPoint: 'Explained the mechanic of left and right pointers converging inward toward each other.',
        conceptName: 'Converging pointer mechanics',
      },
    ],
    misconceptions: [],
    exemplar: 'In a sorted array, two pointers initialized at opposite ends converge inward. By evaluating the current sum against the target, we can eliminate an entire row of candidates in O(1) space and O(n) time, avoiding quadratic brute-force nested loops.',
    improvement: 'Give a specific problem example like Two Sum II or Container With Most Water to demonstrate pointer movement rules.',
  },

  // Hash collision resolution
  hashmap: {
    matchKeywords: ['hashmap', 'hash collision', 'chaining', 'bucket', 'binary search tree', 'treeify'],
    corePropositions: [
      {
        id: 'chaining',
        regex: /(chaining|linked\s*list|open\s*addressing|buckets?)/i,
        correctPoint: 'Explained collision resolution via separate chaining in buckets.',
        conceptName: 'Separate chaining collision resolution',
      },
      {
        id: 'treeify_threshold',
        regex: /(treeif(y|ied)|threshold|8\s*(nodes?|entries|items?|elements?)|red-?black)/i,
        correctPoint: 'Referenced the treeification threshold (typically 8) converting linked lists to balanced trees.',
        conceptName: 'Treeification threshold (8 elements)',
      },
      {
        id: 'complexity_gain',
        regex: /(o\(log\s*n\)|worst\s*case|o\(n\)\s*to\s*o\(log\s*n\))/i,
        correctPoint: 'Highlighted that converting to a tree improves worst-case lookup from O(n) to O(log n).',
        conceptName: 'O(log n) worst-case performance guarantee',
      },
    ],
    misconceptions: [],
    exemplar: 'HashMaps handle collisions by chaining entries in linked lists per bucket. When a bucket length exceeds a threshold (TREEIFY_THRESHOLD = 8 in Java), it transforms into a balanced Red-Black tree to safeguard O(log n) lookup instead of degenerating into O(n).',
    improvement: 'Explain why load factor (0.75) and hash distribution quality matter before treeification occurs.',
  },
};

export class FallbackProvider extends AIProvider {
  constructor() {
    super('fallback');
  }

  async generateQuestions(config) {
    const { topics = [], difficulty = 'Medium', questionCount = 5, interviewType = 'Technical' } = config;

    let matched = FALLBACK_QUESTION_BANK.filter((q) => {
      const topicMatches = topics.length === 0 || topics.some((t) => q.topic.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(q.topic.toLowerCase()));
      const diffMatches = q.difficulty.toLowerCase() === difficulty.toLowerCase();
      return topicMatches && diffMatches;
    });

    if (matched.length < questionCount) {
      const topicFallbacks = FALLBACK_QUESTION_BANK.filter(
        (q) => !matched.includes(q) && (topics.length === 0 || topics.some((t) => q.topic.toLowerCase().includes(t.toLowerCase())))
      );
      matched = [...matched, ...topicFallbacks];
    }

    if (matched.length < questionCount) {
      const remainingPool = FALLBACK_QUESTION_BANK.filter((q) => !matched.includes(q));
      matched = [...matched, ...remainingPool];
    }

    const shuffled = [...matched].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, questionCount);

    const questions = selected.map((q, idx) => ({
      orderIndex: idx,
      questionText: q.questionText,
      topic: q.topic,
      difficulty: q.difficulty,
      type: q.type || interviewType,
      referenceConcepts: q.referenceConcepts,
      evaluationCriteria: q.evaluationCriteria,
    }));

    return {
      questions,
      provider: 'fallback',
      isFallback: true,
      message: 'Generated via Curated Technical Placement Question Bank (Offline Fallback)',
    };
  }

  async evaluateAnswer(data) {
    const { questionText = '', referenceConcepts = [], candidateAnswer = '', topic = '' } = data;
    const answer = (candidateAnswer || '').trim();

    // 1. Detect Blank, Truncated, or Evasive Answers
    const isEvasive = /^(i\s*don'?t\s*know|no\s*idea|skip|pass|n\/?a|hello|test|hi|xyz|asdf)$/i.test(answer);
    if (!answer || answer.length < 10 || isEvasive) {
      return {
        scoreOutOf10: 1,
        overallScore: 10,
        criteriaScores: {
          relevance: 1,
          correctness: 1,
          completeness: 1,
          technicalAccuracy: 1,
          quality: 1,
          technicalCorrectness: 4,
          clarity: 2,
        },
        correctPoints: [],
        missingPoints: referenceConcepts.length > 0 ? referenceConcepts : ['Core theoretical definition and implementation mechanics'],
        incorrectPoints: ['The submitted response was either blank, evasive, or did not provide an explanation.'],
        improvement: 'State the core definition clearly, mention how the mechanism works, and explain practical use cases.',
        feedback: 'Your answer did not address the question asked. In interview settings, provide at least the fundamental definition.',
        improvedAnswer: `A solid response should explain: ${referenceConcepts.join(', ')}.`,
        correctConcepts: [],
        missingConcepts: referenceConcepts,
        mistakes: ['Response was evasive or too brief to evaluate.'],
        explanation: 'The submitted answer was incomplete or non-responsive.',
        isFallback: true,
      };
    }

    // 2. Identify Matching Question Domain Evaluator
    const lowerQuestion = questionText.toLowerCase();
    const lowerAnswer = answer.toLowerCase();

    let matchedEvaluator = null;
    for (const [key, evaluator] of Object.entries(QUESTION_EVALUATORS)) {
      const isMatch = evaluator.matchKeywords.some((kw) => lowerQuestion.includes(kw));
      if (isMatch) {
        matchedEvaluator = evaluator;
        break;
      }
    }

    // 3. Question-Specific Semantic Evaluation
    if (matchedEvaluator) {
      const demonstrated = [];
      const missing = [];
      const incorrect = [];

      matchedEvaluator.corePropositions.forEach((prop) => {
        if (prop.regex.test(answer) || (prop.altRegex && prop.altRegex.test(answer))) {
          demonstrated.push(prop.correctPoint);
        } else {
          missing.push(prop.conceptName);
        }
      });

      matchedEvaluator.misconceptions.forEach((misc) => {
        if (misc.regex.test(answer)) {
          incorrect.push(misc.point);
        }
      });

      const totalProps = matchedEvaluator.corePropositions.length;
      const coverageRatio = demonstrated.length / totalProps;

      // Question Relevance: did they address the topic?
      const relevanceScore = demonstrated.length > 0 ? (coverageRatio >= 0.6 ? 10 : 8) : 3;

      // Correctness: penalize identified misconceptions
      let correctnessScore = demonstrated.length > 0 ? (coverageRatio >= 0.5 ? 9 : 7) : 2;
      if (incorrect.length > 0) correctnessScore = Math.max(1, correctnessScore - 4);

      // Completeness: coverage of core points
      const completenessScore = Math.max(1, Math.min(10, Math.round(coverageRatio * 10)));

      // Technical Accuracy: correct terminology
      const technicalAccuracyScore = demonstrated.length > 0 ? (coverageRatio >= 0.5 ? 9 : 7) : 2;

      // Quality: structure and clarity
      const qualityScore = answer.length > 60 ? (demonstrated.length > 0 ? 8 : 4) : 5;

      const scoreOutOf10 = Math.max(
        1,
        Math.min(
          10,
          Math.round(
            relevanceScore * 0.25 +
            correctnessScore * 0.35 +
            completenessScore * 0.25 +
            technicalAccuracyScore * 0.15
          )
        )
      );

      const overallScore = scoreOutOf10 * 10;

      return {
        scoreOutOf10,
        overallScore,
        criteriaScores: {
          relevance: relevanceScore,
          correctness: correctnessScore,
          completeness: completenessScore,
          technicalAccuracy: technicalAccuracyScore,
          quality: qualityScore,
          technicalCorrectness: correctnessScore * 4,
          clarity: qualityScore * 2,
        },
        correctPoints: demonstrated.length > 0 ? demonstrated : ['Demonstrated partial familiarity with the domain'],
        missingPoints: missing.length > 0 ? missing : ['Consider discussing architectural trade-offs or implementation nuances'],
        incorrectPoints: incorrect,
        improvement: matchedEvaluator.improvement,
        feedback: demonstrated.length > 0
          ? `Good explanation covering ${demonstrated.length} key concept(s). To elevate your answer, touch upon: ${missing.slice(0, 2).join(', ')}.`
          : 'Your explanation lacked key core concepts. Ensure you define the main mechanism clearly.',
        improvedAnswer: matchedEvaluator.exemplar,
        correctConcepts: demonstrated,
        missingConcepts: missing,
        mistakes: incorrect,
        explanation: `Evaluated ${demonstrated.length}/${totalProps} expected propositions for "${questionText}".`,
        isFallback: true,
      };
    }

    // 4. Generalized Question Evaluator (for dynamic topics or non-preset questions)
    // Check if the answer actually mentions entities or context from the question
    const qWords = questionText.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter((w) => w.length > 3 && !['what', 'explain', 'describe', 'difference', 'between', 'modern', 'systems'].includes(w));
    const hasTopicOverlap = qWords.some((w) => lowerAnswer.includes(w));

    // If completely disconnected from question text
    if (!hasTopicOverlap && answer.length < 50) {
      return {
        scoreOutOf10: 2,
        overallScore: 20,
        criteriaScores: {
          relevance: 2,
          correctness: 2,
          completeness: 1,
          technicalAccuracy: 2,
          quality: 3,
          technicalCorrectness: 8,
          clarity: 6,
        },
        correctPoints: [],
        missingPoints: referenceConcepts.length > 0 ? referenceConcepts : ['Direct answer to the prompt'],
        incorrectPoints: ['Answer does not appear to directly address the question asked.'],
        improvement: 'Carefully read the question prompt and focus your answer directly on its core concepts.',
        feedback: 'Your answer did not appear relevant to the question asked.',
        improvedAnswer: `An effective response would address: ${referenceConcepts.join(', ')}.`,
        correctConcepts: [],
        missingConcepts: referenceConcepts,
        mistakes: ['Off-topic response.'],
        explanation: 'Low relevance to the asked question.',
        isFallback: true,
      };
    }

    // Measure conceptual overlap using phrase-level semantics
    const identified = [];
    const missing = [];

    referenceConcepts.forEach((concept) => {
      const cleanConcept = concept.toLowerCase();
      const tokens = cleanConcept.replace(/[^\w\s]/g, '').split(/\s+/).filter((t) => t.length > 2);
      const matchCount = tokens.filter((t) => lowerAnswer.includes(t)).length;
      if (tokens.length > 0 && matchCount / tokens.length >= 0.4) {
        identified.push(`Addressed concept: ${concept}`);
      } else {
        missing.push(concept);
      }
    });

    const coverage = referenceConcepts.length > 0 ? identified.length / referenceConcepts.length : 0.6;
    const relevanceScore = hasTopicOverlap ? (coverage >= 0.4 ? 9 : 7) : 3;
    const correctnessScore = coverage >= 0.4 ? 8 : 6;
    const completenessScore = Math.max(1, Math.min(10, Math.round(coverage * 10)));
    const technicalAccuracyScore = coverage >= 0.4 ? 8 : 6;
    const qualityScore = answer.length > 80 ? 8 : 6;

    const scoreOutOf10 = Math.max(
      1,
      Math.min(
        10,
        Math.round(
          relevanceScore * 0.25 +
          correctnessScore * 0.35 +
          completenessScore * 0.25 +
          technicalAccuracyScore * 0.15
        )
      )
    );

    const overallScore = scoreOutOf10 * 10;

    return {
      scoreOutOf10,
      overallScore,
      criteriaScores: {
        relevance: relevanceScore,
        correctness: correctnessScore,
        completeness: completenessScore,
        technicalAccuracy: technicalAccuracyScore,
        quality: qualityScore,
        technicalCorrectness: correctnessScore * 4,
        clarity: qualityScore * 2,
      },
      correctPoints: identified.length > 0 ? identified : ['Addressed key elements of the question'],
      missingPoints: missing.length > 0 ? missing : ['Further exploration of real-world edge cases'],
      incorrectPoints: [],
      improvement: missing.length > 0 ? `To strengthen your answer, incorporate: ${missing.slice(0, 2).join(', ')}.` : 'Provide a concrete example to solidify your response.',
      feedback: `Overall score: ${scoreOutOf10}/10. Your response addressed ${identified.length} of ${referenceConcepts.length} expected core concept areas.`,
      improvedAnswer: `A comprehensive answer covers: ${referenceConcepts.join(', ')}.`,
      correctConcepts: identified,
      missingConcepts: missing,
      mistakes: [],
      explanation: `Semantic coverage evaluated: ${scoreOutOf10}/10.`,
      isFallback: true,
    };
  }

  async transcribeAudio(data) {
    return {
      transcript: '',
      provider: 'fallback',
      isFallback: true,
      message: 'Local fallback mode does not have external cloud STT.',
    };
  }
}
