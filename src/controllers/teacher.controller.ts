import { Request, Response } from "express";

import { registerStudent, getCommonStudents, suspendStudent , notifyStudent } from "../services/teacher.service";
import logger from "../configs/logger";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../utils/catchAsync";
import transformEmail from "../utils/transformEmail";

export const registerStudentController = catchAsync(
    async (req: Request, res: Response) => {
      const { teacher, students } = req.body ;
      logger.info('Register students', {
        // requestId: (req as any).requestId,
        teacher,
        students,
      });
  
      await registerStudent(teacher, students);
      res.status(StatusCodes.NO_CONTENT).send();
    },
  );

export const getCommonStudentsController = catchAsync(
    async (req: Request, res: Response) => {
      const { teacher } = req.query;
      logger.info('Get common students', {
        // requestId: (req as any).requestId,
        teacher,
    })
    const teacherEmails: string[] = 
    typeof teacher === "string" ? [teacher] : 
    Array.isArray(teacher) ? teacher as string[] : 
    [];
      const commonStudents = await getCommonStudents(teacherEmails as string[]);
      const studentEmails = commonStudents.map(s => s.email);
      
      if (teacherEmails?.length === 1) {
        studentEmails.push(transformEmail(teacherEmails[0]));
      }
  
      const response = studentEmails.length > 0 ?
            { students: studentEmails }
          : { message: "No students found for given teachers" };

          res.status(StatusCodes.OK).json(response);
}
);

export const suspendStudentController = catchAsync(
    async (req: Request, res: Response) => {
      const { student } = req.body;
      logger.info('Suspend student', {
        // requestId: (req as any).requestId,
        student,
      });
  
      await suspendStudent(student);
      res.status(StatusCodes.NO_CONTENT).send();
    },
);

export const notifyStudentController = catchAsync(
    async (req: Request, res: Response) => {
      const { teacher, notification } = req.body;
      logger.info('Notify student', {
        // requestId: (req as any).requestId,
        teacher,
        notification,
      });
  
      const recipients = await notifyStudent(teacher, notification);
      const response = { recipients };
      res.status(StatusCodes.OK).json(response);
    },
);