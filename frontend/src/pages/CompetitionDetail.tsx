import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Users, DollarSign } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';

const COMP_DATA: Record<string, any> = {
  'hackathon-1': {
    title: 'AI Innovation Hackathon',
    org: 'TechCorp',
    desc: 'Build cutting-edge AI solutions that solve real-world problems. Open to all skill levels with mentorship provided.',
    type: 'HACKATHON',
    location: 'Remote',
    deadline: 'March 15, 2026',
    prize: '$10,000',
    duration: '48 hours',
    tags: ['AI/ML', 'Python', 'TensorFlow', 'NLP'],
    rules: ['Teams of 2-4', 'Must use open-source AI tools', 'Demo required', 'Open to all levels'],
  },
};

const defaultComp = {
  title: 'Competition',
  org: 'Organizer',
  desc: 'An exciting tech competition to showcase your skills and win amazing prizes.',
  type: 'COMPETITION',
  location: 'Online',
  deadline: 'TBA',
  prize: 'TBA',
  duration: 'TBA',
  tags: ['Technology', 'Innovation'],
  rules: ['Follow the guidelines', 'Submit on time', 'Have fun'],
};

export default function CompetitionDetail() {
  const { id } = useParams();
  const comp = COMP_DATA[id || ''] || { ...defaultComp, title: id };
  const { ref, isVisible } = useScrollReveal();

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
      <div ref={ref} className={`${isVisible ? 'scroll-visible' : 'scroll-hidden'}`}>
        <Link to="/competitions" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Competitions
        </Link>

        <GlassCard direction="up">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="px-3 py-1 text-xs rounded-lg bg-primary-500/20 text-primary-300 font-medium mb-3 inline-block">
                  {comp.type}
                </span>
                <h1 className="text-3xl font-bold text-white">{comp.title}</h1>
                <p className="text-white/40 mt-1">{comp.org}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">{comp.prize}</div>
                <div className="text-xs text-white/30">Prize Pool</div>
              </div>
            </div>

            <p className="text-white/60 leading-relaxed mb-8">{comp.desc}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: MapPin, label: 'Location', value: comp.location },
                { icon: Clock, label: 'Duration', value: comp.duration },
                { icon: Users, label: 'Deadline', value: comp.deadline },
                { icon: DollarSign, label: 'Prize', value: comp.prize },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl bg-white/5 text-center">
                  <item.icon className="w-4 h-4 text-white/30 mx-auto mb-1" />
                  <div className="text-xs text-white/40">{item.label}</div>
                  <div className="text-sm font-medium text-white">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-white/80 mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {comp.tags.map((t: string) => (
                  <span key={t} className="px-3 py-1 text-sm rounded-lg bg-primary-500/10 text-primary-300">{t}</span>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-white/80 mb-3">Rules</h3>
              <ul className="space-y-2">
                {comp.rules.map((r: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <GlassButton variant="primary" size="lg">Register Now</GlassButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
