import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GitBranch, Sparkles, Layers, BookOpen, Briefcase, Target,
  ArrowRight, ZoomIn, ZoomOut, RotateCcw, CheckCircle2, HelpCircle,
} from 'lucide-react';
import { initialSkillGraphData, SkillGraphNode } from '../data/skillGraphData';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassBadge from '../components/GlassBadge';
import { useTilt } from '../hooks/useTilt';
import { useScrollReveal } from '../hooks/useScrollReveal';

function GraphNode({
  node,
  isSelected,
  isConnected,
  isHovered,
  canvasWidth,
  canvasHeight,
  onClick,
  onHover,
  onLeave,
}: {
  node: SkillGraphNode;
  isSelected: boolean;
  isConnected: boolean;
  isHovered: boolean;
  canvasWidth: number;
  canvasHeight: number;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  const { ref, style, handleMouseMove, handleMouseLeave } = useTilt(12);

  let cardStyle =
    'bg-white/85 text-slate-800 border-slate-200/80 shadow-sm';
  let iconEl = <Target className="w-3.5 h-3.5 text-cyan-500" />;

  if (node.type === 'role') {
    cardStyle =
      'bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white font-black shadow-lg shadow-indigo-500/30 border-white/20';
    iconEl = <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />;
  } else if (node.type === 'domain') {
    cardStyle =
      'bg-indigo-50/90 text-indigo-700 border-indigo-200 dark:border-indigo-800/80 font-bold';
    iconEl = <Layers className="w-3.5 h-3.5 text-indigo-500" />;
  } else if (node.type === 'skill') {
    cardStyle =
      'bg-cyan-50/70 text-cyan-900 border-cyan-200/70 dark:border-cyan-800/50 font-semibold';
    iconEl = <Target className="w-3.5 h-3.5 text-cyan-500" />;
  } else if (node.type === 'project') {
    cardStyle =
      'bg-emerald-50/80 text-emerald-800 border-emerald-200 dark:border-emerald-800/60 font-semibold';
    iconEl = <Briefcase className="w-3.5 h-3.5 text-emerald-500" />;
  } else if (node.type === 'resource') {
    cardStyle =
      'bg-purple-50/70 text-purple-900 border-purple-200/70 dark:border-purple-800/50 font-medium';
    iconEl = <BookOpen className="w-3.5 h-3.5 text-purple-500" />;
  }

  const dimmed = !isSelected && !isConnected && !isHovered;

  return (
    <div
      ref={ref}
      style={{
        left: `${(node.x / canvasWidth) * 100}%`,
        top: `${(node.y / canvasHeight) * 100}%`,
        transform: `translate(-50%, -50%) ${style.transform || ''}`,
        opacity: dimmed ? 0.35 : 1,
        transition: 'opacity 0.3s ease',
      }}
      className={`absolute z-20 px-3.5 py-2 rounded-2xl border text-xs cursor-pointer select-none backdrop-blur-md flex items-center gap-2 max-w-[210px] whitespace-nowrap ${cardStyle} ${
        isSelected
          ? 'ring-4 ring-indigo-500/40 scale-110 font-black shadow-xl z-30 border-indigo-500'
          : isConnected
          ? 'ring-2 ring-cyan-500/30 shadow-md'
          : ''
      }`}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={() => { onLeave(); handleMouseLeave(); }}
      onMouseMove={handleMouseMove}
    >
      <span className="shrink-0">{iconEl}</span>
      <span className="truncate">{node.label}</span>
    </div>
  );
}

export default function SkillGraph() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('sk-react');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
  const { ref: graphRef, isVisible: graphVisible } = useScrollReveal();

  const nodes = initialSkillGraphData.nodes;
  const edges = initialSkillGraphData.edges;
  const canvasWidth = initialSkillGraphData.canvasWidth;
  const canvasHeight = initialSkillGraphData.canvasHeight;

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[3];
  const getNode = useCallback((id: string) => nodes.find((n) => n.id === id), [nodes]);

  const activeConnectedNodeIds = new Set<string>([selectedNodeId]);
  edges.forEach((edge) => {
    if (edge.from === selectedNodeId) activeConnectedNodeIds.add(edge.to);
    if (edge.to === selectedNodeId) activeConnectedNodeIds.add(edge.from);
  });

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
              <GitBranch className="w-3.5 h-3.5" />
              Visual Career Graph
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Role &rarr; Skill &rarr; Project Ecosystem
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Explore the multi-tier dependency tree connecting industry targets, verified skills, proof-of-work projects, and learning resources.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <GlassBadge variant="indigo">Frontend Developer Track</GlassBadge>
            <Link to="/roadmaps">
              <GlassButton variant="glass" size="sm">
                <ArrowRight className="w-3.5 h-3.5 mr-1 inline" /> Open Roadmap
              </GlassButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Interactive Graph & Detail Layout */}
      <div
        ref={graphRef}
        className={`grid grid-cols-1 lg:grid-cols-12 gap-6 items-start ${graphVisible ? 'scroll-visible' : 'scroll-hidden'}`}
      >
        {/* Left: Visual Network Graph (8 cols) */}
        <div className="lg:col-span-8 glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
          {/* Top Canvas Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5 mb-4 z-10">
            <div className="flex items-center gap-3 text-xs flex-wrap">
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Target Role
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Skill Node
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Project Node
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Resource
              </span>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 self-end sm:self-auto">
              <button
                onClick={() => setZoomLevel((prev) => Math.max(0.75, prev - 0.1))}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1.5 text-slate-300">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((prev) => Math.min(1.3, prev + 0.1))}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors ml-0.5"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Graph Canvas */}
          <div className="w-full overflow-x-auto overflow-y-hidden rounded-2xl bg-slate-950/50 border border-white/5 p-2 sm:p-4">
            <div
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease-out',
                minWidth: '780px',
              }}
              className="relative w-full aspect-[1000/680]"
            >
              {/* SVG Canvas for Bezier Tree Edges */}
              <svg
                viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
                className="w-full h-full absolute inset-0 pointer-events-none"
              >
                <defs>
                  <linearGradient id="grad-active-edge" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.95" />
                    <stop offset="50%" stopColor="#818cf8" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.95" />
                  </linearGradient>
                  <linearGradient id="grad-passive-edge" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#64748b" stopOpacity="0.2" />
                  </linearGradient>
                  <filter id="glow-edge" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {edges.map((edge, idx) => {
                  const fromNode = getNode(edge.from);
                  const toNode = getNode(edge.to);
                  if (!fromNode || !toNode) return null;

                  const isEdgeActive =
                    selectedNodeId === edge.from ||
                    selectedNodeId === edge.to ||
                    hoveredNodeId === edge.from ||
                    hoveredNodeId === edge.to;

                  const deltaY = toNode.y - fromNode.y;
                  const cp1y = fromNode.y + deltaY * 0.45;
                  const cp2y = fromNode.y + deltaY * 0.55;
                  const pathD = `M ${fromNode.x} ${fromNode.y} C ${fromNode.x} ${cp1y}, ${toNode.x} ${cp2y}, ${toNode.x} ${toNode.y}`;

                  return (
                    <g key={idx}>
                      {isEdgeActive && (
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="6"
                          strokeOpacity="0.3"
                          filter="url(#glow-edge)"
                        />
                      )}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={isEdgeActive ? 'url(#grad-active-edge)' : 'url(#grad-passive-edge)'}
                        strokeWidth={isEdgeActive ? '3' : '1.5'}
                        strokeDasharray={isEdgeActive ? 'none' : '4 3'}
                        className="transition-all duration-300"
                      />
                      <circle
                        cx={toNode.x}
                        cy={toNode.y - 18}
                        r={isEdgeActive ? 3.5 : 2}
                        fill={isEdgeActive ? '#06b6d4' : '#94a3b8'}
                        fillOpacity={isEdgeActive ? 1 : 0.4}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Render Interactive Nodes */}
              {nodes.map((node) => (
                <GraphNode
                  key={node.id}
                  node={node}
                  isSelected={selectedNodeId === node.id}
                  isConnected={activeConnectedNodeIds.has(node.id)}
                  isHovered={hoveredNodeId === node.id}
                  canvasWidth={canvasWidth}
                  canvasHeight={canvasHeight}
                  onClick={() => setSelectedNodeId(node.id)}
                  onHover={() => setHoveredNodeId(node.id)}
                  onLeave={() => setHoveredNodeId(null)}
                />
              ))}
            </div>
          </div>

          <div className="pt-3 text-xs text-slate-400 text-center flex items-center justify-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Click any node in the tree to inspect details, learning resources, and associated proof projects.</span>
          </div>
        </div>

        {/* Right: Selected Node Inspection Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <NodeInspector node={selectedNode} />
        </div>
      </div>
    </div>
  );
}

function NodeInspector({ node }: { node: SkillGraphNode }) {
  const { ref, isVisible } = useScrollReveal();

  const badgeVariant =
    node.type === 'role' ? 'indigo' :
    node.type === 'domain' ? 'indigo' :
    node.type === 'skill' ? 'sky' :
    node.type === 'project' ? 'emerald' :
    'purple';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 20 }}
      animate={isVisible ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="glass-card rounded-3xl p-6 border-indigo-500/30"
    >
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-white/5 mb-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
            Node Inspector
          </span>
          <h3 className="text-lg font-bold text-white mt-0.5">{node.label}</h3>
        </div>
        <GlassBadge variant={badgeVariant as any}>
          {node.type.toUpperCase()}
        </GlassBadge>
      </div>

      {/* Description */}
      {node.description && (
        <p className="text-xs text-slate-300 leading-relaxed mb-4 bg-white/5 p-3 rounded-xl">
          {node.description}
        </p>
      )}

      {/* Proficiency Levels */}
      {node.currentLevel && (
        <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4 text-xs">
          <div>
            <div className="text-slate-400 text-[11px]">Your Verified Level</div>
            <div className="font-extrabold text-indigo-400 mt-0.5">{node.currentLevel}</div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Target Expectation</div>
            <div className="font-extrabold text-emerald-400 mt-0.5">{node.targetLevel}</div>
          </div>
        </div>
      )}

      {/* Learning Resources */}
      {node.resources && node.resources.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Curated Learning Resources
          </div>
          <div className="space-y-1.5">
            {node.resources.map((res, i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs font-medium text-slate-200 flex items-center justify-between hover:border-indigo-400 transition-colors"
              >
                <span className="truncate">{res}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proof Projects */}
      {node.projects && node.projects.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            <Layers className="w-3.5 h-3.5 text-emerald-500" /> Recommended Proof Projects
          </div>
          <div className="space-y-1.5">
            {node.projects.map((proj, i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-slate-200"
              >
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> {proj}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Opportunities */}
      {node.opportunities && node.opportunities.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            <Briefcase className="w-3.5 h-3.5 text-cyan-500" /> Linked Target Opportunities
          </div>
          <div className="space-y-1.5">
            {node.opportunities.map((opp, i) => (
              <div
                key={i}
                className="p-2 rounded-xl bg-white/5 text-xs font-medium text-indigo-400 hover:underline flex items-center justify-between"
              >
                <span>{opp}</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="pt-4 border-t border-white/5 mt-5">
        <Link to="/roadmaps">
          <GlassButton variant="primary" size="sm" className="w-full">
            <Sparkles className="w-3.5 h-3.5 mr-1 inline" /> Add to Roadmap
          </GlassButton>
        </Link>
      </div>
    </motion.div>
  );
}
