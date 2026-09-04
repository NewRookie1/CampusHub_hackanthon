import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Users, Star, MapPin, GraduationCap, ExternalLink, Mail, ChevronDown,
} from 'lucide-react';
import { mockTalentPool, TalentStudent } from '../data/hrData';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassBadge from '../components/GlassBadge';
import GlassModal from '../components/GlassModal';
import { useToast } from '../context/ToastContext';

const statusConfig: Record<string, { label: string; variant: 'blue' | 'amber' | 'emerald' | 'purple' | 'slate' }> = {
  new: { label: 'New', variant: 'blue' },
  reviewed: { label: 'Reviewed', variant: 'amber' },
  shortlisted: { label: 'Shortlisted', variant: 'emerald' },
  interviewed: { label: 'Interviewed', variant: 'purple' },
  offered: { label: 'Offered', variant: 'emerald' },
};

const avatarColors = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-red-500',
  'from-indigo-500 to-blue-500',
  'from-pink-500 to-rose-500',
  'from-cyan-500 to-blue-500',
];

export default function TalentPool() {
  const { showToast } = useToast();
  const [students, setStudents] = useState<TalentStudent[]>(mockTalentPool);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [skillFilter, setSkillFilter] = useState('');
  const [sortBy, setSortBy] = useState<'match' | 'score' | 'name'>('match');
  const [selectedStudent, setSelectedStudent] = useState<TalentStudent | null>(null);

  const allSkills = [...new Set(students.flatMap((s) => s.topSkills))].sort();

  const filtered = students
    .filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.major.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      const matchesSkill = !skillFilter || s.topSkills.includes(skillFilter);
      return matchesSearch && matchesStatus && matchesSkill;
    })
    .sort((a, b) => {
      if (sortBy === 'match') return b.skillMatch - a.skillMatch;
      if (sortBy === 'score') return b.resumeScore - a.resumeScore;
      return a.name.localeCompare(b.name);
    });

  const handleAction = (student: TalentStudent, action: 'shortlist' | 'reject' | 'interview') => {
    const newStatus = action === 'shortlist' ? 'shortlisted' : action === 'reject' ? 'reviewed' : 'interviewed';
    setStudents((prev) => prev.map((s) => s.id === student.id ? { ...s, status: newStatus as TalentStudent['status'] } : s));
    if (action === 'shortlist') showToast('Shortlisted', `${student.name} added to shortlist.`, 'success');
    if (action === 'interview') showToast('Interview Sent', `Invitation sent to ${student.name}.`, 'success');
    if (action === 'reject') showToast('Moved to Reviewed', `${student.name} moved to reviewed.`, 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Talent <span className="text-gradient">Pool</span>
          </h1>
          <p className="text-white/40">Discover and manage student candidates matching your requirements</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-indigo-500 outline-none text-sm"
              placeholder="Search by name, university, major..."
            />
          </div>
          <div className="relative">
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 outline-none text-sm appearance-none"
            >
              <option value="" className="bg-slate-800">All Skills</option>
              {allSkills.map((s) => (
                <option key={s} value={s} className="bg-slate-800">{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 outline-none text-sm appearance-none"
            >
              <option value="match" className="bg-slate-800">Skill Match</option>
              <option value="score" className="bg-slate-800">Resume Score</option>
              <option value="name" className="bg-slate-800">Name</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {['All', 'new', 'reviewed', 'shortlisted', 'interviewed', 'offered'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                statusFilter === s
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-white/5 text-white/40 border border-white/5 hover:text-white/60'
              }`}
            >
              {s === 'All' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              {s !== 'All' && (
                <span className="ml-1 text-[10px] opacity-60">
                  {students.filter((st) => st.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="text-xs text-white/30 mb-4">{filtered.length} candidates found</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((student, idx) => (
            <motion.div
              key={student.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="glass-card p-5 cursor-pointer hover:border-indigo-500/20 transition-all"
              onClick={() => setSelectedStudent(student)}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {student.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white truncate">{student.name}</h3>
                    <GlassBadge variant={statusConfig[student.status].variant} size="sm">
                      {statusConfig[student.status].label}
                    </GlassBadge>
                  </div>
                  <p className="text-xs text-white/40 mb-2">
                    {student.major} &middot; {student.university} &middot; Class of {student.graduationYear}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {student.topSkills.slice(0, 4).map((s) => (
                      <span key={s} className="px-2 py-0.5 text-[10px] rounded-md bg-white/5 text-white/50 border border-white/5">{s}</span>
                    ))}
                    {student.topSkills.length > 4 && (
                      <span className="px-2 py-0.5 text-[10px] rounded-md bg-white/5 text-white/30">+{student.topSkills.length - 4}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <div className="text-xs text-white/40">Match</div>
                      <div className={`text-sm font-bold ${student.skillMatch >= 85 ? 'text-emerald-400' : student.skillMatch >= 70 ? 'text-amber-400' : 'text-white/50'}`}>
                        {student.skillMatch}%
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="text-xs text-white/40">Resume</div>
                      <div className="text-sm font-bold text-indigo-400">{student.resumeScore}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-white/30">
                      <GraduationCap className="w-3 h-3" /> {student.projects} projects
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-16 text-white/30">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No candidates match your filters.</p>
            </div>
          )}
        </div>
      </motion.div>

      <GlassModal isOpen={!!selectedStudent} onClose={() => setSelectedStudent(null)} title={selectedStudent?.name || ''}>
        {selectedStudent && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${avatarColors[mockTalentPool.indexOf(selectedStudent) % avatarColors.length]} flex items-center justify-center text-white font-bold`}>
                {selectedStudent.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <GlassBadge variant={statusConfig[selectedStudent.status].variant}>
                    {statusConfig[selectedStudent.status].label}
                  </GlassBadge>
                </div>
                <p className="text-sm text-white/40 mt-1">{selectedStudent.major} &middot; {selectedStudent.university}</p>
              </div>
            </div>

            <p className="text-sm text-white/50 leading-relaxed">{selectedStudent.bio}</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/5">
                <div className="text-xs text-white/40">Skill Match</div>
                <div className="text-lg font-bold text-emerald-400">{selectedStudent.skillMatch}%</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <div className="text-xs text-white/40">Resume Score</div>
                <div className="text-lg font-bold text-indigo-400">{selectedStudent.resumeScore}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <div className="text-xs text-white/40">GPA</div>
                <div className="text-lg font-bold text-white">{selectedStudent.gpa}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <div className="text-xs text-white/40">Projects</div>
                <div className="text-lg font-bold text-white">{selectedStudent.projects}</div>
              </div>
            </div>

            <div>
              <div className="text-xs text-white/40 mb-2">Skills</div>
              <div className="flex flex-wrap gap-1.5">
                {selectedStudent.topSkills.map((s) => (
                  <span key={s} className="px-2 py-1 text-xs rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">{s}</span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs text-white/40 mb-2">Experience</div>
              <p className="text-sm text-white/50">{selectedStudent.experience}</p>
            </div>

            {selectedStudent.links.length > 0 && (
              <div>
                <div className="text-xs text-white/40 mb-2">Links</div>
                <div className="flex gap-2">
                  {selectedStudent.links.map((l) => (
                    <a key={l.type} href={`https://${l.url}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-white/5 text-white/50 hover:text-white transition-colors">
                      <ExternalLink className="w-3 h-3" /> {l.type}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {selectedStudent.status !== 'shortlisted' && (
                <GlassButton variant="primary" onClick={() => { handleAction(selectedStudent, 'shortlist'); setSelectedStudent(null); }}>
                  Shortlist
                </GlassButton>
              )}
              {selectedStudent.status !== 'interviewed' && selectedStudent.status !== 'offered' && (
                <GlassButton variant="ghost" onClick={() => { handleAction(selectedStudent, 'interview'); setSelectedStudent(null); }}>
                  Schedule Interview
                </GlassButton>
              )}
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
}
