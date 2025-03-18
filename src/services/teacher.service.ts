import { TeacherRepository } from '../repositories/teacher.repository';
import { StudentRepository } from '../repositories/student.repository';
import extractEmailsFromNotification from "../utils/getEmailFromNoti";
import { StudentNotFoundError, TeacherNotFoundError } from '../errors/NotFoundError';
const teacherRepo = new TeacherRepository();
const studentRepo = new StudentRepository();


export const registerStudent = async (teacherEmail: string, studentEmails: string[]) => {
    const teacher = await teacherRepo.findByEmail(teacherEmail);

    if (!teacher)  throw new TeacherNotFoundError();
    const students = await studentRepo.findByEmails(studentEmails);
    if (students.length === 0) throw new StudentNotFoundError();

    await teacherRepo.registerStudent(teacher.id, students.map(s => s.id));
};


export const getCommonStudents = async (teacherEmails: string[]) => {
        const teachers = await teacherRepo.findManyByEmails(teacherEmails);
     
        if (teachers.length === 0 || teachers.length !== teacherEmails.length)  throw new TeacherNotFoundError();   
        const students = await studentRepo.findByTeacherIds(teachers.map(t => t.id));
        return students;
};

export const suspendStudent = async (studentEmail: string) => {
    const student = await studentRepo.findByEmail(studentEmail);
    if (!student) throw new StudentNotFoundError();
    await studentRepo.updateStudentSuspended(student.email, true);
};


//MUST NOT be suspended,
// AND MUST fulfill AT LEAST ONE of the following:
// is registered with teacherEmail
// included in the notification
export const notifyStudent = async (teacherEmail: string, notification: string) => {
    const studentEmails = extractEmailsFromNotification(notification);
    //const studentEmails = extractEmailsFromNotification("Hello studentjon@gmail.com and also studentmark@gmail.com last but not least studentstella@gmail.com");
    console.log("studentEmails", studentEmails);
    const teacher = await teacherRepo.findByEmail(teacherEmail);

    if (!teacher)  throw new TeacherNotFoundError();
    // TODO registered Student can also be suspended so 
    const registeredStudents = await studentRepo.findByTeacherId(teacher.id);

    const mentionedStudents = await studentRepo.findByEmailsWhereNotSuspended(studentEmails);

    const relevantStudents = [...registeredStudents, ...mentionedStudents];

    // using filter to remove duplicates 
    return relevantStudents.map(s => s.email).filter((value, index, self) => self.indexOf(value) === index);
};