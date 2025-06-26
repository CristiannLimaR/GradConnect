import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { dbConnection } from "./mongo.js";
import userRoutes from "../src/users/user.routes.js";
import authRoutes from "../src/auth/auth.routes.js";
import wOfferRoutes from "../src/workOffer/wOffer.routes.js";
import experienRoutes from '../src/experience/experience.routes.js';
import educationRoutes from '../src/education/education.routes.js';
import userRoutes from '../src/users/user.routes.js';
import authRoutes from '../src/auth/auth.routes.js';
import jobApplicationRoutes from '../src/JobApplication/jobApplication.routes.js';

const middlewares = (app) => {
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(cors());
  app.use(helmet());
  app.use(morgan("dev"));
};

const routes = (app) => {
  app.use("/gradConnect/v1/auth", authRoutes);
  app.use("/gradConnect/v1/user", userRoutes);
  app.use("/gradConnect/v1/wOffer", wOfferRoutes);
  app.use("/gradConnect/v1/experience", experienRoutes);
  app.use("/gradConnect/v1/solicitudes", jobApplicationRoutes);
  app.use("/gradConnect/v1/education", educationRoutes);
};

const conectarDb = async () => {
  try {
    await dbConnection();
    console.log("MongoDB | Conectado");
  } catch (error) {
    console.log("Error al conectarse a la DB:", error);
  }
};

export const initServer = () => {
  const app = express();
  const port = process.env.PORT || 3002;

  middlewares(app);
  routes(app);
  conectarDb();

  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
};

