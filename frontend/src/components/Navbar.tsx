import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Zap, User, LogOut, Sun, Moon, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useMouseParallax } from '../hooks/useMouseParallax';
import GlassButton from './GlassButton';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const parallax = useMouseParallax(0.01);

  const isHR = user?.role === 'hr/company';

  const studentLinks = [
    { to: '/roadmaps', label: 'Roadmaps' },
    { to: '/skill-graph', label: 'Skill Graph' },
    { to: '/competitions', label: 'Competitions' },
    { to: '/mock-test', label: 'Mock Tests' },
    { to: '/skill-gap', label: 'Skill Gap' },
    { to: '/interview', label: 'Interview' },
    { to: '/globe', label: 'Explore' },
  ];

  const hrLinks = [
    { to: '/company', label: 'Company' },
    { to: '/job-postings', label: 'Job Postings' },
    { to: '/talent-pool', label: 'Talent Pool' },
    { to: '/ai-hr', label: 'AI HR' },
    { to: '/hr-analytics', label: 'Analytics' },
    { to: '/globe', label: 'Explore' },
  ];

  const navLinks = isHR ? hrLinks : studentLinks;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-shadow"
              style={{ transform: `translate(${parallax.x * 0.5}px, ${parallax.y * 0.5}px)` }}
            >
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">SkillSwitch</span>
            {isHR && (
              <span className="ml-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                HR
              </span>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {user ? (
              <>
                <Link
                  to={isHR ? '/company' : '/dashboard'}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                >
                  {isHR ? <Briefcase className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  {user.firstName}
                </Link>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <GlassButton variant="ghost" size="sm">Log in</GlassButton>
                </Link>
                <Link to="/register">
                  <GlassButton variant="primary" size="sm">Sign up</GlassButton>
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-white/60 hover:text-white">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden glass border-t border-white/5 animate-slide-down">
          <div className="px-4 py-3 space-y-1">
            {isHR && (
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-400/60">
                HR Dashboard
              </div>
            )}
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-all"
              >
                {link.label}
              </Link>
            ))}
            {!isHR && (
              <>
                <div className="px-3 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-widest text-white/20">
                  Student
                </div>
              </>
            )}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <button
                onClick={toggleTheme}
                className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              {user ? (
                <button
                  onClick={() => { logout(); navigate('/'); setOpen(false); }}
                  className="text-sm text-red-400 hover:bg-white/5 rounded-lg transition-all px-3 py-2"
                >
                  Log out
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" onClick={() => setOpen(false)} className="flex-1">
                    <GlassButton variant="glass" size="sm" className="w-full">Log in</GlassButton>
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="flex-1">
                    <GlassButton variant="primary" size="sm" className="w-full">Sign up</GlassButton>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
