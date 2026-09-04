import pdfParse from 'pdf-parse';
import { resumeRepository } from '../repositories/resumeRepository.js';
import { skillIntelligence } from './skillIntelligence.js';
import { SkillWithProficiency } from '../interfaces/skill.js';
import { AppError } from '../utils/AppError.js';

class ResumeService {
  async uploadResume(userId: string, file: Express.Multer.File): Promise<string> {
    let parsedText = '';

    if (file.mimetype === 'application/pdf') {
      const data = await pdfParse(file.buffer);
      parsedText = data.text;
    } else if (file.mimetype === 'text/plain') {
      parsedText = file.buffer.toString('utf-8');
    } else {
      throw new AppError('Unsupported file format. Please upload PDF or text file.', 400, 'INVALID_FILE_TYPE');
    }

    if (!parsedText.trim()) {
      throw new AppError('Could not extract text from the resume.', 400, 'EMPTY_RESUME');
    }

    const resume = await resumeRepository.create({
      user: { connect: { id: userId } },
      fileName: file.originalname,
      fileUrl: `/uploads/${file.originalname}`,
      fileSize: file.size,
      mimeType: file.mimetype,
      parsedText,
    });

    const skills = await skillIntelligence.extractSkillsFromText(parsedText);
    if (skills.length > 0) {
      const skillEntries = await Promise.all(
        skills.map(async (s) => {
          const skill = await skillIntelligence.findOrCreateSkill(s.name);
          return {
            skillId: skill.id,
            confidence: s.confidence,
            context: s.context || undefined,
          };
        })
      );

      await resumeRepository.addSkills(
        resume.id,
        skillEntries.map(e => ({
          skillId: e.skillId,
          confidence: e.confidence,
          context: e.context,
        }))
      );
    }

    return resume.id;
  }

  async getResumeById(resumeId: string) {
    const resume = await resumeRepository.findById(resumeId);
    if (!resume) throw new AppError('Resume not found', 404, 'NOT_FOUND');
    return resume;
  }

  async getUserResumes(userId: string) {
    return resumeRepository.findByUser(userId);
  }

  async getResumeSkills(resumeId: string): Promise<SkillWithProficiency[]> {
    const resumeSkills = await resumeRepository.getSkills(resumeId);
    return resumeSkills.map((rs: any) => ({
      id: rs.skill.id,
      name: rs.skill.name,
      normalizedName: rs.skill.normalizedName,
      category: rs.skill.category,
      description: rs.skill.description,
      aliases: rs.skill.aliases,
      proficiency: rs.proficiency,
      confidence: rs.confidence,
      context: rs.context,
    }));
  }

  async deleteResume(resumeId: string, userId: string): Promise<void> {
    const resume = await resumeRepository.findById(resumeId);
    if (!resume) throw new AppError('Resume not found', 404, 'NOT_FOUND');
    if ((resume as any).userId !== userId) throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    await resumeRepository.delete(resumeId);
  }
}

export const resumeService = new ResumeService();
