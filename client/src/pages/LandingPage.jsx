import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ShieldCheck, 
  Mic, 
  Activity, 
  Check, 
  Award,
  BookOpen,
  Scale,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('rubric');

  useEffect(() => {
    api.get('/health')
      .then((data) => {
        setHealth(data);
        setHealthLoading(false);
      })
      .catch((err) => {
        console.warn('Backend health check warning:', err.message);
        setHealth({ status: 'operational', database: { status: 'in-memory' }, ai: { configuredProvider: 'fallback' } });
        setHealthLoading(false);
      });
  }, []);

  return (
    <div className="relative min-h-screen bg-[#F7F4EE] dark:bg-[#141210] text-[#171717] dark:text-[#F7F4EE] selection:bg-[#7A263A] selection:text-white transition-colors duration-150">
      {/* Top Academic Telemetry Strip */}
      <div className="border-b border-[#DED9D0] dark:border-[#332F2A] bg-[#F0ECE4]/90 dark:bg-[#1C1916]/90 py-1.5 px-4 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#3F6B52]" />
            <span className="text-[#68645E] dark:text-[#9E988F]">
              EVALUATION ENGINE:
            </span>
            <span className="text-[#171717] dark:text-[#F7F4EE] font-semibold">
              {healthLoading ? 'CALIBRATING...' : `${health?.database?.status?.toUpperCase() || 'ONLINE'} DB | AI: ${health?.ai?.configuredProvider?.toUpperCase() || 'FALLBACK_VIVA'}`}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[#68645E] dark:text-[#9E988F]">
            <span>CALIBRATION: 40/20/20/20</span>
            <span className="hidden sm:inline">FULLSCREEN PROCTORING: STRICT</span>
            <span className="text-[#7A263A] dark:text-[#D4AA6A] font-semibold">B.TECH VIVA READY</span>
          </div>
        </div>
      </div>

      {/* Hero Section: Editorial Split Layout */}
      <section className="pt-14 pb-20 md:pt-24 md:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Authoritative Engineering Headline & Value Prop */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[8px] border border-[#E8C5CC] dark:border-[#7A263A]/40 bg-[#FAF0F2] dark:bg-[#7A263A]/20 text-[#7A263A] dark:text-[#E8A5B2] font-mono text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7A263A]" />
              INSTITUTIONAL TECHNICAL EVALUATION STANDARD
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-[#171717] dark:text-[#F7F4EE] leading-[1.12]">
              Technical Mock Interviews Evaluated by
              <span className="inline-flex items-center align-middle mx-2.5 px-3 py-0.5 rounded-[8px] bg-[#F0ECE4] dark:bg-[#24201C] text-[#7A263A] dark:text-[#D4AA6A] font-serif italic border border-[#DED9D0] dark:border-[#332F2A] shadow-sm">
                Rubric
              </span>
              Not Keyword Guesswork.
            </h1>

            <p className="text-base sm:text-lg text-[#68645E] dark:text-[#9E988F] font-normal leading-relaxed max-w-2xl">
              An editorial-grade technical assessment platform designed for placement readiness and university viva defense.
              Generates rigorous questions across CS fundamentals, monitors camera continuity and fullscreen adherence, and scores across four calibrated criteria.
            </p>

            {/* Spec Metrics Row */}
            <div className="grid grid-cols-3 gap-3 py-2 max-w-lg font-mono">
              <div className="p-3.5 rounded-xl border border-[#DED9D0] dark:border-[#332F2A] bg-[#FFFDF9] dark:bg-[#1C1916] shadow-sm">
                <div className="text-2xl font-bold font-serif text-[#171717] dark:text-[#F7F4EE]">12+</div>
                <div className="text-[11px] text-[#68645E] dark:text-[#9E988F] uppercase tracking-tight mt-0.5">CS Core Tracks</div>
              </div>
              <div className="p-3.5 rounded-xl border border-[#DED9D0] dark:border-[#332F2A] bg-[#FFFDF9] dark:bg-[#1C1916] shadow-sm">
                <div className="text-2xl font-bold font-serif text-[#7A263A] dark:text-[#D4AA6A]">4-Tier</div>
                <div className="text-[11px] text-[#68645E] dark:text-[#9E988F] uppercase tracking-tight mt-0.5">Rubric Weights</div>
              </div>
              <div className="p-3.5 rounded-xl border border-[#DED9D0] dark:border-[#332F2A] bg-[#FFFDF9] dark:bg-[#1C1916] shadow-sm">
                <div className="text-2xl font-bold font-serif text-[#3F6B52] dark:text-[#528568]">100%</div>
                <div className="text-[11px] text-[#68645E] dark:text-[#9E988F] uppercase tracking-tight mt-0.5">Proctored Audit</div>
              </div>
            </div>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard">
                    <Button size="lg" icon={ArrowRight} className="w-full sm:w-auto font-medium">
                      Enter Workspace ({user?.name?.split(' ')[0] || 'Candidate'})
                    </Button>
                  </Link>
                  <Link to="/interviews/new">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                      New Assessment
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" icon={ArrowRight} className="w-full sm:w-auto font-medium">
                      Launch Practice Session
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                      Candidate Login
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Editorial Cockpit Simulator */}
          <div className="lg:col-span-5">
            <div className="rounded-xl border border-[#DED9D0] dark:border-[#332F2A] bg-[#FFFDF9] dark:bg-[#1C1916] shadow-paper overflow-hidden">
              {/* Cockpit Window Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#F0ECE4] dark:bg-[#24201C] border-b border-[#DED9D0] dark:border-[#332F2A] font-mono text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#DED9D0] dark:bg-[#332F2A]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#DED9D0] dark:bg-[#332F2A]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#DED9D0] dark:bg-[#332F2A]" />
                  </div>
                  <span className="text-[#68645E] dark:text-[#9E988F] ml-2">session_viva_dossier.edu</span>
                </div>
                <span className="px-2 py-0.5 rounded-[6px] bg-[#EFF5F1] text-[#3F6B52] dark:bg-[#3F6B52]/20 dark:text-[#88BA9D] text-[10px] font-semibold border border-[#C2D9CB] dark:border-[#3F6B52]/40">
                  DEFENSE RECORD
                </span>
              </div>

              {/* Cockpit Tabs */}
              <div className="flex border-b border-[#DED9D0] dark:border-[#332F2A] bg-[#F7F4EE] dark:bg-[#141210] px-4 pt-2.5 gap-3 text-xs font-mono">
                <button
                  onClick={() => setActiveTab('rubric')}
                  className={`pb-2 px-2 border-b-2 font-medium transition-colors ${
                    activeTab === 'rubric'
                      ? 'border-[#7A263A] text-[#7A263A] dark:border-[#D4AA6A] dark:text-[#D4AA6A] font-semibold'
                      : 'border-transparent text-[#68645E] hover:text-[#171717] dark:text-[#9E988F] dark:hover:text-[#F7F4EE]'
                  }`}
                >
                  Rubric Scoring
                </button>
                <button
                  onClick={() => setActiveTab('prompt')}
                  className={`pb-2 px-2 border-b-2 font-medium transition-colors ${
                    activeTab === 'prompt'
                      ? 'border-[#7A263A] text-[#7A263A] dark:border-[#D4AA6A] dark:text-[#D4AA6A] font-semibold'
                      : 'border-transparent text-[#68645E] hover:text-[#171717] dark:text-[#9E988F] dark:hover:text-[#F7F4EE]'
                  }`}
                >
                  Question & Code
                </button>
                <button
                  onClick={() => setActiveTab('proctor')}
                  className={`pb-2 px-2 border-b-2 font-medium transition-colors ${
                    activeTab === 'proctor'
                      ? 'border-[#7A263A] text-[#7A263A] dark:border-[#D4AA6A] dark:text-[#D4AA6A] font-semibold'
                      : 'border-transparent text-[#68645E] hover:text-[#171717] dark:text-[#9E988F] dark:hover:text-[#F7F4EE]'
                  }`}
                >
                  Proctoring Audit
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-5 text-sm space-y-4">
                {activeTab === 'rubric' && (
                  <div className="space-y-3.5 font-mono">
                    <div className="flex items-center justify-between pb-2.5 border-b border-[#DED9D0] dark:border-[#332F2A]">
                      <span className="text-xs text-[#68645E] dark:text-[#9E988F]">EXAMINATION SCORE</span>
                      <span className="text-2xl font-bold font-serif text-[#7A263A] dark:text-[#D4AA6A]">88 / 100</span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <div className="flex justify-between text-[#171717] dark:text-[#F7F4EE] mb-1 font-medium">
                          <span>Technical Correctness (40%)</span>
                          <span className="font-semibold text-[#3F6B52]">36 / 40</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#F0ECE4] dark:bg-[#24201C] overflow-hidden">
                          <div className="w-[90%] h-full bg-[#3F6B52]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[#171717] dark:text-[#F7F4EE] mb-1 font-medium">
                          <span>Question Relevance (20%)</span>
                          <span className="font-semibold text-[#C59A5B]">18 / 20</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#F0ECE4] dark:bg-[#24201C] overflow-hidden">
                          <div className="w-[90%] h-full bg-[#C59A5B]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[#171717] dark:text-[#F7F4EE] mb-1 font-medium">
                          <span>Completeness (20%)</span>
                          <span className="font-semibold text-[#A66A24]">16 / 20</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#F0ECE4] dark:bg-[#24201C] overflow-hidden">
                          <div className="w-[80%] h-full bg-[#A66A24]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[#171717] dark:text-[#F7F4EE] mb-1 font-medium">
                          <span>Communication Clarity (20%)</span>
                          <span className="font-semibold text-[#3F6B52]">18 / 20</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#F0ECE4] dark:bg-[#24201C] overflow-hidden">
                          <div className="w-[90%] h-full bg-[#3F6B52]" />
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-[8px] bg-[#F0ECE4] dark:bg-[#24201C] border border-[#DED9D0] dark:border-[#332F2A] text-[11px] text-[#68645E] dark:text-[#9E988F] leading-relaxed">
                      <span className="font-semibold text-[#7A263A] dark:text-[#D4AA6A]">EVALUATOR SYNTHESIS:</span> Articulated B+ Tree root/leaf page branching factor with O(log N) disk seek bounds. Clarified cache-aside TTL invalidation.
                    </div>
                  </div>
                )}

                {activeTab === 'prompt' && (
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="brand">DATABASE MANAGEMENT</Badge>
                      <Badge variant="warning">HARD TIER</Badge>
                    </div>
                    <p className="text-sm font-serif italic text-[#171717] dark:text-[#F7F4EE] leading-relaxed">
                      "Explain how database index structures reduce disk seek operations, and analyze the concrete trade-offs on write amplification."
                    </p>
                    <div className="p-3.5 rounded-[8px] bg-[#F0ECE4] dark:bg-[#24201C] text-[#171717] dark:text-[#F7F4EE] font-mono text-xs border border-[#DED9D0] dark:border-[#332F2A]">
                      <span className="text-[#68645E] dark:text-[#9E988F]">// Evaluation Criteria Reference</span><br />
                      <span className="text-[#7A263A] dark:text-[#D4AA6A]">const</span> rubricCriteria = &#123;<br />
                      &nbsp;&nbsp;btree_traversal: <span className="text-[#3F6B52]">"verified"</span>,<br />
                      &nbsp;&nbsp;disk_io_penalty: <span className="text-[#3F6B52]">"addressed"</span>,<br />
                      &nbsp;&nbsp;write_overhead: <span className="text-[#3F6B52]">"quantified"</span><br />
                      &#125;;
                    </div>
                  </div>
                )}

                {activeTab === 'proctor' && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3.5 rounded-[8px] bg-[#F0ECE4] dark:bg-[#24201C] border border-[#DED9D0] dark:border-[#332F2A] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[#68645E] dark:text-[#9E988F]">CONTINUOUS CAMERA ACCESS:</span>
                        <span className="text-[#3F6B52] font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> STREAM PERSISTENT
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#68645E] dark:text-[#9E988F]">FULLSCREEN ENFORCEMENT:</span>
                        <span className="text-[#171717] dark:text-[#F7F4EE] font-semibold">STRICT ACTIVE</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#68645E] dark:text-[#9E988F]">SECURITY VIOLATIONS:</span>
                        <span className="text-[#3F6B52] font-semibold">0 RECORDED</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#68645E] dark:text-[#9E988F] leading-normal">
                      Full-screen exit immediately terminates the examination and generates a proctoring audit log for the evaluators.
                    </p>
                  </div>
                )}
              </div>

              {/* Cockpit Footer */}
              <div className="px-4 py-2.5 bg-[#F0ECE4] dark:bg-[#24201C] border-t border-[#DED9D0] dark:border-[#332F2A] flex items-center justify-between text-[11px] font-mono text-[#68645E] dark:text-[#9E988F]">
                <span>SESSION #MV-2026-VIVA</span>
                <span className="text-[#3F6B52] font-semibold">VERIFIED VALID</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Asymmetric Bento Grid Section: Architecture & Capabilities */}
      <section id="architecture" className="py-20 md:py-28 border-t border-[#DED9D0] dark:border-[#332F2A] bg-[#FFFDF9] dark:bg-[#1C1916]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-14">
            <span className="font-mono text-xs text-[#7A263A] dark:text-[#D4AA6A] uppercase tracking-wider font-semibold">
              ACADEMIC ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#171717] dark:text-[#F7F4EE] mt-1.5">
              Engineered for Realistic Technical Evaluation.
            </h2>
            <p className="text-sm sm:text-base text-[#68645E] dark:text-[#9E988F] mt-3 leading-relaxed">
              Every component adheres to university Viva examination standards, real-time rubric evaluation protocols, and complete data integrity.
            </p>
          </div>

          {/* Asymmetric Bento Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Bento Card 1: 7 cols - Semantic Rubric Engine */}
            <div className="md:col-span-7 rounded-xl border border-[#DED9D0] dark:border-[#332F2A] bg-[#F7F4EE] dark:bg-[#141210] p-6 sm:p-8 flex flex-col justify-between shadow-paper">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-[8px] bg-[#FAF0F2] dark:bg-[#7A263A]/20 text-[#7A263A] dark:text-[#E8A5B2] flex items-center justify-center border border-[#E8C5CC] dark:border-[#7A263A]/40">
                    <Scale className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs text-[#68645E] dark:text-[#9E988F]">SPEC: 40/20/20/20</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#171717] dark:text-[#F7F4EE] mb-2">
                  Calibrated Viva Rubric Engine
                </h3>
                <p className="text-sm text-[#68645E] dark:text-[#9E988F] leading-relaxed mb-6">
                  Rather than generic keyword matching, MockVue parses technical answers across four weighted dimensions. Responses receive targeted diagnostic feedback, edge-case analysis, and study notes.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs text-center">
                  <div className="p-3 rounded-[8px] bg-[#FFFDF9] dark:bg-[#1C1916] border border-[#DED9D0] dark:border-[#332F2A]">
                    <div className="text-lg font-serif font-bold text-[#171717] dark:text-[#F7F4EE]">40%</div>
                    <div className="text-[10px] text-[#68645E] dark:text-[#9E988F] mt-0.5">TECHNICAL</div>
                  </div>
                  <div className="p-3 rounded-[8px] bg-[#FFFDF9] dark:bg-[#1C1916] border border-[#DED9D0] dark:border-[#332F2A]">
                    <div className="text-lg font-serif font-bold text-[#171717] dark:text-[#F7F4EE]">20%</div>
                    <div className="text-[10px] text-[#68645E] dark:text-[#9E988F] mt-0.5">RELEVANCE</div>
                  </div>
                  <div className="p-3 rounded-[8px] bg-[#FFFDF9] dark:bg-[#1C1916] border border-[#DED9D0] dark:border-[#332F2A]">
                    <div className="text-lg font-serif font-bold text-[#171717] dark:text-[#F7F4EE]">20%</div>
                    <div className="text-[10px] text-[#68645E] dark:text-[#9E988F] mt-0.5">COMPLETION</div>
                  </div>
                  <div className="p-3 rounded-[8px] bg-[#FFFDF9] dark:bg-[#1C1916] border border-[#DED9D0] dark:border-[#332F2A]">
                    <div className="text-lg font-serif font-bold text-[#171717] dark:text-[#F7F4EE]">20%</div>
                    <div className="text-[10px] text-[#68645E] dark:text-[#9E988F] mt-0.5">CLARITY</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#DED9D0] dark:border-[#332F2A] flex items-center justify-between text-xs font-mono text-[#68645E] dark:text-[#9E988F]">
                <span>MODEL EVALUATION AUDIT</span>
                <span className="text-[#7A263A] dark:text-[#D4AA6A] font-semibold">STRICT SCHEMA ENFORCEMENT</span>
              </div>
            </div>

            {/* Bento Card 2: 5 cols - Anti-Cheat & Client Privacy */}
            <div className="md:col-span-5 rounded-xl border border-[#DED9D0] dark:border-[#332F2A] bg-[#F7F4EE] dark:bg-[#141210] p-6 sm:p-8 flex flex-col justify-between shadow-paper">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-[8px] bg-[#EFF5F1] dark:bg-[#3F6B52]/20 text-[#3F6B52] dark:text-[#88BA9D] flex items-center justify-center border border-[#C2D9CB] dark:border-[#3F6B52]/40">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs text-[#3F6B52] dark:text-[#88BA9D] font-semibold">ALL-TIME CAMERA</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#171717] dark:text-[#F7F4EE] mb-2">
                  Continuous Proctoring & Fullscreen Defense
                </h3>
                <p className="text-sm text-[#68645E] dark:text-[#9E988F] leading-relaxed mb-4">
                  Examinations require unbroken camera streams and strictly gate progress behind browser full-screen locks. Any exit immediately concludes the viva.
                </p>
                <div className="p-3.5 rounded-[8px] bg-[#FFFDF9] dark:bg-[#1C1916] border border-[#DED9D0] dark:border-[#332F2A] space-y-2 font-mono text-xs">
                  <div className="flex items-center gap-2 text-[#171717] dark:text-[#F7F4EE]">
                    <Check className="w-3.5 h-3.5 text-[#3F6B52]" />
                    <span>Unbroken camera track verification</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#171717] dark:text-[#F7F4EE]">
                    <Check className="w-3.5 h-3.5 text-[#3F6B52]" />
                    <span>Instant termination upon fullscreen exit</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#171717] dark:text-[#F7F4EE]">
                    <Check className="w-3.5 h-3.5 text-[#3F6B52]" />
                    <span>Audit violations persisted to database</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#DED9D0] dark:border-[#332F2A] text-xs font-mono text-[#68645E] dark:text-[#9E988F]">
                <span>AUDIT-SAFE FOR UNIVERSITY VIVA DEFENSE</span>
              </div>
            </div>

            {/* Bento Card 3: 5 cols - Dual Speech & Code Mode */}
            <div className="md:col-span-5 rounded-xl border border-[#DED9D0] dark:border-[#332F2A] bg-[#F7F4EE] dark:bg-[#141210] p-6 sm:p-8 flex flex-col justify-between shadow-paper">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-[8px] bg-[#FBF6EE] dark:bg-[#C59A5B]/20 text-[#8C642A] dark:text-[#E8CDA0] flex items-center justify-center border border-[#E8D5B8] dark:border-[#C59A5B]/40">
                    <Mic className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs text-[#68645E] dark:text-[#9E988F]">DUAL INPUT CHANNELS</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#171717] dark:text-[#F7F4EE] mb-2">
                  Natural Speech & Code Submission
                </h3>
                <p className="text-sm text-[#68645E] dark:text-[#9E988F] leading-relaxed mb-4">
                  Candidates can articulate architectural reasoning via real-time speech transcription or type structured algorithms and pseudocode in the monospace answer console.
                </p>
                <div className="p-3.5 rounded-[8px] bg-[#FFFDF9] dark:bg-[#1C1916] border border-[#DED9D0] dark:border-[#332F2A] font-mono text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#3F6B52]" />
                    <span className="text-[#171717] dark:text-[#F7F4EE]">Speech Recognition Engine</span>
                  </div>
                  <span className="text-[#68645E] dark:text-[#9E988F]">CLIENT BROWSER</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#DED9D0] dark:border-[#332F2A] text-xs font-mono text-[#68645E] dark:text-[#9E988F]">
                <span>SUPPORTS TECHNICAL EXPLANATION & CODING</span>
              </div>
            </div>

            {/* Bento Card 4: 7 cols - Dossier & Faculty Export */}
            <div className="md:col-span-7 rounded-xl border border-[#DED9D0] dark:border-[#332F2A] bg-[#F7F4EE] dark:bg-[#141210] p-6 sm:p-8 flex flex-col justify-between shadow-paper">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-[8px] bg-[#FAF0F2] dark:bg-[#7A263A]/20 text-[#7A263A] dark:text-[#E8A5B2] flex items-center justify-center border border-[#E8C5CC] dark:border-[#7A263A]/40">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs text-[#68645E] dark:text-[#9E988F]">COMPREHENSIVE DOSSIER</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#171717] dark:text-[#F7F4EE] mb-2">
                  Academic Viva Transcript & Rubric Breakdown
                </h3>
                <p className="text-sm text-[#68645E] dark:text-[#9E988F] leading-relaxed mb-4">
                  Upon completion, candidates and evaluators receive a detailed viva report featuring radar competency diagrams, identified mistakes, and improved model answers.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-[8px] bg-[#FFFDF9] dark:bg-[#1C1916] border border-[#DED9D0] dark:border-[#332F2A]">
                    <div className="font-bold text-[#171717] dark:text-[#F7F4EE]">Mistake Analysis</div>
                    <div className="text-[10px] text-[#68645E] dark:text-[#9E988F] mt-1">Pinpoints misconceptions</div>
                  </div>
                  <div className="p-3 rounded-[8px] bg-[#FFFDF9] dark:bg-[#1C1916] border border-[#DED9D0] dark:border-[#332F2A]">
                    <div className="font-bold text-[#171717] dark:text-[#F7F4EE]">Model Answer</div>
                    <div className="text-[10px] text-[#68645E] dark:text-[#9E988F] mt-1">Gold-standard synthesis</div>
                  </div>
                  <div className="p-3 rounded-[8px] bg-[#FFFDF9] dark:bg-[#1C1916] border border-[#DED9D0] dark:border-[#332F2A]">
                    <div className="font-bold text-[#171717] dark:text-[#F7F4EE]">Radar Metrics</div>
                    <div className="text-[10px] text-[#68645E] dark:text-[#9E988F] mt-1">Multi-axis placement radar</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#DED9D0] dark:border-[#332F2A] flex items-center justify-between text-xs font-mono text-[#68645E] dark:text-[#9E988F]">
                <span>EVALUATION ARCHIVE</span>
                <span className="text-[#3F6B52] font-semibold">100% AUDIT READY</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Institutional Call To Action */}
      <section className="py-20 md:py-28 border-t border-[#DED9D0] dark:border-[#332F2A] bg-[#F7F4EE] dark:bg-[#141210]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="font-mono text-xs uppercase tracking-wider text-[#7A263A] dark:text-[#D4AA6A] font-semibold">
            CALIBRATED ASSESSMENT ENVIRONMENT
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-[#171717] dark:text-[#F7F4EE]">
            Prepare for Technical Placements with True Academic Rigor.
          </h2>
          <p className="text-base text-[#68645E] dark:text-[#9E988F] max-w-2xl mx-auto leading-relaxed">
            Eliminate the guesswork of campus placement interviews. Practice with real question sequences, enforced full-screen defense, and faculty-grade evaluation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/register">
              <Button size="lg" icon={ArrowRight}>
                Register Candidate Account
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">
                Access Existing Dossier
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
