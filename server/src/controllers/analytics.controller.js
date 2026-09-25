import Interview from '../models/Interview.js';
import Answer from '../models/Answer.js';
import Question from '../models/Question.js';
import MonitoringEvent from '../models/MonitoringEvent.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/customErrors.js';

export const getOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const totalInterviews = await Interview.countDocuments({ userId });
    const completedInterviews = await Interview.find({ userId, status: { $in: ['completed', 'terminated'] } })
      .sort({ completedAt: -1 });

    const completedCount = completedInterviews.length;
    const avgScore = completedCount
      ? Math.round(completedInterviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) / completedCount)
      : 0;

    const totalMinutesPracticed = completedInterviews.reduce((sum, i) => sum + (i.durationMinutes || 0), 0);

    // Latest 5 interview scores for trajectory trend
    const recentScores = completedInterviews.slice(0, 5).map((i) => ({
      id: i._id,
      title: i.title,
      score: i.overallScore || 0,
      difficulty: i.difficulty,
      date: i.completedAt,
    })).reverse();

    res.status(200).json({
      success: true,
      overview: {
        totalInterviews,
        completedCount,
        averageScore: avgScore,
        totalMinutesPracticed,
        readinessStatus: completedCount === 0 ? 'Not Started' : avgScore >= 75 ? 'Placement Ready' : 'Needs Practice',
        recentScores,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPerformance = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Fetch all completed/terminated interviews sorted chronologically
    const completed = await Interview.find({ userId, status: { $in: ['completed', 'terminated'] } })
      .sort({ completedAt: 1 })
      .select('title difficulty overallScore completedAt topics');

    // 2. Score progression timeline
    const scoreTrend = completed.map((i, idx) => ({
      index: idx + 1,
      interviewId: i._id,
      title: i.title,
      difficulty: i.difficulty,
      score: i.overallScore || 0,
      date: new Date(i.completedAt).toLocaleDateString(),
    }));

    // 3. Performance by Topic using genuine Answer scores
    const answers = await Answer.find({ userId }).populate('questionId', 'topic difficulty');
    const topicAggregates = {};

    answers.forEach((ans) => {
      const topic = ans.questionId?.topic || 'Core CS';
      if (!topicAggregates[topic]) {
        topicAggregates[topic] = { totalScore: 0, count: 0 };
      }
      topicAggregates[topic].totalScore += ans.overallScore || 0;
      topicAggregates[topic].count += 1;
    });

    const topicPerformance = Object.keys(topicAggregates).map((topic) => ({
      topic,
      averageScore: Math.round(topicAggregates[topic].totalScore / topicAggregates[topic].count),
      attempts: topicAggregates[topic].count,
    }));

    // 4. Performance by Difficulty
    const difficultyMap = { Easy: { total: 0, count: 0 }, Medium: { total: 0, count: 0 }, Hard: { total: 0, count: 0 } };
    completed.forEach((i) => {
      if (difficultyMap[i.difficulty]) {
        difficultyMap[i.difficulty].total += i.overallScore || 0;
        difficultyMap[i.difficulty].count += 1;
      }
    });

    const difficultyPerformance = Object.keys(difficultyMap).map((diff) => ({
      difficulty: diff,
      averageScore: difficultyMap[diff].count ? Math.round(difficultyMap[diff].total / difficultyMap[diff].count) : 0,
      count: difficultyMap[diff].count,
    }));

    // 5. Strongest vs Weakest Topics
    const sortedTopics = [...topicPerformance].sort((a, b) => b.averageScore - a.averageScore);
    const strongestTopics = sortedTopics.filter((t) => t.averageScore >= 65);
    const weakestTopics = sortedTopics.filter((t) => t.averageScore < 65);

    // 6. Actionable Next Recommendation
    let recommendation = {
      topic: 'Data Structures & Algorithms',
      difficulty: 'Medium',
      reason: 'Complete an initial placement interview to benchmark your foundational skills.',
    };

    if (weakestTopics.length > 0) {
      recommendation = {
        topic: weakestTopics[0].topic,
        difficulty: 'Medium',
        reason: `Your average score in ${weakestTopics[0].topic} is ${weakestTopics[0].averageScore}%. Focused practice will elevate your overall placement readiness.`,
      };
    } else if (sortedTopics.length > 0) {
      recommendation = {
        topic: sortedTopics[0].topic,
        difficulty: 'Hard',
        reason: `You've demonstrated solid mastery in ${sortedTopics[0].topic} (${sortedTopics[0].averageScore}%). Challenge yourself with Hard tier questions.`,
      };
    }

    res.status(200).json({
      success: true,
      analytics: {
        scoreTrend,
        topicPerformance,
        difficultyPerformance,
        strongestTopics,
        weakestTopics,
        recommendation,
        totalAnswersAnalyzed: answers.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logMonitoringEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { eventType, durationSeconds = 0, confidence = 0.85, description } = req.body;

    const interview = await Interview.findById(id);
    if (!interview) {
      throw new NotFoundError('Interview session not found.');
    }
    if (interview.userId.toString() !== req.user._id.toString()) {
      throw new ForbiddenError('Unauthorized.');
    }

    const event = await MonitoringEvent.create({
      interviewId: interview._id,
      userId: req.user._id,
      eventType,
      durationSeconds: parseInt(durationSeconds, 10) || 0,
      confidence: parseFloat(confidence) || 0.85,
      description: description || `Focus monitoring observation: ${eventType.replace(/_/g, ' ')}`,
    });

    interview.proctoringViolations = (interview.proctoringViolations || 0) + 1;

    // Strict tab switch or window blur rule: "if someone goes from that tab test end"
    if (eventType === 'tab_switched' || eventType === 'window_blurred') {
      interview.status = 'terminated';
      interview.terminationReason = 'Exam terminated: Candidate navigated away from the examination tab.';
      interview.completedAt = new Date();
    } else if (eventType === 'fullscreen_exit') {
      interview.status = 'terminated';
      interview.terminationReason = 'Exam terminated: Full-screen examination mode was exited.';
      interview.completedAt = new Date();
    } else if (eventType === 'max_warnings_exceeded' || interview.proctoringViolations >= 5) {
      // 5-Warning Rule: "after 5 warning test ends"
      interview.status = 'terminated';
      interview.terminationReason = 'Exam terminated: Exceeded maximum allowed proctoring warnings (5 infractions accumulated).';
      interview.completedAt = new Date();
    }

    await interview.save();

    res.status(201).json({
      success: true,
      event,
      totalViolations: interview.proctoringViolations,
      isTerminated: interview.status === 'terminated',
      terminationReason: interview.terminationReason,
    });
  } catch (error) {
    next(error);
  }
};

export const getMonitoringEvents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const interview = await Interview.findById(id);

    if (!interview) {
      throw new NotFoundError('Interview session not found.');
    }
    if (interview.userId.toString() !== req.user._id.toString()) {
      throw new ForbiddenError('Unauthorized.');
    }

    const events = await MonitoringEvent.find({ interviewId: interview._id }).sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    next(error);
  }
};
