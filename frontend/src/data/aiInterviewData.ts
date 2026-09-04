export interface InterviewQuestion {
  id: string;
  category: 'hr' | 'technical' | 'behavioral';
  question: string;
  roleTarget: string;
  suggestedPoints: string[];
  sampleGoodAnswer: string;
}

export interface InterviewFeedback {
  communicationScore: number;
  relevanceScore: number;
  confidenceScore: number;
  structureScore: number;
  technicalDepthScore: number;
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  exemplarAnswer: string;
}

export const interviewQuestionsPool: InterviewQuestion[] = [
  {
    id: 'hr-1',
    category: 'hr',
    question: 'Tell me about yourself and what sparked your passion for software development.',
    roleTarget: 'All Roles',
    suggestedPoints: [
      'Brief academic background & graduation year',
      'What drew you to software engineering (first project or aha moment)',
      'Key technical technologies you specialize in',
      'Why you are excited about this opportunity specifically',
    ],
    sampleGoodAnswer:
      "I am a junior computer science student at Stanford with a passion for building user-centric web applications. My journey started when I built a student club portal that eliminated 5 hours of manual spreadsheet work every week. Since then, I've dove deep into the React and TypeScript ecosystem, contributing to open-source UI libraries and building full-stack applications. I'm excited about this internship because of your team's focus on high-performance design systems and engineering excellence.",
  },
  {
    id: 'hr-2',
    category: 'hr',
    question: 'Why should we hire you over other candidates who might have similar grades or university backgrounds?',
    roleTarget: 'All Roles',
    suggestedPoints: [
      'Proven proof of work and end-to-end project execution',
      'High velocity learning and autonomous problem-solving',
      'Strong team communication and feedback receptivity',
      'Direct alignment with company values',
    ],
    sampleGoodAnswer:
      'Beyond strong academics, what differentiates me is my continuous track record of building and shipping. When I identify a skill gap, I build an end-to-end project and write unit tests for it. I am extremely self-directed, communicate transparently during blockers, and will hit the ground running on day one with enthusiasm and humility.',
  },
  {
    id: 'hr-3',
    category: 'hr',
    question: 'What are your greatest strengths and a genuine area of improvement you are actively working on?',
    roleTarget: 'All Roles',
    suggestedPoints: [
      'Concrete strength tied to impact',
      'Authentic weakness with actionable steps being taken',
      'Demonstrated growth mindset',
    ],
    sampleGoodAnswer:
      "My greatest strength is my debugging rigor. An area I'm actively improving is over-engineering early prototypes. Now, I explicitly timebox spikes, align with stakeholders on MVP scope, and iterate based on real feedback.",
  },
  {
    id: 'tech-1',
    category: 'technical',
    question: 'Explain how React reconciliation works and why the Virtual DOM was introduced. How does React 18 change rendering behavior?',
    roleTarget: 'Frontend Developer',
    suggestedPoints: [
      'Virtual DOM as an in-memory representation of real DOM',
      'Diffing algorithm heuristics',
      'Keys for identity tracking across renders',
      'React 18 Concurrent features',
    ],
    sampleGoodAnswer:
      'React introduced the Virtual DOM as an in-memory representation of UI elements because direct DOM operations are computationally expensive. When state updates, React generates a new Virtual DOM tree and runs its heuristic diffing algorithm. React 18 elevates this with Concurrent Rendering, allowing the renderer to pause, prioritize user-urgent inputs via useTransition, and automatically batch multiple state updates across async boundaries.',
  },
  {
    id: 'tech-2',
    category: 'technical',
    question: 'What is the JavaScript Event Loop? Walk through what happens when a Promise resolves compared to a setTimeout callback.',
    roleTarget: 'Frontend / Full Stack',
    suggestedPoints: [
      'Call stack, Web APIs, Task Queue, Microtask Queue',
      'Microtask priority over macrotasks',
      'Promise .then callbacks queued as microtasks',
      'setTimeout callbacks queued as macrotasks',
    ],
    sampleGoodAnswer:
      'JavaScript is single-threaded with a non-blocking event loop. Asynchronous tasks like setTimeout hand off timer execution to browser Web APIs, and once finished, their callback enters the Macrotask Queue. Promise settlements enter the Microtask Queue. After each tick, the event loop exhausts the entire Microtask Queue before pulling the next single Macrotask.',
  },
  {
    id: 'tech-3',
    category: 'technical',
    question: 'How do you approach client-side web performance optimization when a web application has slow Core Web Vitals?',
    roleTarget: 'Frontend Developer',
    suggestedPoints: [
      'LCP: Image priority, server-side preloading, CDN caching',
      'INP: Breaking long tasks with scheduler or requestIdleCallback',
      'CLS: Explicit image width/height dimensions, font display swap',
    ],
    sampleGoodAnswer:
      "I tackle performance through data-driven auditing using Chrome DevTools Performance panel and Lighthouse. For LCP, I ensure the hero image has preload headers, served via optimized WebP/AVIF from edge CDNs. For INP, I break down long JavaScript tasks exceeding 50ms using Web Workers. For CLS, I enforce aspect-ratio and explicit dimensions on all media.",
  },
  {
    id: 'beh-1',
    category: 'behavioral',
    question: 'Tell me about a time when you encountered a difficult technical roadblock or bug in a project. How did you diagnose and resolve it?',
    roleTarget: 'All Roles',
    suggestedPoints: [
      'Situation: Context of the project and the critical issue',
      'Task: What was at stake and your responsibility',
      'Action: Step-by-step diagnostic strategy',
      'Result: Concrete outcome and lasting takeaway',
    ],
    sampleGoodAnswer:
      "During a hackathon where we built a real-time collaborative whiteboarding tool, our web socket connections kept silently dropping. I used Wireshark and browser network logs to inspect WebSocket frames and discovered our server wasn't responding to TCP keep-alive pings within the reverse proxy's 30-second timeout. I configured automated heartbeat pings and tuned the NGINX proxy timeout. The connection stayed 100% stable during the live judging demo.",
  },
  {
    id: 'beh-2',
    category: 'behavioral',
    question: 'Describe a situation where you had a disagreement with a team member on a technical decision. How did you handle it?',
    roleTarget: 'All Roles',
    suggestedPoints: [
      'Situation: Contrasting opinions on architecture or library choice',
      'Action: Respectful listening, objective benchmarking, finding consensus',
      'Result: Successful project delivery and strengthened team relationship',
    ],
    sampleGoodAnswer:
      "In a group coursework project, a peer wanted Redux with redux-thunk for a simple app while I felt Zustand would introduce far less boilerplate. Instead of arguing theoretically, I invited him to a whiteboard session where we outlined requirements and built a 10-line POC with both. When he saw Zustand delivered full TypeScript safety with 80% fewer files, he happily agreed.",
  },
];

export function generateMockFeedback(
  _userAnswer: string,
  question: InterviewQuestion
): InterviewFeedback {
  const wordCount = _userAnswer.trim().split(/\s+/).filter(Boolean).length;

  let commScore = 75;
  let relScore = 78;
  let confScore = 75;
  let structScore = 74;
  let techScore = 72;

  if (wordCount < 20) {
    commScore = 50;
    relScore = 55;
    confScore = 48;
    structScore = 52;
    techScore = 50;
  } else if (wordCount > 60) {
    commScore = Math.min(95, 82 + Math.floor(Math.random() * 8));
    relScore = Math.min(96, 85 + Math.floor(Math.random() * 8));
    confScore = Math.min(92, 80 + Math.floor(Math.random() * 10));
    structScore = Math.min(94, 82 + Math.floor(Math.random() * 8));
    techScore = Math.min(95, 84 + Math.floor(Math.random() * 8));
  } else {
    commScore = 78;
    relScore = 80;
    confScore = 75;
    structScore = 78;
    techScore = 76;
  }

  const overallScore = Math.round(
    (commScore + relScore + confScore + structScore + techScore) / 5
  );

  return {
    communicationScore: commScore,
    relevanceScore: relScore,
    confidenceScore: confScore,
    structureScore: structScore,
    technicalDepthScore: techScore,
    overallScore,
    summary:
      wordCount < 25
        ? 'Your answer is quite brief. In an interview setting, expand on your concrete actions, the context behind your decisions, and measurable outcomes.'
        : 'Strong and articulate response! You showed good self-awareness, clear communication, and addressed the core intention of the question directly.',
    strengths: [
      'Direct and authentic tone with zero excessive buzzwords',
      'Addressed the prompt cleanly with focused logical flow',
      'Demonstrated proactive learning attitude and technical curiosity',
    ],
    improvements: [
      'Incorporate more quantitative metrics (e.g. "% performance improvement", "hours saved")',
      'Structure longer answers using the STAR method (Situation, Task, Action, Result)',
      'Tie back your conclusion explicitly to how it benefits the target team',
    ],
    exemplarAnswer: question.sampleGoodAnswer,
  };
}
