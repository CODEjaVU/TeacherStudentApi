import { TeacherRepository } from '../../src/repositories/teacher.repository';
import { StudentRepository } from '../../src/repositories/student.repository';
import {
  registerStudent,
  getCommonStudents,
  suspendStudent,
  notifyStudent
} from '../../src/services/teacher.service';
import  extractEmailsFromNotification from '../../src/utils/getEmailFromNoti';
import { TeacherNotFoundError, StudentNotFoundError } from '../../src/errors/NotFoundError';

// Mock repositories
jest.mock('../repositories/teacher.repository');
jest.mock('../repositories/student.repository');
jest.mock('../utils/getEmailFromNoti');

describe('Teacher Service', () => {
  let mockTeacherRepo: jest.Mocked<TeacherRepository>;
  let mockStudentRepo: jest.Mocked<StudentRepository>;

  beforeEach(() => {
    mockTeacherRepo = new TeacherRepository() as jest.Mocked<TeacherRepository>;
    mockStudentRepo = new StudentRepository() as jest.Mocked<StudentRepository>;
    
    // Reset mocks for constructor instances
    (TeacherRepository as jest.Mock).mockImplementation(() => mockTeacherRepo);
    (StudentRepository as jest.Mock).mockImplementation(() => mockStudentRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerStudent', () => {
    it('should register students successfully', async () => {
      // Arrange
      const teacherEmail = 'teacher@example.com';
      const studentEmails = ['student1@example.com', 'student2@example.com'];
      const mockTeacher = { id: "a", email: teacherEmail };
      const mockStudents = [
        { id: "b", email: 'student1@example.com', isSuspended: false },
        { id: "c", email: 'student2@example.com', isSuspended: false }
      ];

      mockTeacherRepo.findByEmail.mockResolvedValueOnce(mockTeacher as { id: string; email: string; });
      mockStudentRepo.findByEmails.mockResolvedValueOnce(mockStudents as { id: string; email: string; isSuspended: boolean; }[]);
      mockTeacherRepo.registerStudent.mockResolvedValueOnce(undefined);

      // Act
      await registerStudent(teacherEmail, studentEmails);

      // Assert
      expect(mockTeacherRepo.findByEmail).toHaveBeenCalledWith(teacherEmail);
      expect(mockStudentRepo.findByEmails).toHaveBeenCalledWith(studentEmails);
      expect(mockTeacherRepo.registerStudent).toHaveBeenCalledWith(1, [1, 2]);
    });

    it('should throw TeacherNotFoundError when teacher does not exist', async () => {
      // Arrange
      const teacherEmail = 'nonexistent@example.com';
      const studentEmails = ['student1@example.com'];

      mockTeacherRepo.findByEmail.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(registerStudent(teacherEmail, studentEmails))
        .rejects.toThrow(TeacherNotFoundError);
      expect(mockTeacherRepo.registerStudent).not.toHaveBeenCalled();
    });

    it('should throw StudentNotFoundError when no students exist', async () => {
      // Arrange
      const teacherEmail = 'teacher@example.com';
      const studentEmails = ['nonexistent@example.com'];
      const mockTeacher = { id: "a", email: teacherEmail };

      mockTeacherRepo.findByEmail.mockResolvedValueOnce(mockTeacher as { id: string; email: string; });
      mockStudentRepo.findByEmails.mockResolvedValueOnce([]);

      // Act & Assert
      await expect(registerStudent(teacherEmail, studentEmails))
        .rejects.toThrow(StudentNotFoundError);
      expect(mockTeacherRepo.registerStudent).not.toHaveBeenCalled();
    });
  });

  describe('getCommonStudents', () => {
    it('should return common students for given teachers', async () => {
      // Arrange
      const teacherEmails = ['teacher1@example.com', 'teacher2@example.com'];
      const mockTeachers = [
        { id: "a", email: 'teacher1@example.com' },
        { id: "b", email: 'teacher2@example.com' }
      ];
      const mockStudents = [
        { id: "c", email: 'student1@example.com', isSuspended: false },
        { id: "d", email: 'student2@example.com', isSuspended: false }
      ];

      mockTeacherRepo.findManyByEmails.mockResolvedValueOnce(mockTeachers);
      mockStudentRepo.findByTeacherIds.mockResolvedValueOnce(mockStudents as { id: string; email: string; isSuspended: boolean; }[]);

      // Act
      const result = await getCommonStudents(teacherEmails);

      // Assert
      expect(mockTeacherRepo.findManyByEmails).toHaveBeenCalledWith(teacherEmails);
      expect(mockStudentRepo.findByTeacherIds).toHaveBeenCalledWith([1, 2]);
      expect(result).toEqual(mockStudents);
    });

    it('should throw TeacherNotFoundError when not all teachers exist', async () => {
      // Arrange
      const teacherEmails = ['teacher1@example.com', 'nonexistent@example.com'];
      const mockTeachers = [{ id: "a", email: 'teacher1@example.com' }];

      mockTeacherRepo.findManyByEmails.mockResolvedValueOnce(mockTeachers as { id: string; email: string; }[]);

      // Act & Assert
      await expect(getCommonStudents(teacherEmails))
        .rejects.toThrow(TeacherNotFoundError);
      expect(mockStudentRepo.findByTeacherIds).not.toHaveBeenCalled();
    });

    it('should throw TeacherNotFoundError when no teachers are found', async () => {
      // Arrange
      const teacherEmails = ['nonexistent1@example.com', 'nonexistent2@example.com'];

      mockTeacherRepo.findManyByEmails.mockResolvedValueOnce([]);

      // Act & Assert
      await expect(getCommonStudents(teacherEmails))
        .rejects.toThrow(TeacherNotFoundError);
      expect(mockStudentRepo.findByTeacherIds).not.toHaveBeenCalled();
    });
  });

  describe('suspendStudent', () => {
    it('should suspend a student successfully', async () => {
      // Arrange
      const studentEmail = 'student@example.com';
      const mockStudent = { id: 'a', email: studentEmail, isSuspended: false };

      mockStudentRepo.findByEmail.mockResolvedValueOnce( mockStudent as { id: string; email: string; isSuspended: boolean; });
      mockStudentRepo.updateStudentSuspended.mockResolvedValueOnce(undefined);

      // Act
      await suspendStudent(studentEmail);

      // Assert
      expect(mockStudentRepo.findByEmail).toHaveBeenCalledWith(studentEmail);
      expect(mockStudentRepo.updateStudentSuspended).toHaveBeenCalledWith(studentEmail, true);
    });

    it('should throw StudentNotFoundError when student does not exist', async () => {
      // Arrange
      const studentEmail = 'nonexistent@example.com';

      mockStudentRepo.findByEmail.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(suspendStudent(studentEmail))
        .rejects.toThrow(StudentNotFoundError);
      expect(mockStudentRepo.updateStudentSuspended).not.toHaveBeenCalled();
    });
  });

  describe('notifyStudent', () => {
    it('should notify relevant students correctly', async () => {
      // Arrange
      const teacherEmail = 'teacher@example.com';
      const notification = 'Hello @student1@example.com and @student2@example.com';
      const extractedEmails = ['student1@example.com', 'student2@example.com'];
      const mockTeacher = { id: "a", email: teacherEmail };
      const registeredStudents = [
        { id: "a", email: 'student1@example.com', isSuspended: false },
        { id: "b", email: 'student3@example.com', isSuspended: false }
      ];
      const mentionedStudents = [
        { id: "c", email: 'student1@example.com', isSuspended: false },
        { id: "d", email: 'student2@example.com', isSuspended: false }
      ];

      (extractEmailsFromNotification as jest.Mock).mockReturnValueOnce(extractedEmails);
      mockTeacherRepo.findByEmail.mockResolvedValueOnce(mockTeacher as { id: string; email: string; });
      mockStudentRepo.findByTeacherId.mockResolvedValueOnce(registeredStudents);
      mockStudentRepo.findByEmailsWhereNotSuspended.mockResolvedValueOnce(mentionedStudents);

      // Act
      const result = await notifyStudent(teacherEmail, notification);

      // Assert
      expect(extractEmailsFromNotification).toHaveBeenCalledWith(notification);
      expect(mockTeacherRepo.findByEmail).toHaveBeenCalledWith(teacherEmail);
      expect(mockStudentRepo.findByTeacherId).toHaveBeenCalledWith(1);
      expect(mockStudentRepo.findByEmailsWhereNotSuspended).toHaveBeenCalledWith(extractedEmails);
      // Check for duplicate removal
      expect(result).toEqual(['student1@example.com', 'student3@example.com', 'student2@example.com']);
    });

    it('should throw TeacherNotFoundError when teacher does not exist', async () => {
      // Arrange
      const teacherEmail = 'nonexistent@example.com';
      const notification = 'Hello @student1@example.com';
      const extractedEmails = ['student1@example.com'];

      (extractEmailsFromNotification as jest.Mock).mockReturnValueOnce(extractedEmails);
      mockTeacherRepo.findByEmail.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(notifyStudent(teacherEmail, notification))
        .rejects.toThrow(TeacherNotFoundError);
      expect(mockStudentRepo.findByTeacherId).not.toHaveBeenCalled();
      expect(mockStudentRepo.findByEmailsWhereNotSuspended).not.toHaveBeenCalled();
    });
  });
});