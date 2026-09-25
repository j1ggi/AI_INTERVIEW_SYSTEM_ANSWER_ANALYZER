import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  AlertCircle,
  BookOpen,
  Scale,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import api from '../services/api';

export const CreateInterviewPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Software Development Engineer');
  const [selectedTopics, setSelectedTopics] = useState(
    user?.preferredTopics || ['Data Structures & Algorithms', 'Database Management Systems']
  );
  const [difficulty, setDifficulty] = useState('Medium');
  const [interviewType, setInterviewType] = useState('Technical');
  const [questionCount, setQuestionCount] = useState(5);
  const [durationMinutes, setDurationMinutes] = useState(20);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { title: 'Software Development Engineer', desc: 'Core DSA, System Design, OS, and Architecture' },
    { title: 'Frontend Developer', desc: 'React, JavaScript/TypeScript, Web Performance, CSS' },
    { title: 'Backend Developer', desc: 'Node.js, Databases, APIs, Distributed Systems' },
    { title: 'Full Stack Developer', desc: 'End-to-End MERN/Web, Database Modeling, REST' },
    { title: 'Data Analyst', desc: 'SQL, Python Data Manipulation, Metrics, Insights' },
    { title: 'Java Developer', desc: 'Java Core, OOP, Spring Boot, Multithreading' },
  ];

  const topicsList = [
    'Data Structures & Algorithms',
    'Database Management Systems',
    'Operating Systems',
    'Computer Networks',
    'System Design',
    'Object-Oriented Programming',
    'JavaScript & TypeScript',
    'React & Frontend Architecture',
    'Node.js & Backend Architecture',
    'SQL & Data Modeling',
    'Python Programming',
    'Java & Spring Boot',
    'HR & Behavioral',
  ];

  const handleTopicToggle = (topic) => {
    if (selectedTopics.includes(topic)) {
      if (selectedTopics.length === 1) return;
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleGenerate = async () => {
    setError('');
    setIsGenerating(true);

    try {
      const res = await api.post('/interviews/generate', {
        targetRole,
        topics: selectedTopics,
        difficulty,
        interviewType,
        questionCount,
        durationMinutes,
      });

      if (res.interviewId) {
        navigate(`/interviews/${res.interviewId}/prep`);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate interview. Please check your configuration.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Wizard Header & Progress Steps */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="font-mono text-xs text-[#7A263A] dark:text-[#D4AA6A] uppercase tracking-wider font-semibold">
          EVALUATION PROTOCOL
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171717] dark:text-[#F7F4EE] tracking-tight mt-1">
          Configure Examination Session
        </h1>
        <p className="font-mono text-xs text-[#68645E] dark:text-[#9E988F] mt-1.5">
          STEP {step} OF 4: {step === 1 ? 'PLACEMENT TRACK' : step === 2 ? 'TECHNICAL SYLLABUS' : step === 3 ? 'EVALUATION RIGOR' : 'DURATION & CONFIRMATION'}
        </p>

        {/* Step Progress Indicators */}
        <div className="flex items-center justify-center gap-2 mt-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === step
                  ? 'w-10 bg-[#7A263A]'
                  : i < step
                  ? 'w-6 bg-[#3F6B52]'
                  : 'w-6 bg-[#DED9D0] dark:bg-[#332F2A]'
              }`}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-[10px] bg-[#FAF0F0] dark:bg-[#A33B3B]/15 border border-[#E8C4C4] dark:border-[#A33B3B]/40 flex items-center gap-2.5 text-xs text-[#A33B3B] dark:text-[#E59797]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Target Role */}
      {step === 1 && (
        <div className="space-y-5 animate-slide-up">
          <div className="flex items-center justify-between pb-2 border-b border-[#DED9D0] dark:border-[#332F2A]">
            <h2 className="text-sm font-mono font-semibold text-[#171717] dark:text-[#F7F4EE] uppercase tracking-wider">
              1. Select Placement Track
            </h2>
            <span className="text-xs text-[#68645E] dark:text-[#9E988F] font-mono">6 ROLES AVAILABLE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {roles.map((r) => {
              const isSelected = targetRole === r.title;
              return (
                <div
                  key={r.title}
                  onClick={() => setTargetRole(r.title)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-[#FAF0F2] dark:bg-[#7A263A]/20 border-[#7A263A] dark:border-[#7A263A]/60 shadow-sm'
                      : 'bg-[#FFFDF9] dark:bg-[#1C1916] border-[#DED9D0] dark:border-[#332F2A] hover:border-[#C59A5B]/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-serif font-bold text-[#171717] dark:text-[#F7F4EE] text-sm">{r.title}</h3>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-[#7A263A]" />}
                  </div>
                  <p className="text-xs text-[#68645E] dark:text-[#9E988F] leading-relaxed">{r.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-3">
            <Button size="md" icon={ArrowRight} onClick={() => setStep(2)}>
              Next: Select Syllabus
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Technical Topics */}
      {step === 2 && (
        <div className="space-y-5 animate-slide-up">
          <div className="flex items-center justify-between pb-2 border-b border-[#DED9D0] dark:border-[#332F2A]">
            <div>
              <h2 className="text-sm font-mono font-semibold text-[#171717] dark:text-[#F7F4EE] uppercase tracking-wider">
                2. Choose Technical Syllabus
              </h2>
              <p className="text-xs text-[#68645E] dark:text-[#9E988F] mt-0.5">
                Questions will be synthesized across selected areas ({selectedTopics.length} selected).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-2">
            {topicsList.map((topic) => {
              const isSelected = selectedTopics.includes(topic);
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => handleTopicToggle(topic)}
                  className={`px-3.5 py-2 rounded-[8px] font-mono text-xs font-medium transition-all border ${
                    isSelected
                      ? 'bg-[#7A263A] text-white border-[#7A263A] shadow-sm'
                      : 'bg-[#FFFDF9] dark:bg-[#1C1916] text-[#171717] dark:text-[#F7F4EE] border-[#DED9D0] dark:border-[#332F2A] hover:bg-[#F0ECE4] dark:hover:bg-[#24201C]'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {topic}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button variant="secondary" size="md" icon={ArrowLeft} onClick={() => setStep(1)}>
              Back
            </Button>
            <Button size="md" icon={ArrowRight} onClick={() => setStep(3)}>
              Next: Rigor & Format
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Difficulty & Format */}
      {step === 3 && (
        <div className="space-y-5 animate-slide-up">
          <div className="flex items-center justify-between pb-2 border-b border-[#DED9D0] dark:border-[#332F2A]">
            <h2 className="text-sm font-mono font-semibold text-[#171717] dark:text-[#F7F4EE] uppercase tracking-wider">
              3. Evaluation Rigor & Format
            </h2>
            <span className="text-xs text-[#68645E] dark:text-[#9E988F] font-mono">STANDARDIZED TIERS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {[
              { val: 'Easy', label: 'Easy Tier', desc: 'Definitions, core foundations, standard algorithms' },
              { val: 'Medium', label: 'Medium Tier', desc: 'Standard campus placement bar with trade-offs' },
              { val: 'Hard', label: 'Hard Tier', desc: 'Concurrency, scale bottlenecks, system failure modes' },
            ].map((d) => {
              const isSelected = difficulty === d.val;
              return (
                <div
                  key={d.val}
                  onClick={() => setDifficulty(d.val)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-[#FAF0F2] dark:bg-[#7A263A]/20 border-[#7A263A] dark:border-[#7A263A]/60 shadow-sm'
                      : 'bg-[#FFFDF9] dark:bg-[#1C1916] border-[#DED9D0] dark:border-[#332F2A] hover:border-[#C59A5B]/60'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-serif font-bold text-[#171717] dark:text-[#F7F4EE] text-sm">{d.label}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-[#7A263A]" />}
                  </div>
                  <p className="text-xs text-[#68645E] dark:text-[#9E988F] leading-relaxed">{d.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <label className="block text-xs font-mono font-medium text-[#171717] dark:text-[#F7F4EE] uppercase tracking-wider mb-2">
              Interview Modality
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {['Technical', 'HR', 'Behavioral', 'Mixed'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setInterviewType(type)}
                  className={`py-2 px-3 rounded-[8px] font-mono text-xs font-semibold border transition-colors ${
                    interviewType === type
                      ? 'bg-[#7A263A] text-white border-[#7A263A] shadow-sm'
                      : 'bg-[#FFFDF9] dark:bg-[#1C1916] text-[#171717] dark:text-[#F7F4EE] border-[#DED9D0] dark:border-[#332F2A] hover:bg-[#F0ECE4] dark:hover:bg-[#24201C]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button variant="secondary" size="md" icon={ArrowLeft} onClick={() => setStep(2)}>
              Back
            </Button>
            <Button size="md" icon={ArrowRight} onClick={() => setStep(4)}>
              Next: Review & Generate
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Duration & Review */}
      {step === 4 && (
        <div className="space-y-5 animate-slide-up">
          <Card className="p-6 space-y-5">
            <h2 className="text-base font-serif font-bold text-[#171717] dark:text-[#F7F4EE] pb-2 border-b border-[#DED9D0] dark:border-[#332F2A]">
              Session Parameters & Duration
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-medium text-[#171717] dark:text-[#F7F4EE] uppercase tracking-wider mb-2">
                  Question Count: <span className="text-[#7A263A] dark:text-[#D4AA6A] font-bold">{questionCount}</span>
                </label>
                <div className="flex gap-2 font-mono">
                  {[3, 5, 8].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setQuestionCount(count)}
                      className={`flex-1 py-2 rounded-[8px] text-xs font-semibold border ${
                        questionCount === count
                          ? 'bg-[#7A263A] text-white border-[#7A263A]'
                          : 'bg-[#F0ECE4] dark:bg-[#24201C] text-[#171717] dark:text-[#F7F4EE] border-[#DED9D0] dark:border-[#332F2A]'
                      }`}
                    >
                      {count} Qs
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-[#171717] dark:text-[#F7F4EE] uppercase tracking-wider mb-2">
                  Duration Budget: <span className="text-[#7A263A] dark:text-[#D4AA6A] font-bold">{durationMinutes} mins</span>
                </label>
                <div className="flex gap-2 font-mono">
                  {[15, 20, 30].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setDurationMinutes(dur)}
                      className={`flex-1 py-2 rounded-[8px] text-xs font-semibold border ${
                        durationMinutes === dur
                          ? 'bg-[#7A263A] text-white border-[#7A263A]'
                          : 'bg-[#F0ECE4] dark:bg-[#24201C] text-[#171717] dark:text-[#F7F4EE] border-[#DED9D0] dark:border-[#332F2A]'
                      }`}
                    >
                      {dur} mins
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Final Configuration Summary */}
            <div className="p-4 rounded-[10px] bg-[#F0ECE4] dark:bg-[#24201C] border border-[#DED9D0] dark:border-[#332F2A] space-y-2 font-mono text-xs">
              <span className="font-semibold text-[#171717] dark:text-[#F7F4EE] uppercase tracking-wider block mb-1">
                SESSION TELEMETRY MANIFEST:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[#68645E] dark:text-[#9E988F]">
                <div>Track: <strong className="text-[#171717] dark:text-[#F7F4EE]">{targetRole}</strong></div>
                <div>Rigor: <strong className="text-[#171717] dark:text-[#F7F4EE]">{difficulty}</strong></div>
                <div>Format: <strong className="text-[#171717] dark:text-[#F7F4EE]">{interviewType}</strong></div>
                <div>Questions: <strong className="text-[#171717] dark:text-[#F7F4EE]">{questionCount} Qs</strong></div>
              </div>
              <div className="pt-2 text-[#68645E] dark:text-[#9E988F] border-t border-[#DED9D0]/70 dark:border-[#332F2A]/70">
                Syllabus: {selectedTopics.join(', ')}
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between pt-2">
            <Button variant="secondary" size="md" icon={ArrowLeft} onClick={() => setStep(3)} disabled={isGenerating}>
              Back
            </Button>
            <Button
              size="md"
              icon={Award}
              isLoading={isGenerating}
              onClick={handleGenerate}
            >
              {isGenerating ? 'Synthesizing Questions...' : 'Initialize Interview Session'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
