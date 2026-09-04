import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Users, Clock, CheckCircle2, TrendingUp, Target, Briefcase,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { mockHiringMetrics } from '../data/hrData';
import GlassCard from '../components/GlassCard';

const metrics = mockHiringMetrics;

function MetricCard({ icon: Icon, label, value, change, changeLabel, color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  color: string;
}) {
  const isPositive = (change ?? 0) >= 0;
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-white/40">{label}</div>
      {changeLabel && <div className="text-[10px] text-white/25 mt-1">{changeLabel}</div>}
    </div>
  );
}

function HorizontalBar({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-20 text-xs text-white/50 text-right truncate">{label}</div>
      <div className="flex-1 h-6 bg-white/5 rounded-lg overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-lg"
          style={{ background: color }}
        />
      </div>
      <div className="w-10 text-xs font-medium text-white/60">{count}</div>
    </div>
  );
}

function PipelineBar({ stage, count, total, color, index }: {
  stage: string; count: number; total: number; color: string; index: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center gap-4"
    >
      <div className="w-28 text-sm text-white/50">{stage}</div>
      <div className="flex-1 relative">
        <div className="h-8 bg-white/5 rounded-lg overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
            className="h-full rounded-lg flex items-center px-3"
            style={{ background: `${color}33` }}
          >
            <span className="text-xs font-semibold" style={{ color }}>{count} ({pct}%)</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function MiniBarChart({ data }: { data: { month: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count));
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
          <div className="text-[10px] text-white/40">{d.count}</div>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(d.count / max) * 100}%` }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="w-full rounded-t-lg bg-gradient-to-t from-indigo-500/60 to-purple-500/60"
          />
          <div className="text-[10px] text-white/40">{d.month}</div>
        </div>
      ))}
    </div>
  );
}

export default function HRAnalytics() {
  const [timeRange, setTimeRange] = useState('3m');
  const maxSkillCount = Math.max(...metrics.topSkillsRequested.map((s) => s.count));
  const maxSourceCount = Math.max(...metrics.sourceBreakdown.map((s) => s.count));

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Hiring <span className="text-gradient">Analytics</span>
            </h1>
            <p className="text-white/40">Track your recruitment pipeline and hiring metrics</p>
          </div>
          <div className="flex gap-2">
            {['1m', '3m', '6m', '1y'].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  timeRange === r
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-white/5 text-white/40 border border-white/5 hover:text-white/60'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard icon={Users} label="Total Applications" value={metrics.totalApplications} change={12} changeLabel="vs last quarter" color="bg-indigo-500/20" />
          <MetricCard icon={Briefcase} label="Active Positions" value={metrics.activePositions} change={-8} changeLabel="vs last quarter" color="bg-purple-500/20" />
          <MetricCard icon={Clock} label="Avg Days to Hire" value={metrics.avgTimeToHire} change={-15} changeLabel="improving" color="bg-amber-500/20" />
          <MetricCard icon={CheckCircle2} label="Offer Acceptance" value={`${metrics.offerAcceptance}%`} change={5} changeLabel="vs last quarter" color="bg-emerald-500/20" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <GlassCard>
            <div className="p-6">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" /> Hiring Pipeline
              </h3>
              <div className="space-y-3">
                {metrics.pipelineByStage.map((s, i) => (
                  <PipelineBar
                    key={s.stage}
                    stage={s.stage}
                    count={s.count}
                    total={metrics.pipelineByStage[0].count}
                    color={s.color}
                    index={i}
                  />
                ))}
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-6">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" /> Applications by Month
              </h3>
              <MiniBarChart data={metrics.applicationsByMonth} />
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <GlassCard>
            <div className="p-6">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" /> Most Requested Skills
              </h3>
              <div className="space-y-2.5">
                {metrics.topSkillsRequested.map((s) => (
                  <HorizontalBar key={s.skill} label={s.skill} count={s.count} max={maxSkillCount} color="#6366f1" />
                ))}
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-6">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" /> Application Sources
              </h3>
              <div className="space-y-2.5">
                {metrics.sourceBreakdown.map((s) => (
                  <HorizontalBar key={s.source} label={s.source} count={s.count} max={maxSourceCount} color="#8b5cf6" />
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-pink-400" /> Pipeline Conversion Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { from: 'Applied', to: 'Screened', rate: Math.round((89 / 168) * 100) },
                { from: 'Screened', to: 'Interviewed', rate: Math.round((42 / 89) * 100) },
                { from: 'Interviewed', to: 'Offered', rate: Math.round((12 / 42) * 100) },
                { from: 'Offered', to: 'Hired', rate: Math.round((8 / 12) * 100) },
              ].map((c) => (
                <div key={c.from} className="text-center p-4 rounded-xl bg-white/5">
                  <div className="text-2xl font-bold text-indigo-400 mb-1">{c.rate}%</div>
                  <div className="text-xs text-white/40">{c.from} &rarr; {c.to}</div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
