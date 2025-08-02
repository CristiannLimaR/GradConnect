import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['User', 'Enterprise']
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'receiverModel'
  },
  receiverModel: {
    type: String,
    required: true,
    enum: ['User', 'Enterprise']
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'image'],
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  jobOfferId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'wOffer',
    required: false
  },
  status: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices compuestos para mejor rendimiento
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ receiver: 1, isRead: 1 });

// Método para generar ID de conversación único
messageSchema.statics.generateConversationId = function(userId, enterpriseId, jobOfferId = null) {
  console.log('=== DEBUG generateConversationId ===');
  console.log('Raw userId:', userId, 'Type:', typeof userId);
  console.log('Raw enterpriseId:', enterpriseId, 'Type:', typeof enterpriseId);
  console.log('Raw jobOfferId:', jobOfferId, 'Type:', typeof jobOfferId);
  
  // Convertir a strings para asegurar ordenamiento consistente
  const userIdStr = userId.toString();
  const enterpriseIdStr = enterpriseId.toString();
  const jobOfferIdStr = (jobOfferId && jobOfferId !== null && jobOfferId !== 'null') ? jobOfferId.toString() : null;
  
  console.log('String userIdStr:', userIdStr);
  console.log('String enterpriseIdStr:', enterpriseIdStr);
  console.log('String jobOfferIdStr:', jobOfferIdStr);
  
  // Siempre poner userId primero, enterpriseId segundo (sin ordenamiento)
  // para mantener consistencia semántica
  const result = jobOfferIdStr ? `${userIdStr}_${enterpriseIdStr}_${jobOfferIdStr}` : `${userIdStr}_${enterpriseIdStr}`;
  console.log('Final conversationId result:', result);
  console.log('=== END DEBUG generateConversationId ===');
  
  return result;
};

// Método para obtener conversaciones de un usuario
messageSchema.statics.getConversations = function(userId, userType) {
  const matchField = userType === 'User' ? 'sender' : 'receiver';
  const otherField = userType === 'User' ? 'receiver' : 'sender';
  
  return this.aggregate([
    {
      $match: {
        $or: [
          { sender: new mongoose.Types.ObjectId(userId) },
          { receiver: new mongoose.Types.ObjectId(userId) }
        ],
        status: true
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$receiver', new mongoose.Types.ObjectId(userId)] },
                  { $eq: ['$isRead', false] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $sort: { 'lastMessage.createdAt': -1 }
    }
  ]);
};

export default mongoose.model('Message', messageSchema);
