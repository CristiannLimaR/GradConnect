import express from "express";
import cors from "cors";
import helmet from "helmet";
import User from "../src/users/user.model.js";
import morgan from "morgan";
import { hash } from "argon2";
import { createServer } from "http";
import { Server } from "socket.io";
import { dbConnection } from "./mongo.js";
import userRoutes from "../src/users/user.routes.js";
import authRoutes from "../src/auth/auth.routes.js";
import wOfferRoutes from "../src/workOffer/wOffer.routes.js";
import experienRoutes from '../src/experience/experience.routes.js';
import educationRoutes from '../src/education/education.routes.js';
import jobApplicationRoutes from '../src/JobApplication/jobApplication.routes.js';
import enterpriseRoutes from '../src/enterprise/enterprise.routes.js';
import skillRoutes from '../src/skills/skill.routes.js';
import messageRoutes from '../src/messages/message.routes.js';

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
  app.use("/gradConnect/v1/enterprise", enterpriseRoutes);
  app.use("/gradConnect/v1/skills", skillRoutes);
  app.use("/gradConnect/v1/messages", messageRoutes);
};

const conectarDb = async () => {
  try {
    await dbConnection();
    console.log("MongoDB | Conectado");
    await crearAdmin();
  } catch (error) {
    console.log("Error al conectarse a la DB:", error);
  }
};

const crearAdmin = async () => {
  try {
    const admin = await User.findOne({ firstName: "Admin" });
    const encryptedPassword = await hash("admin12345");
    if (!admin) {
      await User.create({
        firstName: "Admin",
        lastName: "GradConnect",
        email: "admin23@admin.com",
        password: encryptedPassword,
        role: "GRADCONNECT"
      });
      console.log("Admin creado");
    }
  } catch (error) {
    console.log("Error al crear admin:", error);
  }
};

export const initServer = () => {
  const app = express();
  const server = createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // URL del frontend
      methods: ["GET", "POST"]
    }
  });
  const port = process.env.PORT || 3000;

  // Hacer io disponible en toda la aplicación
  app.set('io', io);

  middlewares(app);
  routes(app);
  conectarDb();

  // Configurar Socket.IO
  io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);

    // Unirse a una sala específica del usuario
    socket.on('join', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`Usuario ${userId} se unió a su sala`);
    });

    // Manejar desconexión
    socket.on('disconnect', () => {
      console.log('Usuario desconectado:', socket.id);
    });

    // Manejar eventos de mensajes en tiempo real
    socket.on('sendMessage', (messageData) => {
      // Emitir el mensaje al receptor
      socket.to(`user_${messageData.receiverId}`).emit('newMessage', messageData);
    });

    // Manejar typing indicators
    socket.on('typing', (data) => {
      socket.to(`user_${data.receiverId}`).emit('userTyping', {
        senderId: data.senderId,
        conversationId: data.conversationId
      });
    });

    socket.on('stopTyping', (data) => {
      socket.to(`user_${data.receiverId}`).emit('userStoppedTyping', {
        senderId: data.senderId,
        conversationId: data.conversationId
      });
    });
  });

  // Middleware global de manejo de errores
  app.use((err, req, res, next) => {
    console.error('Error:', err); // Muestra el error completo en consola
    res.status(500).json({
      error: err.message || err.toString(),
      details: err.stack || err
    });
  });

  server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📡 Socket.IO server ready`);
  });
};

