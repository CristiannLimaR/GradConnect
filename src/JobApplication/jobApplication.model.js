import mongoose from 'mongoose';
import autopopulate from 'mongoose-autopopulate';

const jobApplicationSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    autopopulate: true
  },
  ofertaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobOffer',
    required: true,
    autopopulate: true
  },
  fechaPostulacion: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: String,
    enum: ['pendiente', 'aceptado', 'rechazado'],
    default: 'pendiente'
  },
  mensajeCandidato: {
    type: String
  }
});

jobApplicationSchema.plugin(autopopulate);

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
