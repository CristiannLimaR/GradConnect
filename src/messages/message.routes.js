import express from 'express';
import messageController from './message.controller.js';
import { validateJWT } from '../middlewares/validate-jwt.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(validateJWT);

// Enviar un nuevo mensaje
router.post('/send', messageController.sendMessage);

// Obtener todas las conversaciones del usuario
router.get('/conversations', messageController.getConversations);

// Obtener mensajes de una conversación específica
router.get('/conversation/:conversationId', messageController.getMessages);

// Marcar mensajes como leídos
router.put('/conversation/:conversationId/read', messageController.markAsRead);

// Iniciar conversación con un candidato (solo para empresas)
router.post('/start-conversation', messageController.startConversationWithCandidate);

export default router;
