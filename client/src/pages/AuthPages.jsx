import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Lock, User, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register: authRegister, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect directly to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e, directEmail, directPassword) => {
    if (e) e.preventDefault();
    const loginEmail = directEmail || email;
    const loginPassword = directPassword || password;

    if (!loginEmail || !loginPassword) {
      setError('Please provide both email and password.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await login(loginEmail, loginPassword);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFastLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setIsLoading(true);

    try {
      await login(demoEmail, demoPassword);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // If demo user wasn't registered in DB, auto-register and sign in
      try {
        await authRegister({
          name: demoEmail.split('@')[0],
          email: demoEmail,
          password: demoPassword,
          targetRole: 'Software Development Engineer',
        });
        navigate('/dashboard', { replace: true });
      } catch (regErr) {
        setError(regErr.message || 'Authentication failed. Please check credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoRegister = async () => {
    if (!email) return;
    setIsLoading(true);
    setError('');

    try {
      await authRegister({
        name: email.split('@')[0],
        email,
        password: password || 'password123',
        targetRole: 'Software Development Engineer',
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Auto-registration failed. Please check information.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-14">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex w-10 h-10 rounded-[8px] bg-[#7A263A] text-white items-center justify-center mb-3 shadow-sm border border-[#C59A5B]/40">
            <span className="font-serif font-bold text-lg">M</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#171717] dark:text-[#F7F4EE]">
            Candidate Authentication
          </h2>
          <p className="text-xs text-[#68645E] dark:text-[#9E988F] mt-1 font-mono uppercase tracking-wider">
            PLACEMENT EVALUATION PORTAL
          </p>
        </div>

        {/* Fast-Track Demo Credentials Accordion */}
        <div className="mb-5 p-3 rounded-[10px] border border-[#DED9D0] dark:border-[#332F2A] bg-[#F0ECE4]/70 dark:bg-[#24201C]/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#68645E] dark:text-[#9E988F] font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3F6B52]" />
              Verified Demo Access
            </span>
            <span className="text-[10px] font-mono text-[#7A263A] dark:text-[#D4AA6A] font-medium">
              1-Click Sign-in
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleFastLogin('megenta.point@gmail.com', 'password123')}
              className="text-left p-2.5 rounded-[8px] border border-[#DED9D0] dark:border-[#332F2A] bg-[#FFFDF9] dark:bg-[#1C1916] hover:border-[#7A263A]/70 hover:shadow-sm transition-all group"
            >
              <div className="text-[11px] font-medium text-[#171717] dark:text-[#F7F4EE] truncate group-hover:text-[#7A263A] dark:group-hover:text-[#D4AA6A]">
                megenta.point@gmail.com
              </div>
              <div className="text-[10px] font-mono text-[#68645E] dark:text-[#9E988F] mt-0.5">
                pwd: password123
              </div>
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleFastLogin('candidate@mockvue.edu', 'password123')}
              className="text-left p-2.5 rounded-[8px] border border-[#DED9D0] dark:border-[#332F2A] bg-[#FFFDF9] dark:bg-[#1C1916] hover:border-[#7A263A]/70 hover:shadow-sm transition-all group"
            >
              <div className="text-[11px] font-medium text-[#171717] dark:text-[#F7F4EE] truncate group-hover:text-[#7A263A] dark:group-hover:text-[#D4AA6A]">
                candidate@mockvue.edu
              </div>
              <div className="text-[10px] font-mono text-[#68645E] dark:text-[#9E988F] mt-0.5">
                pwd: password123
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-[10px] bg-[#FAF0F0] dark:bg-[#A33B3B]/15 border border-[#E8C4C4] dark:border-[#A33B3B]/40 text-xs text-[#A33B3B] dark:text-[#E59797]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            {email && (
              <div className="mt-2.5 pt-2 border-t border-[#E8C4C4] dark:border-[#A33B3B]/30">
                <button
                  type="button"
                  onClick={handleAutoRegister}
                  className="w-full py-1.5 px-3 rounded-[6px] bg-[#A33B3B]/10 hover:bg-[#A33B3B]/20 text-[#A33B3B] dark:text-[#E59797] font-mono text-[11px] border border-[#E8C4C4] dark:border-[#A33B3B]/40 text-center font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Auto-Register & Sign In as {email}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-[#171717] dark:text-[#F7F4EE] uppercase tracking-wider mb-1.5">
              Institutional Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#68645E] dark:text-[#9E988F] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="candidate@mockvue.edu"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-[10px] border border-[#DED9D0] dark:border-[#332F2A] bg-[#F7F4EE] dark:bg-[#24201C] text-[#171717] dark:text-[#F7F4EE] text-sm focus:outline-none focus:border-[#7A263A] focus:ring-1 focus:ring-[#7A263A]/20 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-[#171717] dark:text-[#F7F4EE] uppercase tracking-wider mb-1.5">
              Access Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#68645E] dark:text-[#9E988F] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-[10px] border border-[#DED9D0] dark:border-[#332F2A] bg-[#F7F4EE] dark:bg-[#24201C] text-[#171717] dark:text-[#F7F4EE] text-sm focus:outline-none focus:border-[#7A263A] focus:ring-1 focus:ring-[#7A263A]/20"
              />
            </div>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full mt-2 font-medium" size="md">
            Sign In to Session
          </Button>
        </form>

        <p className="text-center text-xs text-[#68645E] dark:text-[#9E988F] mt-6 font-mono">
          First time?{' '}
          <Link to="/register" className="text-[#7A263A] dark:text-[#D4AA6A] font-semibold hover:underline">
            Register Candidate Account
          </Link>
        </p>
      </Card>
    </div>
  );
};

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState('Software Development Engineer');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register: authRegister, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect directly to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authRegister({ name, email, password, targetRole });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-14">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex w-10 h-10 rounded-[8px] bg-[#7A263A] text-white items-center justify-center mb-3 shadow-sm border border-[#C59A5B]/40">
            <span className="font-serif font-bold text-lg">M</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#171717] dark:text-[#F7F4EE]">
            Create Candidate Dossier
          </h2>
          <p className="text-xs text-[#68645E] dark:text-[#9E988F] mt-1 font-mono uppercase tracking-wider">
            TECHNICAL PLACEMENT TRACK ENROLLMENT
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-[10px] bg-[#FAF0F0] dark:bg-[#A33B3B]/15 border border-[#E8C4C4] dark:border-[#A33B3B]/40 text-xs text-[#A33B3B] dark:text-[#E59797] flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-[#171717] dark:text-[#F7F4EE] uppercase tracking-wider mb-1.5">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#68645E] dark:text-[#9E988F] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-[10px] border border-[#DED9D0] dark:border-[#332F2A] bg-[#F7F4EE] dark:bg-[#24201C] text-[#171717] dark:text-[#F7F4EE] text-sm focus:outline-none focus:border-[#7A263A] focus:ring-1 focus:ring-[#7A263A]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-[#171717] dark:text-[#F7F4EE] uppercase tracking-wider mb-1.5">
              Institutional Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#68645E] dark:text-[#9E988F] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-[10px] border border-[#DED9D0] dark:border-[#332F2A] bg-[#F7F4EE] dark:bg-[#24201C] text-[#171717] dark:text-[#F7F4EE] text-sm focus:outline-none focus:border-[#7A263A] focus:ring-1 focus:ring-[#7A263A]/20 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-[#171717] dark:text-[#F7F4EE] uppercase tracking-wider mb-1.5">
              Access Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#68645E] dark:text-[#9E988F] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-[10px] border border-[#DED9D0] dark:border-[#332F2A] bg-[#F7F4EE] dark:bg-[#24201C] text-[#171717] dark:text-[#F7F4EE] text-sm focus:outline-none focus:border-[#7A263A] focus:ring-1 focus:ring-[#7A263A]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-[#171717] dark:text-[#F7F4EE] uppercase tracking-wider mb-1.5">
              Target Placement Track
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#DED9D0] dark:border-[#332F2A] bg-[#F7F4EE] dark:bg-[#24201C] text-[#171717] dark:text-[#F7F4EE] text-sm focus:outline-none focus:border-[#7A263A] focus:ring-1 focus:ring-[#7A263A]/20"
            >
              <option value="Software Development Engineer">Software Development Engineer (SDE)</option>
              <option value="Frontend Developer">Frontend Developer (React/Web)</option>
              <option value="Backend Developer">Backend Developer (Node/Java/Python)</option>
              <option value="Full Stack Developer">Full Stack Developer (MERN/FullStack)</option>
              <option value="Data Analyst">Data Analyst (SQL/Python/Analytics)</option>
            </select>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full mt-2 font-medium" size="md" icon={ArrowRight}>
            Initialize Dossier
          </Button>
        </form>

        <p className="text-center text-xs text-[#68645E] dark:text-[#9E988F] mt-6 font-mono">
          Already registered?{' '}
          <Link to="/login" className="text-[#7A263A] dark:text-[#D4AA6A] font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  );
};
