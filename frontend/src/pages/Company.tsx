import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, PlusCircle, Users, Search, CheckCircle2, Clock,
  Sparkles, Calendar, Briefcase, Filter,
} from 'lucide-react';
import { mockCandidates, CandidateApplication } from '../data/candidates';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassBadge from '../components/GlassBadge';
import GlassModal from '../components/GlassModal';
import { useToast } from '../context/ToastContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useTilt } from '../hooks/useTilt';
import { useRipple } from '../hooks/useRipple';

function MetricCard({ label, value, sub, color, delay }: {
  label: string; value: string; sub: string; color: string; delay: number;
}) {
  const { ref, isVisible } = useScrollReveal();
  const { ref: tiltRef, style, handleMouseMove, handleMouseLeave } = useTilt(6);

  return (
    <div
      ref={(el) => {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        (tiltRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`glass-card p-4 rounded-2xl border border-white/5 ${isVisible ? 'scroll-visible' : 'scroll-hidden'}`}
      // @ts-ignore
      style={{ ...style, transitionDelay: `${delay}ms` }}
    >
      <div className="text-xs font-semibold text-slate-400">{label}</div>
      <div className={`text-2xl font-black ${color} mt-1`}>{value}</div>
      <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>
    </div>
  );
}

function CandidateRow({ cand, onClick, delay }: {
  cand: CandidateApplication; onClick: () => void; delay: number;
}) {
  const { ref, isVisible } = useScrollReveal();
  const { ref: tiltRef, style, handleMouseMove, handleMouseLeave } = useTilt(4);

  return (
    <tr
      ref={(el) => {
        (ref as React.MutableRefObject<HTMLTableRowElement | null>).current = el;
        (tiltRef as React.MutableRefObject<HTMLTableRowElement | null>).current = el;
      }}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`hover:bg-indigo-500/10 transition-colors group cursor-pointer ${isVisible ? 'scroll-visible' : 'scroll-hidden'}`}
      // @ts-ignore
      onClick={onClick}
    >
      <td className="py-3.5 pl-2">
        <div className="flex items-center gap-3">
          <img src={cand.avatar} alt={cand.name} className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-700 shrink-0" />
          <div>
            <div className="font-bold text-white group-hover:text-indigo-400 transition-colors">{cand.name}</div>
            <div className="text-[11px] text-slate-500">{cand.university}</div>
          </div>
        </div>
      </td>
      <td className="py-3.5 text-slate-300 font-medium">{cand.roleApplied}</td>
      <td className="py-3.5">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-white">{cand.resumeCompatibility}%</span>
          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full" style={{ width: `${cand.resumeCompatibility}%` }} />
          </div>
        </div>
      </td>
      <td className="py-3.5">
        <GlassBadge size="sm" variant={cand.skillMatch >= 90 ? 'emerald' : cand.skillMatch >= 80 ? 'indigo' : 'amber'}>
          <Sparkles className="w-3 h-3 mr-0.5" />{cand.skillMatch}% Match
        </GlassBadge>
      </td>
      <td className="py-3.5 text-slate-300">
        <span className="font-bold text-white">{cand.projectsCount}</span> projects
      </td>
      <td className="py-3.5">
        <GlassBadge size="sm" variant={
          cand.status === 'Interviewing' ? 'indigo' :
          cand.status === 'Offered' ? 'emerald' :
          cand.status === 'Reviewing' ? 'amber' : 'slate'
        }>
          {cand.status}
        </GlassBadge>
      </td>
      <td className="py-3.5 pr-2 text-right">
        <button
          onClick={(e) => { e.stopPropagation(); }}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
        >
          Interview
        </button>
      </td>
    </tr>
  );
}

export default function Company() {
  const { showToast } = useToast();
  const [candidates] = useState<CandidateApplication[]>(mockCandidates);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateApplication | null>(null);

  const [jobTitle, setJobTitle] = useState('');
  const [jobType, setJobType] = useState('Internship');
  const [jobStipend, setJobStipend] = useState('$50 - $60 / hr');
  const [jobSkills, setJobSkills] = useState('React, TypeScript, Tailwind, Git');
  const [jobLocation, setJobLocation] = useState('San Francisco, CA / Remote');

  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
  const { ref: pipelineRef, isVisible: pipelineVisible } = useScrollReveal();

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPostJobModalOpen(false);
    showToast('Opportunity Published!', `"${jobTitle}" is now live and matching student candidates.`, 'success');
    setJobTitle('');
  };

  const handleScheduleInterview = (candidate: CandidateApplication) => {
    showToast(
      'Interview Invitation Sent!',
      `Invited ${candidate.name} (${candidate.university}) for technical screening.`,
      'success'
    );
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchesStatus = selectedStatusFilter === 'All' || c.status === selectedStatusFilter;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.roleApplied.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.topSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const metrics = [
    { label: 'Active Postings', value: '4', sub: '3 Internships \u2022 1 Junior', color: 'text-white' },
    { label: 'Total Applicants', value: '68', sub: '14 new this week', color: 'text-indigo-400' },
    { label: 'High-Match Candidates', value: '26', sub: '>85% compatibility', color: 'text-emerald-400' },
    { label: 'Scheduled Interviews', value: '8', sub: 'Next in 2 hrs', color: 'text-purple-400' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12 space-y-8">
      {/* Header */}
      <div
        ref={headerRef}
        className={`glass-card p-6 rounded-3xl border border-white/10 ${headerVisible ? 'scroll-visible' : 'scroll-hidden'}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-2">
              <Building2 className="w-3.5 h-3.5" /> Recruiter & Employer Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Company Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              TechVision Labs &bull; Technical Talent Pipeline & ATS Ranking
            </p>
          </div>
          <GlassButton variant="primary" size="md" onClick={() => setIsPostJobModalOpen(true)}>
            <PlusCircle className="w-4 h-4 mr-1 inline" /> Post New Opportunity
          </GlassButton>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <MetricCard key={m.label} {...m} delay={i * 80} />
        ))}
      </div>

      {/* Candidate Pipeline */}
      <div
        ref={pipelineRef}
        className={`glass-card rounded-3xl p-6 border border-white/5 ${pipelineVisible ? 'scroll-visible' : 'scroll-hidden'}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5 mb-5">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Candidate Compatibility & Pipeline</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates or skills..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-indigo-500 outline-none"
              />
            </div>
            <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-medium w-full sm:w-auto justify-between">
              {['All', 'Interviewing', 'Reviewing', 'New'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatusFilter(status)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    selectedStatusFilter === status
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <th className="pb-3 pl-2">Candidate</th>
                <th className="pb-3">Role Applied</th>
                <th className="pb-3">ATS Compatibility</th>
                <th className="pb-3">Skill Match</th>
                <th className="pb-3">Projects</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCandidates.map((cand, i) => (
                <CandidateRow
                  key={cand.id}
                  cand={cand}
                  onClick={() => setSelectedCandidate(cand)}
                  delay={i * 50}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Post Opportunity Modal */}
      <GlassModal isOpen={isPostJobModalOpen} onClose={() => setIsPostJobModalOpen(false)} title="Post New Opportunity" subtitle="Publish an internship or job posting to match qualified student candidates">
        <form onSubmit={handlePostJob} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Role Title</label>
            <input type="text" required value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Frontend Software Engineering Intern" className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-indigo-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Opportunity Type</label>
              <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white cursor-pointer">
                <option value="Internship">Internship</option>
                <option value="Full-time">Full-time Job</option>
                <option value="Hackathon">Hackathon Challenge</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Stipend / Salary</label>
              <input type="text" value={jobStipend} onChange={(e) => setJobStipend(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Required Skills (comma separated)</label>
            <input type="text" value={jobSkills} onChange={(e) => setJobSkills(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Location & Work Mode</label>
            <input type="text" value={jobLocation} onChange={(e) => setJobLocation(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 outline-none" />
          </div>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
            <GlassButton type="button" variant="glass" size="sm" onClick={() => setIsPostJobModalOpen(false)}>Cancel</GlassButton>
            <GlassButton type="submit" variant="primary" size="sm">Publish Opportunity</GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* Candidate Profile Modal */}
      <GlassModal
        isOpen={Boolean(selectedCandidate)}
        onClose={() => setSelectedCandidate(null)}
        title={selectedCandidate?.name || ''}
        subtitle={selectedCandidate ? `${selectedCandidate.university} \u2022 ${selectedCandidate.roleApplied}` : ''}
      >
        {selectedCandidate && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
              <img src={selectedCandidate.avatar} alt={selectedCandidate.name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/30" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white">{selectedCandidate.name}</h4>
                  <GlassBadge variant="emerald">{selectedCandidate.status}</GlassBadge>
                </div>
                <p className="text-slate-300 mt-0.5">
                  Applied for {selectedCandidate.roleApplied} &bull; {selectedCandidate.experienceYears} yr experience
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
              <div>
                <div className="text-slate-400">Resume Compatibility</div>
                <div className="text-base font-bold text-white mt-0.5">{selectedCandidate.resumeCompatibility}%</div>
              </div>
              <div>
                <div className="text-slate-400">Verified Skill Match</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">{selectedCandidate.skillMatch}%</div>
              </div>
            </div>

            <div>
              <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1.5">Top Validated Skills</div>
              <div className="flex flex-wrap gap-1.5">
                {selectedCandidate.topSkills.map((sk, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 font-semibold text-slate-200">{sk}</span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
              <GlassButton variant="glass" size="sm" onClick={() => setSelectedCandidate(null)}>Close</GlassButton>
              <GlassButton variant="primary" size="sm" onClick={() => { handleScheduleInterview(selectedCandidate); setSelectedCandidate(null); }}>
                <Calendar className="w-3.5 h-3.5 mr-1 inline" /> Schedule Interview
              </GlassButton>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
}
