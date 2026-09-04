import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map, CheckCircle2, Clock, Circle, ChevronDown, ChevronUp,
  BookOpen, ExternalLink, GraduationCap, Sparkles, Play,
  FileText, Youtube,
} from 'lucide-react';
import { MOCK_ROADMAPS, RoadmapConcept, RoadmapTrack, RoadmapResource } from '../data/mockData';
import GlassCard from '../components/GlassCard';
import GlassBadge from '../components/GlassBadge';
import GlassButton from '../components/GlassButton';
import { useToast } from '../context/ToastContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useTilt } from '../hooks/useTilt';
import { useRipple } from '../hooks/useRipple';

function ResourceIcon({ type }: { type: RoadmapResource['type'] }) {
  if (type === 'video') return <Play className="w-3.5 h-3.5 text-red-400" />;
  if (type === 'practice') return <Sparkles className="w-3.5 h-3.5 text-emerald-400" />;
  return <BookOpen className="w-3.5 h-3.5 text-indigo-400" />;
}

function MilestoneCard({
  concept,
  isExpanded,
  onToggleExpand,
  onStatusChange,
  delay,
}: {
  concept: RoadmapConcept;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onStatusChange: (status: 'not-started' | 'in-progress' | 'completed') => void;
  delay: number;
}) {
  const { ref, isVisible } = useScrollReveal();
  const { ref: tiltRef, style: tiltStyle, handleMouseMove, handleMouseLeave } = useTilt(8);
  const { containerRef, createRipple } = useRipple();

  const isCompleted = concept.status === 'completed';
  const isInProgress = concept.status === 'in-progress';

  return (
    <div
      ref={ref}
      className={`${isVisible ? 'scroll-visible' : 'scroll-hidden'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        ref={(el) => {
          (tiltRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        style={tiltStyle}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`glass-card rounded-3xl p-5 border transition-all duration-300 ${
          isInProgress ? 'border-indigo-500/50 shadow-md shadow-indigo-500/10' : ''
        } ${isCompleted ? 'border-emerald-500/30' : 'border-white/5'}`}
      >
        <div className="flex items-start gap-4">
          {/* Status Icon */}
          <div className="shrink-0 hidden sm:flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : isInProgress
                  ? 'bg-indigo-500/20 text-indigo-400 animate-pulse'
                  : 'bg-white/5 text-slate-500'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : isInProgress ? (
                <Clock className="w-5 h-5" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div
              className="flex items-start justify-between gap-3 cursor-pointer"
              onClick={onToggleExpand}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-white">{concept.title}</h3>
                  <GlassBadge size="sm" variant={isCompleted ? 'emerald' : isInProgress ? 'indigo' : 'slate'}>
                    {concept.status.replace('-', ' ')}
                  </GlassBadge>
                  <GlassBadge
                    size="sm"
                    variant={
                      concept.difficulty === 'beginner' ? 'emerald' :
                      concept.difficulty === 'intermediate' ? 'amber' : 'rose'
                    }
                  >
                    {concept.difficulty}
                  </GlassBadge>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{concept.description}</p>
                <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ~{concept.estimatedHours}h</span>
                  <span>{concept.skills.length} skills</span>
                  {concept.prerequisites.length > 0 && <span>Prereqs: {concept.prerequisites.length}</span>}
                </div>
              </div>

              {/* Status Switcher + Expand */}
              <div className="flex items-center gap-2 shrink-0">
                <div
                  ref={containerRef}
                  className="hidden sm:flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  {(['not-started', 'in-progress', 'completed'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={(e) => {
                        e.stopPropagation();
                        createRipple(e);
                        onStatusChange(s);
                      }}
                      className={`px-2 py-1 rounded-lg transition-all ${
                        concept.status === s
                          ? s === 'completed' ? 'bg-emerald-600 text-white font-bold' :
                            s === 'in-progress' ? 'bg-indigo-600 text-white font-bold' :
                            'bg-white/10 text-white font-bold'
                          : 'text-slate-500 hover:text-white'
                      }`}
                    >
                      {s === 'not-started' ? 'Todo' : s === 'in-progress' ? 'Active' : 'Done'}
                    </button>
                  ))}
                </div>
                <button
                  onClick={onToggleExpand}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t border-white/5 mt-4 space-y-4">
                    {/* Subtopics */}
                    {concept.subtopics.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-indigo-400" /> Key Competencies
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {concept.subtopics.map((topic, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-white/5 text-xs text-slate-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span>{topic}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resources with type-based icons */}
                    {concept.resources.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                          Curated Resources
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {concept.resources.map((res, i) => (
                            <a
                              key={i}
                              href={res.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300 hover:border-indigo-400 transition-colors"
                            >
                              <ResourceIcon type={res.type} />
                              <span>{res.title}</span>
                              <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* YouTube Link */}
                    {concept.youtubeUrl && (
                      <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> ~{concept.estimatedHours} hours estimated
                        </span>
                        <a
                          href={concept.youtubeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                        >
                          <Youtube className="w-3.5 h-3.5" /> {concept.youtubeTitle || 'Watch Tutorial'}
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Roadmaps() {
  const { showToast } = useToast();
  const [selectedTrackId, setSelectedTrackId] = useState<string>('frontend');
  const [concepts, setConcepts] = useState<RoadmapConcept[]>(MOCK_ROADMAPS[0].concepts);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
  const { ref: progressRef, isVisible: progressVisible } = useScrollReveal();

  const currentTrack: RoadmapTrack | undefined = MOCK_ROADMAPS.find((t) => t.id === selectedTrackId);
  const track = currentTrack || MOCK_ROADMAPS[0];

  useEffect(() => {
    const saved = localStorage.getItem(`skillswitch_roadmap_${selectedTrackId}`);
    if (saved) {
      try {
        setConcepts(JSON.parse(saved));
        return;
      } catch (e) { console.error(e); }
    }
    setConcepts(track.concepts);
  }, [selectedTrackId, track]);

  const handleStatusChange = (id: string, newStatus: 'not-started' | 'in-progress' | 'completed') => {
    const updated = concepts.map((c) => (c.id === id ? { ...c, status: newStatus } : c));
    setConcepts(updated);
    localStorage.setItem(`skillswitch_roadmap_${selectedTrackId}`, JSON.stringify(updated));
    const c = concepts.find((x) => x.id === id);
    showToast('Roadmap Updated', `${c?.title || 'Concept'} marked as ${newStatus.replace('-', ' ')}`, 'success');
  };

  const completedCount = concepts.filter((c) => c.status === 'completed').length;
  const inProgressCount = concepts.filter((c) => c.status === 'in-progress').length;
  const progressPct = Math.round((completedCount / concepts.length) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12 space-y-8">
      {/* Header */}
      <div
        ref={headerRef}
        className={`glass-card p-6 rounded-3xl border border-white/10 ${headerVisible ? 'scroll-visible' : 'scroll-hidden'}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-2">
              <Map className="w-3.5 h-3.5" /> Structured Career Roadmaps
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Step-by-Step Learning Paths
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Structured milestone roadmap with curated resources, exercises, and status tracking.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-300">Track:</label>
            <select
              value={selectedTrackId}
              onChange={(e) => setSelectedTrackId(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-white cursor-pointer"
            >
              {MOCK_ROADMAPS.map((t) => (
                <option key={t.id} value={t.id}>{t.title} ({t.concepts.length} stages)</option>
              ))}
            </select>
            <Link to="/skill-graph">
              <GlassButton variant="glass" size="sm">
                <Sparkles className="w-3.5 h-3.5 mr-1 inline" /> View as Graph
              </GlassButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div
        ref={progressRef}
        className={`glass-card p-6 rounded-3xl border border-indigo-500/25 ${progressVisible ? 'scroll-visible' : 'scroll-hidden'}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Roadmap</div>
            <h2 className="text-xl font-extrabold text-white mt-0.5">{track.title} Roadmap</h2>
            <p className="text-xs text-slate-500 mt-0.5">{track.description}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-xl font-extrabold text-indigo-400">{progressPct}%</div>
              <div className="text-[11px] text-slate-400">{completedCount} of {concepts.length} completed</div>
            </div>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>

        <div className="flex items-center gap-6 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> {completedCount} Completed</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> {inProgressCount} In Progress</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-700" /> {concepts.length - completedCount - inProgressCount} Not Started</span>
        </div>
      </div>

      {/* Sequential Milestones List */}
      <div className="space-y-4">
        {concepts.map((concept, index) => (
          <MilestoneCard
            key={concept.id}
            concept={concept}
            isExpanded={expandedId === concept.id}
            onToggleExpand={() => setExpandedId(expandedId === concept.id ? null : concept.id)}
            onStatusChange={(status) => handleStatusChange(concept.id, status)}
            delay={index * 60}
          />
        ))}
      </div>
    </div>
  );
}
