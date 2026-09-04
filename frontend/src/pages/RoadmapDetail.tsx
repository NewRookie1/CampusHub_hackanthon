import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Play, BookOpen, Sparkles, CheckCircle2, Clock, FileText } from 'lucide-react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useTilt } from '../hooks/useTilt';
import { useRipple } from '../hooks/useRipple';
import { MOCK_ROADMAPS, RoadmapConcept, RoadmapResource } from '../data/mockData';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassBadge from '../components/GlassBadge';

const statusColors = {
  'completed': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  'in-progress': { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30', dot: 'bg-indigo-400' },
  'not-started': { bg: 'bg-white/5', text: 'text-white/40', border: 'border-white/10', dot: 'bg-white/20' },
};

const difficultyColors = {
  beginner: 'text-emerald-400 bg-emerald-500/10',
  intermediate: 'text-amber-400 bg-amber-500/10',
  advanced: 'text-red-400 bg-red-500/10',
};

function ResourceIcon({ type }: { type: RoadmapResource['type'] }) {
  if (type === 'video') return <Play className="w-3.5 h-3.5 text-red-400" />;
  if (type === 'practice') return <Sparkles className="w-3.5 h-3.5 text-emerald-400" />;
  return <BookOpen className="w-3.5 h-3.5 text-indigo-400" />;
}

function ConceptNode({
  concept,
  index,
  total,
  isSelected,
  onClick,
  onStatusToggle,
}: {
  concept: RoadmapConcept;
  index: number;
  total: number;
  isSelected: boolean;
  onClick: () => void;
  onStatusToggle: () => void;
}) {
  const colors = statusColors[concept.status];
  const { ref: scrollRef, isVisible } = useScrollReveal();
  const { ref: tiltRef, style: tiltStyle, handleMouseMove, handleMouseLeave } = useTilt(8);
  const { containerRef, createRipple } = useRipple();

  return (
    <div
      ref={scrollRef}
      className={`relative ${isVisible ? 'scroll-visible' : 'scroll-hidden'}`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      {index < total - 1 && (
        <div className="absolute left-5 top-12 w-0.5 h-12 bg-gradient-to-b from-white/10 to-transparent" />
      )}
      <div
        ref={(el) => {
          (tiltRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        style={tiltStyle}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        className={`relative flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
          isSelected
            ? 'glass-card ring-2 ring-indigo-500/50'
            : 'hover:bg-white/5'
        }`}
      >
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center`}>
          <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white text-sm">{concept.title}</h3>
            <span className={`px-1.5 py-0.5 text-[10px] rounded ${difficultyColors[concept.difficulty]}`}>
              {concept.difficulty}
            </span>
            <GlassBadge size="sm" variant={concept.status === 'completed' ? 'emerald' : concept.status === 'in-progress' ? 'indigo' : 'slate'}>
              {concept.status.replace('-', ' ')}
            </GlassBadge>
          </div>
          <p className="text-xs text-white/40 line-clamp-2">{concept.description}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-white/30">{concept.estimatedHours}h</span>
            <div className="flex gap-1">
              {concept.skills.slice(0, 3).map((s) => (
                <span key={s} className="px-1.5 py-0.5 text-[9px] rounded bg-white/5 text-white/30">{s}</span>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            createRipple(e);
            onStatusToggle();
          }}
          className={`flex-shrink-0 px-2 py-1 text-[10px] rounded-lg ${colors.bg} ${colors.text} border ${colors.border} transition-all hover:scale-105`}
        >
          {concept.status === 'completed' ? 'Done' : concept.status === 'in-progress' ? 'Active' : 'Start'}
        </button>
      </div>
    </div>
  );
}

function ConceptDetail({ concept, onClose }: { concept: RoadmapConcept; onClose: () => void }) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`glass-card p-6 ${isVisible ? 'scroll-visible' : 'scroll-hidden'}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white">{concept.title}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-0.5 text-xs rounded ${difficultyColors[concept.difficulty]}`}>
              {concept.difficulty}
            </span>
            <GlassBadge size="sm" variant={concept.status === 'completed' ? 'emerald' : concept.status === 'in-progress' ? 'indigo' : 'slate'}>
              {concept.status.replace('-', ' ')}
            </GlassBadge>
          </div>
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-white/60 text-sm">Close</button>
      </div>

      <p className="text-sm text-white/60 leading-relaxed mb-4">{concept.description}</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-white/5">
          <div className="text-xs text-white/40">Estimated Time</div>
          <div className="text-sm font-semibold text-white">{concept.estimatedHours} hours</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5">
          <div className="text-xs text-white/40">Prerequisites</div>
          <div className="text-sm font-semibold text-white">{concept.prerequisites.length || 'None'}</div>
        </div>
      </div>

      {/* Subtopics */}
      {concept.subtopics.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-white/60 mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Key Competencies
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {concept.subtopics.map((topic, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{topic}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-white/60 mb-2">Skills You'll Learn</h4>
        <div className="flex flex-wrap gap-1">
          {concept.skills.map((s) => (
            <span key={s} className="px-2 py-0.5 text-xs rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Resources with type icons */}
      {concept.resources.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-white/60 mb-2">Learning Resources</h4>
          <div className="space-y-1.5">
            {concept.resources.map((res, i) => (
              <a
                key={i}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
              >
                <ResourceIcon type={res.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{res.title}</p>
                  <p className="text-xs text-white/40 capitalize">{res.type}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* YouTube Link */}
      {concept.youtubeUrl && (
        <div>
          <h4 className="text-xs font-semibold text-white/60 mb-2">Video Tutorial</h4>
          <a
            href={concept.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <Play className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{concept.youtubeTitle || 'Watch Tutorial'}</p>
              <p className="text-xs text-white/40">YouTube</p>
            </div>
            <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors flex-shrink-0" />
          </a>
        </div>
      )}
    </motion.div>
  );
}

export default function RoadmapDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollReveal();
  const [selectedConcept, setSelectedConcept] = useState<RoadmapConcept | null>(null);
  const [conceptStates, setConceptStates] = useState<Record<string, RoadmapConcept['status']>>(() => {
    const saved = localStorage.getItem(`skillswitch_roadmap_${id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return Object.fromEntries(parsed.map((c: any) => [c.id, c.status]));
        }
        return parsed;
      } catch {}
    }
    return {};
  });

  const roadmap = MOCK_ROADMAPS.find((r) => r.id === id);

  const concepts = useMemo(() => {
    if (!roadmap) return [];
    return roadmap.concepts.map((c) => ({
      ...c,
      status: conceptStates[c.id] || c.status,
    }));
  }, [roadmap, conceptStates]);

  const completedCount = concepts.filter((c) => c.status === 'completed').length;
  const inProgressCount = concepts.filter((c) => c.status === 'in-progress').length;
  const progress = concepts.length > 0 ? (completedCount / concepts.length) * 100 : 0;

  const toggleStatus = (conceptId: string) => {
    setConceptStates((prev) => {
      const current = (prev[conceptId] || 'not-started') as 'not-started' | 'in-progress' | 'completed';
      const next: 'not-started' | 'in-progress' | 'completed' = current === 'not-started' ? 'in-progress' : current === 'in-progress' ? 'completed' : 'not-started';
      const updated: Record<string, 'not-started' | 'in-progress' | 'completed'> = { ...prev, [conceptId]: next };
      localStorage.setItem(`skillswitch_roadmap_${id}`, JSON.stringify(updated));
      return updated;
    });
  };

  if (!roadmap) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-12 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Roadmap not found</h1>
        <Link to="/roadmaps">
          <GlassButton variant="primary">Back to Roadmaps</GlassButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
      <div ref={ref} className={`${isVisible ? 'scroll-visible' : 'scroll-hidden'}`}>
        <Link to="/roadmaps" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Roadmaps
        </Link>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              <span className="text-gradient">{roadmap.title}</span> Roadmap
            </h1>
            <p className="text-white/40">{roadmap.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gradient">{Math.round(progress)}%</div>
              <div className="text-xs text-white/40">Complete</div>
            </div>
            <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <div className="text-lg font-bold text-emerald-400">{completedCount}</div>
            <div className="text-xs text-white/40">Completed</div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
            <div className="text-lg font-bold text-indigo-400">{inProgressCount}</div>
            <div className="text-xs text-white/40">In Progress</div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
            <div className="text-lg font-bold text-white/60">{concepts.length - completedCount - inProgressCount}</div>
            <div className="text-xs text-white/40">Remaining</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-2">
            {concepts.map((concept, i) => (
              <ConceptNode
                key={concept.id}
                concept={concept}
                index={i}
                total={concepts.length}
                isSelected={selectedConcept?.id === concept.id}
                onClick={() => setSelectedConcept(concept)}
                onStatusToggle={() => toggleStatus(concept.id)}
              />
            ))}
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <AnimatePresence mode="wait">
                {selectedConcept ? (
                  <ConceptDetail
                    key={selectedConcept.id}
                    concept={{ ...selectedConcept, status: conceptStates[selectedConcept.id] || selectedConcept.status }}
                    onClose={() => setSelectedConcept(null)}
                  />
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card p-6 text-center"
                  >
                    <p className="text-sm text-white/40">Select a concept to view details and learning resources</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
