import http from 'http';
import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

const request = (path, method = 'GET', data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 400) {
            reject(new Error(parsed.message || `HTTP ${res.statusCode}: ${body}`));
          } else {
            resolve(parsed);
          }
        } catch {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

async function runCompleteSystemVerification() {
  console.log('===========================================================');
  console.log('🧪 RUNNING COMPLETE MOCKVUE SYSTEM & FEATURE VERIFICATION');
  console.log('===========================================================\n');

  // Test 1: Auth Flow
  console.log('[TEST 1/5] Testing User Registration & Authentication...');
  const uniqueId = Date.now();
  const regRes = await request('/auth/register', 'POST', {
    name: 'Aryan Sharma',
    email: `aryan_${uniqueId}@college.edu`,
    password: 'Password123!',
    targetRole: 'Software Development Engineer',
  });
  assert(regRes.token, 'Registration should return token');
  const token = regRes.token;
  console.log('   ✓ Registered student user:', regRes.user.email);

  // Test 2: Speech-to-Text Endpoint Test (/api/interviews/transcribe)
  console.log('\n[TEST 2/5] Testing Speech-to-Text Endpoint (/api/interviews/transcribe)...');
  const dummyAudioBase64 = Buffer.from('RIFF....WAVEfmt ....data....').toString('base64');
  const transcribeRes = await request('/interviews/transcribe', 'POST', {
    audioData: dummyAudioBase64,
    mimeType: 'audio/webm',
  }, token);
  assert(transcribeRes.success === true, 'Transcribe response must be success: true');
  assert(typeof transcribeRes.transcript === 'string', 'Transcribe response must contain transcript string');
  console.log('   ✓ STT endpoint returned successfully with transcript:', `"${transcribeRes.transcript}"`);

  // Test 3: Generate Interview (OOP & Database)
  console.log('\n[TEST 3/5] Testing Interview Generation...');
  const genRes = await request('/interviews/generate', 'POST', {
    targetRole: 'Software Development Engineer',
    topics: ['Object-Oriented Programming', 'Database Management Systems'],
    difficulty: 'Medium',
    questionCount: 2,
    durationMinutes: 15,
  }, token);
  assert(genRes.interviewId, 'Generation should return interviewId');
  const interviewId = genRes.interviewId;

  // Fetch interview details
  const getIntRes = await request(`/interviews/${interviewId}`, 'GET', null, token);
  const questions = getIntRes.interview.questions;
  console.log(`   ✓ Created Interview [${interviewId}] with ${questions.length} questions:`);
  questions.forEach((q, idx) => console.log(`      Q${idx + 1}: ${q.questionText}`));

  // Start interview
  const startRes = await request(`/interviews/${interviewId}/start`, 'POST', {}, token);
  assert(startRes.status === 'in_progress', 'Interview status should be in_progress');
  console.log('   ✓ Interview transitioned to in_progress.');

  // Test 4: Answer Analysis, 10-Point Scoring, and Structured Feedback
  console.log('\n[TEST 4/5] Testing Semantic Answer Analysis, 10-Point Rubric & Structured Feedback...');

  // Q1: Conceptual strong answer
  const q1 = questions[0];
  console.log(`\n   --- Submitting Strong Answer to Q1: "${q1.questionText}" ---`);
  let strongAnswerText = 'Inheritance in OOP allows a derived child class to inherit attributes, fields, and methods from a base parent class. It promotes code reusability and enables hierarchical classification and polymorphism via method overriding.';
  const qLower = (q1.questionText || '').toLowerCase();
  if (qLower.includes('b+') || qLower.includes('index') || qLower.includes('database') || qLower.includes('sql') || qLower.includes('tree')) {
    strongAnswerText = 'A B+ tree is a self-balancing search tree data structure commonly used in relational database indexing. All actual data pointers and keys are stored at the leaf level in a doubly linked list for fast range queries, while internal nodes only store routing keys, allowing high fanout and logarithmic search, insertion, and deletion time with minimal disk I/O.';
  } else if (q1.expectedPoints && q1.expectedPoints.length > 0) {
    strongAnswerText = q1.expectedPoints.join('. ') + '. This ensures high modularity, code reusability, and efficient performance.';
  }

  const eval1 = await request(`/interviews/${interviewId}/answer`, 'POST', {
    questionId: q1._id,
    responseText: strongAnswerText,
    responseType: 'audio',
    timeSpentSeconds: 45,
  }, token);

  const e1 = eval1.evaluation;
  console.log(`   ✓ Score Out of 10: ${e1.scoreOutOf10}/10 (Overall Score: ${e1.overallScore}/100)`);
  console.log('   ✓ Criteria Breakdown:');
  console.log(`      - Relevance: ${e1.criteriaScores.relevance}/10`);
  console.log(`      - Correctness: ${e1.criteriaScores.correctness}/10`);
  console.log(`      - Completeness: ${e1.criteriaScores.completeness}/10`);
  console.log(`      - Technical Accuracy: ${e1.criteriaScores.technicalAccuracy}/10`);
  console.log(`   ✓ Correct Points (${e1.correctPoints.length}):`, e1.correctPoints);
  console.log(`   ✓ Missing Points (${e1.missingPoints.length}):`, e1.missingPoints);
  console.log(`   ✓ Improvement Advice: "${e1.improvement}"`);

  assert(e1.scoreOutOf10 >= 7, `Expected score >= 7/10 for strong OOP answer, got ${e1.scoreOutOf10}`);
  assert(Array.isArray(e1.correctPoints) && e1.correctPoints.length > 0, 'Should identify correct points');

  // Q2: Evasive / Low Quality answer
  const q2 = questions[1];
  console.log(`\n   --- Submitting Evasive/Poor Answer to Q2: "${q2.questionText}" ---`);
  const poorAnswerText = 'I do not know the answer to this question, sorry skip.';
  const eval2 = await request(`/interviews/${interviewId}/answer`, 'POST', {
    questionId: q2._id,
    responseText: poorAnswerText,
    responseType: 'text',
    timeSpentSeconds: 15,
  }, token);

  const e2 = eval2.evaluation;
  console.log(`   ✓ Score Out of 10: ${e2.scoreOutOf10}/10 (Overall Score: ${e2.overallScore}/100)`);
  console.log('   ✓ Criteria Breakdown:');
  console.log(`      - Relevance: ${e2.criteriaScores.relevance}/10`);
  console.log(`      - Correctness: ${e2.criteriaScores.correctness}/10`);
  console.log(`      - Completeness: ${e2.criteriaScores.completeness}/10`);
  console.log(`      - Technical Accuracy: ${e2.criteriaScores.technicalAccuracy}/10`);
  console.log(`   ✓ Missing Points:`, e2.missingPoints);
  console.log(`   ✓ Improvement Advice: "${e2.improvement}"`);

  assert(e2.scoreOutOf10 <= 3, `Expected low score <= 3/10 for evasive answer, got ${e2.scoreOutOf10}`);
  assert(eval2.isComplete === true, 'Interview should be completed after answering all questions');

  // Test 4.5: Camera & Face Detection AI Proctoring Events Logging
  console.log('\n[TEST 4.5] Testing Camera & Face Detection Proctoring Events Logging...');
  const eventsToTest = [
    { eventType: 'no_face_detected', confidence: 0.9, durationSeconds: 3, description: 'No face detected in camera frame for 3s.' },
    { eventType: 'multiple_faces_detected', confidence: 0.95, durationSeconds: 2, description: '2 people detected in camera frame.' },
    { eventType: 'looking_away', confidence: 0.88, durationSeconds: 3, description: 'Candidate looking away from screen for 3s.' },
    { eventType: 'left_frame', confidence: 0.85, durationSeconds: 2, description: 'Candidate partially or fully left the camera frame.' },
    { eventType: 'camera_disconnected', confidence: 1.0, durationSeconds: 1, description: 'Camera being stopped or disconnected.' },
    { eventType: 'tab_switched', confidence: 1.0, durationSeconds: 1, description: 'Candidate switched browser tabs or minimized window.' },
  ];

  for (const evt of eventsToTest) {
    const logRes = await request(`/interviews/${interviewId}/monitoring`, 'POST', evt, token);
    assert(logRes.success === true, `Failed to log proctoring event: ${evt.eventType}`);
    console.log(`   ✓ Logged suspicious event: [${evt.eventType}]`);
  }

  const getMonRes = await request(`/interviews/${interviewId}/monitoring`, 'GET', null, token);
  assert(getMonRes.count >= 6, `Expected at least 6 monitoring events, got ${getMonRes.count}`);
  console.log(`   ✓ Retrieved ${getMonRes.count} proctoring observations from audit ledger.`);

  // Test 5: End-of-Interview Report & Exemplar Verification
  console.log('\n[TEST 5/5] Testing Complete Interview Report & Exemplar Answers...');
  const reportRes = await request(`/interviews/${interviewId}/report`, 'GET', null, token);
  assert(reportRes.interview.status === 'completed', 'Interview status must be completed');
  assert(typeof reportRes.interview.scoreOutOf10 === 'number', 'Report must include scoreOutOf10');
  console.log(`   ✓ Interview Status: ${reportRes.interview.status}`);
  console.log(`   ✓ Interview Final Average Score: ${reportRes.interview.scoreOutOf10}/10 (${reportRes.interview.overallScore}%)`);
  console.log(`   ✓ Report Questions Count: ${reportRes.report.length}`);

  reportRes.report.forEach((item, idx) => {
    console.log(`\n   Question ${idx + 1}: ${item.questionText}`);
    console.log(`     Candidate Answer: "${item.candidateResponse?.slice(0, 60)}..."`);
    console.log(`     Score: ${item.evaluation?.scoreOutOf10}/10`);
    console.log(`     Exemplar Answer Provided: ${!!item.exemplarAnswer}`);
  });

  console.log('\n===========================================================');
  console.log('🎉 ALL SYSTEM & REQUIREMENT VERIFICATIONS PASSED SUCCESSFULLY!');
  console.log('===========================================================');
}

runCompleteSystemVerification().catch((err) => {
  console.error('\n❌ VERIFICATION TEST FAILED:', err);
  process.exit(1);
});
