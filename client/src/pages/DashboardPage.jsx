import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Compass, 
  CheckCircle, 
  Award, 
  ChevronRight,
  BookOpen,
  Activity,
  Plus,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Candidate Welcome Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#DED9D0] dark:border-[#332F2A]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171717] dark:text-[#F7F4EE] tracking-tight">
              Candidate Dossier & Workspace
            </h1>
            <Badge variant="brand" size="sm">{user?.experienceLevel || 'Entry-Level'}</Badge>
          </div>
          <p className="text-xs text-[#68645E] dark:text-[#9E988F] mt-1 font-mono uppercase tracking-wider">
            PLACEMENT TRACK: <span className="text-[#171717] dark:text-[#F7F4EE] font-semibold">{user?.targetRole?.toUpperCase()}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/interviews/new">
            <Button icon={Plus} size="md">
              New Interview Session
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid - Editorial Numerical Standards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#68645E] dark:text-[#9E988F]">
              Completed Sessions
            </span>
            <div className="w-7 h-7 rounded-[7px] bg-[#FAF0F2] dark:bg-[#7A263A]/20 text-[#7A263A] dark:text-[#E8A5B2] flex items-center justify-center border border-[#E8C5CC] dark:border-[#7A263A]/40">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-[#171717] dark:text-[#F7F4EE] mt-2">{totalInterviews}</p>
          <p className="text-[11px] text-[#68645E] dark:text-[#9E988F] mt-1 font-mono">Recorded viva assessments</p>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#68645E] dark:text-[#9E988F]">
              Average Rubric Score
            </span>
            <div className="w-7 h-7 rounded-[7px] bg-[#EFF5F1] dark:bg-[#3F6B52]/20 text-[#3F6B52] dark:text-[#88BA9D] flex items-center justify-center border border-[#C2D9CB] dark:border-[#3F6B52]/40">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-[#7A263A] dark:text-[#D4AA6A] mt-2">
            {totalInterviews > 0 ? `${averageScore}%` : '—'}
          </p>
          <p className="text-[11px] text-[#68645E] dark:text-[#9E988F] mt-1 font-mono">Weighted 4-tier rubric</p>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#68645E] dark:text-[#9E988F]">
              Placement Readiness
            </span>
            <div className="w-7 h-7 rounded-[7px] bg-[#FBF6EE] dark:bg-[#C59A5B]/20 text-[#8C642A] dark:text-[#E8CDA0] flex items-center justify-center border border-[#E8D5B8] dark:border-[#C59A5B]/40">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="font-serif text-xl font-bold text-[#171717] dark:text-[#F7F4EE] mt-3">
            {totalInterviews === 0 ? 'Baseline Pending' : averageScore >= 75 ? 'Placement Qualified' : 'Development Required'}
          </p>
          <p className="text-[11px] text-[#68645E] dark:text-[#9E988F] mt-1 font-mono">Viva faculty benchmark</p>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#68645E] dark:text-[#9E988F]">
              Core Syllabus Topics
            </span>
            <div className="w-7 h-7 rounded-[7px] bg-[#F0ECE4] dark:bg-[#24201C] text-[#68645E] dark:text-[#9E988F] flex items-center justify-center border border-[#DED9D0] dark:border-[#332F2A]">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-[#171717] dark:text-[#F7F4EE] mt-2">
            {user?.preferredTopics?.length || 3}
          </p>
          <p className="text-[11px] text-[#68645E] dark:text-[#9E988F] mt-1 font-mono">Technical evaluation tracks</p>
        </Card>
      </div>

      {/* Recommended Action - Editorial Callout */}
      <div className="p-5 rounded-xl border border-[#DED9D0] dark:border-[#332F2A] bg-[#F0ECE4]/70 dark:bg-[#1C1916] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-paper">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase font-semibold px-2 py-0.5 rounded-[6px] bg-[#FAF0F2] dark:bg-[#7A263A]/20 text-[#7A263A] dark:text-[#E8A5B2] border border-[#E8C5CC] dark:border-[#7A263A]/40">
              NEXT EVALUATION OBJECTIVE
            </span>
            <span className="font-mono text-xs text-[#68645E] dark:text-[#9E988F]">CURATED PLACEMENT TRACK</span>
          </div>
          <h3 className="text-base font-serif font-bold text-[#171717] dark:text-[#F7F4EE]">
            {totalInterviews === 0
              ? 'Complete Your Baseline Assessment'
              : `Recommended: Practice Medium Difficulty ${user?.targetRole} Questions`}
          </h3>
          <p className="text-xs text-[#68645E] dark:text-[#9E988F] max-w-2xl leading-relaxed">
            {totalInterviews === 0
              ? `Initialize a baseline interview for ${user?.targetRole} to calibrate your performance radar across technical correctness and completeness.`
              : `Focus on technical topics (${user?.preferredTopics?.join(', ') || 'System Design, DBMS'}) to improve semantic completeness and clarity scores.`}
          </p>
        </div>
        <Link to="/interviews/new" className="shrink-0">
          <Button icon={ArrowRight} size="sm">
            {totalInterviews === 0 ? 'Start Baseline Interview' : 'Start Targeted Session'}
          </Button>
        </Link>
      </div>

      {/* Recent Interviews / Empty State */}
      <Card>
        <CardHeader
          title="Interview Examination History"
          subtitle="Generated sessions, transcripts, and faculty rubric reports"
          action={
            <Link to="/history" className="font-mono text-xs font-semibold text-[#7A263A] dark:text-[#D4AA6A] hover:underline flex items-center gap-1">
              <span>View All Dossiers</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
        <CardBody>
          {loading ? (
            <div className="py-8 flex justify-center">
              <Spinner label="Loading session records..." />
            </div>
          ) : interviews.length === 0 ? (
            <div className="py-10 text-center max-w-md mx-auto">
              <div className="w-10 h-10 rounded-[8px] bg-[#F0ECE4] dark:bg-[#24201C] text-[#68645E] dark:text-[#9E988F] flex items-center justify-center mx-auto mb-3 border border-[#DED9D0] dark:border-[#332F2A]">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-serif font-bold text-[#171717] dark:text-[#F7F4EE] mb-1">
                No Interview Sessions Recorded
              </h4>
              <p className="text-xs text-[#68645E] dark:text-[#9E988F] mb-5">
                Generate an interview session to unlock 4-tier rubric feedback and model answers.
              </p>
              <Link to="/interviews/new">
                <Button size="sm" icon={Plus}>
                  Generate First Session
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#DED9D0]/70 dark:divide-[#332F2A]/70">
              {interviews.map((item) => (
                <div key={item._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F0ECE4]/30 dark:hover:bg-[#24201C]/30 px-2 rounded-[8px] transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-serif font-semibold text-[#171717] dark:text-[#F7F4EE]">{item.title}</h5>
                      {item.status === 'terminated' ? (
                        <Badge variant="danger" size="sm">Terminated</Badge>
                      ) : item.status === 'completed' ? (
                        <Badge variant="success" size="sm">Completed</Badge>
                      ) : (
                        <Badge variant="warning" size="sm">In Progress</Badge>
                      )}
                    </div>
                    <p className="text-xs text-[#68645E] dark:text-[#9E988F] font-mono mt-1">
                      {item.targetRole} • {item.difficulty} • {item.topics?.slice(0, 2).join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-serif text-base font-bold text-[#7A263A] dark:text-[#D4AA6A]">
                      {item.overallScore !== null ? `${item.overallScore}%` : '—'}
                    </span>
                    <Link to={`/interviews/${item._id}/results`}>
                      <Button variant="secondary" size="sm" icon={FileText}>
                        Dossier
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
