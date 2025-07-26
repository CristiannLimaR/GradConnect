import Education from './education.model.js';
import User from '../users/user.model.js';

export const createEducation = async (req, res) => {
    const { institution, degree, startDate, endDate, description } = req.body;

    try {
        const education = new Education({
            user: req.user._id,
            institution,
            degree,
            startDate,
            endDate,
            description
        });
        await education.save();

        res.status(201).json({
            success: true,
            msg: 'Educación creada exitosamente',
            education
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al crear la educación',
            error: error.message
        });
    }
};

export const getEducations = async (req, res) => {
    try {
        const educations = await Education.find({ user: req.user._id });

        res.status(200).json({
            success: true,
            msg: 'Educación obtenida exitosamente',
            educations
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al obtener la educación',
            error: error.message
        });
    }
};

export const updateEducation = async (req, res) => {
    const { id } = req.params;
    const { institution, degree, startDate, endDate, description } = req.body;

    try {
        const education = await Education.findByIdAndUpdate(id, {
            institution,
            degree,
            startDate,
            endDate,
            description
        }, { new: true });

        res.status(200).json({
            success: true,
            msg: 'Educación actualizada exitosamente',
            education
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al actualizar la educación',
            error: error.message
        });
    }
};

export const deleteEducation = async (req, res) => {
    const { id } = req.params;

    try {
       const education = await Education.findByIdAndUpdate(id, { status: false });

        res.status(200).json({
            success: true,
            msg: 'Educación eliminada exitosamente'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al eliminar la educación',
            error: error.message
        });
    }
};




