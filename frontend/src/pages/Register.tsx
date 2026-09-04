import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import GlassButton from '../components/GlassButton';

export default function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollReveal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div ref={ref} className={`w-full max-w-md ${isVisible ? 'scroll-visible' : 'scroll-hidden'}`}>
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Create account</h1>
            <p className="text-sm text-white/40">Start your skill transformation today</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-scale-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    value={form.firstName}
                    onChange={update('firstName')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all text-sm"
                    placeholder="John"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Last Name</label>
                <input
                  value={form.lastName}
                  onChange={update('lastName')}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all text-sm"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={form.email}
                  onChange={update('email')}
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
                  value={form.password}
                  onChange={update('password')}
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all text-sm"
                  placeholder="Min 8 characters"
                  minLength={8}
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
              {loading ? 'Creating account...' : 'Create Account'}
            </GlassButton>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
