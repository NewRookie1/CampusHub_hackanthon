import { useState } from 'react';
import { MessageSquare, Send, ArrowRight, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useScrollReveal } from '../hooks/useScrollReveal';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';

type Stage = 'config' | 'interview' | 'result';

export default function Interview() {
  const { token } = useAuth();
  const [stage, setStage] = useState<Stage>('config');
  const [stageType, setStageType] = useState('HR_INTERVIEW');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [sessionId, setSessionId] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const { ref, isVisible } = useScrollReveal();

  const startInterview = async () => {
    if (!token) return alert('Please log in');
    setLoading(true);
    try {
      const res = await api.post('/api/interview/start', {
        stage: stageType,
        difficulty,
        num_questions: numQuestions,
      }, token);
      if (res.success) {
        setSessionId(res.data.id);
        setQuestions(res.data.questions || []);
        setStage('interview');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!token || !answer.trim()) return;
    setLoading(true);
    try {
      const q = questions[currentQ];
      const res = await api.post('/api/interview/evaluate', {
        session_id: sessionId,
        question_id: q.id,
        answer,
      }, token);
      if (res.success) {
        const eval_ = res.data.evaluation;
        setEvaluation(eval_);
        setHistory((prev) => [...prev, { question: q.question, answer, evaluation: eval_ }]);
        setScore(res.data.current_score || 0);
        setAnswer('');

        if (res.data.session_complete) {
          setStage('result');
        } else if (res.data.next_question) {
          setQuestions((prev) => [...prev, res.data.next_question]);
          setCurrentQ((c) => c + 1);
        }
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStage('config');
    setSessionId('');
    setQuestions([]);
    setCurrentQ(0);
    setAnswer('');
    setEvaluation(null);
    setHistory([]);
    setScore(0);
  };

  if (stage === 'config') {
    return (
      <div className="max-w-lg mx-auto px-4 pt-24 pb-12">
        <div ref={ref} className={`${isVisible ? 'scroll-visible' : 'scroll-hidden'}`}>
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-3">
              AI <span className="text-gradient">Interview</span> Prep
            </h1>
            <p className="text-white/40">Practice with AI-powered mock interviews</p>
          </div>

          <GlassCard direction="up">
            <div className="p-8 space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Interview Stage</label>
                <div className="grid grid-cols-3 gap-2">
                  {['HR_INTERVIEW', 'TECHNICAL_INTERVIEW', 'BEHAVIORAL_INTERVIEW'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStageType(s)}
                      className={`py-2 rounded-xl text-xs transition-all ${
                        stageType === s
                          ? 'bg-primary-600 text-white'
                          : 'bg-white/5 text-white/40 hover:text-white'
                      }`}
                    >
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Difficulty</label>
                <div className="flex gap-2">
                  {['easy', 'medium', 'hard'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2 rounded-xl text-sm capitalize transition-all ${
                        difficulty === d ? 'bg-primary-600 text-white' : 'bg-white/5 text-white/40 hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Number of Questions: {numQuestions}</label>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                  className="w-full accent-primary-500"
                />
              </div>

              <GlassButton variant="primary" size="lg" className="w-full" onClick={startInterview} disabled={loading}>
                {loading ? 'Starting...' : 'Start Interview'}
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  if (stage === 'interview' && questions.length > 0) {
    const q = questions[currentQ];

    return (
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-12">
        <GlassCard direction="up">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-white/60">Question {currentQ + 1}</span>
              <span className="text-sm text-primary-400">Score: {score.toFixed(1)}</span>
            </div>

            <div className="w-full h-1 bg-white/5 rounded-full mb-6">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all"
                style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
              />
            </div>

            <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
              <MessageSquare className="w-5 h-5 text-primary-400 mb-2" />
              <p className="text-white leading-relaxed">{q.question}</p>
            </div>

            {evaluation && (
              <div className="mb-6 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 animate-scale-in">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-sm font-medium ${evaluation.score >= 7 ? 'text-green-400' : evaluation.score >= 4 ? 'text-yellow-400' : 'text-red-400'}`}>
                    Score: {evaluation.score}/10
                  </span>
                </div>
                {evaluation.feedback && (
                  <p className="text-sm text-white/60">{evaluation.feedback}</p>
                )}
              </div>
            )}

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-primary-500 outline-none text-sm min-h-[120px] mb-4"
              placeholder="Type your answer..."
            />

            <GlassButton variant="primary" onClick={submitAnswer} disabled={loading || !answer.trim()}>
              {loading ? 'Evaluating...' : <>Submit Answer <Send className="w-4 h-4 ml-2 inline" /></>}
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (stage === 'result') {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-12">
        <GlassCard direction="scale">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Interview Complete!</h2>
            <div className="text-5xl font-bold text-gradient my-6">{score.toFixed(1)}</div>
            <p className="text-white/40 mb-8">Final Score</p>

            <div className="space-y-3 text-left mb-8 max-h-96 overflow-y-auto">
              {history.map((h, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5">
                  <p className="text-sm text-white/80 mb-2 font-medium">Q{i + 1}: {h.question}</p>
                  <p className="text-xs text-white/40 mb-1">Your answer: {h.answer.slice(0, 100)}...</p>
                  {h.evaluation && (
                    <span className={`text-xs font-medium ${h.evaluation.score >= 7 ? 'text-green-400' : h.evaluation.score >= 4 ? 'text-yellow-400' : 'text-red-400'}`}>
                      Score: {h.evaluation.score}/10
                    </span>
                  )}
                </div>
              ))}
            </div>

            <GlassButton variant="primary" onClick={reset}>
              <RotateCcw className="w-4 h-4 mr-2 inline" /> Practice Again
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  return null;
}
