import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
      index: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    responseType: {
      type: String,
      enum: ['text', 'voice', 'audio'],
      default: 'text',
    },
    responseText: {
      type: String,
      required: [true, 'Candidate answer text is required'],
      trim: true,
    },
    transcriptConfidence: {
      type: Number,
      default: null,
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    scoreOutOf10: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    criteriaScores: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({
        relevance: 0,
        correctness: 0,
        completeness: 0,
        technicalAccuracy: 0,
        quality: 0,
        technicalCorrectness: 0,
        clarity: 0,
      }),
    },
    correctPoints: {
      type: [String],
      default: [],
    },
    missingPoints: {
      type: [String],
      default: [],
    },
    incorrectPoints: {
      type: [String],
      default: [],
    },
    improvement: {
      type: String,
      default: '',
    },
    correctConcepts: {
      type: [String],
      default: [],
    },
    missingConcepts: {
      type: [String],
      default: [],
    },
    mistakes: {
      type: [String],
      default: [],
    },
    explanation: {
      type: String,
      default: '',
    },
    feedback: {
      type: String,
      default: '',
    },
    improvedAnswer: {
      type: String,
      default: '',
    },
    recommendedTopics: {
      type: [String],
      default: [],
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
    },
    isFallbackEvaluation: {
      type: Boolean,
      default: false,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate answers to the same question within an interview
answerSchema.index({ interviewId: 1, questionId: 1 }, { unique: true });

const Answer = mongoose.model('Answer', answerSchema);
export default Answer;
