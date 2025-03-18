
import extractEmailsFromNotification  from '../../src/utils/getEmailFromNoti';


describe('extractEmailsFromNotification', () => {
    it('should extract emails from notification text', () => {
      const notification = 'Hello @student1@example.com and also @student2@gmail.com';
      
      const result = extractEmailsFromNotification(notification);
      expect(result).toEqual(['student1@example.com', 'student2@gmail.com']);
    });

    it('should return empty array when no emails in notification', () => {
      const notification = 'Hello everyone, no emails here';
      
      const result = extractEmailsFromNotification(notification);
      
      expect(result).toEqual([]);
    });

    it('should handle multiple occurrences of the same email', () => {
      const notification = 'Hello @student1@example.com, please contact @student1@example.com';
      
      const result = extractEmailsFromNotification(notification);
      
      expect(result).toEqual(['student1@example.com', 'student1@example.com']);
    });
  });