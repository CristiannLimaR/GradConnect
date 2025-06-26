import JobApplication from './jobApplication.model.js';
import User from '../users/user.model.js';

export const createJobApplication = async (req, res) => {
  try {
    const { ofertaId, mensajeCandidato } = req.body;

    const nuevaSolicitud = new JobApplication({
      usuarioId: req.user._id,
      ofertaId,
      mensajeCandidato
    });

    await nuevaSolicitud.save();
    res.status(201).json({
      message: 'Solicitud creada con éxito',
      solicitud: nuevaSolicitud
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllApplications = async (req, res) => {
  try {
    const solicitudes = await JobApplication.find();
    res.json(solicitudes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

export const updateApplicationStatus = async (req, res) => {
  try {
    const { estado } = req.body;

    if (!['pendiente', 'aceptado', 'rechazado'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const solicitud = await JobApplication.findByIdAndUpdate(
      req.params.id,
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
