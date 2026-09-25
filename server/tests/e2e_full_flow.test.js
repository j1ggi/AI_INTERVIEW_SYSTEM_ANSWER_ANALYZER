/**
 * Full End-to-End User Flow Test for MockVue
 * Tests: Register -> Login -> /me -> Profile Update -> Generate Interview -> 
 * Prep Check -> Start Interview -> Submit Answers -> Receive Evaluation -> 
 * Complete Interview -> Results Report -> History -> Analytics Overview & Performance.
 */

const BASE_URL = 'http://localhost:5000/api';

const runE2E = async () => {
  console.log('🚀 Starting MockVue Full End-to-End Test Suite...\n');
  const uniqueId = Math.floor(Math.random() * 90000) + 10000;
  const userPayload = {
    name: 'Vikram Sengupta',
    email: `vikram_${uniqueId}@college.edu`,
    password: 'vivaPassword2026',
    targetRole: 'Software Development Engineer',
  };

  // 1. Register Candidate
  console.log('[1/10] Registering Candidate:', userPayload.email);
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userPayload),
  });
  const regData = await regRes.json();
  if (!regData.token) throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
  const token = regData.token;
  console.log('   ✓ Registered successfully. JWT issued.');

  // 2. Login Verification
  console.log('\n[2/10] Verifying Login Authentication...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: userPayload.email, password: userPayload.password }),
  });
  const loginData = await loginRes.json();
  if (!loginData.token) throw new Error('Login failed');
  console.log('   ✓ Login authenticated.');

  // 3. Profile Fetch & Update
  console.log('\n[3/10] Testing Profile Update & Preferences...');
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  const profileRes = await fetch(`${BASE_URL}/users/profile`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      targetRole: 'Full Stack Developer',
      bio: 'B.Tech final year student targeting Tier-1 product companies.',
      preferredTopics: ['Data Structures & Algorithms', 'Database Management Systems', 'System Design'],
    }),
  });
  const profileData = await profileRes.json();
  if (profileData.user.targetRole !== 'Full Stack Developer') {
    throw new Error('Profile update failed');
  }
  console.log('   ✓ Profile updated to:', profileData.user.targetRole);

  // 4. Generate AI Interview Session
  console.log('\n[4/10] Requesting AI Interview Generation...');
  const genRes = await fetch(`${BASE_URL}/interviews/generate`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      targetRole: 'Full Stack Developer',
      topics: ['Database Management Systems', 'System Design'],
      difficulty: 'Medium',
      interviewType: 'Technical',
      questionCount: 2,
      durationMinutes: 15,
    }),
  });
  const genData = await genRes.json();
  if (!genData.interviewId) throw new Error(`Generation failed: ${JSON.stringify(genData)}`);
  const interviewId = genData.interviewId;
  console.log(`   ✓ Interview Session Created: [${interviewId}] - ${genData.interview.title}`);

  // 5. Fetch Active Interview & Validate Anti-Cheat Sanitation
  console.log('\n[5/10] Fetching Interview & Verifying Candidate Sanitization...');
  const getIntRes = await fetch(`${BASE_URL}/interviews/${interviewId}`, { headers: authHeaders });
  const getIntData = await getIntRes.json();
  const q1 = getIntData.interview.questions[0];
  const q2 = getIntData.interview.questions[1];
  if (q1.referenceConcepts !== undefined) {
    throw new Error('Security flaw: Reference answers exposed during active interview!');
  }
  console.log('   ✓ Candidate Security Verified: referenceConcepts are hidden.');
  console.log(`   ✓ Q1: "${q1.questionText}"`);
  console.log(`   ✓ Q2: "${q2.questionText}"`);

  // 6. Start Interview
  console.log('\n[6/10] Transitioning Session State to in_progress...');
  const startRes = await fetch(`${BASE_URL}/interviews/${interviewId}/start`, {
    method: 'POST',
    headers: authHeaders,
  });
  const startData = await startRes.json();
  if (startData.status !== 'in_progress') throw new Error('Failed to start interview');
  console.log('   ✓ Session status is now in_progress.');

  // 7. Submit Answer to Q1 and Verify 4-Tier Rubric Evaluation
  console.log('\n[7/10] Submitting Candidate Answer for Q1...');
  const ans1Res = await fetch(`${BASE_URL}/interviews/${interviewId}/answer`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      questionId: q1._id,
      responseText: 'Relational databases use B+ trees for indexing because the high fan-out minimizes disk I/O reads. Furthermore, linked leaf nodes allow fast O(log n) range queries, which are crucial for SQL queries.',
      responseType: 'text',
      timeSpentSeconds: 65,
    }),
  });
  const ans1Data = await ans1Res.json();
  if (!ans1Data.evaluation) throw new Error(`Evaluation failed: ${JSON.stringify(ans1Data)}`);
  console.log(`   ✓ Answer Evaluated! Overall Score: ${ans1Data.evaluation.overallScore}/100`);
  console.log('   ✓ Rubric Criteria:', ans1Data.evaluation.criteriaScores);
  console.log('   ✓ Feedback:', ans1Data.evaluation.feedback);

  // 8. Submit Answer to Q2 (Completing the Interview)
  console.log('\n[8/10] Submitting Candidate Answer for Q2 (Completing Session)...');
  const ans2Res = await fetch(`${BASE_URL}/interviews/${interviewId}/answer`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      questionId: q2._id,
      responseText: 'In a URL shortener, IDs can be generated using a distributed counter and Base62 encoding to ensure uniqueness without collisions. Redis caching handles the 100:1 read-to-write ratio.',
      responseType: 'text',
      timeSpentSeconds: 50,
    }),
  });
  const ans2Data = await ans2Res.json();
  if (!ans2Data.isComplete) throw new Error('Session should be marked complete after last question');
  console.log('   ✓ Final Question Submitted! Session marked as complete.');

  // 9. Fetch Full Assessment Report
  console.log('\n[9/10] Fetching End-of-Interview Results Report...');
  const repRes = await fetch(`${BASE_URL}/interviews/${interviewId}/report`, { headers: authHeaders });
  const repData = await repRes.json();
  console.log(`   ✓ Report Generated! Final Average Score: ${repData.interview.overallScore}%`);
  console.log(`   ✓ Total Questions Analyzed: ${repData.report.length}`);

  // 10. Verify Real Analytics Calculation
  console.log('\n[10/10] Querying Data-Driven Analytics Overview & Performance...');
  const ovRes = await fetch(`${BASE_URL}/analytics/overview`, { headers: authHeaders });
  const ovData = await ovRes.json();
  const perfRes = await fetch(`${BASE_URL}/analytics/performance`, { headers: authHeaders });
  const perfData = await perfRes.json();

  console.log(`   ✓ Total Completed Interviews in Analytics: ${ovData.overview.completedCount}`);
  console.log(`   ✓ Overall Score in Analytics: ${ovData.overview.averageScore}%`);
  console.log(`   ✓ Personalized Placement Recommendation: ${perfData.analytics.recommendation.topic} (${perfData.analytics.recommendation.difficulty})`);
  console.log(`     Reason: "${perfData.analytics.recommendation.reason}"`);

  console.log('\n========================================================');
  console.log('🎉 ALL 10 END-TO-END SYSTEM TESTS PASSED SUCCESSFULLY!');
  console.log('========================================================');
};

runE2E().catch((err) => {
  console.error('\n❌ E2E TEST FAILED:', err.message);
  process.exit(1);
});
