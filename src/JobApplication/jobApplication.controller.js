import wOffer from '../workOffer/wOffer.model.js';
import JobApplication from './jobApplication.model.js';

// Crear nueva postulación
export const createJobApplication = async (req, res) => {
  try {
    const { ofertaId, mensajeCandidato } = req.body;

    // Validar que el usuario no haya aplicado ya a esta oferta
    const yaExiste = await JobApplication.findOne({
      usuarioId: req.user._id,
      ofertaId
    });

    if (yaExiste) {
      return res.status(400).json({
        error: 'Ya has aplicado a esta oferta de trabajo.'
      });
    }

    const nuevaSolicitud = new JobApplication({
      usuarioId: req.user._id,
      ofertaId,
      mensajeCandidato
    });

    await nuevaSolicitud.save();

    // Agregar la postulación a la oferta si no existe aún
    await wOffer.findByIdAndUpdate(ofertaId, {
      $addToSet: { applications: nuevaSolicitud._id }
    });

    res.status(201).json({
      message: 'Solicitud creada con éxito',
      solicitud: nuevaSolicitud
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener todas las postulaciones
export const getAllApplications = async (req, res) => {
  try {
    const solicitudes = await JobApplication.find();
    res.json(solicitudes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener una postulación por ID
export const getApplicationById = async (req, res) => {
  try {
    const solicitud = await JobApplication.findById(req.params.id);
    if (!solicitud) {
      return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
    }
    res.json(solicitud);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar el estado de una postulación (se envía el ID desde el frontend)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId, estado } = req.body;

    if (!['pendiente', 'aceptado', 'rechazado'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const solicitud = await JobApplication.findByIdAndUpdate(
      applicationId,
      { estado },
      { new: true }
    );

    if (!solicitud) {
      return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
    }

    res.json({
      message: 'Estado actualizado con éxito',
      solicitud
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// GET /gradconnect/v1/solicitudes/usuario/:id
// Obtener las postulaciones de un usuario
export const getApplicationsByUser = async (req, res) => {
  try {
    const userId = req.user._id;

    // Filtramos solo los campos que necesitamos de la oferta
    const applications = await JobApplication.find({ usuarioId: userId })
      .populate('ofertaId', 'isApplicated title description company location modality salary ubication closingDate skills status') // solo los campos que necesitamos
      .exec();

    res.status(200).json({
      ok: true,
      applications
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: 'Error al obtener postulaciones del usuario',
      error: error.message
    });
  }
};
