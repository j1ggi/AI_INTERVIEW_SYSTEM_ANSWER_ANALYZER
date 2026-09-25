import mongoose from 'mongoose';
import Interview from '../models/Interview.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import { aiService } from '../services/ai/AIProviderFactory.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/customErrors.js';

export const generateInterview = async (req, res, next) => {
  try {
    const {
      targetRole,
      topics,
      difficulty = 'Medium',
      interviewType = 'Technical',
      questionCount = 5,
      durationMinutes = 20,
    } = req.body;

    if (!targetRole) {
      throw new ValidationError('Target job role is required.');
    }
    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      throw new ValidationError('At least one technical topic must be selected.');
    }

    const count = Math.min(Math.max(parseInt(questionCount, 10) || 5, 1), 10);
    const duration = Math.min(Math.max(parseInt(durationMinutes, 10) || 20, 5), 60);

    // 1. Generate questions via AI Service Layer
    const aiResult = await aiService.generateQuestions({
      targetRole,
      topics,
      difficulty,
      interviewType,
      experienceLevel: req.user.experienceLevel || 'Entry-Level',
      questionCount: count,
    });

    const sessionTitle = `${difficulty} ${interviewType} Interview — ${targetRole}`;

    // 2. Create Interview Document
    const interview = await Interview.create({
      userId: req.user._id,
      title: sessionTitle,
      targetRole,
      difficulty,
      interviewType,
      topics,
      durationMinutes: duration,
      status: 'created',
      isFallbackAI: aiResult.isFallback,
    });

    // 3. Create Question Documents linked to interviewId
    const questionDocs = aiResult.questions.map((q, idx) => ({
      interviewId: interview._id,
      orderIndex: idx,
      questionText: q.questionText,
      topic: q.topic || topics[0],
      difficulty: q.difficulty || difficulty,
      type: q.type || interviewType,
      referenceConcepts: q.referenceConcepts || [],
      evaluationCriteria: q.evaluationCriteria || [],
    }));

    const savedQuestions = await Question.insertMany(questionDocs);

    // 4. Associate Questions with Interview
    interview.questions = savedQuestions.map((q) => q._id);
    await interview.save();

    res.status(201).json({
      success: true,
      message: 'Interview session created successfully.',
      interviewId: interview._id,
      interview: {
        _id: interview._id,
        title: interview.title,
        targetRole: interview.targetRole,
        difficulty: interview.difficulty,
        interviewType: interview.interviewType,
        topics: interview.topics,
        durationMinutes: interview.durationMinutes,
        questionCount: savedQuestions.length,
        status: interview.status,
        isFallbackAI: interview.isFallbackAI,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getInterview = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid interview session ID.');
    }

    const interview = await Interview.findById(id).populate('questions');
    if (!interview) {
      throw new NotFoundError('Interview session not found.');
    }

    if (interview.userId.toString() !== req.user._id.toString()) {
      throw new ForbiddenError('You do not have permission to access this interview session.');
    }

    // Sanitize questions if interview is not completed (prevent candidate from inspecting answers)
    const isCompleted = interview.status === 'completed' || interview.status === 'terminated';
    const sanitizedQuestions = interview.questions.map((q) => {
      const qObj = q.toObject();
      if (!isCompleted) {
        delete qObj.referenceConcepts;
        delete qObj.evaluationCriteria;
      }
      return qObj;
    });

    // Fetch any previously answered questions for session restore
    const existingAnswers = await Answer.find({ interviewId: interview._id }).select('questionId overallScore submittedAt');

    res.status(200).json({
      success: true,
      interview: {
        ...interview.toObject(),
        questions: sanitizedQuestions,
        answeredQuestionIds: existingAnswers.map((a) => a.questionId.toString()),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const startInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const interview = await Interview.findById(id);

    if (!interview) {
      throw new NotFoundError('Interview session not found.');
    }
    if (interview.userId.toString() !== req.user._id.toString()) {
      throw new ForbiddenError('You do not have permission to modify this interview.');
    }

    if (interview.status === 'created') {
      interview.status = 'in_progress';
      interview.startedAt = new Date();
      await interview.save();
    }

    res.status(200).json({
      success: true,
      message: 'Interview started.',
      status: interview.status,
      startedAt: interview.startedAt,
    });
  } catch (error) {
    next(error);
  }
};

export const submitAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { questionId, responseText, responseType = 'text', timeSpentSeconds = 0 } = req.body;

    if (!responseText || typeof responseText !== 'string' || !responseText.trim()) {
      throw new ValidationError('Answer response text cannot be empty.');
    }

    const interview = await Interview.findById(id);
    if (!interview) {
      throw new NotFoundError('Interview session not found.');
    }
    if (interview.userId.toString() !== req.user._id.toString()) {
      throw new ForbiddenError('You do not have permission to submit answers for this interview.');
    }
    if (interview.status === 'completed') {
      throw new ValidationError('This interview session has already been completed.');
    }

    const question = await Question.findById(questionId);
    if (!question || question.interviewId.toString() !== interview._id.toString()) {
      throw new NotFoundError('Question not found or does not belong to this interview session.');
    }

    // Check for duplicate submission
    const existingAnswer = await Answer.findOne({ interviewId: interview._id, questionId });
    if (existingAnswer) {
      return res.status(409).json({
        success: false,
        message: 'This question has already been answered and evaluated.',
        evaluation: existingAnswer,
      });
    }

    // 1. Evaluate answer using AI Service Layer
    const evaluation = await aiService.evaluateAnswer({
      questionText: question.questionText,
      referenceConcepts: question.referenceConcepts,
      evaluationCriteria: question.evaluationCriteria,
      candidateAnswer: responseText.trim(),
      topic: question.topic,
    });

    // 2. Persist Answer & Evaluation
    const answer = await Answer.create({
      interviewId: interview._id,
      questionId: question._id,
      userId: req.user._id,
      responseType,
      responseText: responseText.trim(),
      overallScore: evaluation.overallScore,
      criteriaScores: evaluation.criteriaScores,
      correctConcepts: evaluation.correctConcepts || [],
      missingConcepts: evaluation.missingConcepts || [],
      mistakes: evaluation.mistakes || [],
      explanation: evaluation.explanation || '',
      feedback: evaluation.feedback || '',
      improvedAnswer: evaluation.improvedAnswer || '',
      recommendedTopics: evaluation.recommendedTopics || [],
      timeSpentSeconds: parseInt(timeSpentSeconds, 10) || 0,
      isFallbackEvaluation: evaluation.isFallback || false,
    });

    // 3. Progress Question Pointer
    const totalQuestions = interview.questions.length;
    const nextIndex = Math.min(interview.currentQuestionIndex + 1, totalQuestions);
    interview.currentQuestionIndex = nextIndex;

    // Check if this was the last question
    const allAnswersCount = await Answer.countDocuments({ interviewId: interview._id });
    const isComplete = allAnswersCount >= totalQuestions;

    if (isComplete) {
      const allAnswers = await Answer.find({ interviewId: interview._id });
      const avgScore = Math.round(
        allAnswers.reduce((sum, a) => sum + a.overallScore, 0) / allAnswers.length
      );
      interview.status = 'completed';
      interview.overallScore = avgScore;
      interview.completedAt = new Date();
    }

    await interview.save();

    res.status(201).json({
      success: true,
      message: 'Answer evaluated and recorded successfully.',
      evaluation: answer,
      nextQuestionIndex: nextIndex,
      isComplete,
      interviewStatus: interview.status,
    });
  } catch (error) {
    next(error);
  }
};

export const completeInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, terminated } = req.body || {};
    const interview = await Interview.findById(id);

    if (!interview) {
      throw new NotFoundError('Interview session not found.');
    }
    if (interview.userId.toString() !== req.user._id.toString()) {
      throw new ForbiddenError('Unauthorized.');
    }

    if (interview.status !== 'completed') {
      const answers = await Answer.find({ interviewId: interview._id });
      const avgScore = answers.length
        ? Math.round(answers.reduce((acc, curr) => acc + curr.overallScore, 0) / answers.length)
        : 0;

      interview.status = terminated ? 'terminated' : (interview.status === 'terminated' ? 'terminated' : 'completed');
      interview.overallScore = avgScore;
      interview.completedAt = interview.completedAt || new Date();
      if (reason) {
        interview.terminationReason = reason;
      }
      await interview.save();
    }

    res.status(200).json({
      success: true,
      message: interview.terminationReason
        ? `Interview concluded: ${interview.terminationReason}`
        : 'Interview session completed.',
      status: interview.status,
      overallScore: interview.overallScore,
      terminationReason: interview.terminationReason,
      completedAt: interview.completedAt,
    });
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

export const getReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const interview = await Interview.findById(id).populate('questions');

    if (!interview) {
      throw new NotFoundError('Interview session not found.');
    }
    if (interview.userId.toString() !== req.user._id.toString()) {
      throw new ForbiddenError('Unauthorized.');
    }

    // Retrieve answers with evaluations
    const answers = await Answer.find({ interviewId: interview._id });

    // Combine questions with corresponding answers
    const reportData = interview.questions.map((q) => {
      const ans = answers.find((a) => a.questionId.toString() === q._id.toString());
      return {
        question: q,
        answer: ans || null,
      };
    });

    res.status(200).json({
      success: true,
      interview,
      report: reportData,
    });
  } catch (error) {
    next(error);
  }
};
