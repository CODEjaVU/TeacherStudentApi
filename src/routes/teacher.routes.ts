import { Router } from 'express';
import {
    registerStudentController,
    suspendStudentController,
    notifyStudentController,
  getCommonStudentsController,
} from '../controllers/teacher.controller';
import { validatePayload } from '../middlewares/validation.middleware';
import {
  commonStudentsSchema,
  notificationsSchema,
  suspendSchema,
  registerSchema,
} from '../validations/validationSchema';

const router = Router();

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register one or more students to a specified teacher
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teacher:
 *                 type: string
 *               students:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       204:
 *         description: No Content
 *       400:
 *         description: Validation error
 */
router.post(
  '/register',
  validatePayload(registerSchema),
  registerStudentController,
);

/**
 * @swagger
 * /api/commonstudents:
 *   get:
 *     summary: Retrieve list of students common to a given list of teachers
 *     parameters:
 *       - name: teacher
 *         in: query
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *     responses:
 *       200:
 *         description: Returns the list of students
 */
router.get(
  '/commonstudents',
  validatePayload(commonStudentsSchema),
  getCommonStudentsController,
);

/**
 * @swagger
 * /api/suspend:
 *   post:
 *     summary: Suspend a specified student
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               student:
 *                 type: string
 *     responses:
 *       204:
 *         description: No Content
 */
router.post(
  '/suspend',
  validatePayload(suspendSchema),
  suspendStudentController,
);

/**
 * @swagger
 * /api/retrievefornotifications:
 *   post:
 *     summary: Retrieve list of students who can receive a given notification
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               teacher:
 *                 type: string
 *               notification:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns the list of recipient emails
 */
router.post(
  '/retrievefornotifications',
  validatePayload(notificationsSchema),
  notifyStudentController,
);

export default router;