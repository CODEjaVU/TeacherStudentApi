import { Student } from '@prisma/client';
import { prisma } from '../lib/prisma';

export class StudentRepository {
  public async findByEmail(email: string): Promise<Student | null> {
    return prisma.student.findUnique({
      where: { email },
    });
  }

  public async findByEmails(
    emails: string[],
  ): Promise<Student[]> {
    return prisma.student.findMany({
      where: {
        email: { in: emails },
      },
    });
  }

  public async updateStudentSuspended(
    email: string,
    isSuspended: boolean,
  ): Promise<Student> {
    return prisma.student.update({
      where: { email },
      data: { isSuspended },
    });
  }

  public async findByEmailsWhereNotSuspended(
    emails: string[],
  ): Promise<Student[]> {
    return prisma.student.findMany({
      where: {
        email: { in: emails },
        isSuspended: false,
      },
    });
  }

  public async findByTeacherId(teacherId: string): Promise<Student[]> {
    return prisma.student.findMany({
      where: {
        teachers: {
          some: { id: teacherId }, 
        },
      },
      include: {
        teachers: {
          select: { id: true }, 
        },
      },
    });
  }

  public async findByTeacherIds(teacherIds: string[]): Promise<Student[]> {
    return prisma.student.findMany({
      where: {
        teachers: {
          some: { id: { in: teacherIds } }, 
        },
      },
      include: {
        teachers: {
          select: { id: true }, 
        },
      },
    });
  }
}