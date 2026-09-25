import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  VideoOff, 
  ShieldCheck, 
  Award, 
  AlertCircle,
  Play,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import api from '../services/api';

export const InterviewPrepPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  // Hardware Checks State
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    api.get(`/interviews/${id}`)
      .then((res) => {
        setInterview(res.interview);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load interview session.');
        setLoading(false);
      });

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [id]);

  const toggleCamera = async () => {
    if (cameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      setCameraActive(false);
      if (videoRef.current) videoRef.current.srcObject = null;
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } catch (err) {
        console.warn('Camera/Mic permission denied or not available:', err.message);
        alert('Could not access camera/microphone. Ensure permissions are granted before starting the proctored viva.');
      }
    }
  };

  const handleStartInterview = async () => {
    setIsStarting(true);
    try {
      await api.post(`/interviews/${id}/start`);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      navigate(`/interviews/${id}/room`);
    } catch (err) {
      setError(err.message || 'Failed to start interview.');
      setIsStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spinner size="lg" label="Initializing Session Parameters..." />
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="max-w-md mx-auto my-20 p-6 stitch-card text-center">
        <AlertCircle className="w-8 h-8 text-[#A33B3B] mx-auto mb-3" />
        <h2 className="text-base font-serif font-bold text-[#171717] dark:text-[#F7F4EE] mb-1">Session Unavailable</h2>
        <p className="text-xs text-[#68645E] dark:text-[#9E988F] mb-5 font-mono">{error || 'Session not found'}</p>
        <Button size="sm" onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Session Title & Overview */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#DED9D0] dark:border-[#332F2A]">
        <div>
          <div className="flex items-center gap-2 mb-2 font-mono">
            <Badge variant="brand" size="sm">{interview.difficulty.toUpperCase()}</Badge>
            <Badge variant="neutral" size="sm">{interview.interviewType.toUpperCase()}</Badge>
            {interview.isFallbackAI && <Badge variant="warning" size="sm">CURATED REPOSITORY</Badge>}
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#171717] dark:text-[#F7F4EE]">
            {interview.title}
          </h1>
          <p className="text-xs text-[#68645E] dark:text-[#9E988F] mt-1 font-mono">
            {interview.questions?.length} QUESTIONS • {interview.durationMinutes} MINUTE EXAMINATION BUDGET
          </p>
        </div>

        <Button
          size="md"
          icon={Play}
          isLoading={isStarting}
          onClick={handleStartInterview}
        >
          Initialize Examination Room
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Device & Hardware Verification */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-[#171717] dark:text-[#F7F4EE]">
                Webcam & Sensor Calibration
              </h3>
              <button
                onClick={toggleCamera}
                className="font-mono text-xs font-semibold text-[#7A263A] dark:text-[#D4AA6A] hover:underline"
              >
                {cameraActive ? 'Deactivate Device' : 'Test Device Feed'}
              </button>
            </div>
            <p className="text-xs text-[#68645E] dark:text-[#9E988F] mb-3">
              Webcam is required for engagement telemetry and proctoring audit during the viva examination.
            </p>

            <div className="relative aspect-video rounded-xl bg-[#1C1916] overflow-hidden flex items-center justify-center border border-[#DED9D0] dark:border-[#332F2A]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
              />
              {!cameraActive && (
                <div className="text-center p-6 text-[#9E988F] space-y-2">
                  <div className="w-10 h-10 rounded-[8px] bg-[#24201C] border border-[#332F2A] flex items-center justify-center mx-auto text-[#68645E]">
                    <VideoOff className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-mono">Device feed inactive</p>
                  <Button size="sm" variant="secondary" onClick={toggleCamera}>
                    Activate Preview
                  </Button>
                </div>
              )}
              {cameraActive && (
                <div className="absolute bottom-2 left-2 bg-[#1C1916]/90 backdrop-blur-md px-2.5 py-1 rounded-[6px] text-[10px] font-mono text-[#3F6B52] dark:text-[#88BA9D] flex items-center gap-1.5 border border-[#3F6B52]/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3F6B52] animate-pulse" />
                  SENSOR VERIFIED ONLINE
                </div>
              )}
            </div>
          </Card>

          <div className="p-4 rounded-xl border border-[#DED9D0] dark:border-[#332F2A] bg-[#F0ECE4]/70 dark:bg-[#1C1916] text-xs text-[#68645E] dark:text-[#9E988F] space-y-1">
            <div className="flex items-center gap-1.5 text-[#171717] dark:text-[#F7F4EE] font-medium">
              <ShieldCheck className="w-4 h-4 text-[#3F6B52]" />
              <span>Client-Side Privacy Compliance</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              All proctoring computer vision metrics run directly in-memory in your browser. No raw video tracks are transmitted to external servers.
            </p>
          </div>
        </div>

        {/* Right: Evaluation Rubric Breakdown */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-mono font-semibold uppercase tracking-wider text-[#171717] dark:text-[#F7F4EE] mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#7A263A] dark:text-[#D4AA6A]" />
              4-Tier Rubric Specification (100%)
            </h3>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-3 rounded-[8px] bg-[#F0ECE4] dark:bg-[#24201C] border border-[#DED9D0] dark:border-[#332F2A]">
                <div className="flex justify-between font-bold text-[#171717] dark:text-[#F7F4EE] mb-0.5">
                  <span>1. Technical Correctness</span>
                  <span className="text-[#3F6B52]">40%</span>
                </div>
                <p className="text-[11px] text-[#68645E] dark:text-[#9E988F] font-sans">
                  Theoretical validity, algorithm mechanics, complexity bounds, correct terminology.
                </p>
              </div>

              <div className="p-3 rounded-[8px] bg-[#F0ECE4] dark:bg-[#24201C] border border-[#DED9D0] dark:border-[#332F2A]">
                <div className="flex justify-between font-bold text-[#171717] dark:text-[#F7F4EE] mb-0.5">
                  <span>2. Question Relevance</span>
                  <span className="text-[#C59A5B]">20%</span>
                </div>
                <p className="text-[11px] text-[#68645E] dark:text-[#9E988F] font-sans">
                  Direct responsiveness to prompt constraints without extraneous filler.
                </p>
              </div>

              <div className="p-3 rounded-[8px] bg-[#F0ECE4] dark:bg-[#24201C] border border-[#DED9D0] dark:border-[#332F2A]">
                <div className="flex justify-between font-bold text-[#171717] dark:text-[#F7F4EE] mb-0.5">
                  <span>3. Completeness</span>
                  <span className="text-[#A66A24]">20%</span>
                </div>
                <p className="text-[11px] text-[#68645E] dark:text-[#9E988F] font-sans">
                  Coverage of architectural trade-offs, edge cases, and scale failure modes.
                </p>
              </div>

              <div className="p-3 rounded-[8px] bg-[#F0ECE4] dark:bg-[#24201C] border border-[#DED9D0] dark:border-[#332F2A]">
                <div className="flex justify-between font-bold text-[#171717] dark:text-[#F7F4EE] mb-0.5">
                  <span>4. Communication Clarity</span>
                  <span className="text-[#3F6B52]">20%</span>
                </div>
                <p className="text-[11px] text-[#68645E] dark:text-[#9E988F] font-sans">
                  Logical sequence, coherent narrative, clear architectural step-by-step reasoning.
                </p>
              </div>
            </div>
          </Card>

          <div className="p-4 rounded-xl border border-[#E8D5BE] dark:border-[#A66A24]/40 bg-[#FBF5EC] dark:bg-[#A66A24]/10 text-xs font-mono space-y-1.5">
            <span className="font-bold text-[#A66A24] dark:text-[#DEAC74] uppercase tracking-wider block flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              MANDATORY PROCTORING PROTOCOL:
            </span>
            <p className="text-[11px] text-[#171717] dark:text-[#F7F4EE] font-sans leading-relaxed">
              1. <strong>All-Time Camera:</strong> Continuous webcam access is maintained during the viva.<br />
              2. <strong>Full-Screen Lock:</strong> The exam executes in strict full-screen mode. <strong>Exiting full screen will immediately terminate your exam and submit answered questions.</strong>
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#DED9D0] dark:border-[#332F2A] bg-[#FFFDF9] dark:bg-[#1C1916] flex items-center justify-between shadow-paper">
            <span className="text-xs font-mono text-[#68645E] dark:text-[#9E988F]">
              Timer commences on entrance.
            </span>
            <Button size="sm" icon={Play} onClick={handleStartInterview} isLoading={isStarting}>
              Enter Proctored Exam
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
