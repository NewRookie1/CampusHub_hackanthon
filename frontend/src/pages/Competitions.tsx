import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Clock, ArrowRight, Filter } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useTilt } from '../hooks/useTilt';
import GlassCard from '../components/GlassCard';

const COMPETITIONS = [
  { id: 'hackathon-1', title: 'AI Innovation Hackathon', org: 'TechCorp', type: 'HACKATHON', location: 'Remote', deadline: '2026-03-15', prize: '$10,000', tags: ['AI/ML', 'Python', '48hrs'] },
  { id: 'hackathon-2', title: 'Build the Future Hack', org: 'StartupHub', type: 'HACKATHON', location: 'Bangalore', deadline: '2026-04-01', prize: '$5,000', tags: ['Web3', 'React', '24hrs'] },
  { id: 'hackathon-3', title: 'Open Source Challenge', org: 'DevCommunity', type: 'CHALLENGE', location: 'Remote', deadline: '2026-03-20', prize: 'Swag Kit', tags: ['Open Source', 'GitHub', '4 weeks'] },
  { id: 'hackathon-4', title: 'Data Science Bowl', org: 'DataOrg', type: 'COMPETITION', location: 'Online', deadline: '2026-04-15', prize: '$15,000', tags: ['Data Science', 'Python', 'ML'] },
  { id: 'hackathon-5', title: 'Cybersecurity CTF', org: 'SecTeam', type: 'CTF', location: 'Remote', deadline: '2026-03-25', prize: '$3,000', tags: ['Security', 'Networking', '48hrs'] },
  { id: 'hackathon-6', title: 'Cloud Architecture Sprint', org: 'CloudBase', type: 'CHALLENGE', location: 'Online', deadline: '2026-04-10', prize: 'Cloud Credits', tags: ['AWS', 'DevOps', '2 weeks'] },
];

function CompetitionCardItem({ comp, index }: { comp: typeof COMPETITIONS[0]; index: number }) {
  const { ref, style, handleMouseMove, handleMouseLeave } = useTilt(6);

  return (
    <GlassCard delay={index * 100} direction="up">
      <Link to={`/competitions/${comp.id}`}>
        <div
          ref={ref}
          style={style}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="p-6 cursor-pointer group"
        >
          <div className="flex items-start justify-between mb-3">
            <span className="px-2 py-0.5 text-xs rounded-md bg-primary-500/20 text-primary-300 font-medium">
              {comp.type}
            </span>
            <span className="text-sm font-semibold text-green-400">{comp.prize}</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-gradient transition-all">{comp.title}</h3>
          <p className="text-sm text-white/40 mb-3">{comp.org}</p>
          <div className="flex items-center gap-4 text-xs text-white/30 mb-3">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {comp.location}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {comp.deadline}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {comp.tags.map((t) => (
              <span key={t} className="px-2 py-0.5 text-xs rounded-md bg-white/5 text-white/50">{t}</span>
            ))}
          </div>
          <div className="flex items-center text-sm text-primary-400 mt-4 group-hover:text-primary-300 transition-colors">
            View Details <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </GlassCard>
  );
}

export default function Competitions() {
  const [filter, setFilter] = useState('ALL');
  const { ref, isVisible } = useScrollReveal();
  const types = ['ALL', 'HACKATHON', 'CHALLENGE', 'COMPETITION', 'CTF'];

  const filtered = filter === 'ALL' ? COMPETITIONS : COMPETITIONS.filter((c) => c.type === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
      <div ref={ref} className={`${isVisible ? 'scroll-visible' : 'scroll-hidden'}`}>
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-3">
            <span className="text-gradient">Competitions</span> & Hackathons
          </h1>
          <p className="text-white/40 max-w-lg mx-auto">
            Compete, learn, and win prizes in exciting tech challenges.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2 text-sm rounded-xl transition-all ${
                filter === t
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                  : 'glass text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c, i) => (
            <CompetitionCardItem key={c.id} comp={c} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
