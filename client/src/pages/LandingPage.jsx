import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Mic, 
  CheckCircle, 
  Award, 
  BookOpen, 
  Layers, 
  FileText,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 py-16 sm:py-24 text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          Technical Mock Interview & Viva Preparation Platform
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-3xl mx-auto">
          Practice Technical Interviews by <span className="text-blue-600">Speaking Your Answers</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          MockVue is a simple, student-friendly platform for college placements and technical viva exams. Speak your answers naturally, review your transcript, and get meaningful evaluation based on conceptual correctness.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-6 py-3 rounded-lg shadow-sm transition-colors w-full sm:w-auto"
            >
              <span>Go to Dashboard ({user?.name || 'Student'})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-6 py-3 rounded-lg shadow-sm transition-colors w-full sm:w-auto"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium text-sm px-6 py-3 rounded-lg shadow-sm transition-colors w-full sm:w-auto"
              >
                <span>Student Login</span>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-center text-slate-900 mb-8">
          Built for Student Placement Success
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Audio Recording & STT</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Record complete answers without arbitrary cutoffs. Your speech is converted to text, which you can easily review and edit before submission.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-200 text-green-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Semantic Evaluation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Answers are evaluated for technical meaning and accuracy, not exact keyword matching. Correct concepts in your own words receive fair scores.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Structured Rubric Feedback</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Receive scores out of 10 for Relevance, Correctness, Completeness, and Technical Accuracy, along with clear points on what was right and missing.
            </p>
          </div>
        </div>
      </section>

      {/* How it works 3 steps */}
      <section className="bg-white border-y border-slate-200 py-14">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">How MockVue Works</h2>
            <p className="text-xs text-slate-500 mt-1">Simple 3-step practice flow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="space-y-2">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">STEP 1</span>
              <h4 className="text-sm font-semibold text-slate-900">Choose Role & Topics</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select your target job role (SDE, Full Stack, Frontend, Backend) and preferred subjects (DSA, DBMS, OS, Networks, OOP).
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">STEP 2</span>
              <h4 className="text-sm font-semibold text-slate-900">Speak & Review</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Click "Start Recording", speak your answer, click "Stop Recording", and check your transcribed text before submitting.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">STEP 3</span>
              <h4 className="text-sm font-semibold text-slate-900">Receive Score & Feedback</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Get an objective score out of 10 with actionable feedback on correct points, omitted topics, and model answers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Ready to Practice Your Viva & Technical Rounds?</h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Start a mock interview session now and test your conceptual readiness.
        </p>
        <div className="pt-2">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-6 py-2.5 rounded-lg shadow-sm transition-colors"
          >
            <span>Start Practicing Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
