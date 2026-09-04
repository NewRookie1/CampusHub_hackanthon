import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Target, BarChart3, BookOpen, Trophy, ArrowRight, Briefcase, TrendingUp, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useScrollReveal } from '../hooks/useScrollReveal';
import GlassCard from '../components/GlassCard';
import ProgressRing from '../components/ProgressRing';
import { MOCK_DASHBOARD_STATS } from '../data/mockData';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [demoStats] = useState(MOCK_DASHBOARD_STATS);
  const { ref, isVisible } = useScrollReveal();

  useEffect(() => {
    if (token && !token.startsWith('demo-token')) {
      api.get('/api/mock-test/stats', token).then((r) => {
        if (r.success) setStats(r.data);
      }).catch(() => {});
    }
  }, [token]);

  const quickActions = [
    { icon: Upload, label: 'Upload Resume', desc: 'Analyze your skills', to: '/skill-gap', color: 'from-blue-500 to-cyan-500' },
    { icon: Target, label: 'Skill Gap Analysis', desc: 'Find what to learn', to: '/skill-gap', color: 'from-purple-500 to-pink-500' },
    { icon: BookOpen, label: 'Learning Plan', desc: 'AI study schedule', to: '/roadmaps', color: 'from-green-500 to-emerald-500' },
    { icon: Trophy, label: 'Mock Test', desc: 'Practice & improve', to: '/mock-test', color: 'from-yellow-500 to-amber-500' },
  ];

  const readinessScore = demoStats.careerReadinessScore;

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
      <div ref={ref} className={`${isVisible ? 'scroll-visible' : 'scroll-hidden'}`}>
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={item} className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Welcome back, <span className="text-gradient">{user?.firstName || 'User'}</span>
                </h1>
                <p className="text-white/40">Here's your skill development overview</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400">AI Career Co-Pilot Active</span>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <motion.div variants={item} className="lg:col-span-1">
              <GlassCard>
                <div className="p-6 flex flex-col items-center">
                  <ProgressRing value={readinessScore} size={140} strokeWidth={10} label="Readiness" />
                  <h3 className="text-sm font-semibold text-white mt-4">Career Readiness Score</h3>
                  <p className="text-xs text-white/40 mt-1">Keep building skills to improve</p>
                  <div className="w-full mt-4 space-y-2">
                    {Object.entries(demoStats.skillsBreakdown).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/50 capitalize">{key.replace('portfolio', 'Portfolio Projects')}</span>
                          <span className="text-white/70">{value}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${value}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div variants={item} className="lg:col-span-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Skills Tracked', value: demoStats.skillsTracked, icon: Target, color: 'text-blue-400' },
                  { label: 'Applications', value: demoStats.applications, icon: Briefcase, color: 'text-purple-400' },
                  { label: 'Roadmap Progress', value: `${demoStats.roadmapProgress}%`, icon: TrendingUp, color: 'text-emerald-400' },
                  { label: 'Tests Done', value: demoStats.mockTestsCompleted, icon: Trophy, color: 'text-amber-400' },
                ].map((stat) => (
                  <GlassCard key={stat.label}>
                    <div className="p-4">
                      <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-white/40 mt-1">{stat.label}</div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div variants={item}>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary-400" />
              Quick Actions
            </h2>
          </motion.div>

          <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {quickActions.map((action, i) => (
              <motion.div key={action.label} variants={item}>
                <Link to={action.to}>
                  <GlassCard>
                    <div className="p-5 group cursor-pointer">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-white mb-1">{action.label}</h3>
                      <p className="text-xs text-white/40">{action.desc}</p>
                      <ArrowRight className="w-4 h-4 text-white/20 mt-2 group-hover:text-white/60 transition-colors" />
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={item}>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              AI Recommendations
            </h2>
          </motion.div>

          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {demoStats.recommendations.map((rec, i) => (
              <motion.div key={i} variants={item}>
                <GlassCard>
                  <div className="p-4 flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      rec.priority === 'high' ? 'bg-red-500/10' : rec.priority === 'medium' ? 'bg-amber-500/10' : 'bg-emerald-500/10'
                    }`}>
                      <Target className={`w-4 h-4 ${
                        rec.priority === 'high' ? 'text-red-400' : rec.priority === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm text-white">{rec.title}</p>
                      <span className={`text-[10px] mt-1 inline-block px-1.5 py-0.5 rounded ${
                        rec.priority === 'high' ? 'bg-red-500/10 text-red-400' : rec.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {rec.priority} priority
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>

          {stats && (
            <motion.div variants={item}>
              <GlassCard>
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary-400" />
                    Your Stats
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-xl bg-white/5">
                      <div className="text-2xl font-bold text-gradient">{stats.totalTests || 0}</div>
                      <div className="text-xs text-white/40 mt-1">Tests Taken</div>
                    </div>
                    {Object.entries(stats.byExamType || {}).slice(0, 3).map(([type, data]: [string, any]) => (
                      <div key={type} className="text-center p-4 rounded-xl bg-white/5">
                        <div className="text-2xl font-bold text-gradient">{Math.round(data.avgPercentage || 0)}%</div>
                        <div className="text-xs text-white/40 mt-1">{type} Avg</div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          <motion.div variants={item}>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-400" />
              Recent Activity
            </h2>
          </motion.div>

          <motion.div variants={item} className="space-y-2">
            {demoStats.recentActivity.map((act, i) => (
              <GlassCard key={i}>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      act.type === 'roadmap' ? 'bg-emerald-500/10' : act.type === 'test' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                    }`}>
                      {act.type === 'roadmap' ? <BookOpen className="w-4 h-4 text-emerald-400" /> :
                       act.type === 'test' ? <Trophy className="w-4 h-4 text-amber-400" /> :
                       <Target className="w-4 h-4 text-blue-400" />}
                    </div>
                    <span className="text-sm text-white/70">{act.title}</span>
                  </div>
                  <span className="text-xs text-white/30">{act.time}</span>
                </div>
              </GlassCard>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
