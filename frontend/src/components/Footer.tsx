import { Link } from 'react-router-dom';
import { Zap, Github, Twitter } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Footer() {
  const { isDark } = useTheme();

  return (
    <footer className={`relative z-10 glass border-t ${isDark ? 'border-white/5' : 'border-black/5'} mt-20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gradient">SkillSwitch</span>
            </Link>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
              AI-powered skill matching platform for the next generation of developers.
            </p>
          </div>

          <div>
            <h4 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white/80' : 'text-slate-700'}`}>Platform</h4>
            <div className="space-y-2">
              {[
                { label: 'Roadmaps', to: '/roadmaps' },
                { label: 'Competitions', to: '/competitions' },
                { label: 'Mock Tests', to: '/mock-test' },
                { label: 'Skill Gap', to: '/skill-gap' },
                { label: 'Explore Globe', to: '/globe' },
              ].map((item) => (
                <Link key={item.label} to={item.to} className={`block text-sm transition-colors ${isDark ? 'text-white/40 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white/80' : 'text-slate-700'}`}>Resources</h4>
            <div className="space-y-2">
              {['Documentation', 'API Reference', 'Blog', 'Community'].map((item) => (
                <span key={item} className={`block text-sm transition-colors cursor-pointer ${isDark ? 'text-white/40 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white/80' : 'text-slate-700'}`}>Connect</h4>
            <div className="flex gap-3">
              <a href="#" className={`w-9 h-9 rounded-lg glass flex items-center justify-center transition-all ${isDark ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-black/5'}`}>
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className={`w-9 h-9 rounded-lg glass flex items-center justify-center transition-all ${isDark ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-black/5'}`}>
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className={`mt-10 pt-6 border-t text-center text-xs ${isDark ? 'border-white/5 text-white/30' : 'border-black/5 text-slate-400'}`}>
          &copy; 2026 SkillSwitch. Built for the future of work.
        </div>
      </div>
    </footer>
  );
}
