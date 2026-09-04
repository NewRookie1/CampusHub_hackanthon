import { roleRepository } from '../repositories/roleRepository.js';
import { scheduleRepository } from '../repositories/scheduleRepository.js';
import { skillIntelligence } from './skillIntelligence.js';
import { resumeService } from './resumeService.js';
import { resumeRepository } from '../repositories/resumeRepository.js';
import {
  GeneratedSchedule,
  ScheduleDay,
  ScheduleTopic,
} from '../interfaces/skill.js';
import { AppError } from '../utils/AppError.js';

function uuid(): string {
  return 'xxxx-xxxx-xxxx'.replace(/x/g, () => ((Math.random() * 16) | 0).toString(16));
}

class PlannerService {
  async generateSchedule(params: {
    userId: string;
    targetRole: string;
    roleId?: string;
    availableDays: number;
    hoursPerDay: number;
    startDate?: string;
    priorities?: string[];
    includeInterviewPrep?: boolean;
  }): Promise<GeneratedSchedule> {
    const { userId, targetRole, roleId, availableDays, hoursPerDay, startDate, priorities, includeInterviewPrep } = params;

    let role;
    if (roleId) {
      role = await roleRepository.findById(roleId);
    } else {
      role = await skillIntelligence.getRoleByTitle(targetRole);
    }
    if (!role) throw new AppError(`Role "${targetRole}" not found`, 404, 'ROLE_NOT_FOUND');

    const roleSkills = await skillIntelligence.getRoleSkills(role.id);
    if (roleSkills.length === 0) {
      throw new AppError('No skills defined for this role', 400, 'NO_ROLE_SKILLS');
    }

    let missingSkills: Array<{ name: string; weight: number; proficiency: string }> = [];
    try {
      const resumes = await resumeRepository.findByUser(userId);
      if (resumes.length > 0) {
        const resumeSkills = await resumeService.getResumeSkills(resumes[0].id);
        const gapAnalysis = await skillIntelligence.analyzeSkillGap(resumeSkills, roleSkills);
        missingSkills = gapAnalysis.missingSkills.map(s => ({
          name: s.name,
          weight: 1.0,
          proficiency: s.proficiency,
        }));
      }
    } catch {
      missingSkills = roleSkills.map(rs => ({
        name: rs.skill.name,
        weight: rs.weight,
        proficiency: rs.proficiency,
      }));
    }

    if (missingSkills.length === 0) {
      missingSkills = roleSkills.map(rs => ({
        name: rs.skill.name,
        weight: rs.weight,
        proficiency: rs.proficiency,
      }));
    }

    if (priorities && priorities.length > 0) {
      missingSkills.sort((a, b) => {
        const aPriority = priorities.findIndex(p => a.name.toLowerCase().includes(p.toLowerCase()));
        const bPriority = priorities.findIndex(p => b.name.toLowerCase().includes(p.toLowerCase()));
        return (aPriority === -1 ? 999 : aPriority) - (bPriority === -1 ? 999 : bPriority);
      });
    } else {
      missingSkills.sort((a, b) => b.weight - a.weight);
    }

    const schedule = this.buildSchedule({
      missingSkills,
      availableDays,
      hoursPerDay,
      startDate: startDate || new Date().toISOString().split('T')[0],
      includeInterviewPrep: includeInterviewPrep ?? true,
    });

    const generatedSchedule: GeneratedSchedule = {
      title: `${role.title} Preparation Plan`,
      description: `Personalized ${availableDays}-day preparation plan for ${role.title}`,
      totalDays: availableDays,
      hoursPerDay,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: this.calculateEndDate(startDate || new Date().toISOString().split('T')[0], availableDays),
      schedule,
      metadata: {
        targetRole: role.title,
        roleId: role.id,
        missingSkillsCount: missingSkills.length,
      },
    };

    await scheduleRepository.create({
      userId,
      roleId: role.id,
      title: generatedSchedule.title,
      description: generatedSchedule.description,
      totalDays: availableDays,
      hoursPerDay,
      startDate: new Date(generatedSchedule.startDate),
      endDate: new Date(generatedSchedule.endDate),
      scheduleData: JSON.stringify(generatedSchedule.schedule),
    });

    return generatedSchedule;
  }

  private buildSchedule(params: {
    missingSkills: Array<{ name: string; weight: number; proficiency: string }>;
    availableDays: number;
    hoursPerDay: number;
    startDate: string;
    includeInterviewPrep: boolean;
  }): ScheduleDay[] {
    const { missingSkills, availableDays, hoursPerDay, startDate, includeInterviewPrep } = params;
    const schedule: ScheduleDay[] = [];

    const includeInterview = includeInterviewPrep && availableDays > 6;
    const interviewDays = includeInterview ? Math.max(2, Math.min(Math.floor(availableDays * 0.1), availableDays - 3)) : 0;
    const projectDays = Math.min(Math.max(1, Math.floor(availableDays * 0.15)), availableDays - interviewDays - 1);
    const revisionDays = Math.min(Math.max(1, Math.floor(availableDays * 0.1)), availableDays - interviewDays - projectDays);
    const learningDays = Math.max(1, availableDays - interviewDays - projectDays - revisionDays);

    let dayNumber = 1;
    let currentDate = new Date(startDate);

    const fundamentalsHours = Math.min(hoursPerDay * 0.5, 2);
    schedule.push({
      day: dayNumber,
      date: currentDate.toISOString().split('T')[0],
      topics: [
        {
          id: uuid(),
          title: 'Fundamentals Review',
          description: `Review core fundamentals for ${missingSkills[0]?.name || 'target role'}`,
          type: 'fundamentals',
          estimatedHours: fundamentalsHours,
        },
        {
          id: uuid(),
          title: `Introduction to ${missingSkills[0]?.name || 'Key Skill'}`,
          description: `Learn the basics of ${missingSkills[0]?.name || 'key skill'}`,
          skillName: missingSkills[0]?.name,
          type: 'skill',
          estimatedHours: hoursPerDay - fundamentalsHours,
        },
      ],
      totalHours: hoursPerDay,
    });
    dayNumber++;
    currentDate.setDate(currentDate.getDate() + 1);

    let skillIndex = 0;

    while (dayNumber <= learningDays && skillIndex < missingSkills.length) {
      const topicsForDay: ScheduleTopic[] = [];
      let hoursUsed = 0;

      while (hoursUsed < hoursPerDay && skillIndex < missingSkills.length) {
        const skill = missingSkills[skillIndex];
        const skillHours = Math.min(hoursPerDay - hoursUsed, 2.5);

        topicsForDay.push({
          id: uuid(),
          title: `Learn ${skill.name}`,
          description: `Study and practice ${skill.name} - focus on ${skill.proficiency} level`,
          skillName: skill.name,
          type: 'skill',
          estimatedHours: skillHours,
        });

        hoursUsed += skillHours;
        skillIndex++;

        if (hoursUsed >= hoursPerDay - 1) break;
      }

      if (topicsForDay.length === 0) {
        topicsForDay.push({
          id: uuid(),
          title: 'Practice & Coding Challenges',
          description: 'Solve coding problems and practice exercises',
          type: 'practice',
          estimatedHours: hoursPerDay,
        });
      }

      schedule.push({
        day: dayNumber,
        date: currentDate.toISOString().split('T')[0],
        topics: topicsForDay,
        totalHours: hoursPerDay,
      });
      dayNumber++;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    while (dayNumber <= learningDays) {
      schedule.push({
        day: dayNumber,
        date: currentDate.toISOString().split('T')[0],
        topics: [
          {
            id: uuid(),
            title: 'Practice & Coding Challenges',
            description: 'Apply learned skills through coding challenges',
            type: 'practice',
            estimatedHours: hoursPerDay * 0.5,
          },
          {
            id: uuid(),
            title: 'Project Work',
            description: 'Work on a hands-on project to demonstrate skills',
            type: 'project',
            estimatedHours: hoursPerDay * 0.5,
          },
        ],
        totalHours: hoursPerDay,
      });
      dayNumber++;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    for (let i = 0; i < projectDays && dayNumber <= availableDays; i++) {
      schedule.push({
        day: dayNumber,
        date: currentDate.toISOString().split('T')[0],
        topics: [
          {
            id: uuid(),
            title: 'Project Development',
            description: `Build a project demonstrating ${missingSkills.slice(0, 3).map(s => s.name).join(', ')}`,
            type: 'project',
            estimatedHours: hoursPerDay,
            skillName: missingSkills[0]?.name,
          },
        ],
        totalHours: hoursPerDay,
      });
      dayNumber++;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    for (let i = 0; i < revisionDays && dayNumber <= availableDays; i++) {
      schedule.push({
        day: dayNumber,
        date: currentDate.toISOString().split('T')[0],
        topics: [
          {
            id: uuid(),
            title: 'Revision & Review',
            description: 'Review all learned skills and concepts',
            type: 'revision',
            estimatedHours: hoursPerDay,
          },
        ],
        totalHours: hoursPerDay,
      });
      dayNumber++;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    for (let i = 0; i < interviewDays && dayNumber <= availableDays; i++) {
      const topics: ScheduleTopic[] = [];
      if (i === 0) {
        topics.push({
          id: uuid(),
          title: 'Interview Preparation - Technical',
          description: 'Practice technical interview questions and coding challenges',
          type: 'interview_prep',
          estimatedHours: hoursPerDay * 0.6,
        });
        topics.push({
          id: uuid(),
          title: 'Mock Technical Interview',
          description: 'Simulate a technical interview session',
          type: 'interview_prep',
          estimatedHours: hoursPerDay * 0.4,
        });
      } else {
        topics.push({
          id: uuid(),
          title: 'Interview Preparation - Behavioral',
          description: 'Prepare behavioral interview responses using STAR method',
          type: 'interview_prep',
          estimatedHours: hoursPerDay * 0.5,
        });
        topics.push({
          id: uuid(),
          title: 'Final Review & Portfolio',
          description: 'Final review of all skills and portfolio preparation',
          type: 'interview_prep',
          estimatedHours: hoursPerDay * 0.5,
        });
      }

      schedule.push({
        day: dayNumber,
        date: currentDate.toISOString().split('T')[0],
        topics,
        totalHours: hoursPerDay,
      });
      dayNumber++;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return schedule;
  }

  private calculateEndDate(startDate: string, days: number): string {
    const end = new Date(startDate);
    end.setDate(end.getDate() + days - 1);
    return end.toISOString().split('T')[0];
  }

  async getSchedule(scheduleId: string) {
    const schedule = await scheduleRepository.findById(scheduleId);
    if (!schedule) throw new AppError('Schedule not found', 404, 'NOT_FOUND');
    return schedule;
  }

  async getUserSchedules(userId: string) {
    return scheduleRepository.findByUser(userId);
  }

  async updateProgress(scheduleId: string, day: number, topicId: string, completed: boolean) {
    const schedule = await scheduleRepository.findById(scheduleId);
    if (!schedule) throw new AppError('Schedule not found', 404, 'NOT_FOUND');

    let scheduleData: any[];
    try {
      scheduleData = JSON.parse(schedule.scheduleData as string);
    } catch {
      scheduleData = [];
    }

    const dayData = scheduleData.find((d: any) => d.day === day);
    if (!dayData) throw new AppError('Day not found in schedule', 400, 'INVALID_DAY');

    const topic = dayData.topics.find((t: any) => t.id === topicId);
    if (!topic) throw new AppError('Topic not found in day', 400, 'INVALID_TOPIC');

    topic.completed = completed;

    let totalTopics = 0;
    let completedTopics = 0;
    for (const d of scheduleData) {
      for (const t of d.topics) {
        totalTopics++;
        if (t.completed) completedTopics++;
      }
    }

    const progress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

    await scheduleRepository.update(scheduleId, {
      scheduleData: JSON.stringify(scheduleData),
      progress,
    });

    return { progress, totalTopics, completedTopics };
  }
}

export const plannerService = new PlannerService();
