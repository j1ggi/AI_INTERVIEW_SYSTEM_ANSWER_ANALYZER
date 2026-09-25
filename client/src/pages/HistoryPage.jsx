import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  History, 
  Calendar, 
  ChevronRight, 
  AlertCircle,
  Plus,
  BookOpen
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
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
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spinner size="lg" label="Retrieving Examination Archives..." />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#DED9D0] dark:border-[#332F2A]">
        <div>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#68645E] dark:text-[#9E988F]">
            ARCHIVAL RECORDS
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171717] dark:text-[#F7F4EE] tracking-tight">
            Assessment History & Transcripts
          </h1>
          <p className="text-xs text-[#68645E] dark:text-[#9E988F] mt-0.5 font-mono">
            VERIFIED LONGITUDINAL LOG OF SESSIONS & RUBRIC OUTCOMES
          </p>
        </div>
        <Link to="/interviews/new">
          <Button icon={Plus} size="md">
            New Assessment
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-[#FAF0F0] dark:bg-[#A33B3B]/20 border border-[#E8C4C4] dark:border-[#A33B3B]/40 flex items-center gap-2 text-xs text-[#A33B3B] dark:text-[#E59797] font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {interviews.length === 0 ? (
        <Card className="p-10 text-center max-w-md mx-auto shadow-paper">
          <div className="w-10 h-10 rounded-lg bg-[#F0ECE4] dark:bg-[#24201C] text-[#68645E] dark:text-[#9E988F] flex items-center justify-center mx-auto mb-3 border border-[#DED9D0] dark:border-[#332F2A]">
            <History className="w-5 h-5 text-[#7A263A] dark:text-[#D4AA6A]" />
          </div>
          <h2 className="text-sm font-serif font-bold text-[#171717] dark:text-[#F7F4EE] mb-1">No Past Assessments Recorded</h2>
          <p className="text-xs text-[#68645E] dark:text-[#9E988F] mb-5">
            Complete your first mock interview to establish your historical performance profile.
          </p>
          <Link to="/interviews/new">
            <Button size="sm" icon={Plus}>Start First Assessment</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {interviews.map((item) => {
            const isCompleted = item.status === 'completed';
            const score = item.overallScore || 0;

            return (
              <Card key={item._id} hover className="p-4 sm:p-5 shadow-paper">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 font-mono">
                      <Badge variant={isCompleted ? 'success' : 'neutral'} size="sm" dot>
                        {item.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge variant="brand" size="sm">{item.difficulty?.toUpperCase()}</Badge>
                      <span className="text-[11px] text-[#68645E] dark:text-[#9E988F] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-serif font-bold text-[#171717] dark:text-[#F7F4EE]">
                      {item.title}
                    </h3>

                    <p className="text-xs text-[#68645E] dark:text-[#9E988F] font-mono">
                      Role: {item.targetRole} • Topics: {item.topics?.join(', ')} • {item.questions?.length} Questions
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-2.5 sm:pt-0 border-[#DED9D0] dark:border-[#332F2A]">
                    {isCompleted && (
                      <div className="text-right font-mono">
                        <span className="text-[10px] text-[#68645E] dark:text-[#9E988F] block uppercase">Rubric Score</span>
                        <span className="text-lg font-bold text-[#7A263A] dark:text-[#D4AA6A]">
                          {score}%
                        </span>
                      </div>
                    )}

                    <Link to={isCompleted ? `/interviews/${item._id}/results` : `/interviews/${item._id}/prep`}>
                      <Button variant={isCompleted ? 'outline' : 'primary'} size="sm" icon={ChevronRight}>
                        {isCompleted ? 'View Dossier' : 'Resume'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
