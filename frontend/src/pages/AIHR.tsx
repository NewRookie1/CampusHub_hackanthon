import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bot, Sparkles, Send, RotateCcw, CheckCircle2, Volume2,
  HelpCircle, TrendingUp, MessageSquare, Zap,
} from 'lucide-react';
import {
  interviewQuestionsPool, generateMockFeedback,
  InterviewQuestion, InterviewFeedback,
} from '../data/aiInterviewData';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassBadge from '../components/GlassBadge';
import { useToast } from '../context/ToastContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useTilt } from '../hooks/useTilt';

export default function AIHR() {
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<'hr' | 'technical' | 'behavioral'>('hr');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);

  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal();
  const { ref: interviewerRef, isVisible: interviewerVisible } = useScrollReveal();
  const { ref: feedbackRef, isVisible: feedbackVisible } = useScrollReveal();
  const { ref: tiltRef, style: tiltStyle, handleMouseMove, handleMouseLeave } = useTilt(6);

  const filteredQuestions = interviewQuestionsPool.filter((q) => q.category === selectedCategory);
  const currentQuestion: InterviewQuestion = filteredQuestions[currentQuestionIndex] || filteredQuestions[0];

  const handleCategorySwitch = (cat: 'hr' | 'technical' | 'behavioral') => {
    setSelectedCategory(cat);
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setFeedback(null);
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((currentQuestionIndex + 1) % filteredQuestions.length);
    setUserAnswer('');
    setFeedback(null);
  };

  const handleLoadSample = () => {
    setUserAnswer(currentQuestion.sampleGoodAnswer);
    showToast('Sample Answer Loaded', 'Ready for AI evaluation benchmark', 'info');
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) {
      showToast('Answer Required', 'Please enter your response before submitting.', 'error');
      return;
    }
    setIsEvaluating(true);
    setTimeout(() => {
      const result = generateMockFeedback(userAnswer, currentQuestion);
      setFeedback(result);
      setIsEvaluating(false);
      showToast('AI Evaluation Ready', `Overall Score: ${result.overallScore}%`, 'success');
    }, 900);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12 space-y-8">
      {/* Header */}
      <div
        ref={headerRef}
        className={`glass-card p-6 rounded-3xl border border-white/10 ${headerVisible ? 'scroll-visible' : 'scroll-hidden'}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold mb-2">
              <Bot className="w-3.5 h-3.5" /> AI HR & Technical Interview Trainer
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Conversational Interview Simulation Room
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Simulate real interview pressure with AI evaluation across communication clarity, technical depth, and STAR structure.
            </p>
          </div>
          <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 text-xs font-medium">
            {(['hr', 'technical', 'behavioral'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySwitch(cat)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'hr' ? 'HR Interview' : cat === 'technical' ? 'Technical Round' : 'Behavioral (STAR)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interview Chamber */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Question & Answer */}
        <div className="lg:col-span-7 space-y-6">
          {/* AI Interviewer Card */}
          <div
            ref={interviewerRef}
            className={`glass-card rounded-3xl p-6 border border-indigo-500/30 ${interviewerVisible ? 'scroll-visible' : 'scroll-hidden'}`}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                    <Bot className="w-6 h-6" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">AI Lead Interviewer</h3>
                    <GlassBadge size="sm" variant="indigo">
                      Question {currentQuestionIndex + 1} of {filteredQuestions.length}
                    </GlassBadge>
                  </div>
                  <p className="text-xs text-slate-400">
                    Target Role: {currentQuestion.roleTarget} &bull; {selectedCategory.toUpperCase()} Mode
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Volume2 className="w-4 h-4" />
                <span className="w-1 h-3 bg-indigo-500 rounded-full animate-pulse" />
                <span className="w-1 h-5 bg-indigo-500 rounded-full animate-pulse delay-75" />
                <span className="w-1 h-2 bg-indigo-500 rounded-full animate-pulse delay-150" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
              <p className="text-base font-semibold text-white leading-relaxed">
                &ldquo;{currentQuestion.question}&rdquo;
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 text-xs text-slate-300">
              <div className="font-bold text-slate-200 mb-1 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" /> Key Elements to Address:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-400">
                {currentQuestion.suggestedPoints.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Response Chamber */}
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Your Spoken or Written Response
              </span>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Zap className="w-3 h-3" /> Fill Benchmark Answer
              </button>
            </div>

            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <textarea
                rows={6}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your response here as you would speak it in a live interview..."
                className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-indigo-500 outline-none text-xs leading-relaxed resize-none"
              />
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{userAnswer.trim().split(/\s+/).filter(Boolean).length} words</span>
                  <span>&bull;</span>
                  <span>Recommended: ~80-150 words</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <GlassButton type="button" variant="glass" size="sm" onClick={handleNextQuestion}>
                    <RotateCcw className="w-3.5 h-3.5 mr-1 inline" /> Next
                  </GlassButton>
                  <GlassButton type="submit" variant="primary" size="sm" disabled={isEvaluating}>
                    <Send className="w-3.5 h-3.5 mr-1 inline" />
                    {isEvaluating ? 'Evaluating...' : 'Submit to AI HR'}
                  </GlassButton>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right: AI Feedback */}
        <div className="lg:col-span-5 space-y-6">
          {feedback ? (
            <motion.div
              ref={(el) => {
                (feedbackRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
                (tiltRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={tiltStyle}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="glass-card rounded-3xl p-6 border border-indigo-500/30"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">AI Evaluation Report</span>
                  <h3 className="text-lg font-bold text-white">Performance Breakdown</h3>
                </div>
                <GlassBadge variant={feedback.overallScore >= 80 ? 'emerald' : 'amber'}>
                  {feedback.overallScore}% Overall
                </GlassBadge>
              </div>

              <div className="space-y-3 mb-5 text-xs">
                {[
                  { label: 'Communication Clarity', score: feedback.communicationScore, color: 'bg-indigo-500' },
                  { label: 'Question Relevance', score: feedback.relevanceScore, color: 'bg-cyan-500' },
                  { label: 'Confidence & Tone', score: feedback.confidenceScore, color: 'bg-purple-500' },
                  { label: 'Structure (STAR)', score: feedback.structureScore, color: 'bg-emerald-500' },
                  { label: 'Technical Depth', score: feedback.technicalDepthScore, color: 'bg-amber-500' },
                ].map((d) => (
                  <div key={d.label}>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>{d.label}</span>
                      <span className="font-bold">{d.score}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4 text-xs text-slate-300 leading-relaxed">
                {feedback.summary}
              </div>

              <div className="mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> What You Did Well
                </h4>
                <ul className="space-y-1 text-xs text-slate-300">
                  {feedback.strengths.map((str, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">&bull;</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Key Areas for Polish
                </h4>
                <ul className="space-y-1 text-xs text-slate-300">
                  {feedback.improvements.map((imp, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">&bull;</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs">
                <span className="font-bold text-indigo-400">Model Exemplar Response:</span>
                <p className="text-slate-300 italic mt-1 leading-relaxed">&ldquo;{feedback.exemplarAnswer}&rdquo;</p>
              </div>
            </motion.div>
          ) : (
            <div className="glass-card rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[350px]">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-3">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white">Feedback Awaiting Submission</h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
                Type your response or load a sample benchmark answer on the left to see real-time AI scoring on communication, confidence, and structure.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
