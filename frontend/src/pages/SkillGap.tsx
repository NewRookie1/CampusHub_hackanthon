import { useState, useEffect, useRef, useCallback } from 'react';
import { Target, ArrowRight, AlertTriangle, CheckCircle, Upload, FileText, X, Loader2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { useScrollReveal } from '../hooks/useScrollReveal';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';

const TARGET_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'Cloud Engineer',
  'DevOps Engineer',
  'UI/UX Designer',
  'Cybersecurity Analyst',
  'Mobile Developer',
  'ML Engineer',
];

interface Resume {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  extractedSkills?: { name: string; proficiency: string; confidence: number }[];
}

export default function SkillGap() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const { ref, isVisible } = useScrollReveal();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fetchingResumes, setFetchingResumes] = useState(false);

  const fetchResumes = useCallback(async () => {
    if (!token || token.startsWith('demo-token')) return;
    setFetchingResumes(true);
    try {
      const res = await api.get('/api/resume/my', token);
      if (res.success && Array.isArray(res.data)) {
        setResumes(res.data);
        if (res.data.length > 0 && !selectedResumeId) {
          setSelectedResumeId(res.data[0].id);
        }
      }
    } catch {
      // Silently fail - user may not have backend running
    } finally {
      setFetchingResumes(false);
    }
  }, [token, selectedResumeId]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleFileUpload = async (file: File) => {
    if (!token) {
      showToast('Login Required', 'Please log in to upload resumes', 'error');
      return;
    }
    if (token.startsWith('demo-token')) {
      showToast('Demo Mode', 'Resume upload requires a real backend connection', 'info');
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      showToast('Invalid Format', 'Please upload a PDF, TXT, DOC, or DOCX file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File Too Large', 'Maximum file size is 5MB', 'error');
      return;
    }

    setUploading(true);
    try {
      const res = await api.upload('/api/resume/upload', file, token);
      if (res.success) {
        showToast('Resume Uploaded', `"${file.name}" uploaded successfully`, 'success');
        await fetchResumes();
        if (res.data?.resume_id) {
          setSelectedResumeId(res.data.resume_id);
        }
      }
    } catch (e: any) {
      showToast('Upload Failed', e.message || 'Could not upload resume', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const analyze = async () => {
    if (!token || !selectedResumeId || !targetRole) return;
    setLoading(true);
    try {
      const res = await api.post('/api/skill-gap/analyze', {
        resume_id: selectedResumeId,
        target_role: targetRole,
      }, token);
      if (res.success) {
        setResult(res.data);
        showToast('Analysis Complete', 'Your skill gap analysis is ready', 'success');
      }
    } catch (e: any) {
      showToast('Analysis Failed', e.message || 'Could not complete analysis', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteResume = async (id: string) => {
    if (!token || token.startsWith('demo-token')) return;
    try {
      await api.delete(`/api/resume/${id}`, token);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      if (selectedResumeId === id) {
        setSelectedResumeId('');
        setResult(null);
      }
      showToast('Deleted', 'Resume deleted', 'success');
    } catch (e: any) {
      showToast('Delete Failed', e.message, 'error');
    }
  };

  const coverage = result?.coverage_score ?? 0;
  const displayCoverage = coverage > 1 ? coverage : Math.round(coverage * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
      <div ref={ref} className={`${isVisible ? 'scroll-visible' : 'scroll-hidden'}`}>
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-3">
            <span className="text-gradient">Skill Gap</span> Analysis
          </h1>
          <p className="text-white/40 max-w-lg mx-auto">
            Upload your resume and discover exactly what skills you need for your target role.
          </p>
        </div>

        <div className="space-y-6">
          {/* Upload Section */}
          <GlassCard direction="up">
            <div className="p-6">
              <h2 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-400" />
                Resume
              </h2>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  dragOver
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                    dragOver ? 'bg-primary-500/20' : 'bg-white/5'
                  }`}>
                    {uploading ? (
                      <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6 text-white/40" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-white/70 font-medium">
                      {uploading ? 'Uploading...' : 'Drop your resume here or click to browse'}
                    </p>
                    <p className="text-xs text-white/30 mt-1">PDF, TXT, DOC, DOCX - Max 5MB</p>
                  </div>
                </div>
              </div>

              {resumes.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-white/40">Your resumes:</p>
                  {resumes.map((r) => (
                    <div
                      key={r.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedResumeId === r.id
                          ? 'bg-primary-500/10 border-primary-500/30'
                          : 'bg-white/5 border-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => { setSelectedResumeId(r.id); setResult(null); }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-4 h-4 text-primary-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate">{r.fileName}</p>
                          <p className="text-xs text-white/30">
                            {(r.fileSize / 1024).toFixed(1)} KB
                            {r.extractedSkills?.length ? ` - ${r.extractedSkills.length} skills found` : ''}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteResume(r.id); }}
                        className="p-1 text-white/20 hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>

          {/* Target Role Section */}
          <GlassCard delay={100} direction="up">
            <div className="p-6">
              <h2 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                Target Role
              </h2>

              <div className="relative">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-left text-sm flex items-center justify-between transition-all hover:border-white/20"
                >
                  <span className={targetRole ? 'text-white' : 'text-white/30'}>
                    {targetRole || 'Select a target role...'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {roleDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute z-20 w-full mt-2 rounded-xl bg-[#1a1a2e] border border-white/10 shadow-2xl overflow-hidden"
                    >
                      <div className="max-h-60 overflow-y-auto">
                        {TARGET_ROLES.map((role) => (
                          <button
                            key={role}
                            onClick={() => { setTargetRole(role); setRoleDropdownOpen(false); setResult(null); }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                              targetRole === role
                                ? 'bg-primary-500/20 text-primary-300'
                                : 'text-white/60 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </GlassCard>

          {/* Analyze Button */}
          <div className="flex justify-center">
            <GlassButton
              variant="primary"
              size="lg"
              onClick={analyze}
              disabled={loading || !selectedResumeId || !targetRole}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze Skill Gap
                  <ArrowRight className="w-4 h-4 ml-2 inline" />
                </>
              )}
            </GlassButton>
          </div>

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-4"
              >
                <GlassCard delay={0} direction="up">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-1">Coverage Score</h3>
                    <div className="text-4xl font-bold text-gradient my-3">{displayCoverage}%</div>
                    <div className="w-full h-2 bg-white/5 rounded-full">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${displayCoverage}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </GlassCard>

                {result.missing_skills?.length > 0 && (
                  <GlassCard delay={100} direction="left">
                    <div className="p-6">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-3">
                        <AlertTriangle className="w-5 h-5 text-red-400" /> Missing Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.missing_skills.map((s: any) => (
                          <span key={s.id || s.name} className="px-3 py-1 text-sm rounded-lg bg-red-500/10 text-red-300 border border-red-500/20">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </GlassCard>
                )}

                {result.weak_skills?.length > 0 && (
                  <GlassCard delay={150} direction="left">
                    <div className="p-6">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400" /> Weak Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.weak_skills.map((s: any) => (
                          <span key={s.id || s.name} className="px-3 py-1 text-sm rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </GlassCard>
                )}

                {result.existing_skills?.length > 0 && (
                  <GlassCard delay={200} direction="right">
                    <div className="p-6">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-3">
                        <CheckCircle className="w-5 h-5 text-green-400" /> Your Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.existing_skills.map((s: any) => (
                          <span key={s.id || s.name} className="px-3 py-1 text-sm rounded-lg bg-green-500/10 text-green-300 border border-green-500/20">
                            {s.name} ({s.proficiency})
                          </span>
                        ))}
                      </div>
                    </div>
                  </GlassCard>
                )}

                {result.recommendations?.length > 0 && (
                  <GlassCard delay={300} direction="up">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Recommendations</h3>
                      <ul className="space-y-2">
                        {result.recommendations.map((r: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </GlassCard>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
