import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle, 
  Award, 
  BookOpen, 
  Plus, 
  FileText,
  Clock,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/interviews/history')
      .then((data) => {
        setInterviews(data.interviews || []);
        setLoading(false);
      })
      .catch(() => {
        setInterviews([]);
        setLoading(false);
      });
  }, []);

  const totalInterviews = interviews.length;
  const completedInterviews = interviews.filter((i) => i.status === 'completed' || i.status === 'terminated');
  const averageScore = completedInterviews.length
    ? Math.round(
        completedInterviews.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) /
          completedInterviews.length
      )
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Student Welcome Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">
            Student Dashboard
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Target Role: <strong className="text-slate-700">{user?.targetRole || 'Software Development Engineer'}</strong> • Level: <strong className="text-slate-700">{user?.experienceLevel || 'Entry-Level'}</strong>
          </p>
        </div>

        <Link
          to="/interviews/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Start New Interview</span>
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Completed Sessions</span>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalInterviews}</p>
          <p className="text-[11px] text-slate-400">Total mock interviews practiced</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Average Score</span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {totalInterviews > 0 ? `${Math.round(averageScore / 10)}/10 (${averageScore}%)` : '—'}
          </p>
          <p className="text-[11px] text-slate-400">Across evaluated questions</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Placement Status</span>
            <BookOpen className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-lg font-bold text-slate-800">
            {totalInterviews === 0 ? 'Not Started' : averageScore >= 75 ? 'Placement Ready' : 'Needs Practice'}
          </p>
          <p className="text-[11px] text-slate-400">Based on rubric performance</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Target Topics</span>
            <Compass className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{user?.preferredTopics?.length || 3}</p>
          <p className="text-[11px] text-slate-400">Selected technical subjects</p>
        </div>
      </div>

      {/* Recent Interviews Card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Practice Sessions</h2>
            <p className="text-xs text-slate-500">History of your mock interviews and evaluations</p>
          </div>
          <Link
            to="/history"
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            View All History →
          </Link>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500">Loading sessions...</div>
          ) : interviews.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <p className="text-sm font-medium text-slate-700">No interview sessions recorded yet.</p>
              <p className="text-xs text-slate-500">Generate your first mock interview to practice speaking your answers.</p>
              <Link
                to="/interviews/new"
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Start First Interview</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {interviews.slice(0, 5).map((item) => (
                <div key={item._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        item.status === 'completed'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {item.status === 'completed' ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.difficulty} • {item.topics?.slice(0, 2).join(', ')} • {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-blue-600">
                      {item.overallScore !== null ? `${Math.round(item.overallScore / 10)}/10` : '—'}
                    </span>
                    <Link
                      to={`/interviews/${item._id}/results`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Results</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
