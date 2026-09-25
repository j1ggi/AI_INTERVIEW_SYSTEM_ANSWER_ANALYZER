import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Award, 
  Check, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Terminal, 
  ShieldAlert, 
  BookOpen,
  Compass,
  Plus,
  FileText,
  Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import api from '../services/api';

export const InterviewResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [monitoringEvents, setMonitoringEvents] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get(`/interviews/${id}/report`),
      api.get(`/interviews/${id}/monitoring`).catch(() => ({ events: [] }))
    ])
      .then(([res, monRes]) => {
        setData(res);
        setMonitoringEvents(monRes?.events || []);
        setLoading(false);

        if (res.interview?.overallScore >= 70) {
          try {
            confetti({
              particleCount: 70,
              spread: 55,
              origin: { y: 0.6 },
              colors: ['#7A263A', '#C59A5B', '#3F6B52', '#F7F4EE']
            });
          } catch (e) {
            // Ignore
          }
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load interview report.');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <Spinner size="lg" label="Computing Comprehensive Assessment Dossier..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto my-20 p-6 rounded-xl border border-[#DED9D0] dark:border-[#332F2A] bg-[#FFFDF9] dark:bg-[#1C1916] text-center shadow-paper">
        <AlertCircle className="w-8 h-8 text-[#A33B3B] mx-auto mb-2" />
        <h2 className="text-base font-serif font-bold text-[#171717] dark:text-[#F7F4EE] mb-1">Dossier Unavailable</h2>
        <p className="text-xs font-mono text-[#68645E] dark:text-[#9E988F] mb-5">{error || 'Session report records could not be retrieved.'}</p>
        <Button size="sm" onClick={() => navigate('/dashboard')}>Return to Workspace</Button>
      </div>
    );
  }

  const { interview, report = [] } = data;
  const overallScore = interview.overallScore || 0;

  const totalQuestions = report.length || 1;
  const avgTechnical = Math.round(
    report.reduce((sum, r) => sum + (r.answer?.criteriaScores?.technicalCorrectness || 0), 0) / totalQuestions
  );
  const avgRelevance = Math.round(
    report.reduce((sum, r) => sum + (r.answer?.criteriaScores?.relevance || 0), 0) / totalQuestions
  );
  const avgCompleteness = Math.round(
    report.reduce((sum, r) => sum + (r.answer?.criteriaScores?.completeness || 0), 0) / totalQuestions
  );
  const avgClarity = Math.round(
    report.reduce((sum, r) => sum + (r.answer?.criteriaScores?.clarity || 0), 0) / totalQuestions
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in font-sans">
      {/* Assessment Dossier Masthead */}
      <div className="p-6 sm:p-8 rounded-xl border border-[#DED9D0] dark:border-[#332F2A] bg-[#FFFDF9] dark:bg-[#1C1916] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-paper">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2 font-mono">
            <Badge variant="brand" size="sm">{interview.difficulty?.toUpperCase()}</Badge>
            <Badge variant="neutral" size="sm">{interview.targetRole}</Badge>
            <Badge variant={overallScore >= 75 ? 'success' : overallScore >= 50 ? 'warning' : 'danger'} size="sm">
              {overallScore >= 75 ? 'PLACEMENT READY' : overallScore >= 50 ? 'PROFICIENT' : 'NEEDS REFINEMENT'}
            </Badge>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#68645E] dark:text-[#9E988F]">
              OFFICIAL EVALUATION DOSSIER
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171717] dark:text-[#F7F4EE] tracking-tight">
              {interview.title || 'Technical Assessment Report'}
            </h1>
          </div>
          <p className="text-xs text-[#68645E] dark:text-[#9E988F] font-mono">
            Concluded: {new Date(interview.completedAt || interview.updatedAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })} • ID: #{interview._id?.slice(-8).toUpperCase()}
          </p>
        </div>

        {/* Score Plaque */}
        <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-[#F7F4EE] dark:bg-[#141210] border border-[#DED9D0] dark:border-[#332F2A] min-w-[190px] font-mono text-center">
          <span className="text-[10px] uppercase tracking-wider text-[#68645E] dark:text-[#9E988F] font-medium">
            OVERALL RUBRIC SCORE
          </span>
          <span className="text-4xl sm:text-5xl font-serif font-bold text-[#7A263A] dark:text-[#D4AA6A] my-1">
            {overallScore}%
          </span>
          <span className="text-[11px] text-[#68645E] dark:text-[#9E988F]">
            {report.filter((r) => r.answer).length} OF {report.length} RESPONSES EVALUATED
          </span>
        </div>
      </div>

      {/* Proctoring Early Termination Banner */}
      {(interview.status === 'terminated' || interview.terminationReason) && (
        <div className="p-4 sm:p-5 rounded-xl border border-[#E8C4C4] dark:border-[#A33B3B]/40 bg-[#FAF0F0] dark:bg-[#A33B3B]/10 flex items-start gap-3.5 text-xs">
          <div className="w-8 h-8 rounded-lg bg-[#A33B3B]/15 text-[#A33B3B] dark:text-[#E59797] flex items-center justify-center shrink-0 border border-[#A33B3B]/30">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#A33B3B] dark:text-[#E59797]">
                EXAMINATION CONCLUDED EARLY BY PROCTORING
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#A33B3B]/10 text-[#A33B3B] dark:text-[#E59797] border border-[#A33B3B]/20">
                SECURITY TERMINATION
              </span>
            </div>
            <p className="text-[#171717] dark:text-[#F7F4EE] font-sans leading-relaxed">
              Reason: <strong>{interview.terminationReason || 'Full-screen mode was exited during the examination.'}</strong>
              {' '}All questions submitted prior to exit have been fully evaluated according to the 4-tier rubric.
            </p>
          </div>
        </div>
      )}

      {/* Proctoring & Security Audit Trail */}
      {monitoringEvents.length > 0 && (
        <Card className="p-5 shadow-paper space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#DED9D0] dark:border-[#332F2A]">
            <div className="flex items-center gap-2 font-mono text-xs">
              <ShieldAlert className="w-4 h-4 text-[#7A263A] dark:text-[#D4AA6A]" />
              <span className="font-bold text-[#171717] dark:text-[#F7F4EE] uppercase tracking-wider">
                Proctoring & Anti-Cheat Audit Trail
              </span>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#FAF0F0] text-[#A33B3B] dark:bg-[#A33B3B]/20 dark:text-[#E59797] border border-[#E8C4C4] font-semibold">
              {monitoringEvents.length} INCIDENTS RECORDED
            </span>
          </div>

          <div className="space-y-2">
            {monitoringEvents.map((evt, idx) => (
              <div
                key={evt._id || idx}
                className="p-2.5 rounded-lg bg-[#F7F4EE] dark:bg-[#141210] border border-[#DED9D0] dark:border-[#332F2A] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#A33B3B]" />
                  <strong className="text-[#171717] dark:text-[#F7F4EE] uppercase">
                    {evt.eventType.replace(/_/g, ' ')}
                  </strong>
                  <span className="text-[#68645E] dark:text-[#9E988F] text-[11px]">
                    — {evt.description}
                  </span>
                </div>
                <span className="text-[10px] text-[#68645E] dark:text-[#9E988F] shrink-0">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 4-Tier Rubric Criteria Grid */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between pb-1 border-b border-[#DED9D0] dark:border-[#332F2A]">
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#171717] dark:text-[#F7F4EE]">
            Rubric Criteria Breakdown
          </h2>
          <span className="font-mono text-[11px] text-[#68645E] dark:text-[#9E988F]">
            WEIGHTED CALIBRATION
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Card className="p-4 space-y-2">
            <div className="flex justify-between items-center font-mono">
              <span className="text-[11px] text-[#68645E] dark:text-[#9E988F] uppercase">Technical (40%)</span>
              <span className="text-sm font-bold text-[#3F6B52] dark:text-[#88BA9D]">{avgTechnical} / 40</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#F0ECE4] dark:bg-[#24201C] overflow-hidden">
              <div
                className="h-full bg-[#3F6B52] rounded-full transition-all duration-500"
                style={{ width: `${(avgTechnical / 40) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-[#68645E] dark:text-[#9E988F] font-mono">Core mechanics & accuracy</p>
          </Card>

          <Card className="p-4 space-y-2">
            <div className="flex justify-between items-center font-mono">
              <span className="text-[11px] text-[#68645E] dark:text-[#9E988F] uppercase">Relevance (20%)</span>
              <span className="text-sm font-bold text-[#7A263A] dark:text-[#D4AA6A]">{avgRelevance} / 20</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#F0ECE4] dark:bg-[#24201C] overflow-hidden">
              <div
                className="h-full bg-[#7A263A] dark:bg-[#D4AA6A] rounded-full transition-all duration-500"
                style={{ width: `${(avgRelevance / 20) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-[#68645E] dark:text-[#9E988F] font-mono">Direct prompt alignment</p>
          </Card>

          <Card className="p-4 space-y-2">
            <div className="flex justify-between items-center font-mono">
              <span className="text-[11px] text-[#68645E] dark:text-[#9E988F] uppercase">Completeness (20%)</span>
              <span className="text-sm font-bold text-[#A66A24] dark:text-[#DEAC74]">{avgCompleteness} / 20</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#F0ECE4] dark:bg-[#24201C] overflow-hidden">
              <div
                className="h-full bg-[#A66A24] rounded-full transition-all duration-500"
                style={{ width: `${(avgCompleteness / 20) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-[#68645E] dark:text-[#9E988F] font-mono">Edge cases & scale hazards</p>
          </Card>

          <Card className="p-4 space-y-2">
            <div className="flex justify-between items-center font-mono">
              <span className="text-[11px] text-[#68645E] dark:text-[#9E988F] uppercase">Clarity (20%)</span>
              <span className="text-sm font-bold text-[#C59A5B] dark:text-[#D4AA6A]">{avgClarity} / 20</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#F0ECE4] dark:bg-[#24201C] overflow-hidden">
              <div
                className="h-full bg-[#C59A5B] rounded-full transition-all duration-500"
                style={{ width: `${(avgClarity / 20) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-[#68645E] dark:text-[#9E988F] font-mono">Narrative flow & precision</p>
          </Card>
        </div>
      </div>

      {/* Question-by-Question Dossier Review */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between pb-1 border-b border-[#DED9D0] dark:border-[#332F2A]">
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#171717] dark:text-[#F7F4EE]">
            Question Critique & Exemplar Analyses
          </h2>
          <span className="font-mono text-[11px] text-[#68645E] dark:text-[#9E988F]">
            {report.length} ITEMS
          </span>
        </div>

        <div className="space-y-3">
          {report.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            const q = item.question;
            const a = item.answer;

            return (
              <div
                key={q._id || idx}
                className="rounded-xl border border-[#DED9D0] dark:border-[#332F2A] bg-[#FFFDF9] dark:bg-[#1C1916] overflow-hidden shadow-paper transition-all duration-150"
              >
                {/* Collapsible Header Bar */}
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4 hover:bg-[#F0ECE4]/40 dark:hover:bg-[#24201C] transition-colors"
                >
                  <div className="space-y-1.5 pr-2">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="px-2 py-0.5 rounded-[6px] bg-[#FAF0F2] dark:bg-[#7A263A]/20 text-[#7A263A] dark:text-[#E8A5B2] font-semibold border border-[#E8C5CC] dark:border-[#7A263A]/40">
                        Q{idx + 1}
                      </span>
                      <span className="font-semibold text-[#171717] dark:text-[#F7F4EE]">{q.topic}</span>
                      <span className="text-[#DED9D0] dark:text-[#332F2A]">•</span>
                      <span className="text-[#68645E] dark:text-[#9E988F]">{q.difficulty}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-serif font-bold text-[#171717] dark:text-[#F7F4EE] leading-snug">
                      {q.questionText}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-xs sm:text-sm font-bold text-[#7A263A] dark:text-[#D4AA6A]">
                      {a ? `${a.overallScore}%` : 'Unanswered'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#68645E] dark:text-[#9E988F]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#68645E] dark:text-[#9E988F]" />
                    )}
                  </div>
                </button>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="p-5 border-t border-[#DED9D0] dark:border-[#332F2A] bg-[#F7F4EE]/50 dark:bg-[#141210]/50 space-y-4">
                    {/* Candidate Submitted Response */}
                    <div>
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#68645E] dark:text-[#9E988F] block mb-1">
                        CANDIDATE SUBMITTED RESPONSE:
                      </span>
                      <div className="p-3.5 rounded-lg bg-[#FFFDF9] dark:bg-[#1C1916] border border-[#DED9D0] dark:border-[#332F2A] text-xs text-[#171717] dark:text-[#F7F4EE] leading-relaxed">
                        {a ? `"${a.responseText}"` : 'No response was submitted for this question.'}
                      </div>
                    </div>

                    {/* Criteria Breakdown for this Question */}
                    {a && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                        <div className="p-2.5 rounded-lg bg-[#FFFDF9] dark:bg-[#1C1916] border border-[#DED9D0] dark:border-[#332F2A] text-center">
                          <span className="text-[#68645E] dark:text-[#9E988F] block text-[10px]">Technical</span>
                          <strong className="text-[#3F6B52] dark:text-[#88BA9D] font-bold">{a.criteriaScores?.technicalCorrectness} / 40</strong>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[#FFFDF9] dark:bg-[#1C1916] border border-[#DED9D0] dark:border-[#332F2A] text-center">
                          <span className="text-[#68645E] dark:text-[#9E988F] block text-[10px]">Relevance</span>
                          <strong className="text-[#7A263A] dark:text-[#D4AA6A] font-bold">{a.criteriaScores?.relevance} / 20</strong>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[#FFFDF9] dark:bg-[#1C1916] border border-[#DED9D0] dark:border-[#332F2A] text-center">
                          <span className="text-[#68645E] dark:text-[#9E988F] block text-[10px]">Completeness</span>
                          <strong className="text-[#A66A24] dark:text-[#DEAC74] font-bold">{a.criteriaScores?.completeness} / 20</strong>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[#FFFDF9] dark:bg-[#1C1916] border border-[#DED9D0] dark:border-[#332F2A] text-center">
                          <span className="text-[#68645E] dark:text-[#9E988F] block text-[10px]">Clarity</span>
                          <strong className="text-[#C59A5B] dark:text-[#D4AA6A] font-bold">{a.criteriaScores?.clarity} / 20</strong>
                        </div>
                      </div>
                    )}

                    {/* Concepts Covered vs Missing */}
                    {a && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                        <div className="p-3 rounded-lg bg-[#EFF5F1] dark:bg-[#3F6B52]/20 border border-[#C2D9CB] dark:border-[#3F6B52]/40">
                          <span className="font-semibold text-[#3F6B52] dark:text-[#88BA9D] flex items-center gap-1.5 mb-1.5 text-[11px]">
                            <Check className="w-3.5 h-3.5" /> CONCEPTS DEMONSTRATED:
                          </span>
                          <ul className="list-disc list-inside text-[#171717] dark:text-[#F7F4EE] space-y-0.5 text-[11px]">
                            {a.correctConcepts?.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 rounded-lg bg-[#FBF5EC] dark:bg-[#A66A24]/20 border border-[#E8D5BE] dark:border-[#A66A24]/40">
                          <span className="font-semibold text-[#A66A24] dark:text-[#DEAC74] flex items-center gap-1.5 mb-1.5 text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5" /> MISSING CONCEPTS & HAZARDS:
                          </span>
                          <ul className="list-disc list-inside text-[#171717] dark:text-[#F7F4EE] space-y-0.5 text-[11px]">
                            {a.missingConcepts?.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Interviewer Constructive Feedback */}
                    {a?.feedback && (
                      <div className="p-3 rounded-lg bg-[#FFFDF9] dark:bg-[#1C1916] border border-[#DED9D0] dark:border-[#332F2A]">
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#68645E] dark:text-[#9E988F] block mb-1">
                          EXPERT DIAGNOSTIC CRITIQUE:
                        </span>
                        <p className="text-xs text-[#171717] dark:text-[#F7F4EE] leading-relaxed">
                          {a.feedback}
                        </p>
                      </div>
                    )}

                    {/* Exemplar / Model Answer */}
                    {a?.improvedAnswer && (
                      <div className="p-3.5 rounded-lg bg-[#FAF0F2] dark:bg-[#7A263A]/15 border border-[#E8C5CC] dark:border-[#7A263A]/30">
                        <span className="font-mono text-[10px] font-bold text-[#7A263A] dark:text-[#E8A5B2] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5" /> EXEMPLAR BENCHMARK RESPONSE:
                        </span>
                        <p className="text-xs text-[#171717] dark:text-[#F7F4EE] leading-relaxed font-sans">
                          {a.improvedAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Academic Disclaimer Card */}
      <div className="p-4 rounded-xl border border-[#DED9D0] dark:border-[#332F2A] bg-[#FFFDF9] dark:bg-[#1C1916] text-xs text-[#68645E] dark:text-[#9E988F] flex items-start gap-3 shadow-paper">
        <ShieldAlert className="w-4 h-4 text-[#7A263A] dark:text-[#D4AA6A] shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          <strong className="text-[#171717] dark:text-[#F7F4EE] font-semibold block mb-0.5">
            Academic Evaluation & Ethical Integrity Protocol
          </strong>
          MockVue scores answers strictly through calibrated 4-tier rubric matrices (Technical 40%, Relevance 20%, Completeness 20%, Clarity 20%). Video proctoring is evaluated client-side in RAM and never stored as raw media.
        </div>
      </div>

      {/* Post-Interview Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#DED9D0] dark:border-[#332F2A]">
        <Link to="/dashboard">
          <Button variant="secondary" size="md" icon={Compass}>
            Return to Workspace
          </Button>
        </Link>
        <div className="flex items-center gap-2.5">
          <Link to="/history">
            <Button variant="outline" size="md" icon={BookOpen}>
              Assessment History
            </Button>
          </Link>
          <Link to="/interviews/new">
            <Button size="md" icon={Plus}>
              New Assessment
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InterviewResultsPage;
