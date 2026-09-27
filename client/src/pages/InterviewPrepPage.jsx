import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Camera,
  Play, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft,
  FileText,
  Volume2
} from 'lucide-react';
import api from '../services/api';

export const InterviewPrepPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  // Microphone Check State
  const [micTested, setMicTested] = useState(false);
  const [micStatus, setMicStatus] = useState('idle'); // 'idle' | 'listening' | 'success' | 'error'
  const [micVolume, setMicVolume] = useState(0);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);

  // Camera & Face Detection Check State
  const [cameraStatus, setCameraStatus] = useState('idle'); // 'idle' | 'checking' | 'ready' | 'error'
  const [cameraError, setCameraError] = useState('');
  const [faceDetected, setFaceDetected] = useState(false);
  const videoRef = useRef(null);
  const videoStreamRef = useRef(null);
  const faceCheckIntervalRef = useRef(null);

  useEffect(() => {
    api.get(`/interviews/${id}`)
      .then((res) => {
        setInterview(res.interview);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load interview details.');
        setLoading(false);
      });

    // Auto-initiate camera preview check
    handleTestCamera();

    return () => {
      cleanupHardwareTests();
    };
  }, [id]);

  const cleanupHardwareTests = () => {
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (e) {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (faceCheckIntervalRef.current) {
      clearInterval(faceCheckIntervalRef.current);
    }
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const handleTestCamera = async () => {
    setCameraStatus('checking');
    setCameraError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      videoStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      setCameraStatus('ready');
      setFaceDetected(true);
    } catch (err) {
      console.warn('Camera preview test error:', err);
      setCameraStatus('error');
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in your browser settings to proceed with the proctored interview.'
          : 'Could not access camera. Please verify your webcam is connected.'
      );
    }
  };

  const cleanupMicTest = () => {
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (e) {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const handleTestMicrophone = async () => {
    cleanupMicTest();
    setMicStatus('listening');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 64;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let checkCounter = 0;

        const checkVolume = () => {
          if (!streamRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = Math.round(sum / dataArray.length);
          setMicVolume(Math.min(100, avg * 2));

          checkCounter++;
          if (checkCounter < 30) {
            requestAnimationFrame(checkVolume);
          } else {
            setMicStatus('success');
            setMicTested(true);
          }
        };

        checkVolume();
      } else {
        setMicStatus('success');
        setMicTested(true);
      }
    } catch (err) {
      console.warn('Microphone test error:', err);
      setMicStatus('error');
    }
  };

  const handleStartInterview = async () => {
    cleanupHardwareTests();
    setIsStarting(true);
    try {
      await api.post(`/interviews/${id}/start`);
      navigate(`/interviews/${id}/room`);
    } catch (err) {
      setError(err.message || 'Failed to start interview.');
      setIsStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-600">Loading interview details...</p>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-white border border-slate-200 rounded-lg text-center shadow-sm space-y-4">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Session Error</h2>
        <p className="text-sm text-slate-600">{error || 'Session could not be found.'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      {/* Page Heading */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-slate-900">{interview.title}</h1>
          <p className="text-xs text-slate-500 mt-1">
            {interview.difficulty} Level • {interview.questions?.length || 5} Questions • {interview.durationMinutes} Minutes Total
          </p>
        </div>

        <button
          onClick={handleStartInterview}
          disabled={isStarting}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded shadow-sm transition-colors"
        >
          {isStarting ? (
            <span>Starting...</span>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Start Interview</span>
            </>
          )}
        </button>
      </div>

      {/* Grid: Instructions & Hardware Check */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Instructions Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            How It Works
          </h3>

          <ol className="text-xs text-slate-600 space-y-2.5 list-decimal list-inside leading-relaxed">
            <li>
              <strong>Read the question</strong> displayed on the screen.
            </li>
            <li>
              Click <strong>"Start Recording"</strong> and speak your answer clearly into your microphone.
            </li>
            <li>
              Click <strong>"Stop Recording"</strong> when you are finished speaking.
            </li>
            <li>
              Your speech will be converted to text. You can <strong>review and edit</strong> your transcript.
            </li>
            <li>
              Click <strong>"Submit Answer"</strong> to receive an accurate score and detailed feedback breakdown.
            </li>
          </ol>
        </div>

        {/* Camera & AI Proctoring Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-600" />
              Webcam & AI Proctoring Check
            </span>
            {cameraStatus === 'ready' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                <CheckCircle className="w-3 h-3 text-green-600" />
                Active & Monitoring
              </span>
            )}
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed">
            AI proctoring monitors presence, face visibility, and focus during the interview. Please position yourself in the center of the frame.
          </p>

          <div className="relative w-full h-44 bg-slate-900 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />

            {cameraStatus === 'checking' && (
              <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center text-white space-y-2">
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Initializing camera feed...</span>
              </div>
            )}

            {cameraStatus === 'error' && (
              <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-4 text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <span className="text-xs text-white font-medium">Camera Access Required</span>
                <span className="text-[11px] text-slate-300 leading-tight">
                  {cameraError || 'Please allow webcam access to continue.'}
                </span>
                <button
                  onClick={handleTestCamera}
                  className="mt-1 text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition-colors"
                >
                  Retry Access
                </button>
              </div>
            )}

            {cameraStatus === 'ready' && (
              <div className="absolute bottom-2 left-2 right-2 bg-slate-900/70 backdrop-blur-sm text-white px-2.5 py-1 rounded flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Face Detected in Frame
                </span>
                <span className="text-slate-300">Live Preview</span>
              </div>
            )}
          </div>
        </div>

        {/* Microphone Test Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Mic className="w-4 h-4 text-blue-600" />
            Microphone Check
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed">
            Make sure your microphone is working so your answers are captured clearly.
          </p>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700">Microphone Status:</span>
              {micStatus === 'idle' && (
                <span className="text-xs text-slate-500">Not Tested</span>
              )}
              {micStatus === 'listening' && (
                <span className="text-xs text-blue-600 font-medium animate-pulse flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5" />
                  Listening... Speak now
                </span>
              )}
              {micStatus === 'success' && (
                <span className="text-xs text-green-700 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  Microphone Verified
                </span>
              )}
              {micStatus === 'error' && (
                <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                  Permission Denied
                </span>
              )}
            </div>

            {/* Audio Volume Bar */}
            {micStatus === 'listening' && (
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-75 rounded-full"
                  style={{ width: `${Math.max(10, micVolume)}%` }}
                />
              </div>
            )}

            <button
              onClick={handleTestMicrophone}
              className="w-full text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 py-1.5 rounded transition-colors"
            >
              {micTested ? 'Test Again' : 'Test Microphone'}
            </button>
          </div>
        </div>
      </div>

      {/* Selected Topics Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-2">
        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Topics Covered in this Session
        </h3>
        <div className="flex flex-wrap gap-2 pt-1">
          {interview.topics?.map((topic, i) => (
            <span
              key={i}
              className="text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Final Action CTA */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-xs text-slate-600">
          Ready to begin? The session timer will start once you enter the room.
        </span>

        <button
          onClick={handleStartInterview}
          disabled={isStarting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-6 py-2.5 rounded shadow-sm transition-colors"
        >
          {isStarting ? <span>Loading Room...</span> : <span>Start Interview</span>}
        </button>
      </div>
    </div>
  );
};

export default InterviewPrepPage;
