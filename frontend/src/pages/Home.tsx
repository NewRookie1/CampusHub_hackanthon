import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Target, Brain, BarChart3, Shield, Zap, BookOpen, Trophy, Globe } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useMouseParallax } from '../hooks/useMouseParallax';
import { useTilt } from '../hooks/useTilt';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

function HeroSection() {
  const parallax = useMouseParallax(0.015);
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div
        ref={ref}
        className={`text-center max-w-5xl mx-auto px-4 ${isVisible ? 'scroll-visible' : 'scroll-hidden'}`}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm text-primary-300"
        >
          <Sparkles className="w-4 h-4" />
          AI-Powered Skill Intelligence
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          style={{ transform: `translate(${parallax.x}px, ${parallax.y}px)` }}
        >
          <span className="text-white">Master Your </span>
          <span className="text-gradient">Skills</span>
          <br />
          <span className="text-white">Shape Your </span>
          <span className="shimmer-text">Future</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Upload your resume, discover skill gaps, practice with AI mock tests,
          and get matched with opportunities that fit your unique profile.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/register">
            <GlassButton variant="primary" size="lg">
              Get Started Free <ArrowRight className="w-5 h-5 ml-2 inline" />
            </GlassButton>
          </Link>
          <Link to="/roadmaps">
            <GlassButton variant="glass" size="lg">
              Explore Roadmaps
            </GlassButton>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {[
            { value: '8+', label: 'Exam Types' },
            { value: '50+', label: 'Skill Paths' },
            { value: '100%', label: 'AI-Driven' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-gradient">{stat.value}</div>
              <div className="text-xs text-white/40 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { icon: Brain, title: 'AI Resume Analysis', desc: 'Upload your resume and let our AI extract skills, identify gaps, and suggest improvements.', color: 'from-blue-500 to-cyan-500' },
    { icon: Target, title: 'Skill Gap Detection', desc: 'Compare your profile against target roles to see exactly what you need to learn.', color: 'from-purple-500 to-pink-500' },
    { icon: BarChart3, title: 'Smart Matching', desc: 'Get matched with opportunities based on your actual skills and potential.', color: 'from-green-500 to-emerald-500' },
    { icon: BookOpen, title: 'Learning Planner', desc: 'AI generates personalized study schedules tailored to your goals and availability.', color: 'from-orange-500 to-red-500' },
    { icon: Trophy, title: 'Mock Tests', desc: 'Practice with AI-generated questions for GATE, TOEFL, GRE, GMAT, and more.', color: 'from-yellow-500 to-amber-500' },
    { icon: Shield, title: 'Interview Prep', desc: 'AI-powered mock interviews with real-time feedback and scoring.', color: 'from-indigo-500 to-violet-500' },
  ];

  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to <span className="text-gradient">Level Up</span>
          </h2>
          <p className="text-white/40 max-w-xl mx-auto">
            A complete platform powered by advanced AI to accelerate your career growth.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, desc, color, index }: {
  icon: any; title: string; desc: string; color: string; index: number;
}) {
  const { ref, style, handleMouseMove, handleMouseLeave } = useTilt(10);

  return (
    <motion.div variants={fadeUp}>
      <GlassCard delay={index * 100} direction="up">
        <div
          ref={ref}
          style={style}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="p-6 cursor-default"
        >
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function ExamTypesSection() {
  const exams = [
    { name: 'GATE', full: 'Graduate Aptitude Test in Engineering' },
    { name: 'TOEFL', full: 'Test of English as a Foreign Language' },
    { name: 'GRE', full: 'Graduate Record Examinations' },
    { name: 'GMAT', full: 'Graduate Management Admission Test' },
    { name: 'CAT', full: 'Common Admission Test' },
    { name: 'UPSC', full: 'Civil Services Examination' },
    { name: 'JEE', full: 'Joint Entrance Examination' },
    { name: 'NEET', full: 'National Eligibility cum Entrance Test' },
  ];

  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prepare for <span className="text-gradient">Top Exams</span>
          </h2>
          <p className="text-white/40 max-w-xl mx-auto">
            AI-generated mock tests with adaptive difficulty for all major competitive exams.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {exams.map((exam, i) => (
            <motion.div key={exam.name} variants={fadeUp}>
              <GlassCard delay={i * 80} direction="scale">
                <div className="p-5 text-center">
                  <div className="text-2xl font-bold text-gradient mb-1">{exam.name}</div>
                  <div className="text-xs text-white/30">{exam.full}</div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-24 px-4">
      <div ref={ref} className={`max-w-4xl mx-auto ${isVisible ? 'scroll-visible' : 'scroll-hidden'}`}>
        <div className="glass-card p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-purple-600/10 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to <span className="text-gradient">Transform</span> Your Career?
            </h2>
            <p className="text-white/40 max-w-lg mx-auto mb-8">
              Join thousands of developers who are mastering new skills and landing their dream roles.
            </p>
            <Link to="/register">
              <GlassButton variant="primary" size="lg">
                Start for Free <Zap className="w-5 h-5 ml-2 inline" />
              </GlassButton>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <ExamTypesSection />
      <CTASection />
    </div>
  );
}
