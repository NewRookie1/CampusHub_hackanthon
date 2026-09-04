import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const skills = [
  { name: 'Python', normalizedName: 'python', category: 'PROGRAMMING', aliases: '["py","python3"]' },
  { name: 'JavaScript', normalizedName: 'javascript', category: 'PROGRAMMING', aliases: '["js","ecmascript","es6"]' },
  { name: 'TypeScript', normalizedName: 'typescript', category: 'PROGRAMMING', aliases: '["ts"]' },
  { name: 'Java', normalizedName: 'java', category: 'PROGRAMMING', aliases: '[]' },
  { name: 'C++', normalizedName: 'c++', category: 'PROGRAMMING', aliases: '["cpp"]' },
  { name: 'Go', normalizedName: 'go', category: 'PROGRAMMING', aliases: '["golang"]' },
  { name: 'Rust', normalizedName: 'rust', category: 'PROGRAMMING', aliases: '[]' },
  { name: 'SQL', normalizedName: 'sql', category: 'DATABASE', aliases: '["mysql","postgresql","sqlite"]' },
  { name: 'React', normalizedName: 'react', category: 'FRAMEWORK', aliases: '["reactjs","react.js"]' },
  { name: 'Node.js', normalizedName: 'node.js', category: 'FRAMEWORK', aliases: '["node","nodejs"]' },
  { name: 'Express', normalizedName: 'express', category: 'FRAMEWORK', aliases: '["expressjs","express.js"]' },
  { name: 'FastAPI', normalizedName: 'fastapi', category: 'FRAMEWORK', aliases: '["fast api"]' },
  { name: 'Django', normalizedName: 'django', category: 'FRAMEWORK', aliases: '[]' },
  { name: 'Flask', normalizedName: 'flask', category: 'FRAMEWORK', aliases: '[]' },
  { name: 'Spring Boot', normalizedName: 'spring boot', category: 'FRAMEWORK', aliases: '["spring","springboot"]' },
  { name: 'PostgreSQL', normalizedName: 'postgresql', category: 'DATABASE', aliases: '["postgres","psql"]' },
  { name: 'MongoDB', normalizedName: 'mongodb', category: 'DATABASE', aliases: '["mongo"]' },
  { name: 'Redis', normalizedName: 'redis', category: 'DATABASE', aliases: '[]' },
  { name: 'Docker', normalizedName: 'docker', category: 'DEVOPS', aliases: '[]' },
  { name: 'Kubernetes', normalizedName: 'kubernetes', category: 'DEVOPS', aliases: '["k8s"]' },
  { name: 'AWS', normalizedName: 'aws', category: 'CLOUD', aliases: '["amazon web services"]' },
  { name: 'GCP', normalizedName: 'gcp', category: 'CLOUD', aliases: '["google cloud platform"]' },
  { name: 'Azure', normalizedName: 'azure', category: 'CLOUD', aliases: '[]' },
  { name: 'Git', normalizedName: 'git', category: 'DEVOPS', aliases: '["github","gitlab","version control"]' },
  { name: 'Linux', normalizedName: 'linux', category: 'DEVOPS', aliases: '[]' },
  { name: 'Machine Learning', normalizedName: 'machine learning', category: 'AI_ML', aliases: '["ml","machine-learning"]' },
  { name: 'Deep Learning', normalizedName: 'deep learning', category: 'AI_ML', aliases: '["dl","deep-learning"]' },
  { name: 'TensorFlow', normalizedName: 'tensorflow', category: 'AI_ML', aliases: '[]' },
  { name: 'PyTorch', normalizedName: 'pytorch', category: 'AI_ML', aliases: '[]' },
  { name: 'Scikit-learn', normalizedName: 'scikit-learn', category: 'AI_ML', aliases: '["sklearn"]' },
  { name: 'Pandas', normalizedName: 'pandas', category: 'DATA_SCIENCE', aliases: '[]' },
  { name: 'NumPy', normalizedName: 'numpy', category: 'DATA_SCIENCE', aliases: '[]' },
  { name: 'Data Analysis', normalizedName: 'data analysis', category: 'DATA_SCIENCE', aliases: '["data analytics"]' },
  { name: 'REST API', normalizedName: 'rest api', category: 'FRAMEWORK', aliases: '["rest","restful","rest apis"]' },
  { name: 'GraphQL', normalizedName: 'graphql', category: 'FRAMEWORK', aliases: '["gql"]' },
  { name: 'HTML', normalizedName: 'html', category: 'FRAMEWORK', aliases: '["html5"]' },
  { name: 'CSS', normalizedName: 'css', category: 'FRAMEWORK', aliases: '["css3","scss","sass"]' },
  { name: 'Figma', normalizedName: 'figma', category: 'DESIGN', aliases: '[]' },
  { name: 'UI/UX Design', normalizedName: 'ui/ux design', category: 'DESIGN', aliases: '["ui ux","user interface","user experience"]' },
  { name: 'Communication', normalizedName: 'communication', category: 'SOFT_SKILL', aliases: '[]' },
  { name: 'Leadership', normalizedName: 'leadership', category: 'SOFT_SKILL', aliases: '[]' },
  { name: 'Problem Solving', normalizedName: 'problem solving', category: 'SOFT_SKILL', aliases: '["problem-solving"]' },
  { name: 'Teamwork', normalizedName: 'teamwork', category: 'SOFT_SKILL', aliases: '["team work"]' },
  { name: 'Excel', normalizedName: 'excel', category: 'DATA_SCIENCE', aliases: '["microsoft excel","spreadsheet"]' },
];

const roles = [
  {
    title: 'Data Scientist',
    description: 'Analyze complex data sets using machine learning and statistical methods',
    category: 'Data Science',
    level: 'Mid-Level',
    skills: [
      { skillName: 'python', proficiency: 'ADVANCED', weight: 2.0 },
      { skillName: 'machine learning', proficiency: 'ADVANCED', weight: 2.0 },
      { skillName: 'deep learning', proficiency: 'INTERMEDIATE', weight: 1.5 },
      { skillName: 'sql', proficiency: 'INTERMEDIATE', weight: 1.5 },
      { skillName: 'pandas', proficiency: 'ADVANCED', weight: 1.5 },
      { skillName: 'numpy', proficiency: 'ADVANCED', weight: 1.0 },
      { skillName: 'tensorflow', proficiency: 'INTERMEDIATE', weight: 1.0 },
      { skillName: 'pytorch', proficiency: 'INTERMEDIATE', weight: 1.0 },
      { skillName: 'scikit-learn', proficiency: 'ADVANCED', weight: 1.5 },
      { skillName: 'data analysis', proficiency: 'ADVANCED', weight: 1.5 },
      { skillName: 'communication', proficiency: 'INTERMEDIATE', weight: 0.5 },
    ],
  },
  {
    title: 'Backend Developer',
    description: 'Build and maintain server-side applications and APIs',
    category: 'Software Engineering',
    level: 'Mid-Level',
    skills: [
      { skillName: 'python', proficiency: 'ADVANCED', weight: 2.0 },
      { skillName: 'javascript', proficiency: 'ADVANCED', weight: 1.5 },
      { skillName: 'node.js', proficiency: 'INTERMEDIATE', weight: 1.5 },
      { skillName: 'express', proficiency: 'INTERMEDIATE', weight: 1.5 },
      { skillName: 'fastapi', proficiency: 'INTERMEDIATE', weight: 1.5 },
      { skillName: 'sql', proficiency: 'ADVANCED', weight: 2.0 },
      { skillName: 'postgresql', proficiency: 'INTERMEDIATE', weight: 1.5 },
      { skillName: 'mongodb', proficiency: 'INTERMEDIATE', weight: 1.0 },
      { skillName: 'docker', proficiency: 'INTERMEDIATE', weight: 1.0 },
      { skillName: 'git', proficiency: 'ADVANCED', weight: 1.0 },
      { skillName: 'rest api', proficiency: 'ADVANCED', weight: 1.5 },
      { skillName: 'linux', proficiency: 'INTERMEDIATE', weight: 0.5 },
    ],
  },
  {
    title: 'Frontend Developer',
    description: 'Build responsive and interactive user interfaces',
    category: 'Software Engineering',
    level: 'Mid-Level',
    skills: [
      { skillName: 'javascript', proficiency: 'ADVANCED', weight: 2.0 },
      { skillName: 'typescript', proficiency: 'INTERMEDIATE', weight: 1.5 },
      { skillName: 'react', proficiency: 'ADVANCED', weight: 2.0 },
      { skillName: 'html', proficiency: 'ADVANCED', weight: 1.5 },
      { skillName: 'css', proficiency: 'ADVANCED', weight: 1.5 },
      { skillName: 'git', proficiency: 'INTERMEDIATE', weight: 1.0 },
      { skillName: 'rest api', proficiency: 'INTERMEDIATE', weight: 1.0 },
      { skillName: 'ui/ux design', proficiency: 'BEGINNER', weight: 0.5 },
    ],
  },
  {
    title: 'Full Stack Developer',
    description: 'Build end-to-end web applications',
    category: 'Software Engineering',
    level: 'Mid-Level',
    skills: [
      { skillName: 'javascript', proficiency: 'ADVANCED', weight: 2.0 },
      { skillName: 'typescript', proficiency: 'INTERMEDIATE', weight: 1.5 },
      { skillName: 'react', proficiency: 'ADVANCED', weight: 1.5 },
      { skillName: 'node.js', proficiency: 'ADVANCED', weight: 2.0 },
      { skillName: 'express', proficiency: 'ADVANCED', weight: 1.5 },
      { skillName: 'sql', proficiency: 'INTERMEDIATE', weight: 1.5 },
      { skillName: 'postgresql', proficiency: 'INTERMEDIATE', weight: 1.0 },
      { skillName: 'mongodb', proficiency: 'INTERMEDIATE', weight: 1.0 },
      { skillName: 'docker', proficiency: 'BEGINNER', weight: 0.5 },
      { skillName: 'git', proficiency: 'ADVANCED', weight: 1.0 },
      { skillName: 'html', proficiency: 'ADVANCED', weight: 1.0 },
      { skillName: 'css', proficiency: 'ADVANCED', weight: 1.0 },
      { skillName: 'rest api', proficiency: 'ADVANCED', weight: 1.5 },
    ],
  },
  {
    title: 'DevOps Engineer',
    description: 'Manage CI/CD pipelines and cloud infrastructure',
    category: 'DevOps',
    level: 'Mid-Level',
    skills: [
      { skillName: 'docker', proficiency: 'ADVANCED', weight: 2.0 },
      { skillName: 'kubernetes', proficiency: 'ADVANCED', weight: 2.0 },
      { skillName: 'aws', proficiency: 'ADVANCED', weight: 2.0 },
      { skillName: 'linux', proficiency: 'ADVANCED', weight: 2.0 },
      { skillName: 'git', proficiency: 'ADVANCED', weight: 1.5 },
      { skillName: 'python', proficiency: 'INTERMEDIATE', weight: 1.0 },
      { skillName: 'gcp', proficiency: 'INTERMEDIATE', weight: 1.0 },
      { skillName: 'azure', proficiency: 'INTERMEDIATE', weight: 1.0 },
    ],
  },
  {
    title: 'ML Engineer',
    description: 'Deploy and optimize machine learning models in production',
    category: 'AI/ML',
    level: 'Mid-Level',
    skills: [
      { skillName: 'python', proficiency: 'ADVANCED', weight: 2.0 },
      { skillName: 'machine learning', proficiency: 'ADVANCED', weight: 2.0 },
      { skillName: 'deep learning', proficiency: 'ADVANCED', weight: 2.0 },
      { skillName: 'tensorflow', proficiency: 'ADVANCED', weight: 1.5 },
      { skillName: 'pytorch', proficiency: 'ADVANCED', weight: 1.5 },
      { skillName: 'docker', proficiency: 'INTERMEDIATE', weight: 1.0 },
      { skillName: 'aws', proficiency: 'INTERMEDIATE', weight: 1.0 },
      { skillName: 'sql', proficiency: 'INTERMEDIATE', weight: 1.0 },
      { skillName: 'git', proficiency: 'ADVANCED', weight: 1.0 },
    ],
  },
  {
    title: 'Data Analyst',
    description: 'Analyze data and create visualizations for business insights',
    category: 'Data Science',
    level: 'Entry-Level',
    skills: [
      { skillName: 'sql', proficiency: 'ADVANCED', weight: 2.0 },
      { skillName: 'python', proficiency: 'INTERMEDIATE', weight: 1.5 },
      { skillName: 'pandas', proficiency: 'ADVANCED', weight: 1.5 },
      { skillName: 'data analysis', proficiency: 'ADVANCED', weight: 2.0 },
      { skillName: 'communication', proficiency: 'INTERMEDIATE', weight: 1.0 },
      { skillName: 'excel', proficiency: 'ADVANCED', weight: 1.0 },
    ],
  },
  {
    title: 'Product Manager',
    description: 'Lead product strategy and cross-functional team coordination',
    category: 'Product',
    level: 'Mid-Level',
    skills: [
      { skillName: 'communication', proficiency: 'ADVANCED', weight: 2.0 },
      { skillName: 'leadership', proficiency: 'ADVANCED', weight: 2.0 },
      { skillName: 'problem solving', proficiency: 'ADVANCED', weight: 2.0 },
      { skillName: 'teamwork', proficiency: 'ADVANCED', weight: 1.5 },
      { skillName: 'data analysis', proficiency: 'INTERMEDIATE', weight: 1.0 },
    ],
  },
];

async function main() {
  console.log('Seeding database...');

  const createdSkills = new Map<string, string>();
  for (const skill of skills) {
    const created = await prisma.skill.upsert({
      where: { normalizedName: skill.normalizedName },
      update: {},
      create: {
        name: skill.name,
        normalizedName: skill.normalizedName,
        category: skill.category,
        aliases: skill.aliases,
      },
    });
    createdSkills.set(created.normalizedName, created.id);
  }
  console.log(`Created ${createdSkills.size} skills`);

  for (const role of roles) {
    const createdRole = await prisma.role.upsert({
      where: { title: role.title },
      update: {},
      create: {
        title: role.title,
        description: role.description,
        category: role.category,
        level: role.level,
      },
    });

    for (const skillReq of role.skills) {
      const skillId = createdSkills.get(skillReq.skillName);
      if (skillId) {
        await prisma.roleSkill.upsert({
          where: { roleId_skillId: { roleId: createdRole.id, skillId } },
          update: {},
          create: {
            roleId: createdRole.id,
            skillId,
            proficiency: skillReq.proficiency,
            weight: skillReq.weight,
            isRequired: true,
          },
        });
      }
    }
    console.log(`Created role: ${role.title}`);
  }

  console.log('Seed complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
