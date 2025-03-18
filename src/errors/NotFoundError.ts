import { CustomError } from "./CustomError";
import { StatusCodes } from "http-status-codes";
export class NotFoundError extends CustomError {
    constructor(message: string) {
        super(message, StatusCodes.NOT_FOUND);
    }
}

export class StudentNotFoundError extends CustomError {
    constructor(message = "Student not found") { 
      super(message,StatusCodes.NOT_FOUND); 
    }
  }
  
  // Teacher Not Found Error
export class TeacherNotFoundError extends CustomError {
    constructor(message = "Teacher not found") { 
      super(message, StatusCodes.NOT_FOUND); 
    }
  }