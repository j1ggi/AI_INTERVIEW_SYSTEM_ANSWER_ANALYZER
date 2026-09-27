import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mic,
  Square,
  Send,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  FileText,
  HelpCircle,
  ChevronRight,
  Info,
  Camera,
  Shield,
  Eye,
  X
} from 'lucide-react';
import api from '../services/api';
import { ProctoringCVService } from '../services/proctoringCV';

export const InterviewRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Session state
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active question pointer & timings
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const endTimeRef = useRef(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Audio Recording & Transcription State
  // recordingStatus: 'idle' | 'recording' | 'processing' | 'transcribing' | 'ready'
  const [recordingStatus, setRecordingStatus] = useState('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [micError, setMicError] = useState('');

  // Answer Evaluation & Progress State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);

  // AI Proctoring & Face Detection State
  const [proctoringStatus, setProctoringStatus] = useState({
    isMonitoring: false,
    cameraActive: false,
    faceCount: 1,
    isLookingAtScreen: true,
    isLeavingFrame: false,
  });
  const [activeWarning, setActiveWarning] = useState(null);
  const [warningCount, setWarningCount] = useState(0);

  // Audio recording refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const liveSpeechDraftRef = useRef('');

  // Camera Proctoring refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const proctoringRef = useRef(null);
  const warningTimeoutRef = useRef(null);

  // Load Interview Session & Start Proctoring
  useEffect(() => {
    let timerInterval = null;

    api.get(`/interviews/${id}`)
      .then((res) => {
        setInterview(res.interview);

        if (res.interview.status === 'completed' || res.interview.status === 'terminated') {
          navigate(`/interviews/${id}/results`, { replace: true });
          return;
        }

        const questions = res.interview.questions || [];
        const savedIdx = parseInt(localStorage.getItem(`mockvue_int_${id}_idx`) || '0', 10);
        const validIdx = Math.min(Math.max(0, savedIdx), Math.max(0, questions.length - 1));
        setCurrentIndex(validIdx);

        // Countdown timer calculation
        const durationSec = (res.interview.durationMinutes || 20) * 60;
        const storageKey = `mockvue_timer_end_${id}`;
        let endTime = localStorage.getItem(storageKey);

        if (!endTime) {
          endTime = Date.now() + durationSec * 1000;
          localStorage.setItem(storageKey, String(endTime));
        } else {
          endTime = parseInt(endTime, 10);
        }
        endTimeRef.current = endTime;

        const updateTimer = () => {
          const now = Date.now();
          const diff = Math.max(0, Math.round((endTimeRef.current - now) / 1000));
          setSecondsRemaining(diff);

          if (diff <= 0) {
            clearInterval(timerInterval);
            handleAutoSubmitDueToTime();
          }
        };

        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
        setLoading(false);

        // Initialize AI Camera Proctoring
        try {
          const proctoring = new ProctoringCVService({
            onEvent: async (eventData) => {
              try {
                await api.post(`/interviews/${id}/monitoring`, eventData);
              } catch (monErr) {
                console.warn('[PROCTORING LOG ERROR]', monErr);
              }
            },
            onWarning: (msg) => {
              setActiveWarning(msg);
              setWarningCount((c) => c + 1);
              if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
              warningTimeoutRef.current = setTimeout(() => {
                setActiveWarning(null);
              }, 5000);
            },
            onStatusChange: (status) => {
              setProctoringStatus((prev) => ({ ...prev, ...status }));
            },
          });

          proctoringRef.current = proctoring;
          proctoring.init({
            videoElement: videoRef.current,
            canvasElement: canvasRef.current,
          }).catch((err) => {
            console.warn('[PROCTORING INIT]', err);
          });
        } catch (procErr) {
          console.warn('[PROCTORING SETUP FAIL]', procErr);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load interview session.');
        setLoading(false);
      });

    return () => {
      if (timerInterval) clearInterval(timerInterval);
      cleanupAll();
    };
  }, [id, navigate]);

  // Cleanup all audio tracks and proctoring streams
  const cleanupAll = () => {
    cleanupAudio();
    if (proctoringRef.current) {
      proctoringRef.current.stop();
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
  };

  // Cleanup audio tracks and recorders
  const cleanupAudio = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
  };

  // Convert Blob to Base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // START RECORDING
  const handleStartRecording = async () => {
    setMicError('');
    setError('');
    audioChunksRef.current = [];
    liveSpeechDraftRef.current = '';

    try {
      // 1. Request microphone access only (NO camera!)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 2. Set up MediaRecorder
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
        else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
        else mimeType = '';
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // 3. Start local speech recognition in parallel as a real-time instant draft
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event) => {
            let finalAccumulated = '';
            for (let i = 0; i < event.results.length; i++) {
              finalAccumulated += event.results[i][0].transcript + ' ';
            }
            liveSpeechDraftRef.current = finalAccumulated.trim();
          };

          recognition.onerror = (e) => {
            console.warn('Local speech recognition notice:', e.error);
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (e) {
          console.warn('SpeechRecognition initialization notice:', e);
        }
      }

      recorder.start(250); // collect in 250ms chunks
      setRecordingStatus('recording');
      setRecordingTime(0);

      // Start elapsed timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access failed:', err);
      setMicError('Could not access your microphone. Please allow microphone permissions in your browser, or type your answer below.');
      setRecordingStatus('idle');
    }
  };

  // STOP RECORDING
  const handleStopRecording = () => {
    if (!mediaRecorderRef.current || recordingStatus !== 'recording') return;

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }

    setRecordingStatus('processing');

    const recorder = mediaRecorderRef.current;

    recorder.onstop = async () => {
      // Stop media tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }

      setRecordingStatus('transcribing');

      try {
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });

        if (audioBlob.size < 500) {
          // Extremely short audio, fallback to draft or ask student
          if (liveSpeechDraftRef.current) {
            setTranscript((prev) => prev ? `${prev} ${liveSpeechDraftRef.current}` : liveSpeechDraftRef.current);
          }
          setRecordingStatus('ready');
          return;
        }

        // Convert audio blob to base64
        const base64Data = await blobToBase64(audioBlob);

        // Send to backend transcription endpoint
        const res = await api.post('/interviews/transcribe', {
          audioBase64: base64Data,
          mimeType: audioBlob.type,
        });

        if (res.transcript && res.transcript.trim()) {
          setTranscript((prev) => prev ? `${prev} ${res.transcript.trim()}` : res.transcript.trim());
        } else if (liveSpeechDraftRef.current) {
          // Fallback to local continuous draft
          setTranscript((prev) => prev ? `${prev} ${liveSpeechDraftRef.current}` : liveSpeechDraftRef.current);
        } else {
          setMicError('Audio captured. Please review and type any missing details in your answer.');
        }
      } catch (err) {
        console.warn('Backend transcription notice:', err.message);
        // Seamlessly use local speech recognition draft on network/API fallback
        if (liveSpeechDraftRef.current) {
          setTranscript((prev) => prev ? `${prev} ${liveSpeechDraftRef.current}` : liveSpeechDraftRef.current);
        } else {
          setMicError('Transcription service could not reach the cloud API. You can review and type your answer directly in the box below.');
        }
      } finally {
        setRecordingStatus('ready');
      }
    };

    try {
      recorder.stop();
    } catch (e) {
      setRecordingStatus('ready');
    }
  };

  // SUBMIT FINAL ANSWER FOR EVALUATION
  const handleSubmitAnswer = async () => {
    const finalAnswer = transcript.trim();
    if (!finalAnswer || isSubmitting) return;

    cleanupAudio();
    setIsSubmitting(true);
    setError('');

    const timeSpent = Math.max(5, Math.round((Date.now() - questionStartTime) / 1000));
    const questions = interview?.questions || [];
    const currentQ = questions[currentIndex];

    try {
      const res = await api.post(`/interviews/${id}/answer`, {
        questionId: currentQ._id,
        responseText: finalAnswer,
        timeSpentSeconds: timeSpent,
        responseType: 'voice',
      });

      setCurrentEvaluation(res.evaluation);
    } catch (err) {
      setError(err.message || 'Failed to submit response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // PROCEED TO NEXT QUESTION
  const handleNextQuestion = () => {
    const questions = interview?.questions || [];
    const nextIdx = currentIndex + 1;

    if (nextIdx >= questions.length) {
      cleanupAll();
      localStorage.removeItem(`mockvue_int_${id}_idx`);
      localStorage.removeItem(`mockvue_timer_end_${id}`);
      navigate(`/interviews/${id}/results`);
    } else {
      setCurrentIndex(nextIdx);
      localStorage.setItem(`mockvue_int_${id}_idx`, String(nextIdx));
      setTranscript('');
      setRecordingStatus('idle');
      setRecordingTime(0);
      setCurrentEvaluation(null);
      setError('');
      setMicError('');
      setQuestionStartTime(Date.now());
    }
  };

  const handleAutoSubmitDueToTime = async () => {
    cleanupAll();
    localStorage.removeItem(`mockvue_int_${id}_idx`);
    localStorage.removeItem(`mockvue_timer_end_${id}`);
    try {
      await api.post(`/interviews/${id}/complete`);
      navigate(`/interviews/${id}/results`);
    } catch (err) {
      navigate(`/interviews/${id}/results`);
    }
  };

  const handleEndInterviewEarly = async () => {
    if (!window.confirm('Are you sure you want to finish the interview session now?')) return;
    cleanupAll();
    localStorage.removeItem(`mockvue_int_${id}_idx`);
    localStorage.removeItem(`mockvue_timer_end_${id}`);
    try {
      await api.post(`/interviews/${id}/complete`);
      navigate(`/interviews/${id}/results`);
    } catch (err) {
      navigate(`/interviews/${id}/results`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-600">Loading interview question...</p>
      </div>
    );
  }

  const questions = interview?.questions || [];
  const currentQuestion = questions[currentIndex];
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;

  // Format recording seconds
  const recMin = Math.floor(recordingTime / 60);
  const recSec = recordingTime % 60;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header Strip: Question Counter, Subject, Session Timer & Camera Proctoring Preview */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="bg-blue-50 text-blue-700 font-medium text-xs px-2.5 py-1 rounded border border-blue-200">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-sm font-semibold text-slate-900">
              {interview?.targetRole}
            </span>
            <span className="text-xs text-slate-500">
              • {currentQuestion?.topic}
            </span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Time Left: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
            </div>

            <button
              onClick={handleEndInterviewEarly}
              className="text-xs text-red-600 hover:text-red-700 hover:underline font-medium"
            >
              End Interview
            </button>
          </div>
        </div>

        {/* Live Webcam & Face Detection Monitor */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 rounded-lg self-stretch md:self-auto justify-between md:justify-start">
          <div className="relative w-32 h-20 bg-slate-900 rounded overflow-hidden flex items-center justify-center border border-slate-300">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none transform scale-x-[-1]"
            />
            {!proctoringStatus.cameraActive && (
              <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center text-white text-[10px] p-1 text-center">
                <Camera className="w-3.5 h-3.5 text-slate-400 mb-0.5" />
                <span>Connecting...</span>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between text-xs space-y-1 pr-1">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-blue-600" />
              <span className="font-semibold text-slate-800 text-[11px]">AI Proctoring</span>
            </div>

            <div>
              {proctoringStatus.faceCount === 0 ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-100 px-1.5 py-0.5 rounded border border-red-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  No Face Detected
                </span>
              ) : !proctoringStatus.isLookingAtScreen ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  Looking Away
                </span>
              ) : proctoringStatus.faceCount > 1 ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded border border-purple-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                  Multiple Faces
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-800 bg-green-100 px-1.5 py-0.5 rounded border border-green-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                  Face Centered
                </span>
              )}
            </div>

            <span className="text-[10px] text-slate-500">
              Notices: <strong className={warningCount > 0 ? "text-amber-600" : "text-slate-700"}>{warningCount}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Non-Blocking Proctoring Warning Banner */}
      {activeWarning && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-r-lg flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <span className="text-xs font-bold text-amber-900 block">Proctoring Notification</span>
              <span className="text-xs text-amber-800">{activeWarning}</span>
            </div>
          </div>
          <button
            onClick={() => setActiveWarning(null)}
            className="text-xs text-amber-700 hover:text-amber-900 font-medium px-2 py-1 rounded bg-amber-100/60 hover:bg-amber-200/60 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Global Error Banner */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Question Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold uppercase tracking-wider text-slate-600">Question Prompt</span>
          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">{currentQuestion?.difficulty}</span>
        </div>

        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 leading-relaxed">
          {currentQuestion?.questionText}
        </h2>

        <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Explain concepts clearly. You can speak your answer using the microphone or type directly into the box.</span>
        </p>
      </div>

      {/* Answer Workspace Area */}
      {!currentEvaluation ? (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Your Answer</h3>

            {/* Audio Recording Controls */}
            <div className="flex items-center gap-2">
              {recordingStatus === 'idle' && (
                <button
                  onClick={handleStartRecording}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3.5 py-2 rounded shadow-sm transition-colors"
                >
                  <Mic className="w-4 h-4" />
                  <span>Start Recording</span>
                </button>
              )}

              {recordingStatus === 'recording' && (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    Recording ({String(recMin).padStart(2, '0')}:{String(recSec).padStart(2, '0')})
                  </span>
                  <button
                    onClick={handleStopRecording}
                    className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1.5 rounded shadow-sm transition-colors"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop Recording</span>
                  </button>
                </div>
              )}

              {(recordingStatus === 'processing' || recordingStatus === 'transcribing') && (
                <div className="flex items-center gap-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded">
                  <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>{recordingStatus === 'processing' ? 'Processing audio...' : 'Transcribing speech...'}</span>
                </div>
              )}

              {recordingStatus === 'ready' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded flex items-center gap-1 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Transcript Ready
                  </span>
                  <button
                    onClick={handleStartRecording}
                    className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Record Again
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Microphone Warning */}
          {micError && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{micError}</span>
            </div>
          )}

          {/* Editable Transcript Text Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <label htmlFor="transcript-area" className="font-medium text-slate-700">
                Transcript (Review and edit before submitting):
              </label>
              <span>{wordCount} words</span>
            </div>

            <textarea
              id="transcript-area"
              rows={8}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Click 'Start Recording' to speak your answer, or type your answer here..."
              disabled={isSubmitting || recordingStatus === 'recording'}
              className="w-full p-3.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 leading-relaxed font-normal"
            />
          </div>

          {/* Submission Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-500">
              Make sure you have answered the question thoroughly before submitting.
            </span>

            <button
              onClick={handleSubmitAnswer}
              disabled={!transcript.trim() || isSubmitting || recordingStatus === 'recording'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white font-medium text-sm px-5 py-2.5 rounded shadow-sm transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating Answer...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Answer</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Evaluation Results Card */
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
          {/* Header Score Block */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Evaluation Result</span>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">Answer Assessment</h3>
            </div>

            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg flex items-center gap-3">
              <span className="text-xs text-slate-600 font-medium">Overall Score:</span>
              <span className="text-2xl font-bold text-blue-600">
                {currentEvaluation.scoreOutOf10 !== undefined ? currentEvaluation.scoreOutOf10 : Math.round((currentEvaluation.overallScore || 0) / 10)}/10
              </span>
            </div>
          </div>

          {/* Dimension Scores Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded text-center">
              <span className="text-xs text-slate-500 block">Relevance</span>
              <span className="text-base font-bold text-slate-800">
                {currentEvaluation.criteriaScores?.relevance ?? (currentEvaluation.scoreOutOf10 || 7)}/10
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded text-center">
              <span className="text-xs text-slate-500 block">Correctness</span>
              <span className="text-base font-bold text-slate-800">
                {currentEvaluation.criteriaScores?.correctness ?? (currentEvaluation.scoreOutOf10 || 7)}/10
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded text-center">
              <span className="text-xs text-slate-500 block">Completeness</span>
              <span className="text-base font-bold text-slate-800">
                {currentEvaluation.criteriaScores?.completeness ?? Math.max(1, (currentEvaluation.scoreOutOf10 || 7) - 1)}/10
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded text-center">
              <span className="text-xs text-slate-500 block">Technical Accuracy</span>
              <span className="text-base font-bold text-slate-800">
                {currentEvaluation.criteriaScores?.technicalAccuracy ?? (currentEvaluation.scoreOutOf10 || 7)}/10
              </span>
            </div>
          </div>

          {/* Feedback Points */}
          <div className="space-y-4">
            {/* Correct Points */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
              <h4 className="text-xs font-bold text-green-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Correct Points:
              </h4>
              <ul className="list-disc list-inside text-sm text-green-900 space-y-1">
                {(currentEvaluation.correctPoints || currentEvaluation.correctConcepts || []).map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>

            {/* Missing Points */}
            {(currentEvaluation.missingPoints || currentEvaluation.missingConcepts || []).length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Missing Points:
                </h4>
                <ul className="list-disc list-inside text-sm text-amber-900 space-y-1">
                  {(currentEvaluation.missingPoints || currentEvaluation.missingConcepts || []).map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Incorrect Points */}
            {(currentEvaluation.incorrectPoints || currentEvaluation.mistakes || []).length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-2">
                <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  Incorrect Points:
                </h4>
                <ul className="list-disc list-inside text-sm text-red-900 space-y-1">
                  {(currentEvaluation.incorrectPoints || currentEvaluation.mistakes || []).map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvement Advice */}
            {currentEvaluation.improvement && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-1.5">
                <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Improvement Advice:
                </h4>
                <p className="text-sm text-blue-900 leading-relaxed">
                  {currentEvaluation.improvement}
                </p>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              onClick={handleNextQuestion}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded shadow-sm transition-colors"
            >
              <span>{currentIndex + 1 >= questions.length ? 'View Final Results' : 'Proceed to Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewRoom;
