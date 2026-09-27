import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  ChevronRight, 
  AlertCircle,
  Plus,
  BookOpen,
  FileText
} from 'lucide-react';
import api from '../services/api';

export const HistoryPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/interviews/history')
      .then((res) => {
        setInterviews(res.interviews || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch interview history.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-600">Loading interview records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Interview History</h1>
          <p className="text-xs text-slate-500 mt-1">Review your past practice sessions and feedback reports</p>
        </div>

        <Link
          to="/interviews/new"
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Interview</span>
        </Link>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {interviews.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center space-y-3 shadow-sm">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">No Interview Sessions Yet</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't completed any mock interviews. Start a session now to practice speaking your technical answers.
          </p>
          <Link
            to="/interviews/new"
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Start an Interview</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map((item) => {
            const isCompleted = item.status === 'completed';
            const score10 = item.overallScore !== null ? Math.round(item.overallScore / 10) : null;

            return (
              <div
                key={item._id}
                className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      isCompleted
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {isCompleted ? 'Completed' : 'In Progress'}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {item.difficulty}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-500">
                    {item.targetRole} • {item.topics?.join(', ')}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Score</span>
                    <span className="text-lg font-bold text-blue-600">
                      {score10 !== null ? `${score10}/10` : '—'}
                    </span>
                  </div>

                  <Link
                    to={`/interviews/${item._id}/results`}
                    className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3 py-2 rounded transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Report</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
