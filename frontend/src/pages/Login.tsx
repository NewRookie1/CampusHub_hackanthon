import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Zap, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import GlassButton from '../components/GlassButton';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginDemo } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollReveal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      showToast('Welcome back!', 'You have successfully signed in.', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: 'student' | 'hr') => {
    loginDemo(role);
    showToast('Demo Mode', `Logged in as demo ${role}`, 'success');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div
        ref={ref}
        className={`w-full max-w-md ${isVisible ? 'scroll-visible' : 'scroll-hidden'}`}
      >
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-sm text-white/40">Sign in to continue your journey</p>
          </div>

          <div className="mb-6 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
            <p className="text-xs text-primary-300 font-medium mb-3">Quick Demo Access</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDemoLogin('student')}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white/70 hover:text-white transition-all"
              >
                <User className="w-4 h-4 text-primary-400" />
                Student Demo
              </button>
              <button
                onClick={() => handleDemoLogin('hr')}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white/70 hover:text-white transition-all"
              >
                <Zap className="w-4 h-4 text-purple-400" />
                HR Demo
              </button>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-slate-200 dark:bg-[#0a0a0f] text-white/30">or sign in with email</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-scale-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all text-sm"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <GlassButton type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </GlassButton>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
