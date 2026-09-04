import { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, CheckCircle, XCircle, ArrowRight, Trophy, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useTilt } from '../hooks/useTilt';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';

const EXAM_TYPES = [
  { id: 'GATE', name: 'GATE', full: 'Graduate Aptitude Test in Engineering', color: 'from-blue-500 to-cyan-500' },
  { id: 'TOEFL', name: 'TOEFL', full: 'Test of English as a Foreign Language', color: 'from-green-500 to-emerald-500' },
  { id: 'GRE', name: 'GRE', full: 'Graduate Record Examinations', color: 'from-purple-500 to-violet-500' },
  { id: 'GMAT', name: 'GMAT', full: 'Graduate Management Admission Test', color: 'from-orange-500 to-red-500' },
  { id: 'CAT', name: 'CAT', full: 'Common Admission Test', color: 'from-pink-500 to-rose-500' },
  { id: 'UPSC', name: 'UPSC', full: 'Civil Services Examination', color: 'from-amber-500 to-yellow-500' },
  { id: 'JEE', name: 'JEE', full: 'Joint Entrance Examination', color: 'from-indigo-500 to-blue-500' },
  { id: 'NEET', name: 'NEET', full: 'National Eligibility cum Entrance Test', color: 'from-red-500 to-pink-500' },
];

type Stage = 'select' | 'config' | 'test' | 'result';

interface Question {
  id: string;
  index: number;
  question: string;
  type: string;
  options?: string[];
  marks: number;
}

export default function MockTest() {
  const { token } = useAuth();
  const [stage, setStage] = useState<Stage>('select');
  const [selectedExam, setSelectedExam] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(10);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testId, setTestId] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { ref, isVisible } = useScrollReveal();

  useEffect(() => {
    if (stage !== 'test' || timeLeft <= 0) return;
    timerRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stage, timeLeft]);

  const handleSubmit = useCallback(async () => {
    if (!token || !testId) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setLoading(true);
    try {
      for (const [idx, ans] of Object.entries(answers)) {
        await api.post('/api/mock-test/answer', {
          test_id: testId,
          question_index: parseInt(idx),
          answer: ans,
        }, token);
      }
      const res = await api.post('/api/mock-test/complete', { test_id: testId }, token);
      if (res.success) {
        setResult(res.data);
        setStage('result');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, testId, answers]);

  useEffect(() => {
    if (timeLeft === 0 && stage === 'test' && testId) handleSubmit();
  }, [timeLeft, stage, testId, handleSubmit]);

  const startTest = async () => {
    if (!token) return alert('Please log in first');
    setLoading(true);
    try {
      const res = await api.post('/api/mock-test/start', {
        exam_type: selectedExam,
        subject,
        difficulty,
        num_questions: numQuestions,
      }, token);
      if (res.success) {
        setTestId(res.data.testId);
        setQuestions(res.data.questions);
        setTimeLeft(res.data.timeLimitMinutes * 60);
        setStage('test');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const reset = () => {
    setStage('select');
    setSelectedExam('');
    setSubject('');
    setQuestions([]);
    setAnswers({});
    setCurrentQ(0);
    setResult(null);
    setTestId('');
  };

  if (stage === 'select') {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div ref={ref} className={`${isVisible ? 'scroll-visible' : 'scroll-hidden'}`}>
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-white mb-3">
              AI <span className="text-gradient">Mock Tests</span>
            </h1>
            <p className="text-white/40 max-w-lg mx-auto">
              Practice with AI-generated questions for major competitive exams.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {EXAM_TYPES.map((exam, i) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                index={i}
                selected={selectedExam === exam.id}
                onClick={() => { setSelectedExam(exam.id); setStage('config'); }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'config') {
    const exam = EXAM_TYPES.find((e) => e.id === selectedExam);
    return (
      <div className="max-w-lg mx-auto px-4 pt-24 pb-12">
        <GlassCard direction="up">
          <div className="p-8">
            <h2 className="text-xl font-bold text-white mb-1">{exam?.name} Mock Test</h2>
            <p className="text-sm text-white/40 mb-6">{exam?.full}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Subject</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-primary-500 outline-none text-sm"
                  placeholder="e.g., Computer Science"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Difficulty</label>
                <div className="flex gap-2">
                  {['easy', 'medium', 'hard'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2 rounded-xl text-sm capitalize transition-all ${
                        difficulty === d
                          ? 'bg-primary-600 text-white'
                          : 'bg-white/5 text-white/40 hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Questions: {numQuestions}</label>
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                  className="w-full accent-primary-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <GlassButton variant="ghost" size="md" onClick={() => setStage('select')}>Back</GlassButton>
                <GlassButton variant="primary" size="md" className="flex-1" onClick={startTest} disabled={loading || !subject}>
                  {loading ? 'Generating...' : 'Start Test'}
                </GlassButton>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (stage === 'test' && questions.length > 0) {
    const q = questions[currentQ];
    const progress = ((currentQ + 1) / questions.length) * 100;

    return (
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-12">
        <GlassCard direction="up">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-white/60">
                Question {currentQ + 1} of {questions.length}
              </div>
              <div className={`flex items-center gap-2 text-sm font-mono ${timeLeft < 60 ? 'text-red-400' : 'text-white/60'}`}>
                <Clock className="w-4 h-4" /> {formatTime(timeLeft)}
              </div>
            </div>

            <div className="w-full h-1 bg-white/5 rounded-full mb-6">
              <div className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>

            <div className="mb-6">
              <span className="px-2 py-0.5 text-xs rounded bg-primary-500/20 text-primary-300">{q.type}</span>
              <span className="ml-2 text-xs text-white/30">{q.marks} marks</span>
            </div>

            <h2 className="text-lg text-white mb-6 leading-relaxed">{q.question}</h2>

            {q.options && (
              <div className="space-y-3 mb-8">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setAnswers((prev) => ({ ...prev, [currentQ]: opt }))}
                    className={`w-full text-left p-4 rounded-xl border transition-all text-sm ${
                      answers[currentQ] === opt
                        ? 'border-primary-500 bg-primary-500/10 text-white'
                        : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span className="font-medium mr-3 text-white/30">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {!q.options && (
              <textarea
                value={answers[currentQ] || ''}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [currentQ]: e.target.value }))}
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-primary-500 outline-none text-sm min-h-[120px] mb-8"
                placeholder="Type your answer..."
              />
            )}

            <div className="flex justify-between">
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
                disabled={currentQ === 0}
              >
                Previous
              </GlassButton>
              {currentQ < questions.length - 1 ? (
                <GlassButton
                  variant="primary"
                  size="sm"
                  onClick={() => setCurrentQ((q) => q + 1)}
                >
                  Next <ArrowRight className="w-4 h-4 ml-1 inline" />
                </GlassButton>
              ) : (
                <GlassButton variant="primary" size="sm" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Test'}
                </GlassButton>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (stage === 'result' && result) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-12">
        <GlassCard direction="scale">
          <div className="p-8 text-center">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Test Complete!</h2>
            <div className="text-5xl font-bold text-gradient my-6">{Math.round(result.percentage || 0)}%</div>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-3 rounded-xl bg-green-500/10">
                <div className="text-lg font-bold text-green-400">{result.correctAnswers || 0}</div>
                <div className="text-xs text-white/40">Correct</div>
              </div>
              <div className="p-3 rounded-xl bg-red-500/10">
                <div className="text-lg font-bold text-red-400">{result.incorrectAnswers || 0}</div>
                <div className="text-xs text-white/40">Incorrect</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <div className="text-lg font-bold text-white/60">{result.unattempted || 0}</div>
                <div className="text-xs text-white/40">Skipped</div>
              </div>
            </div>
            {result.feedback && (
              <p className="text-sm text-white/50 mb-6 text-left p-4 rounded-xl bg-white/5">{result.feedback}</p>
            )}
            <GlassButton variant="primary" onClick={reset}>
              <RotateCcw className="w-4 h-4 mr-2 inline" /> Take Another Test
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  return null;
}

function ExamCard({ exam, index, selected, onClick }: {
  exam: typeof EXAM_TYPES[0]; index: number; selected: boolean; onClick: () => void;
}) {
  const { ref, style, handleMouseMove, handleMouseLeave } = useTilt(8);

  return (
    <div
      ref={ref}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={onClick}
        className={`glass-card p-5 text-left transition-all w-full ${
          selected ? 'border-primary-500 bg-primary-500/10' : ''
        }`}
      >
        <div className={`text-2xl font-bold bg-gradient-to-r ${exam.color} bg-clip-text text-transparent mb-1`}>
          {exam.name}
        </div>
        <div className="text-xs text-white/30">{exam.full}</div>
      </button>
    </div>
  );
}
