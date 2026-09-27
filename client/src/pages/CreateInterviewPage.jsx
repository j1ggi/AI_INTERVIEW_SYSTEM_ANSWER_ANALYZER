import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  AlertCircle,
  BookOpen,
  Briefcase,
  Sliders,
  CheckSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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
    { title: 'Frontend Developer', desc: 'React, JavaScript, Web Performance, CSS' },
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
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Wizard Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-3">
        <h1 className="text-2xl font-bold text-slate-900">
          Create New Mock Interview
        </h1>
        <p className="text-xs text-slate-500">
          Step {step} of 3: {step === 1 ? 'Choose Job Role' : step === 2 ? 'Select Technical Topics' : 'Difficulty & Questions'}
        </p>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-200 rounded-full"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Choose Target Role */}
      {step === 1 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            Select Your Target Job Role
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roles.map((r) => {
              const isSelected = targetRole === r.title;
              return (
                <div
                  key={r.title}
                  onClick={() => setTargetRole(r.title)}
                  className={`p-4 rounded-lg cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-slate-900 text-sm">{r.title}</h3>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                  </div>
                  <p className="text-xs text-slate-500">{r.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-5 py-2.5 rounded shadow-sm transition-colors"
            >
              <span>Next: Choose Topics</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Choose Technical Topics */}
      {step === 2 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Select Technical Topics ({selectedTopics.length} selected)
            </h2>
            <span className="text-xs text-slate-400">At least 1 required</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {topicsList.map((topic) => {
              const isSelected = selectedTopics.includes(topic);
              return (
                <div
                  key={topic}
                  onClick={() => handleTopicToggle(topic)}
                  className={`p-3 rounded-lg border text-xs font-medium cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 text-blue-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{topic}</span>
                  <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                    isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium py-2 px-3 rounded hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={() => setStep(3)}
              disabled={selectedTopics.length === 0}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium text-xs px-5 py-2.5 rounded shadow-sm transition-colors"
            >
              <span>Next: Difficulty & Count</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Difficulty, Question Count & Duration */}
      {step === 3 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            Interview Settings
          </h2>

          {/* Difficulty Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">Difficulty Level:</label>
            <div className="grid grid-cols-3 gap-3">
              {['Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`py-2.5 px-3 rounded-lg border text-xs font-medium transition-all ${
                    difficulty === diff
                      ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="question-count" className="text-xs font-semibold text-slate-700 block">
                Number of Questions:
              </label>
              <select
                id="question-count"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={3}>3 Questions (Quick Practice)</option>
                <option value={5}>5 Questions (Standard Round)</option>
                <option value={7}>7 Questions (Comprehensive Viva)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="duration-select" className="text-xs font-semibold text-slate-700 block">
                Total Time Limit:
              </label>
              <select
                id="duration-select"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={15}>15 Minutes</option>
                <option value={20}>20 Minutes</option>
                <option value={30}>30 Minutes</option>
              </select>
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
            <p><strong>Track:</strong> {targetRole}</p>
            <p><strong>Topics:</strong> {selectedTopics.join(', ')}</p>
            <p><strong>Configuration:</strong> {difficulty} Level • {questionCount} Questions • {durationMinutes} Minutes</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium py-2 px-3 rounded hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white font-medium text-xs px-6 py-2.5 rounded shadow-sm transition-colors"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating Questions...</span>
                </>
              ) : (
                <>
                  <span>Generate Interview</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateInterviewPage;
