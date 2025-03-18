/**
 * Helper function to extract emails from a given notification
 * @param notification
 * @returns
 */
 const extractEmailsFromNotification = (notification: string) => {
    const pattern = /(@[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]{2,})/g;
    const emails = notification.match(pattern) || [];
    return emails.map((email) => email.substring(1));
  };
export default extractEmailsFromNotification;