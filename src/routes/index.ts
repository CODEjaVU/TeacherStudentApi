import teacherRoutes from './teacher.routes';
import { Router } from 'express';

const routes = Router();

routes.use('/api', teacherRoutes);

export default routes;