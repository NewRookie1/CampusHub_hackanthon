import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase, Plus, Search, MapPin, Clock, Users, Pause, Play, Trash2,
  Eye, Edit3, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { mockJobPostings, JobPosting } from '../data/hrData';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassBadge from '../components/GlassBadge';
import GlassModal from '../components/GlassModal';
import { useToast } from '../context/ToastContext';

const statusConfig: Record<string, { label: string; variant: 'emerald' | 'amber' | 'slate' | 'blue' }> = {
  active: { label: 'Active', variant: 'emerald' },
  paused: { label: 'Paused', variant: 'amber' },
  closed: { label: 'Closed', variant: 'slate' },
  draft: { label: 'Draft', variant: 'blue' },
};

const typeColors: Record<string, string> = {
  'Internship': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Full-time': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Part-time': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Contract': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

export default function JobPostings() {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<JobPosting[]>(mockJobPostings);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<JobPosting['type']>('Internship');
  const [newLocation, setNewLocation] = useState('');
  const [newRemote, setNewRemote] = useState(false);
  const [newSalary, setNewSalary] = useState('');

  const filtered = jobs.filter((j) => {
    const matchesSearch = j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleStatus = (id: string) => {
    setJobs((prev) => prev.map((j) => {
      if (j.id !== id) return j;
      const next = j.status === 'active' ? 'paused' : 'active';
      showToast('Status Updated', `"${j.title}" is now ${next}.`, 'success');
      return { ...j, status: next as JobPosting['status'] };
    }));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const posting: JobPosting = {
      id: `jp-${Date.now()}`,
      title: newTitle,
      type: newType,
      department: 'Engineering',
      location: newLocation || 'Remote',
      remote: newRemote,
      salary: newSalary || 'Competitive',
      description: '',
      requirements: [],
      requiredSkills: [],
      preferredSkills: [],
      status: 'draft',
      applicants: 0,
      shortlisted: 0,
      postedDate: new Date().toISOString().split('T')[0],
      deadline: '',
    };
    setJobs((prev) => [posting, ...prev]);
    setShowCreateModal(false);
    setNewTitle('');
    showToast('Posting Created', `"${posting.title}" saved as draft.`, 'success');
  };

  const handleDelete = (id: string) => {
    const job = jobs.find((j) => j.id === id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
    showToast('Posting Deleted', `"${job?.title}" has been removed.`, 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Job <span className="text-gradient">Postings</span>
            </h1>
            <p className="text-white/40">Manage your open positions and track applicants</p>
          </div>
          <GlassButton variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" /> New Posting
          </GlassButton>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-indigo-500 outline-none text-sm"
              placeholder="Search jobs by title or department..."
            />
          </div>
          <div className="flex gap-2">
            {['All', 'active', 'paused', 'draft', 'closed'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  statusFilter === s
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-white/5 text-white/40 border border-white/5 hover:text-white/60'
                }`}
              >
                {s === 'All' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((job) => (
            <motion.div
              key={job.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-5"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Briefcase className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                    <h3 className="text-lg font-semibold text-white truncate">{job.title}</h3>
                    <GlassBadge variant={statusConfig[job.status].variant} size="sm">
                      {statusConfig[job.status].label}
                    </GlassBadge>
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-md border ${typeColors[job.type]}`}>
                      {job.type}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/40">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                    {job.remote && <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">Remote</span>}
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{job.applicants} applicants</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Posted {job.postedDate}</span>
                  </div>
                  {job.description && (
                    <p className="text-sm text-white/30 mt-2 line-clamp-1">{job.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-semibold text-emerald-400 mr-2">{job.salary}</span>
                  <button
                    onClick={() => toggleStatus(job.id)}
                    className="p-2 rounded-lg hover:bg-white/5 transition-all text-white/40 hover:text-white/60"
                    title={job.status === 'active' ? 'Pause' : 'Activate'}
                  >
                    {job.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="p-2 rounded-lg hover:bg-white/5 transition-all text-white/40 hover:text-white/60"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 transition-all text-white/40 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-white/30">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No job postings match your filters.</p>
            </div>
          )}
        </div>
      </motion.div>

      <GlassModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Posting">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 mb-1">Job Title</label>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-indigo-500 outline-none text-sm"
              placeholder="e.g. Frontend Developer Intern"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/40 mb-1">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as JobPosting['type'])}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 outline-none text-sm"
              >
                {['Internship', 'Full-time', 'Part-time', 'Contract'].map((t) => (
                  <option key={t} value={t} className="bg-slate-800">{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Salary Range</label>
              <input
                value={newSalary}
                onChange={(e) => setNewSalary(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-indigo-500 outline-none text-sm"
                placeholder="$30 - $40 / hr"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">Location</label>
            <input
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-indigo-500 outline-none text-sm"
              placeholder="San Francisco, CA"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-white/50 cursor-pointer">
            <input
              type="checkbox"
              checked={newRemote}
              onChange={(e) => setNewRemote(e.target.checked)}
              className="rounded border-white/20"
            />
            Remote-friendly position
          </label>
          <div className="flex gap-3 pt-2">
            <GlassButton variant="ghost" onClick={() => setShowCreateModal(false)} type="button">Cancel</GlassButton>
            <GlassButton variant="primary" type="submit">Create Posting</GlassButton>
          </div>
        </form>
      </GlassModal>

      <GlassModal isOpen={!!selectedJob} onClose={() => setSelectedJob(null)} title={selectedJob?.title || ''}>
        {selectedJob && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <GlassBadge variant={statusConfig[selectedJob.status].variant}>{statusConfig[selectedJob.status].label}</GlassBadge>
              <span className={`px-2 py-0.5 text-[10px] font-medium rounded-md border ${typeColors[selectedJob.type]}`}>{selectedJob.type}</span>
            </div>
            <p className="text-sm text-white/50">{selectedJob.description || 'No description provided.'}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/5">
                <div className="text-xs text-white/40">Applicants</div>
                <div className="text-lg font-bold text-white">{selectedJob.applicants}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <div className="text-xs text-white/40">Shortlisted</div>
                <div className="text-lg font-bold text-indigo-400">{selectedJob.shortlisted}</div>
              </div>
            </div>
            {selectedJob.requiredSkills.length > 0 && (
              <div>
                <div className="text-xs text-white/40 mb-2">Required Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.requiredSkills.map((s) => (
                    <span key={s} className="px-2 py-1 text-xs rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {selectedJob.preferredSkills.length > 0 && (
              <div>
                <div className="text-xs text-white/40 mb-2">Preferred Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.preferredSkills.map((s) => (
                    <span key={s} className="px-2 py-1 text-xs rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </GlassModal>
    </div>
  );
}
