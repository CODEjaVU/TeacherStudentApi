import { z } from 'zod';
export const registerSchema = z.object({
  body: z.object({
    teacher: z.string().email(),
    students: z.array(z.string().email()).nonempty(),
  }),
});

export const commonStudentsSchema = z.object({
  query: z.object({
    teacher: z
      .union([z.string().email(), z.array(z.string().email())])
      .optional(),
  }),
});

export const notificationsSchema = z.object({
  body: z.object({
    teacher: z.string().email(),
    notification: z.string().min(1),
  }),
});

export const suspendSchema = z.object({
  body: z.object({
    student: z.string().email(),
  }),
});