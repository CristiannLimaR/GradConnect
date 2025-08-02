import Message from './message.model.js';
import User from '../users/user.model.js';
import Enterprise from '../enterprise/enterprise.model.js';
import wOffer from '../workOffer/wOffer.model.js';

// Enviar un nuevo mensaje
const sendMessage = async (req, res) => {
  try {
    const { receiverId, receiverType, content, jobOfferId } = req.body;
    let senderId = req.user.id;
    let senderType = 'User';

    // Si el usuario es un recruiter, necesitamos encontrar su empresa
    if (req.user.role === 'RECRUITER') {
      const enterprise = await Enterprise.findOne({ recruiters: req.user.id });
      if (!enterprise) {
        return res.status(404).json({
          success: false,
          message: 'Empresa no encontrada para este reclutador'
        });
      }
      senderId = enterprise._id;
      senderType = 'Enterprise';
    }

    // Validar que el receptor existe
    const ReceiverModel = receiverType === 'Enterprise' ? Enterprise : User;
    const receiver = await ReceiverModel.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receptor no encontrado'
      });
    }

    // Generar ID de conversación
    // Siempre usar userId y enterpriseId en el orden correcto, independientemente de quién envía
    let userId, enterpriseId;
    
    if (senderType === 'User') {
      userId = senderId;
      enterpriseId = receiverId;
    } else {
      userId = receiverId;
      enterpriseId = senderId;
    }
    
    // Buscar si ya existe una conversación entre estos usuarios
    // para preservar el jobOfferId original
    const existingMessage = await Message.findOne({
      $or: [
        { sender: userId, receiver: enterpriseId },
        { sender: enterpriseId, receiver: userId }
      ]
    }).sort({ createdAt: -1 });
    
    // Si existe una conversación previa, usar su jobOfferId
    const finalJobOfferId = existingMessage ? existingMessage.jobOfferId : jobOfferId;
    
    // Debug: Log the values being used to generate conversationId
    console.log('=== DEBUG sendMessage conversationId generation ===');
    console.log('senderType:', senderType);
    console.log('senderId:', senderId);
    console.log('receiverId:', receiverId);
    console.log('userId:', userId);
    console.log('enterpriseId:', enterpriseId);
    console.log('original jobOfferId:', jobOfferId);
    console.log('existingMessage jobOfferId:', existingMessage ? existingMessage.jobOfferId : 'none');
    console.log('final jobOfferId:', finalJobOfferId);
    
    const conversationId = Message.generateConversationId(userId, enterpriseId, finalJobOfferId);
    console.log('Generated conversationId:', conversationId);
    console.log('=== END DEBUG ===');

    // Crear el mensaje
    const message = new Message({
      conversationId,
      sender: senderId,
      senderModel: senderType,
      receiver: receiverId,
      receiverModel: receiverType,
      content,
      jobOfferId: finalJobOfferId || null
    });

    await message.save();

    // Poblar los datos del mensaje para la respuesta
    await message.populate([
      { path: 'sender', select: 'firstName lastName name' },
      { path: 'receiver', select: 'firstName lastName name' },
      { path: 'jobOfferId', select: 'title' }
    ]);

    // Emitir evento de socket para tiempo real
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${receiverId}`).emit('newMessage', message);
    }

    res.status(201).json({
      success: true,
      message: 'Mensaje enviado correctamente',
      data: message
    });

  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener conversaciones del usuario
const getConversations = async (req, res) => {
  try {
    let userId = req.user.id;
    let userType = 'User';

    // Si el usuario es un recruiter, necesitamos encontrar su empresa
    if (req.user.role === 'RECRUITER') {
      const enterprise = await Enterprise.findOne({ recruiters: req.user.id });
      if (!enterprise) {
        return res.status(404).json({
          success: false,
          message: 'Empresa no encontrada para este reclutador'
        });
      }
      userId = enterprise._id;
      userType = 'Enterprise';
    }

    const conversations = await Message.getConversations(userId, userType);

    // Poblar información adicional
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = conv.lastMessage;
        
        // Determinar quién es el otro participante
        const isUserSender = lastMessage.sender.toString() === userId;
        const otherParticipantId = isUserSender ? lastMessage.receiver : lastMessage.sender;
        const otherParticipantType = isUserSender ? lastMessage.receiverModel : lastMessage.senderModel;

        // Obtener información del otro participante
        const OtherModel = otherParticipantType === 'Enterprise' ? Enterprise : User;
        const otherParticipant = await OtherModel.findById(otherParticipantId)
          .select('firstName lastName name email');

        // Obtener información de la oferta de trabajo si existe
        let jobOffer = null;
        if (lastMessage.jobOfferId) {
          jobOffer = await wOffer.findById(lastMessage.jobOfferId)
            .select('title');
        }

        return {
          conversationId: conv._id,
          otherParticipant: {
            id: otherParticipant._id,
            name: otherParticipant.name || `${otherParticipant.firstName} ${otherParticipant.lastName}`,
            email: otherParticipant.email,
            type: otherParticipantType
          },
          jobOffer,
          lastMessage: {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            isFromMe: isUserSender
          },
          unreadCount: conv.unreadCount
        };
      })
    );

    res.json({
      success: true,
      data: populatedConversations
    });

  } catch (error) {
    console.error('Error al obtener conversaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener mensajes de una conversación específica
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    let userId = req.user.id;

    // Si el usuario es un recruiter, necesitamos encontrar su empresa
    if (req.user.role === 'RECRUITER') {
      const enterprise = await Enterprise.findOne({ recruiters: req.user.id });
      if (!enterprise) {
        return res.status(404).json({
          success: false,
          message: 'Empresa no encontrada para este reclutador'
        });
      }
      userId = enterprise._id;
    }

    // Verificar que el usuario es parte de la conversación
    const userInConversation = await Message.findOne({
      conversationId,
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    });

    if (!userInConversation) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta conversación'
      });
    }

    const messages = await Message.find({ conversationId, status: true })
      .populate({
        path: 'sender',
        select: '_id firstName lastName name'
      })
      .populate({
        path: 'receiver',
        select: '_id firstName lastName name'
      })
      .populate('jobOfferId', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Debug: Log message data
    console.log('=== DEBUG getMessages ===');
    console.log('ConversationId:', conversationId);
    console.log('UserId:', userId);
    console.log('Messages found:', messages.length);
    if (messages.length > 0) {
      console.log('First message sample:', {
        id: messages[0]._id,
        sender: messages[0].sender,
        senderModel: messages[0].senderModel,
        receiver: messages[0].receiver,
        receiverModel: messages[0].receiverModel,
        content: messages[0].content.substring(0, 20) + '...'
      });
    }
    console.log('=== END DEBUG getMessages ===');

    // Marcar mensajes como leídos
    await Message.updateMany(
      {
        conversationId,
        receiver: userId,
        isRead: false
      },
      { isRead: true }
    );

    res.json({
      success: true,
      data: messages.reverse() // Revertir para mostrar más antiguos primero
    });

  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Marcar mensajes como leídos
const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    let userId = req.user.id;

    // Si el usuario es un recruiter, necesitamos encontrar su empresa
    if (req.user.role === 'RECRUITER') {
      const enterprise = await Enterprise.findOne({ recruiters: req.user.id });
      if (!enterprise) {
        return res.status(404).json({
          success: false,
          message: 'Empresa no encontrada para este reclutador'
        });
      }
      userId = enterprise._id;
    }

    await Message.updateMany(
      {
        conversationId,
        receiver: userId,
        isRead: false
      },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'Mensajes marcados como leídos'
    });

  } catch (error) {
    console.error('Error al marcar mensajes como leídos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Iniciar conversación con un candidato
const startConversationWithCandidate = async (req, res) => {
  try {
    const { candidateId, jobOfferId, initialMessage } = req.body;
    const userId = req.user.id;

    // Verificar que el usuario es un recruiter y encontrar su empresa
    if (req.user.role !== 'RECRUITER') {
      return res.status(403).json({
        success: false,
        message: 'Solo los reclutadores pueden iniciar conversaciones'
      });
    }

    // Buscar la empresa a la que pertenece este recruiter
    const enterprise = await Enterprise.findOne({ recruiters: userId });
    if (!enterprise) {
      return res.status(404).json({
        success: false,
        message: 'Empresa no encontrada para este reclutador'
      });
    }

    const enterpriseId = enterprise._id;

    // Verificar que el candidato existe
    const candidate = await User.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidato no encontrado'
      });
    }

    // Verificar que la oferta de trabajo existe si se proporciona
    if (jobOfferId) {
      const jobOffer = await wOffer.findById(jobOfferId);
      if (!jobOffer) {
        return res.status(404).json({
          success: false,
          message: 'Oferta de trabajo no encontrada'
        });
      }
    }

    // Generar ID de conversación
    // Usar el mismo orden que en sendMessage: userId (candidateId) primero, enterpriseId segundo
    console.log('=== DEBUG startConversationWithCandidate conversationId generation ===');
    console.log('candidateId:', candidateId);
    console.log('enterpriseId:', enterpriseId);
    console.log('jobOfferId:', jobOfferId);
    
    const conversationId = Message.generateConversationId(candidateId, enterpriseId, jobOfferId);
    console.log('Generated conversationId:', conversationId);
    console.log('=== END DEBUG ===');

    // Crear mensaje inicial si se proporciona
    if (initialMessage) {
      const message = new Message({
        conversationId,
        sender: enterpriseId,
        senderModel: 'Enterprise',
        receiver: candidateId,
        receiverModel: 'User',
        content: initialMessage,
        jobOfferId: jobOfferId || null
      });

      await message.save();

      // Emitir evento de socket
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${candidateId}`).emit('newMessage', message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Conversación iniciada correctamente',
      data: { conversationId }
    });

  } catch (error) {
    console.error('Error al iniciar conversación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

export default {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  startConversationWithCandidate
};
