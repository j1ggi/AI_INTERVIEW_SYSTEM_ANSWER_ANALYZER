import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Plus,
  Compass,
  BookOpen,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Camera
} from 'lucide-react';
import api from '../services/api';

export const InterviewResultsPage = () => {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [report, setReport] = useState([]);
  const [monitoringEvents, setMonitoringEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get(`/interviews/${id}/report`),
      api.get(`/interviews/${id}/monitoring`).catch(() => ({ events: [] })),
    ])
      .then(([res, monRes]) => {
        setInterview(res.interview);
        setReport(res.report || []);
        setMonitoringEvents(monRes.events || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load interview results.');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-600">Compiling interview results report...</p>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-white border border-slate-200 rounded-lg text-center shadow-sm space-y-4">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Results Unavailable</h2>
        <p className="text-sm text-slate-600">{error || 'Could not load interview session.'}</p>
        <Link
          to="/dashboard"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const answeredQuestions = report.filter((r) => r.answer);
  const overallPercentage = interview.overallScore || (
    answeredQuestions.length > 0
      ? Math.round(answeredQuestions.reduce((acc, curr) => acc + (curr.answer.overallScore || 0), 0) / answeredQuestions.length)
      : 0
  );
  const overallScoreOutOf10 = Math.round(overallPercentage / 10);

  // Compute average criteria scores (0-10)
  const avgRelevance = answeredQuestions.length
    ? Math.round(answeredQuestions.reduce((sum, r) => sum + (r.answer.criteriaScores?.relevance || Math.round((r.answer.overallScore || 70) / 10)), 0) / answeredQuestions.length)
    : 0;

  const avgCorrectness = answeredQuestions.length
    ? Math.round(answeredQuestions.reduce((sum, r) => sum + (r.answer.criteriaScores?.correctness || Math.round((r.answer.overallScore || 70) / 10)), 0) / answeredQuestions.length)
    : 0;

  const avgCompleteness = answeredQuestions.length
    ? Math.round(answeredQuestions.reduce((sum, r) => sum + (r.answer.criteriaScores?.completeness || Math.max(1, Math.round((r.answer.overallScore || 70) / 10) - 1)), 0) / answeredQuestions.length)
    : 0;

  const avgTechnicalAccuracy = answeredQuestions.length
    ? Math.round(answeredQuestions.reduce((sum, r) => sum + (r.answer.criteriaScores?.technicalAccuracy || Math.round((r.answer.overallScore || 70) / 10)), 0) / answeredQuestions.length)
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner / Summary */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">{interview.title}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Completed on {new Date(interview.completedAt || interview.updatedAt).toLocaleDateString()} • {answeredQuestions.length} of {report.length} questions answered
          </p>
        </div>

        {/* Overall Score Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center min-w-[160px]">
          <span className="text-xs text-blue-700 font-semibold uppercase tracking-wider block">Overall Score</span>
          <span className="text-3xl sm:text-4xl font-extrabold text-blue-700 my-0.5 block">
            {overallScoreOutOf10}/10
          </span>
          <span className="text-xs text-blue-600 font-medium">({overallPercentage}%)</span>
        </div>
      </div>

      {/* Rubric Criteria Summary Cards (0-10 Scale) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm text-center">
          <span className="text-xs text-slate-500 block mb-1">Relevance</span>
          <span className="text-xl font-bold text-slate-900">{avgRelevance}/10</span>
          <p className="text-[11px] text-slate-400 mt-1">Directly answers question</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm text-center">
          <span className="text-xs text-slate-500 block mb-1">Correctness</span>
          <span className="text-xl font-bold text-slate-900">{avgCorrectness}/10</span>
          <p className="text-[11px] text-slate-400 mt-1">Factual accuracy</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm text-center">
          <span className="text-xs text-slate-500 block mb-1">Completeness</span>
          <span className="text-xl font-bold text-slate-900">{avgCompleteness}/10</span>
          <p className="text-[11px] text-slate-400 mt-1">Coverage of key concepts</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm text-center">
          <span className="text-xs text-slate-500 block mb-1">Technical Accuracy</span>
          <span className="text-xl font-bold text-slate-900">{avgTechnicalAccuracy}/10</span>
          <p className="text-[11px] text-slate-400 mt-1">CS mechanics & terms</p>
        </div>
      </div>

      {/* AI Proctoring & Session Integrity Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">AI Proctoring & Session Integrity</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {monitoringEvents.length === 0 ? 'Zero Infractions' : `${monitoringEvents.length} Events Logged`}
          </span>
        </div>

        {monitoringEvents.length === 0 ? (
          <div className="p-3.5 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
            <div className="text-xs text-green-900">
              <span className="font-semibold block">Integrity Verified</span>
              <span>Candidate remained centered in camera frame throughout the session with no suspicious activity detected.</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-0.5">
                <span className="font-semibold block">Suspicious Activity Recorded</span>
                <span>The system observed {monitoringEvents.length} focus or presence deviation(s). Evidence is preserved below for objective review:</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {monitoringEvents.map((evt, idx) => (
                <div key={idx} className="p-2.5 px-3 flex items-center justify-between text-xs hover:bg-slate-50">
                  <div className="space-y-0.5">
                    <span className="font-medium text-slate-800 capitalize">
                      {evt.eventType?.replace(/_/g, ' ')}
                    </span>
                    <p className="text-[11px] text-slate-500">{evt.description}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : 'During session'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Question-by-Question Review Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Question Evaluation Breakdown</h2>
          <span className="text-xs text-slate-500">{report.length} Questions</span>
        </div>

        <div className="space-y-3">
          {report.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            const q = item.question;
            const a = item.answer;
            const score10 = a?.scoreOutOf10 !== undefined ? a.scoreOutOf10 : (a ? Math.round((a.overallScore || 0) / 10) : null);

            return (
              <div
                key={q._id || idx}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm transition-all"
              >
                {/* Header / Toggle Row */}
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="bg-slate-100 font-semibold text-slate-700 px-2 py-0.5 rounded">
                        Q{idx + 1}
                      </span>
                      <span className="font-medium text-slate-700">{q.topic}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">{q.difficulty}</span>
                    </div>

                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                      {q.questionText}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold text-blue-600">
                      {score10 !== null ? `${score10}/10` : 'Unanswered'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Details Body */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-200 bg-slate-50/50 space-y-4">
                    {/* Student's Answer */}
                    <div className="space-y-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                        Your Submitted Answer:
                      </span>
                      <div className="p-3.5 bg-white border border-slate-200 rounded text-sm text-slate-800 leading-relaxed font-normal">
                        {a ? a.responseText : 'No response was submitted for this question.'}
                      </div>
                    </div>

                    {/* Criteria Scores for this question */}
                    {a && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="bg-white border border-slate-200 p-2.5 rounded text-center">
                          <span className="text-slate-500 block text-[11px]">Relevance</span>
                          <strong className="text-slate-800 font-bold">
                            {a.criteriaScores?.relevance ?? score10}/10
                          </strong>
                        </div>
                        <div className="bg-white border border-slate-200 p-2.5 rounded text-center">
                          <span className="text-slate-500 block text-[11px]">Correctness</span>
                          <strong className="text-slate-800 font-bold">
                            {a.criteriaScores?.correctness ?? score10}/10
                          </strong>
                        </div>
                        <div className="bg-white border border-slate-200 p-2.5 rounded text-center">
                          <span className="text-slate-500 block text-[11px]">Completeness</span>
                          <strong className="text-slate-800 font-bold">
                            {a.criteriaScores?.completeness ?? Math.max(1, score10 - 1)}/10
                          </strong>
                        </div>
                        <div className="bg-white border border-slate-200 p-2.5 rounded text-center">
                          <span className="text-slate-500 block text-[11px]">Technical Accuracy</span>
                          <strong className="text-slate-800 font-bold">
                            {a.criteriaScores?.technicalAccuracy ?? score10}/10
                          </strong>
                        </div>
                      </div>
                    )}

                    {/* Correct & Missing Points */}
                    {a && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3.5 bg-green-50 border border-green-200 rounded-lg space-y-1.5">
                          <span className="font-bold text-green-800 flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Correct Points:
                          </span>
                          <ul className="list-disc list-inside text-green-900 space-y-0.5">
                            {(a.correctPoints || a.correctConcepts || []).map((pt, i) => (
                              <li key={i}>{pt}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg space-y-1.5">
                          <span className="font-bold text-amber-800 flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            Missing Points:
                          </span>
                          <ul className="list-disc list-inside text-amber-900 space-y-0.5">
                            {(a.missingPoints || a.missingConcepts || []).map((pt, i) => (
                              <li key={i}>{pt}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Incorrect Points */}
                    {a && (a.incorrectPoints || a.mistakes || []).length > 0 && (
                      <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg space-y-1 text-xs">
                        <span className="font-bold text-red-800 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          Incorrect Points:
                        </span>
                        <ul className="list-disc list-inside text-red-900 space-y-0.5">
                          {(a.incorrectPoints || a.mistakes || []).map((pt, i) => (
                            <li key={i}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Improvement Advice */}
                    {a?.improvement && (
                      <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-1">
                        <span className="font-bold text-blue-800 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          How to Improve:
                        </span>
                        <p className="text-blue-900 leading-relaxed">{a.improvement}</p>
                      </div>
                    )}

                    {/* Exemplar Model Answer */}
                    {a?.improvedAnswer && (
                      <div className="p-3.5 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                        <span className="font-semibold text-slate-700 block">
                          Reference Exemplar Answer:
                        </span>
                        <p className="text-slate-600 leading-relaxed">{a.improvedAnswer}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs px-4 py-2 rounded transition-colors"
        >
          <Compass className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/history"
            className="inline-flex items-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs px-4 py-2 rounded transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Interview History
          </Link>

          <Link
            to="/interviews/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
            Start New Interview
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InterviewResultsPage;
