import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Send, 
  ArrowRight, 
  Mic, 
  MicOff, 
  Video, 
  Award, 
  Check, 
  AlertCircle, 
  Terminal,
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  Maximize2,
  Lock,
  Eye,
  Volume2,
  AlertTriangle,
  History
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { ProctoringCVEngine } from '../services/proctoringCV';
import api from '../services/api';

export const InterviewRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Interview session state
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active question pointer & answer state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState('');
  const [currentEvaluation, setCurrentEvaluation] = useState(null);

  // Reliable Countdown Timer
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const endTimeRef = useRef(null);

  // Per-question timing
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Web Speech API for voice dictation
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  const recognitionRef = useRef(null);

  // All-Time Camera Access State
  const [camStream, setCamStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const camVideoRef = useRef(null);
  const camStreamRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const cvEngineRef = useRef(null);

  // Advanced Security & Proctoring State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasEnteredExamMode, setHasEnteredExamMode] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);
  const isTerminatedRef = useRef(false);
  const [terminationReason, setTerminationReason] = useState('');

  // 5-Warning Rule & Live Telemetry
  const [warnings, setWarnings] = useState([]);
  const warningsRef = useRef([]);
  const lastWarningTimeRef = useRef(0);
  const [activeWarningBanner, setActiveWarningBanner] = useState(null);

  // Real-time CV & Audio Meters
  const [liveCV, setLiveCV] = useState({
    faceDetected: true,
    faceCount: 1,
    gaze: { centered: true, label: 'CENTERED' },
    audioDb: 24,
    isSpeaking: false,
  });

  const outOfFrameTimerRef = useRef(0);
  const [outOfFrameSeconds, setOutOfFrameSeconds] = useState(0);

  const gazeDeviationTimerRef = useRef(0);
  const [gazeDeviationSeconds, setGazeDeviationSeconds] = useState(0);

  const audioAnomalyTimerRef = useRef(0);
  const multipleFacesTimerRef = useRef(0);

  // 1. HARD TERMINATION HANDLER (Tab Exit, Blur, Fullscreen Exit, or 5 Warnings)
  const handleTermination = useCallback(async (reasonText, eventType = 'proctoring_violation') => {
    if (isTerminatedRef.current) return;
    isTerminatedRef.current = true;
    setIsTerminated(true);
    setTerminationReason(reasonText);

    // Stop CV Engine and media streams immediately
    if (cvEngineRef.current) {
      cvEngineRef.current.stop();
    }
    if (camStreamRef.current) {
      camStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    localStorage.removeItem(`mockvue_int_${id}_idx`);
    localStorage.removeItem(`mockvue_timer_end_${id}`);

    try {
      // 1. Record violation event
      await api.post(`/interviews/${id}/monitoring`, {
        eventType,
        confidence: 1.0,
        description: reasonText,
      });

      // 2. Mark interview terminated on server
      await api.post(`/interviews/${id}/complete`, {
        terminated: true,
        reason: reasonText,
      });
    } catch (err) {
      console.error('Termination network call failed:', err);
    } finally {
      // Redirect to report dossier after brief audit display
      setTimeout(() => {
        navigate(`/interviews/${id}/results`);
      }, 3000);
    }
  }, [id, navigate]);

  // 2. PROCTORING WARNING TRIGGER (5 Warnings -> Automatic Termination)
  const triggerWarning = useCallback(async (message, eventType) => {
    if (isTerminatedRef.current) return;

    // Rate-limit warnings to avoid spamming within 2.5 seconds
    const now = Date.now();
    if (now - lastWarningTimeRef.current < 2500) {
      return;
    }
    lastWarningTimeRef.current = now;

    const newCount = warningsRef.current.length + 1;
    const newWarning = {
      id: `warn_${now}`,
      message,
      eventType,
      count: newCount,
      time: new Date().toLocaleTimeString(),
    };

    warningsRef.current = [...warningsRef.current, newWarning];
    setWarnings(warningsRef.current);
    setActiveWarningBanner(newWarning);

    // Play subtle audio alert beep
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(740, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      }
    } catch (e) {}

    // Auto-dismiss banner after 5.5s
    setTimeout(() => {
      setActiveWarningBanner((curr) => (curr?.id === newWarning.id ? null : curr));
    }, 5500);

    // Send to backend telemetry
    try {
      await api.post(`/interviews/${id}/monitoring`, {
        eventType,
        description: `Proctoring Warning (${newCount}/5): ${message}`,
        confidence: 0.95,
      });
    } catch (err) {
      console.warn('Proctoring telemetry log failed:', err);
    }

    // CRITICAL REQUIREMENT: "after 5 warning test ends"
    if (newCount >= 5) {
      handleTermination(
        'Exam terminated: Exceeded maximum allowed proctoring warnings (5/5 infractions accumulated).',
        'max_warnings_exceeded'
      );
    }
  }, [id, handleTermination]);

  // 3. CONTINUOUS COMPUTER VISION & AUDIO TELEMETRY HANDLER
  const handleCVTelemetry = useCallback((telemetry) => {
    if (!hasEnteredExamMode || isTerminatedRef.current) return;

    setLiveCV(telemetry);

    // A. Person out of frame check: "if the person goes out of the frame for more than 10 sec warning comes"
    if (!telemetry.faceDetected) {
      outOfFrameTimerRef.current += 0.15; // frame interval step
      const currentSeconds = Math.round(outOfFrameTimerRef.current);
      setOutOfFrameSeconds(currentSeconds);

      if (outOfFrameTimerRef.current >= 10.0) {
        triggerWarning(
          'Candidate absent: No face detected in camera frame for over 10 consecutive seconds.',
          'person_out_of_frame'
        );
        outOfFrameTimerRef.current = 0; // reset for next 10s cycle
        setOutOfFrameSeconds(0);
      }
    } else {
      outOfFrameTimerRef.current = 0;
      setOutOfFrameSeconds(0);
    }

    // B. Eye gaze / off-screen check: "if eyes are not in nearby cordinates or they are off screen"
    if (telemetry.faceDetected && !telemetry.gaze.centered) {
      gazeDeviationTimerRef.current += 0.15;
      const currentGazeSec = Math.round(gazeDeviationTimerRef.current);
      setGazeDeviationSeconds(currentGazeSec);

      if (gazeDeviationTimerRef.current >= 4.0) {
        triggerWarning(
          `Gaze deviation: Candidate eyes directed away from screen center (${telemetry.gaze.label}). Please look directly at the evaluation prompt.`,
          'eye_gaze_deviated'
        );
        gazeDeviationTimerRef.current = 0;
        setGazeDeviationSeconds(0);
      }
    } else {
      gazeDeviationTimerRef.current = 0;
      setGazeDeviationSeconds(0);
    }

    // C. Multiple faces check
    if (telemetry.faceCount > 1) {
      multipleFacesTimerRef.current += 0.15;
      if (multipleFacesTimerRef.current >= 2.0) {
        triggerWarning(
          `Security violation: Multiple individuals (${telemetry.faceCount} faces) detected in video frame. Only the candidate is permitted.`,
          'multiple_faces_detected'
        );
        multipleFacesTimerRef.current = 0;
      }
    } else {
      multipleFacesTimerRef.current = 0;
    }

    // D. Audio anomaly detection (sustained background talk when candidate is reading)
    if (telemetry.audioDb > 62 && !isRecordingRef.current) {
      audioAnomalyTimerRef.current += 0.15;
      if (audioAnomalyTimerRef.current >= 5.0) {
        triggerWarning(
          'Acoustic anomaly: Sustained secondary voices or elevated background speech detected in environment.',
          'audio_anomaly_detected'
        );
        audioAnomalyTimerRef.current = 0;
      }
    } else {
      audioAnomalyTimerRef.current = 0;
    }
  }, [hasEnteredExamMode, triggerWarning]);

  // 4. CAMERA & COMPUTER VISION INITIALIZATION
  const initAllTimeCamera = useCallback(async () => {
    try {
      setCameraError('');
      if (camStreamRef.current) {
        camStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: true,
      });

      camStreamRef.current = stream;
      setCamStream(stream);

      if (camVideoRef.current) {
        camVideoRef.current.srcObject = stream;
        camVideoRef.current.play().catch(() => {});
      }

      // Initialize CV & Audio Engine
      if (camVideoRef.current && overlayCanvasRef.current) {
        if (cvEngineRef.current) {
          cvEngineRef.current.stop();
        }
        const engine = new ProctoringCVEngine(camVideoRef.current, overlayCanvasRef.current);
        engine.initAudio(stream);
        engine.start(handleCVTelemetry);
        cvEngineRef.current = engine;
      }

      // Track unexpected camera disconnection
      stream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          setCameraError('Camera stream disconnected unexpectedly.');
          triggerWarning('Webcam stream was disconnected.', 'camera_disconnected');
        };
      });
    } catch (err) {
      console.warn('All-time camera access error:', err.message);
      setCameraError('Camera access is required for proctoring. Please grant camera permission in browser.');
      api.post(`/interviews/${id}/monitoring`, {
        eventType: 'camera_disconnected',
        description: `Camera permission denied: ${err.message}`,
      }).catch(() => {});
    }
  }, [id, handleCVTelemetry, triggerWarning]);

  // Connect video stream to video & canvas whenever camStream is established
  useEffect(() => {
    if (camVideoRef.current && camStream) {
      camVideoRef.current.srcObject = camStream;
      camVideoRef.current.play().catch(() => {});

      if (overlayCanvasRef.current && !cvEngineRef.current) {
        const engine = new ProctoringCVEngine(camVideoRef.current, overlayCanvasRef.current);
        engine.initAudio(camStream);
        engine.start(handleCVTelemetry);
        cvEngineRef.current = engine;
      }
    }
  }, [camStream, handleCVTelemetry]);

  // 5. TAB SWITCH, FOCUS LOST, FULLSCREEN & KEYBOARD TRAPPING
  useEffect(() => {
    if (!hasEnteredExamMode || isTerminated) return;

    // RULE 1: "if someone goes from that tab test end" -> Visibility hidden (switched tabs / minimized)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && hasEnteredExamMode && !isTerminatedRef.current) {
        handleTermination(
          'Exam terminated: Candidate navigated away from the examination tab.',
          'tab_switched'
        );
      }
    };

    // RULE 2: Window blur (switched application, clicked outside browser window, opened DevTools)
    const handleWindowBlur = () => {
      if (hasEnteredExamMode && !isTerminatedRef.current) {
        handleTermination(
          'Exam terminated: Window lost focus (candidate navigated away from examination).',
          'window_blurred'
        );
      }
    };

    // RULE 3: Fullscreen exit termination
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      setIsFullscreen(isCurrentlyFullscreen);

      if (hasEnteredExamMode && !isCurrentlyFullscreen && !isTerminatedRef.current) {
        handleTermination(
          'Exam terminated: Full-screen examination mode was exited.',
          'fullscreen_exit'
        );
      }
    };

    // RULE 4: Keyboard Restricted Shortcut Trapping
    const handleKeyDown = (e) => {
      // Escape key
      if (e.key === 'Escape') {
        e.preventDefault();
        triggerWarning('Escape key intercepted. Exiting full-screen is prohibited.', 'keyboard_shortcut_violation');
        return;
      }

      // Alt key shortcuts (Alt+Tab, Alt+F4, Alt+Left)
      if (e.altKey && e.key !== 'Alt') {
        e.preventDefault();
        triggerWarning('Alt navigation shortcuts are restricted during examination.', 'keyboard_shortcut_violation');
        return;
      }

      // Developer Tools: F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key))
      ) {
        e.preventDefault();
        triggerWarning('Developer inspection tools and shortcuts are strictly prohibited.', 'keyboard_shortcut_violation');
        return;
      }

      // Clipboard shortcuts: Ctrl+C, Ctrl+V, Ctrl+X
      if (e.ctrlKey && ['c', 'C', 'v', 'V', 'x', 'X'].includes(e.key)) {
        e.preventDefault();
        triggerWarning(
          `Clipboard shortcut [Ctrl+${e.key.toUpperCase()}] intercepted. Copy-pasting is prohibited.`,
          'keyboard_shortcut_violation'
        );
        return;
      }

      // Browser Tab manipulation: Ctrl+T, Ctrl+W, Ctrl+N
      if (e.ctrlKey && ['t', 'T', 'w', 'W', 'n', 'N'].includes(e.key)) {
        e.preventDefault();
        triggerWarning(
          `Browser navigation shortcut [Ctrl+${e.key.toUpperCase()}] intercepted.`,
          'keyboard_shortcut_violation'
        );
        return;
      }
    };

    // Right-click context menu trap
    const handleContextMenu = (e) => {
      e.preventDefault();
      triggerWarning('Right-click context menu is restricted in secure exam mode.', 'keyboard_shortcut_violation');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [hasEnteredExamMode, isTerminated, handleTermination, triggerWarning]);

  // Enter Full Screen Mode & Start Camera
  const enterExamMode = async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }
      setIsFullscreen(true);
      setHasEnteredExamMode(true);
      await initAllTimeCamera();
    } catch (err) {
      console.error('Fullscreen request failed:', err);
      // Still allow candidate into session if fullscreen blocked by permission
      setHasEnteredExamMode(true);
      await initAllTimeCamera();
    }
  };

  // Load Interview Data & Initialize Question
  useEffect(() => {
    let timerInterval = null;

    api.get(`/interviews/${id}`)
      .then((res) => {
        setInterview(res.interview);

        // Check if already completed or terminated
        if (res.interview.status === 'completed' || res.interview.status === 'terminated') {
          navigate(`/interviews/${id}/results`, { replace: true });
          return;
        }

        const questions = res.interview.questions || [];
        const savedIdx = parseInt(localStorage.getItem(`mockvue_int_${id}_idx`) || '0', 10);
        const validIdx = Math.min(Math.max(0, savedIdx), Math.max(0, questions.length - 1));
        setCurrentIndex(validIdx);

        // Calculate and restore countdown timer
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
      })
      .catch((err) => {
        setError(err.message || 'Failed to load interview session.');
        setLoading(false);
      });

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [id, navigate]);

  // Teardown camera & CV engine on unmount
  useEffect(() => {
    return () => {
      if (cvEngineRef.current) {
        cvEngineRef.current.stop();
      }
      if (camStreamRef.current) {
        camStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  // Web Speech API Voice Dictation
  const toggleRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please type your response.');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      isRecordingRef.current = false;
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setAnswerText((prev) => (prev ? `${prev} ${currentTranscript}` : currentTranscript));
        };

        recognition.onerror = (event) => {
          console.warn('Speech recognition notice:', event.error);
          setIsRecording(false);
          isRecordingRef.current = false;
        };

        recognition.onend = () => {
          setIsRecording(false);
          isRecordingRef.current = false;
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
        isRecordingRef.current = true;
      } catch (e) {
        console.error('Speech initialization error:', e);
        setIsRecording(false);
        isRecordingRef.current = false;
      }
    }
  };

  const handleAutoSubmitDueToTime = () => {
    handleEndInterviewEarly();
  };

  const handleEndInterviewEarly = async () => {
    localStorage.removeItem(`mockvue_int_${id}_idx`);
    localStorage.removeItem(`mockvue_timer_end_${id}`);
    try {
      await api.post(`/interviews/${id}/complete`);
      navigate(`/interviews/${id}/results`);
    } catch (err) {
      navigate(`/interviews/${id}/results`);
    }
  };

  const questions = interview?.questions || [];
  const currentQuestion = questions[currentIndex];

  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || isSubmitting) return;

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      isRecordingRef.current = false;
    }

    setIsSubmitting(true);
    setSubmissionStep('Transmitting candidate telemetry to rubric matrix...');

    const timeSpent = Math.max(5, Math.round((Date.now() - questionStartTime) / 1000));

    try {
      const res = await api.post(`/interviews/${id}/answer`, {
        questionId: currentQuestion._id,
        responseText: answerText,
        timeSpentSeconds: timeSpent,
        responseType: isRecording ? 'audio_transcript' : 'text',
      });

      setSubmissionStep('Computing rubric criteria feedback...');
      setCurrentEvaluation(res.evaluation);
    } catch (err) {
      setError(err.message || 'Failed to submit response. Please try again.');
    } finally {
      setIsSubmitting(false);
      setSubmissionStep('');
    }
  };

  const handleNextQuestion = () => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= questions.length) {
      localStorage.removeItem(`mockvue_int_${id}_idx`);
      localStorage.removeItem(`mockvue_timer_end_${id}`);
      navigate(`/interviews/${id}/results`);
    } else {
      setCurrentIndex(nextIdx);
      localStorage.setItem(`mockvue_int_${id}_idx`, String(nextIdx));
      setAnswerText('');
      setCurrentEvaluation(null);
      setQuestionStartTime(Date.now());
    }
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <Spinner size="lg" label="Locking Examination Cockpit & Sensors..." />
      </div>
    );
  }

  // 1. EARLY TERMINATION AUDIT MODAL
  if (isTerminated) {
    return (
      <div className="min-h-screen bg-[#F7F4EE] dark:bg-[#141210] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-xl border border-[#E8C4C4] dark:border-[#A33B3B]/40 bg-[#FFFDF9] dark:bg-[#1C1916] text-center shadow-paper space-y-4 animate-scale-in">
          <div className="w-14 h-14 rounded-full bg-[#FAF0F0] dark:bg-[#A33B3B]/20 border border-[#E8C4C4] dark:border-[#A33B3B]/40 text-[#A33B3B] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#A33B3B] block">
              SECURITY TERMINATION
            </span>
            <h2 className="text-xl font-serif font-bold text-[#171717] dark:text-[#F7F4EE]">
              Examination Concluded
            </h2>
            <p className="text-xs text-[#68645E] dark:text-[#9E988F] font-mono leading-relaxed">
              {terminationReason}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#FAF0F0] dark:bg-[#A33B3B]/10 border border-[#E8C4C4] dark:border-[#A33B3B]/20 text-[11px] font-mono text-[#A33B3B]">
            All submitted responses have been sealed and evaluated. Redirecting to official transcript...
          </div>
          <Spinner size="sm" label="Generating Final Evaluation Dossier..." />
        </div>
      </div>
    );
  }

  // 2. FULLSCREEN GATE: Must enter full-screen to start examination
  if (!hasEnteredExamMode || !isFullscreen) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 font-sans py-8">
        <div className="max-w-xl w-full p-6 sm:p-8 rounded-xl border border-[#DED9D0] dark:border-[#332F2A] bg-[#FFFDF9] dark:bg-[#1C1916] shadow-paper space-y-6 text-center">
          <div className="w-14 h-14 rounded-[12px] bg-[#FAF0F2] dark:bg-[#7A263A]/20 border border-[#E8C5CC] dark:border-[#7A263A]/40 text-[#7A263A] dark:text-[#E8A5B2] flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="font-mono text-[10px] uppercase font-semibold tracking-wider text-[#7A263A] dark:text-[#D4AA6A]">
              PROCTORING INTEGRITY MANDATE
            </span>
            <h1 className="text-2xl font-serif font-bold text-[#171717] dark:text-[#F7F4EE] tracking-tight">
              Strict Assessment Protocol
            </h1>
            <p className="text-xs text-[#68645E] dark:text-[#9E988F] leading-relaxed max-w-md mx-auto">
              MockVue enforces continuous Computer Vision, Gaze Coordinate Tracking, and Full-Screen lock during examinations.
            </p>
          </div>

          {/* Strict Rules Audit Table */}
          <div className="text-left font-mono text-xs space-y-2.5 p-4 rounded-lg bg-[#F7F4EE] dark:bg-[#141210] border border-[#DED9D0] dark:border-[#332F2A]">
            <div className="flex items-start gap-2 text-[#A33B3B] dark:text-[#E59797]">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span><strong>Tab Navigation Ban:</strong> Leaving or minimizing this tab immediately terminates the test.</span>
            </div>
            <div className="flex items-start gap-2 text-[#A33B3B] dark:text-[#E59797]">
              <Maximize2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span><strong>Full-Screen Lock:</strong> Exiting full-screen mode immediately concludes your session.</span>
            </div>
            <div className="flex items-start gap-2 text-[#7A263A] dark:text-[#D4AA6A]">
              <Eye className="w-4 h-4 shrink-0 mt-0.5" />
              <span><strong>Face & Gaze Tracking:</strong> Absence for &gt;10s or looking off-screen issues warnings.</span>
            </div>
            <div className="flex items-start gap-2 text-[#68645E] dark:text-[#9E988F]">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span><strong>5-Warning Hard Limit:</strong> 5 cumulative warnings will automatically terminate the exam.</span>
            </div>
          </div>

          <div className="pt-2">
            <Button size="lg" icon={Maximize2} onClick={enterExamMode} className="w-full font-medium">
              Initiate Proctoring & Enter Examination
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 3. ACTIVE INTERVIEW ROOM COCKPIT
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const isTimeCritical = secondsRemaining > 0 && secondsRemaining < 180;
  const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;
  const integrityScore = Math.max(0, 100 - warnings.length * 15);

  return (
    <div className="min-h-screen bg-[#F7F4EE] dark:bg-[#141210] text-[#171717] dark:text-[#F7F4EE] p-4 sm:p-6 space-y-4 animate-fade-in font-sans">
      {/* Top Cockpit Telemetry Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#DED9D0] dark:border-[#332F2A]">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-[6px] bg-[#FAF0F2] dark:bg-[#7A263A]/20 text-[#7A263A] dark:text-[#E8A5B2] border border-[#E8C5CC] dark:border-[#7A263A]/40">
            QUESTION {String(currentIndex + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')}
          </span>
          <span className="text-sm font-serif font-bold tracking-tight text-[#171717] dark:text-[#F7F4EE]">
            {interview?.targetRole}
          </span>
          <span className="hidden md:inline font-mono text-xs text-[#68645E] dark:text-[#9E988F]">
            • {interview?.difficulty} • {currentQuestion?.topic}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Live Security Badges */}
          <div className="flex items-center gap-2 font-mono text-[10px] font-semibold">
            {/* Integrity Meter */}
            <span className="px-2 py-0.5 rounded-[6px] bg-[#FFFDF9] dark:bg-[#1C1916] text-[#171717] dark:text-[#F7F4EE] border border-[#DED9D0] dark:border-[#332F2A] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#3F6B52]" />
              INTEGRITY: {integrityScore}%
            </span>

            {/* Warning Counter */}
            <span className={`px-2 py-0.5 rounded-[6px] border flex items-center gap-1 ${
              warnings.length >= 3
                ? 'bg-[#FAF0F0] text-[#A33B3B] border-[#E8C4C4] animate-pulse'
                : warnings.length > 0
                ? 'bg-[#FBF5EC] text-[#A66A24] border-[#E8D5BE]'
                : 'bg-[#EFF5F1] text-[#3F6B52] border-[#C2D9CB]'
            }`}>
              <AlertTriangle className="w-3 h-3" />
              WARNINGS: {warnings.length} / 5
            </span>

            {/* Fullscreen indicator */}
            <span className="hidden sm:flex px-2 py-0.5 rounded-[6px] bg-[#EFF5F1] text-[#3F6B52] border border-[#C2D9CB] items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3F6B52] animate-pulse" />
              TAB LOCKED
            </span>
          </div>

          {/* Countdown Timer */}
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-[8px] font-mono text-xs font-bold border transition-colors ${
              isTimeCritical
                ? 'bg-[#FAF0F0] text-[#A33B3B] border-[#E8C4C4] animate-pulse'
                : 'bg-[#FFFDF9] dark:bg-[#1C1916] text-[#171717] dark:text-[#F7F4EE] border-[#DED9D0] dark:border-[#332F2A]'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#7A263A] dark:text-[#D4AA6A]" />
            <span>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleEndInterviewEarly}
            className="text-[#68645E] dark:text-[#9E988F] hover:text-[#A33B3B] text-xs font-mono"
          >
            Finish Exam
          </Button>
        </div>
      </div>

      {/* ACTIVE WARNING NOTIFICATION BANNER */}
      {activeWarningBanner && (
        <div className="p-3.5 rounded-xl bg-[#FAF0F0] dark:bg-[#A33B3B]/20 border border-[#E8C4C4] dark:border-[#A33B3B]/40 flex items-center justify-between gap-3 text-xs text-[#A33B3B] dark:text-[#E59797] font-mono animate-bounce-subtle">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <strong>PROCTORING WARNING ({activeWarningBanner.count} OF 5 ALLOWED):</strong>{' '}
              <span>{activeWarningBanner.message}</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#A33B3B] text-white text-[10px] font-bold shrink-0">
            {5 - activeWarningBanner.count} REMAINING
          </span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-[8px] bg-[#FAF0F0] dark:bg-[#A33B3B]/15 border border-[#E8C4C4] dark:border-[#A33B3B]/40 flex items-center gap-2 text-xs text-[#A33B3B] dark:text-[#E59797] font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Stage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (5 cols): Question Prompt & Real-time Computer Vision HUD */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 shadow-paper">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#DED9D0]/70 dark:border-[#332F2A]/70">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#68645E] dark:text-[#9E988F]">
                EVALUATION PROMPT
              </span>
              <span className="font-mono text-[10px] text-[#7A263A] dark:text-[#D4AA6A] font-semibold">
                {currentQuestion?.topic?.toUpperCase()}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-serif font-bold text-[#171717] dark:text-[#F7F4EE] leading-snug">
              {currentQuestion?.questionText}
            </h2>

            <div className="mt-4 pt-3 border-t border-[#DED9D0]/60 dark:border-[#332F2A]/60 flex items-start gap-2 text-xs text-[#68645E] dark:text-[#9E988F] font-mono">
              <HelpCircle className="w-4 h-4 text-[#7A263A] dark:text-[#D4AA6A] shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Be structured. Explain internal mechanisms, time/space complexity, and practical edge cases.
              </p>
            </div>
          </Card>

          {/* Continuous Computer Vision Proctoring Cockpit */}
          <Card className="p-4 shadow-paper space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#171717] dark:text-[#F7F4EE] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3F6B52]" />
                Computer Vision & Audio Proctor
              </span>
              <span className="font-mono text-[10px] text-[#3F6B52] dark:text-[#88BA9D] flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3F6B52] animate-pulse" />
                OPENCV / RAM ACTIVE
              </span>
            </div>

            {/* Video Preview with Overlay Canvas for AR Telemetry */}
            <div className="relative aspect-video rounded-xl bg-[#1C1916] overflow-hidden flex items-center justify-center border border-[#DED9D0] dark:border-[#332F2A]">
              <video
                ref={camVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas
                ref={overlayCanvasRef}
                width={320}
                height={240}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />

              {/* Real-time Out-of-frame Countdown Alert */}
              {outOfFrameSeconds > 0 && (
                <div className="absolute top-10 left-3 right-3 p-2 rounded-lg bg-[#FAF0F0]/90 text-[#A33B3B] font-mono text-xs font-bold border border-[#A33B3B] text-center animate-pulse">
                  ⚠️ NO CANDIDATE DETECTED: {outOfFrameSeconds}s / 10s (WARNING AT 10s)
                </div>
              )}

              {/* Gaze deviation warning display */}
              {gazeDeviationSeconds > 1 && (
                <div className="absolute bottom-10 left-3 right-3 p-1.5 rounded-lg bg-[#FBF5EC]/90 text-[#A66A24] font-mono text-[11px] font-bold border border-[#A66A24] text-center">
                  ⚠️ EYES DIVERTED ({liveCV.gaze.label}): {gazeDeviationSeconds}s / 4s
                </div>
              )}

              {cameraError && (
                <div className="absolute inset-0 bg-[#1C1916]/85 p-4 flex flex-col items-center justify-center text-center space-y-2">
                  <AlertCircle className="w-6 h-6 text-[#A33B3B]" />
                  <p className="text-[11px] text-[#A33B3B] font-mono">{cameraError}</p>
                  <Button size="sm" variant="secondary" onClick={initAllTimeCamera}>
                    Retry Camera Stream
                  </Button>
                </div>
              )}
            </div>

            {/* Real-Time Live Telemetry Metrics Row */}
            <div className="grid grid-cols-3 gap-2 font-mono text-[10px] text-center">
              <div className="p-2 rounded-lg bg-[#F0ECE4] dark:bg-[#24201C] border border-[#DED9D0] dark:border-[#332F2A]">
                <span className="text-[#68645E] dark:text-[#9E988F] block">VISION PRESENCE</span>
                <strong className={liveCV.faceDetected ? 'text-[#3F6B52]' : 'text-[#A33B3B]'}>
                  {liveCV.faceDetected ? 'LOCKED (1)' : 'ABSENT'}
                </strong>
              </div>

              <div className="p-2 rounded-lg bg-[#F0ECE4] dark:bg-[#24201C] border border-[#DED9D0] dark:border-[#332F2A]">
                <span className="text-[#68645E] dark:text-[#9E988F] block">PUPIL GAZE</span>
                <strong className={liveCV.gaze.centered ? 'text-[#C59A5B]' : 'text-[#A66A24]'}>
                  {liveCV.gaze.label}
                </strong>
              </div>

              <div className="p-2 rounded-lg bg-[#F0ECE4] dark:bg-[#24201C] border border-[#DED9D0] dark:border-[#332F2A]">
                <span className="text-[#68645E] dark:text-[#9E988F] block">ACOUSTIC VU</span>
                <strong className={liveCV.isSpeaking ? 'text-[#3F6B52]' : 'text-[#68645E]'}>
                  {liveCV.audioDb} dB
                </strong>
              </div>
            </div>

            {/* Warning Pips Bar */}
            <div className="p-2.5 rounded-lg bg-[#F7F4EE] dark:bg-[#141210] border border-[#DED9D0] dark:border-[#332F2A] flex items-center justify-between text-xs font-mono">
              <span className="text-[#68645E] dark:text-[#9E988F] text-[11px]">
                WARNING QUOTA:
              </span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((pip) => (
                  <span
                    key={pip}
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      warnings.length >= pip
                        ? 'bg-[#A33B3B] text-white'
                        : 'bg-[#DED9D0] dark:bg-[#332F2A] text-transparent'
                    }`}
                  >
                    {warnings.length >= pip ? '!' : ''}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (7 cols): Workspace & Evaluation Feedback */}
        <div className="lg:col-span-7 space-y-4">
          {!currentEvaluation ? (
            /* Answer Input State */
            <Card className="p-5 space-y-3.5 shadow-paper">
              <div className="flex items-center justify-between pb-3 border-b border-[#DED9D0]/70 dark:border-[#332F2A]/70">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#171717] dark:text-[#F7F4EE] flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#7A263A] dark:text-[#D4AA6A]" />
                  Candidate Response Workspace
                </span>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#68645E] dark:text-[#9E988F]">{wordCount} words</span>
                  <button
                    onClick={toggleRecording}
                    className={`px-2.5 py-1 rounded-[6px] text-xs font-mono font-medium flex items-center gap-1.5 transition-colors border ${
                      isRecording
                        ? 'bg-[#FAF0F0] text-[#A33B3B] border-[#E8C4C4] animate-pulse'
                        : 'bg-[#F0ECE4] text-[#171717] dark:bg-[#24201C] dark:text-[#F7F4EE] border-[#DED9D0] dark:border-[#332F2A] hover:bg-[#E8E2D8]'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                    <span>{isRecording ? 'Stop Dictation' : 'Dictate'}</span>
                  </button>
                </div>
              </div>

              {/* Textarea with Restricted Key Trapping */}
              <textarea
                rows={11}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Type your technical defense or dictate your answer..."
                disabled={isSubmitting}
                className="w-full p-4 rounded-xl border border-[#DED9D0] dark:border-[#332F2A] bg-[#FFFDF9] dark:bg-[#141210] text-[#171717] dark:text-[#F7F4EE] text-sm font-sans focus:outline-none focus:border-[#7A263A] focus:ring-1 focus:ring-[#7A263A]/20 transition-all leading-relaxed"
              />

              {/* Rubric Criteria Chips */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#DED9D0]/60 dark:border-[#332F2A]/60 font-mono text-[11px]">
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-[6px] bg-[#EFF5F1] text-[#3F6B52] dark:bg-[#3F6B52]/20 dark:text-[#88BA9D] border border-[#C2D9CB] dark:border-[#3F6B52]/40">
                    Technical 40%
                  </span>
                  <span className="px-2 py-0.5 rounded-[6px] bg-[#FAF0F2] text-[#7A263A] dark:bg-[#7A263A]/20 dark:text-[#E8A5B2] border border-[#E8C5CC] dark:border-[#7A263A]/40">
                    Relevance 20%
                  </span>
                  <span className="px-2 py-0.5 rounded-[6px] bg-[#FBF5EC] text-[#A66A24] dark:bg-[#A66A24]/20 dark:text-[#DEAC74] border border-[#E8D5BE] dark:border-[#A66A24]/40">
                    Completeness 20%
                  </span>
                  <span className="px-2 py-0.5 rounded-[6px] bg-[#F0ECE4] text-[#68645E] dark:bg-[#24201C] dark:text-[#9E988F] border border-[#DED9D0] dark:border-[#332F2A]">
                    Clarity 20%
                  </span>
                </div>

                <Button
                  size="md"
                  icon={Send}
                  onClick={handleSubmitAnswer}
                  isLoading={isSubmitting}
                  disabled={!answerText.trim() || isSubmitting}
                >
                  Submit & Evaluate
                </Button>
              </div>

              {isSubmitting && submissionStep && (
                <div className="p-2.5 rounded-[8px] bg-[#F0ECE4] dark:bg-[#24201C] text-xs font-mono text-[#68645E] dark:text-[#9E988F] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#7A263A] animate-pulse" />
                  <span>{submissionStep}</span>
                </div>
              )}
            </Card>
          ) : (
            /* Live Evaluation Feedback Display */
            <div className="space-y-4">
              <Card className="p-5 space-y-4 shadow-paper border-[#DED9D0]">
                <div className="flex items-center justify-between pb-3 border-b border-[#DED9D0] dark:border-[#332F2A]">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[10px] uppercase font-semibold text-[#68645E] dark:text-[#9E988F]">
                      CALIBRATED EVALUATION
                    </span>
                    <h3 className="text-base font-serif font-bold text-[#171717] dark:text-[#F7F4EE]">
                      Rubric Scoring Breakdown
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-xs text-[#68645E] dark:text-[#9E988F]">OVERALL:</span>
                    <span className="px-3 py-1 rounded-[8px] bg-[#FAF0F2] dark:bg-[#7A263A]/20 text-[#7A263A] dark:text-[#D4AA6A] font-bold text-base border border-[#E8C5CC] dark:border-[#7A263A]/40">
                      {currentEvaluation.overallScore}%
                    </span>
                  </div>
                </div>

                {/* 4-Tier Criteria Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                  <div className="p-2 rounded-[8px] bg-[#EFF5F1] dark:bg-[#3F6B52]/20 border border-[#C2D9CB] dark:border-[#3F6B52]/40 text-center">
                    <span className="text-[#3F6B52] dark:text-[#88BA9D] block text-[10px]">Technical</span>
                    <strong className="text-sm font-bold text-[#3F6B52] dark:text-[#88BA9D]">
                      {currentEvaluation.criteriaScores?.technicalCorrectness} / 40
                    </strong>
                  </div>
                  <div className="p-2 rounded-[8px] bg-[#FAF0F2] dark:bg-[#7A263A]/20 border border-[#E8C5CC] dark:border-[#7A263A]/40 text-center">
                    <span className="text-[#7A263A] dark:text-[#E8A5B2] block text-[10px]">Relevance</span>
                    <strong className="text-sm font-bold text-[#7A263A] dark:text-[#E8A5B2]">
                      {currentEvaluation.criteriaScores?.relevance} / 20
                    </strong>
                  </div>
                  <div className="p-2 rounded-[8px] bg-[#FBF5EC] dark:bg-[#A66A24]/20 border border-[#E8D5BE] dark:border-[#A66A24]/40 text-center">
                    <span className="text-[#A66A24] dark:text-[#DEAC74] block text-[10px]">Completeness</span>
                    <strong className="text-sm font-bold text-[#A66A24] dark:text-[#DEAC74]">
                      {currentEvaluation.criteriaScores?.completeness} / 20
                    </strong>
                  </div>
                  <div className="p-2 rounded-[8px] bg-[#F0ECE4] dark:bg-[#24201C] border border-[#DED9D0] dark:border-[#332F2A] text-center">
                    <span className="text-[#68645E] dark:text-[#9E988F] block text-[10px]">Clarity</span>
                    <strong className="text-sm font-bold text-[#171717] dark:text-[#F7F4EE]">
                      {currentEvaluation.criteriaScores?.clarity} / 20
                    </strong>
                  </div>
                </div>

                {/* Diagnostic Feedback */}
                <div className="p-3.5 rounded-[8px] bg-[#F0ECE4]/60 dark:bg-[#24201C]/60 border border-[#DED9D0] dark:border-[#332F2A]">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#68645E] dark:text-[#9E988F] block mb-1">
                    CRITIQUE & DIAGNOSTICS:
                  </span>
                  <p className="text-xs text-[#171717] dark:text-[#F7F4EE] leading-relaxed">
                    {currentEvaluation.feedback}
                  </p>
                </div>

                {/* Demonstrated vs Missing Concepts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-[8px] bg-[#EFF5F1] dark:bg-[#3F6B52]/20 border border-[#C2D9CB] dark:border-[#3F6B52]/40 space-y-1">
                    <span className="font-semibold text-[#3F6B52] dark:text-[#88BA9D] flex items-center gap-1 text-[11px]">
                      <Check className="w-3.5 h-3.5" /> CONCEPTS DEMONSTRATED
                    </span>
                    <ul className="list-disc list-inside text-[#171717] dark:text-[#F7F4EE] space-y-0.5 text-[11px]">
                      {currentEvaluation.correctConcepts?.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 rounded-[8px] bg-[#FBF5EC] dark:bg-[#A66A24]/20 border border-[#E8D5BE] dark:border-[#A66A24]/40 space-y-1">
                    <span className="font-semibold text-[#A66A24] dark:text-[#DEAC74] flex items-center gap-1 text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5" /> OMITTED / EDGE CASES
                    </span>
                    <ul className="list-disc list-inside text-[#171717] dark:text-[#F7F4EE] space-y-0.5 text-[11px]">
                      {currentEvaluation.missingConcepts?.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button size="md" icon={ArrowRight} onClick={handleNextQuestion}>
                    {currentIndex + 1 >= questions.length ? 'Finalize & View Dossier' : 'Proceed to Next Question'}
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;
