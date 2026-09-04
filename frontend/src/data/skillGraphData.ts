export interface SkillGraphNode {
  id: string;
  label: string;
  type: 'role' | 'domain' | 'skill' | 'project' | 'resource';
  level?: string;
  currentLevel?: string;
  targetLevel?: string;
  category?: string;
  description?: string;
  resources?: string[];
  projects?: string[];
  opportunities?: string[];
  x: number;
  y: number;
}

export interface SkillGraphEdge {
  from: string;
  to: string;
}

export const initialSkillGraphData = {
  canvasWidth: 1000,
  canvasHeight: 680,
  nodes: [
    // Layer 1: Root Role
    {
      id: 'role-root',
      label: 'Frontend Developer',
      type: 'role' as const,
      x: 500,
      y: 50,
      currentLevel: 'Junior (78%)',
      targetLevel: 'Senior Intern (95%)',
      description: 'End-to-end career target for modern web development and design systems engineering.',
    },

    // Layer 2: Core Domains
    {
      id: 'dom-core',
      label: 'Core Web Foundations',
      type: 'domain' as const,
      x: 200,
      y: 160,
      description: 'The fundamental languages of the browser: semantics, asynchronous execution, and styles.',
    },
    {
      id: 'dom-frameworks',
      label: 'Modern Frameworks',
      type: 'domain' as const,
      x: 500,
      y: 160,
      description: 'Component architecture, reactive state trees, and static type systems.',
    },
    {
      id: 'dom-quality',
      label: 'Quality & Performance',
      type: 'domain' as const,
      x: 800,
      y: 160,
      description: 'Automated test coverage, Core Web Vitals, and production resilience.',
    },

    // Layer 3: Skill Nodes Row A
    {
      id: 'sk-js',
      label: 'JavaScript (ES6+)',
      type: 'skill' as const,
      x: 200,
      y: 275,
      currentLevel: 'Advanced (88%)',
      targetLevel: '85%',
      resources: ['MDN JavaScript In-Depth', 'JavaScript.info Complete Guide', 'Frontend Masters Advanced JS'],
      projects: ['Interactive Real-Time Spreadsheet', 'Canvas Particle Physics Engine'],
      opportunities: ['Stripe Frontend Intern', 'Vercel Web Engineer'],
    },
    {
      id: 'sk-react',
      label: 'React & Hooks',
      type: 'skill' as const,
      x: 500,
      y: 275,
      currentLevel: 'Proficient (82%)',
      targetLevel: '85%',
      resources: ['React.dev Official Docs', 'Epic React by Kent C. Dodds', 'Overreacted by Dan Abramov'],
      projects: ['Task Management Kanban with DnD', 'Collaborative Whiteboard'],
      opportunities: ['Atlassian Hackathon Team', 'Stripe Dashboard Intern'],
    },
    {
      id: 'sk-test',
      label: 'Testing (Jest & RTL)',
      type: 'skill' as const,
      x: 800,
      y: 275,
      currentLevel: 'Beginner (42%)',
      targetLevel: '80%',
      resources: ['TestingJavaScript.com', 'React Testing Library Best Practices', 'Mock Service Worker (MSW) Guide'],
      projects: ['Full E2E Testing Suite for SaaS app', 'TDD Component Library with 100% Coverage'],
      opportunities: ['Datadog QA Fellow', 'Stripe Production Engineer'],
    },

    // Layer 3: Skill Nodes Row B
    {
      id: 'sk-css',
      label: 'CSS3 & Tailwind',
      type: 'skill' as const,
      x: 200,
      y: 375,
      currentLevel: 'Expert (95%)',
      targetLevel: '90%',
      resources: ['CSS Tricks Grid Guide', 'Tailwind CSS Mastery Docs', 'Every Layout Principles'],
      projects: ['Liquid Glass UI Component Kit', 'SaaS Landing Page System'],
      opportunities: ['Figma UI Intern', 'Notion Design Systems Engineer'],
    },
    {
      id: 'sk-ts',
      label: 'TypeScript',
      type: 'skill' as const,
      x: 500,
      y: 375,
      currentLevel: 'Intermediate (58%)',
      targetLevel: '85%',
      resources: ['Total TypeScript by Matt Pocock', 'TypeScript Handbook v5', 'Type Challenges GitHub'],
      projects: ['Type-safe E-commerce State Machine', 'CLI Tool with Full Zod Validation'],
      opportunities: ['Vercel Junior Developer', 'GitHub Accelerator Fellow'],
    },
    {
      id: 'sk-perf',
      label: 'Web Performance',
      type: 'skill' as const,
      x: 800,
      y: 375,
      currentLevel: 'Intermediate (65%)',
      targetLevel: '75%',
      resources: ['Web.dev Core Web Vitals', 'High Performance Browser Networking', 'Next.js Image/Font optimization'],
      projects: ['Sub-100ms Page Load Audit & Refactor', 'Lighthouse 100/100 Benchmark Site'],
      opportunities: ['Vercel Edge Systems', 'Anthropic Web Lead'],
    },

    // Layer 4: Capstone Projects
    {
      id: 'proj-1',
      label: 'Project: Analytics Dashboard',
      type: 'project' as const,
      x: 240,
      y: 500,
      description: 'Real-time telemetry and data charting built with React, WebSockets, and custom Tailwind charts.',
    },
    {
      id: 'proj-2',
      label: 'Project: E-Commerce Storefront',
      type: 'project' as const,
      x: 500,
      y: 500,
      description: 'Full-stack type-safe shopping application with Stripe checkout, Zustand state, and automated RTL tests.',
    },
    {
      id: 'proj-3',
      label: 'Project: Design Token UI Kit',
      type: 'project' as const,
      x: 760,
      y: 500,
      description: 'Accessible Liquid Glass UI library audited for WCAG 2.2 contrast and 99+ Lighthouse performance.',
    },

    // Layer 5: Learning Resources
    {
      id: 'res-1',
      label: 'MDN & Deep JS Guides',
      type: 'resource' as const,
      x: 240,
      y: 615,
      description: 'Official browser specifications and in-depth JS execution models.',
    },
    {
      id: 'res-2',
      label: 'Total TypeScript & React.dev',
      type: 'resource' as const,
      x: 500,
      y: 615,
      description: 'Interactive generics tutorials and modern hooks best practices.',
    },
    {
      id: 'res-3',
      label: 'Testing Library & Web.dev',
      type: 'resource' as const,
      x: 760,
      y: 615,
      description: 'Comprehensive guides for writing resilient component tests and optimizing Web Vitals.',
    },
  ],
  edges: [
    // Root to Domains
    { from: 'role-root', to: 'dom-core' },
    { from: 'role-root', to: 'dom-frameworks' },
    { from: 'role-root', to: 'dom-quality' },

    // Domains to Skills
    { from: 'dom-core', to: 'sk-js' },
    { from: 'dom-core', to: 'sk-css' },
    { from: 'dom-frameworks', to: 'sk-react' },
    { from: 'dom-frameworks', to: 'sk-ts' },
    { from: 'dom-quality', to: 'sk-test' },
    { from: 'dom-quality', to: 'sk-perf' },

    // Skills to Projects
    { from: 'sk-js', to: 'proj-1' },
    { from: 'sk-css', to: 'proj-1' },
    { from: 'sk-react', to: 'proj-1' },
    { from: 'sk-react', to: 'proj-2' },
    { from: 'sk-ts', to: 'proj-2' },
    { from: 'sk-test', to: 'proj-2' },
    { from: 'sk-css', to: 'proj-3' },
    { from: 'sk-test', to: 'proj-3' },
    { from: 'sk-perf', to: 'proj-3' },

    // Projects to Resources
    { from: 'proj-1', to: 'res-1' },
    { from: 'proj-2', to: 'res-2' },
    { from: 'proj-3', to: 'res-3' },
  ],
};
