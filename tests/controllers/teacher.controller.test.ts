import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  registerStudentController,
  getCommonStudentsController,
  suspendStudentController,
  notifyStudentController
} from '../../src/controllers/teacher.controller';
import * as teacherService from '../../src/services/teacher.service';
import transformEmail  from '../../src/utils/transformEmail';
import { TeacherNotFoundError, StudentNotFoundError } from '../../src/errors/NotFoundError';

// Mock dependencies
jest.mock('../../src/services/teacher.service');
jest.mock('../../src/utils/transformEmail');
jest.mock('../../src/utils/getEmailFromNoti');
jest.mock('../configs/logger', () => ({
  info: jest.fn(),
  error: jest.fn()
}));

describe('Teacher Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerStudentController', () => {
    it('should register students successfully', async () => {
      // Arrange
      mockRequest.body = {
        teacher: 'teacher@example.com',
        students: ['student1@example.com', 'student2@example.com']
      };
      const registerStudentMock = jest.spyOn(teacherService, 'registerStudent')
        .mockResolvedValueOnce(undefined);

      // Act
      await registerStudentController(mockRequest as Request, mockResponse as Response , mockNext);

      // Assert
      expect(registerStudentMock).toHaveBeenCalledWith(
        'teacher@example.com',
        ['student1@example.com', 'student2@example.com']
      );
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should handle errors when registering students', async () => {
      // Arrange
      mockRequest.body = {
        teacher: 'teacher@example.com',
        students: ['student1@example.com']
      };
      jest.spyOn(teacherService, 'registerStudent')
        .mockRejectedValueOnce(new TeacherNotFoundError());

      const mockCatchAsyncNext = jest.fn();
      const wrappedController = (req: Request, res: Response, next: any) => {
        return registerStudentController(req, res, next).catch(next);
      };

      // Act
      await wrappedController(mockRequest as Request, mockResponse as Response, mockCatchAsyncNext);

      // Assert
      expect(mockCatchAsyncNext).toHaveBeenCalledWith(expect.any(TeacherNotFoundError));
    });
  });

  describe('getCommonStudentsController', () => {
    it('should return common students for multiple teachers', async () => {
      // Arrange
      mockRequest.query = {
        teacher: ['teacher1@example.com', 'teacher2@example.com']
      };
      const mockStudents = [
        { id: "a", email: 'student1@example.com', isSuspended: false },
        { id: "b", email: 'student2@example.com', isSuspended: false }
      ];
      jest.spyOn(teacherService, 'getCommonStudents')
        .mockResolvedValueOnce(mockStudents as { id: string; email: string; isSuspended: boolean; }[]);

      // Act
      await getCommonStudentsController(mockRequest as Request, mockResponse as Response , mockNext);

      // Assert
      expect(teacherService.getCommonStudents).toHaveBeenCalledWith(
        ['teacher1@example.com', 'teacher2@example.com']
      );
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        students: ['student1@example.com', 'student2@example.com']
      });
    });

    it('should include transformed teacher email when only one teacher is specified', async () => {
      // Arrange
      mockRequest.query = {
        teacher: 'teacher1@example.com'
      };
      const mockStudents = [
        { id: "a", email: 'student1@example.com', isSuspended: false }
      ];
      jest.spyOn(teacherService, 'getCommonStudents')
        .mockResolvedValueOnce(mockStudents as { id: string; email: string; isSuspended: boolean; }[]);
      jest.spyOn(transformEmail as jest.Mock, 'mockImplementation')
        .mockReturnValueOnce('student_only_under_teacher_1@example.com');

      // Act
      await getCommonStudentsController(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(transformEmail).toHaveBeenCalledWith('teacher1@example.com');
      expect(mockResponse.json).toHaveBeenCalledWith({
        students: ['student1@example.com', 'student_only_under_teacher_1@example.com']
      });
    });

    it('should handle no students found', async () => {
      // Arrange
      mockRequest.query = {
        teacher: 'teacher1@example.com'
      };
      jest.spyOn(teacherService, 'getCommonStudents')
        .mockResolvedValueOnce([]);
      jest.spyOn(transformEmail as jest.Mock, 'mockImplementation')
        .mockReturnValueOnce('student_only_under_teacher_1@example.com');

      // Act
      await getCommonStudentsController(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        students: ['student_only_under_teacher_1@example.com']
      });
    });
  });

  describe('suspendStudentController', () => {
    it('should suspend a student successfully', async () => {
      // Arrange
      mockRequest.body = {
        student: 'student@example.com'
      };
      const suspendStudentMock = jest.spyOn(teacherService, 'suspendStudent')
        .mockResolvedValueOnce(undefined);

      // Act
      await suspendStudentController(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(suspendStudentMock).toHaveBeenCalledWith('student@example.com');
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should handle errors when student is not found', async () => {
      // Arrange
      mockRequest.body = {
        student: 'nonexistent@example.com'
      };
      jest.spyOn(teacherService, 'suspendStudent')
        .mockRejectedValueOnce(new StudentNotFoundError());

      const mockCatchAsyncNext = jest.fn();
      const wrappedController = (req: Request, res: Response, next: any) => {
        return suspendStudentController(req, res, next).catch(next);
      };

      // Act
      await wrappedController(mockRequest as Request, mockResponse as Response, mockCatchAsyncNext);

      // Assert
      expect(mockCatchAsyncNext).toHaveBeenCalledWith(expect.any(StudentNotFoundError));
    });
  });

  describe('notifyStudentController', () => {
    it('should notify students successfully', async () => {
      // Arrange
      mockRequest.body = {
        teacher: 'teacher@example.com',
        notification: 'Hello @student1@example.com'
      };
      const mockRecipients = ['student1@example.com', 'student2@example.com'];
      jest.spyOn(teacherService, 'notifyStudent')
        .mockResolvedValueOnce(mockRecipients);

      // Act
      await notifyStudentController(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(teacherService.notifyStudent).toHaveBeenCalledWith(
        'teacher@example.com',
        'Hello @student1@example.com'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        recipients: mockRecipients
      });
    });

    it('should handle errors when teacher is not found', async () => {
      // Arrange
      mockRequest.body = {
        teacher: 'nonexistent@example.com',
        notification: 'Hello @student1@example.com'
      };
      jest.spyOn(teacherService, 'notifyStudent')
        .mockRejectedValueOnce(new TeacherNotFoundError());

      const mockCatchAsyncNext = jest.fn();
      const wrappedController = (req: Request, res: Response, next: any) => {
        return notifyStudentController(req, res, next).catch(next);
      };

      // Act
      await wrappedController(mockRequest as Request, mockResponse as Response, mockCatchAsyncNext);

      // Assert
      expect(mockCatchAsyncNext).toHaveBeenCalledWith(expect.any(TeacherNotFoundError));
    });
  });
});