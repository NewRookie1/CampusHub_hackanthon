export interface CandidateApplication {
  id: string;
  name: string;
  avatar: string;
  roleApplied: string;
  university: string;
  resumeCompatibility: number;
  skillMatch: number;
  experienceYears: number;
  projectsCount: number;
  status: 'New' | 'Reviewing' | 'Interviewing' | 'Offered' | 'Rejected';
  appliedDate: string;
  topSkills: string[];
}

export const mockCandidates: CandidateApplication[] = [
  {
    id: 'cand-1',
    name: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    roleApplied: 'Frontend Software Engineering Intern',
    university: 'Stanford University (B.S. CS 2027)',
    resumeCompatibility: 94,
    skillMatch: 92,
    experienceYears: 1,
    projectsCount: 6,
    status: 'Interviewing',
    appliedDate: 'Yesterday',
    topSkills: ['React', 'JavaScript (ES6+)', 'Tailwind CSS', 'TypeScript', 'Next.js'],
  },
  {
    id: 'cand-2',
    name: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    roleApplied: 'Frontend Software Engineering Intern',
    university: 'Georgia Tech (B.S. CS 2026)',
    resumeCompatibility: 88,
    skillMatch: 86,
    experienceYears: 1.5,
    projectsCount: 4,
    status: 'Reviewing',
    appliedDate: '2 days ago',
    topSkills: ['React', 'TypeScript', 'Redux Toolkit', 'Jest', 'Webpack'],
  },
  {
    id: 'cand-3',
    name: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    roleApplied: 'Junior Full Stack Developer',
    university: 'UC Berkeley (B.S. EECS 2026)',
    resumeCompatibility: 91,
    skillMatch: 89,
    experienceYears: 2,
    projectsCount: 7,
    status: 'Offered',
    appliedDate: '3 days ago',
    topSkills: ['Next.js', 'PostgreSQL', 'Docker', 'GraphQL', 'Tailwind'],
  },
  {
    id: 'cand-4',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    roleApplied: 'UI/UX & Design Systems Intern',
    university: 'Carnegie Mellon University (B.Des 2027)',
    resumeCompatibility: 96,
    skillMatch: 95,
    experienceYears: 1,
    projectsCount: 5,
    status: 'Interviewing',
    appliedDate: '4 days ago',
    topSkills: ['Figma', 'Design Systems', 'CSS Grid', 'WCAG 2.2', 'Prototyping'],
  },
  {
    id: 'cand-5',
    name: 'Devon Wright',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    roleApplied: 'Frontend Software Engineering Intern',
    university: 'University of Michigan (B.S. CS 2027)',
    resumeCompatibility: 79,
    skillMatch: 75,
    experienceYears: 0.5,
    projectsCount: 3,
    status: 'New',
    appliedDate: '5 hours ago',
    topSkills: ['JavaScript', 'HTML/CSS', 'Vue.js', 'Git'],
  },
  {
    id: 'cand-6',
    name: 'Aisha Patel',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&auto=format&fit=crop&q=80',
    roleApplied: 'Junior Full Stack Developer',
    university: 'UT Austin (B.S. CS 2026)',
    resumeCompatibility: 85,
    skillMatch: 82,
    experienceYears: 1,
    projectsCount: 4,
    status: 'Reviewing',
    appliedDate: '1 day ago',
    topSkills: ['Node.js', 'Express', 'React', 'MongoDB', 'REST APIs'],
  },
];
