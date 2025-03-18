import transformEmails from "../../src/utils/transformEmail";
describe('transformEmail', () => {
    it('should transform teacher email to student format', () => {
      const teacherEmail = 'teacher1@example.com';
      
      const result = transformEmails(teacherEmail);
      
      expect(result).toBe('student_only_under_teacher_1@example.com');
    });

    it('should leave non-teacher emails unchanged', () => {
      const nonTeacherEmail = 'student@example.com';
      
      const result = transformEmails(nonTeacherEmail);
      
      expect(result).toBe('student@example.com');
    });
  });