import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import appRoutes from "./src/routes"
import { errorHandler } from "./src/middlewares/errorHandler.middleware";
import swaggerJSDoc from 'swagger-jsdoc';
import { swaggerOptions } from './src/configs/swagger';
import swaggerUi from 'swagger-ui-express';
dotenv.config();
const app = express();

app.use(express.json())
   .use(express.urlencoded({ extended: true }))
   .use(cors());

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(appRoutes);
app.use(errorHandler)


app.listen(3000, () => console.log("Server is running"));

