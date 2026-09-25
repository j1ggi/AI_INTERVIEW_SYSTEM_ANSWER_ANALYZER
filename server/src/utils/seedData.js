import User from '../models/User.js';
import Interview from '../models/Interview.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';

export const seedDemoUsers = async () => {
  try {
    const demoAccounts = [
      {
        email: 'megenta.point@gmail.com',
        name: 'Magenta Point',
        targetRole: 'Software Development Engineer',
        experienceLevel: 'Mid-Level',
        preferredTopics: ['Data Structures & Algorithms', 'System Design', 'Database Management Systems'],
        bio: 'Full-stack software developer preparing for senior placement viva and technical rounds.',
      },
      {
        email: 'candidate@mockvue.edu',
        name: 'Aarav Sharma',
        targetRole: 'Software Development Engineer',
        experienceLevel: 'Entry-Level',
        preferredTopics: ['Data Structures & Algorithms', 'Operating Systems', 'System Design'],
        bio: 'Final year B.Tech Computer Science student preparing for campus placements.',
      },
    ];

    for (const account of demoAccounts) {
      let user = await User.findOne({ email: account.email });
      if (!user) {
        user = await User.create({
          name: account.name,
          email: account.email,
          passwordHash: 'password123',
          targetRole: account.targetRole,
          experienceLevel: account.experienceLevel,
          preferredTopics: account.preferredTopics,
          bio: account.bio,
        });
        console.log(`[SEED] Pre-seeded demo user created: ${account.email} (password: password123)`);

        // Seed a sample completed interview session for rich dashboard experience
        await seedSampleInterview(user);
      }
    }
  } catch (error) {
    console.warn(`[SEED] Auto-seed warning: ${error.message}`);
  }
};

const seedSampleInterview = async (user) => {
  try {
    const existing = await Interview.findOne({ userId: user._id });
    if (existing) return;

    const interview = await Interview.create({
      userId: user._id,
      title: 'Full Stack & System Architecture Viva',
      targetRole: user.targetRole,
      difficulty: 'Medium',
      interviewType: 'Technical',
      topics: ['System Design', 'Database Management Systems', 'Data Structures & Algorithms'],
      status: 'completed',
      durationMinutes: 25,
      currentQuestionIndex: 2,
      overallScore: 84,
      proctoringViolations: 0,
      startedAt: new Date(Date.now() - 3600000 * 24),
      completedAt: new Date(Date.now() - 3600000 * 24 + 18 * 60000),
      isFallbackAI: false,
    });

    const q1 = await Question.create({
      interviewId: interview._id,
      orderIndex: 0,
      questionText: 'Explain how indexing improves database read query performance, and discuss the trade-offs on write operations.',
      topic: 'Database Management Systems',
      difficulty: 'Medium',
      type: 'Technical',
      referenceConcepts: ['B-Tree / B+ Tree data structure', 'O(log N) search complexity', 'Write overhead for index maintenance', 'Disk I/O reduction'],
      evaluationCriteria: ['Explains B-Tree structure and pointer navigation', 'Highlights disk I/O reduction', 'Analyzes INSERT/UPDATE/DELETE overhead'],
    });

    const q2 = await Question.create({
      interviewId: interview._id,
      orderIndex: 1,
      questionText: 'How would you design a caching tier using Redis in a high-traffic microservices architecture, and handle cache invalidation?',
      topic: 'System Design',
      difficulty: 'Hard',
      type: 'Technical',
      referenceConcepts: ['Cache-aside vs Write-through pattern', 'TTL and LRU eviction policy', 'Cache stampede prevention', 'Event-driven invalidation via Kafka/CDC'],
      evaluationCriteria: ['Identifies caching patterns', 'Discusses cache invalidation strategies', 'Mentions distributed consistency trade-offs'],
    });

    interview.questions = [q1._id, q2._id];
    await interview.save();

    await Answer.create({
      interviewId: interview._id,
      questionId: q1._id,
      userId: user._id,
      responseType: 'text',
      responseText: 'Database indexes commonly use balanced search structures like B+ Trees. Instead of a full table scan requiring O(N) disk page reads, searching an index allows the engine to traverse root, branch, and leaf nodes in O(log N) I/O operations. The key tradeoff is that any modification (INSERT, DELETE, or UPDATE on indexed columns) requires the database to reorganize the tree and write to multiple index structures on disk, increasing write latency and storage overhead.',
      overallScore: 88,
      criteriaScores: {
        technicalCorrectness: 36,
        relevance: 18,
        completeness: 17,
        clarity: 17,
      },
      correctConcepts: ['B+ Tree navigation', 'O(log N) lookup', 'Disk page I/O reduction', 'Write latency on index tree balancing'],
      missingConcepts: ['Clustered vs Secondary index distinctions'],
      mistakes: [],
      explanation: 'Demonstrated precise understanding of database internal storage models and query engine I/O behavior.',
      feedback: 'Excellent structural response with correct algorithmic bounds and practical write penalty awareness.',
      improvedAnswer: 'To elevate further, clarify how clustered indexes physically sequence rows on disk versus secondary pointer lookups.',
      recommendedTopics: ['Database Internals', 'Clustered vs Non-Clustered Indexes'],
      timeSpentSeconds: 110,
    });

    await Answer.create({
      interviewId: interview._id,
      questionId: q2._id,
      userId: user._id,
      responseType: 'text',
      responseText: 'In microservices, the cache-aside pattern is standard: the service first queries Redis; on a cache miss, it reads from the primary database, populates Redis with an appropriate TTL, and returns the response. For cache invalidation, write operations should invalidate the corresponding Redis key or publish an event to message brokers like Kafka so subscriber instances purge stale caches.',
      overallScore: 80,
      criteriaScores: {
        technicalCorrectness: 32,
        relevance: 16,
        completeness: 16,
        clarity: 16,
      },
      correctConcepts: ['Cache-aside pattern', 'Time-To-Live (TTL)', 'Event-driven invalidation via message broker'],
      missingConcepts: ['Cache penetration protection (Bloom filters)', 'Distributed locks for stampede'],
      mistakes: [],
      explanation: 'Solid practical explanation of caching tiers and multi-service invalidation strategies.',
      feedback: 'Good architecture comprehension. Consider addressing cache stampedes under high concurrency using distributed mutexes.',
      improvedAnswer: 'Add a note on probabilistic early expiration (XFetch) or Redis distributed locks (Redlock) to safeguard against stampedes.',
      recommendedTopics: ['Distributed Caching Patterns', 'Redis Redlock Algorithm'],
      timeSpentSeconds: 135,
    });

    console.log(`[SEED] Pre-seeded sample completed interview for ${user.email}`);
  } catch (err) {
    console.warn(`[SEED] Sample interview seed warning: ${err.message}`);
  }
};
