import { response } from "express";
import { hash } from "argon2";
import User from "./user.model.js";
import Enterprise from "../enterprise/enterprise.model.js";
import wOffer from "../workOffer/wOffer.model.js";
import JobApplication from "../JobApplication/jobApplication.model.js";

/**
 * Obtener estadísticas globales para AdminDashboard
 */
export const getAdminDashboardStats = async (req, res = response) => {
  try {
    // Usuarios
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: true });
    // Empresas
    const totalCompanies = await Enterprise.countDocuments();
    const activeCompanies = await Enterprise.countDocuments({ status: true });
    // Ofertas
    const totalJobs = await wOffer.countDocuments();
    const activeJobs = await wOffer.countDocuments({ status: true });
    // Aplicaciones este mes
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const applicationsThisMonth = await JobApplication.countDocuments({ fechaPostulacion: { $gte: startOfMonth } });
    // Nuevos usuarios este mes
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });
    res.json({
      totalUsers,
      totalCompanies,
      totalJobs,
      activeUsers,
      activeCompanies,
      activeJobs,
      applicationsThisMonth,
      newUsersThisMonth
    });
  } catch (error) {
    res.status(500).json({
      msg: 'Error obteniendo estadísticas globales',
      error: error.message
    });
  }
};


/**
 * Obtener un usuario por ID con toda su información
 */
export const getUserById = async (req, res = response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate({
        path: 'skills.skillId',
        select: 'nameSkill levelSkill category',
        model: 'Skill'
      })
      .select('-password'); // Excluir la contraseña por seguridad
    console.log(user)
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    // Filtrar skills que no se pudieron popular (skillId null)
    if (user.skills) {
      user.skills = user.skills.filter(skill => skill.skillId !== null);
    }

    res.status(200).json({
      success: true,
      msg: "User profile fetched successfully",
      user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      msg: "Error fetching user profile",
      error: error.message
    });
  }
};

/**
 * Obtener todos los usuarios activos
 */
export const getUsers = async (req, res = response) => {
  try {
    const users = await User.find({ status: true });

    res.status(200).json({
      success: true,
      msg: "Users fetched successfully",
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error fetching users",
      error: error.message
    });
  }
};

/**
 * Obtener habilidades de un usuario específico
 */
export const getUserSkills = async (req, res = response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      msg: "User skills fetched successfully",
      skills: user.skills
    });
  } catch (error) {
    console.error('Error fetching user skills:', error);
    res.status(500).json({
      success: false,
      msg: "Error fetching user skills",
      error: error.message
    });
  }
};

/**
 * Agregar habilidad a un usuario
 */
export const addUserSkill = async (req, res = response) => {
  try {
    const user = req.user;
    const { skillId, levelSkill = "BEGINNER" } = req.body;

    if (!skillId) {
      return res.status(400).json({
        success: false,
        msg: "skillId is required"
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    // Verificar si el skill existe en la base de datos global
    const Skill = (await import('../skills/skill.model.js')).default;
    const globalSkill = await Skill.findById(skillId);
    
    if (!globalSkill) {
      return res.status(404).json({
        success: false,
        msg: "Skill not found in global skills database"
      });
    }

    // Inicializar skills array si no existe
    if (!user.skills) {
      user.skills = [];
    }

    // Verificar si la habilidad ya existe para este usuario
    const existingSkill = user.skills.find(
      skill => skill.skillId && skill.skillId.toString() === skillId
    );

    if (existingSkill) {
      return res.status(400).json({
        success: false,
        msg: "Skill already exists for this user"
      });
    }

    // Agregar la nueva habilidad
    user.skills.push({
      skillId,
      levelSkill,
      addedAt: new Date()
    });

    await user.save();

    // Obtener la habilidad agregada con la información completa
    const populatedUser = await User.findById(user._id)
      .populate('skills.skillId', 'nameSkill levelSkill category');

    const addedSkill = populatedUser.skills[populatedUser.skills.length - 1];

    res.status(201).json({
      success: true,
      msg: "Skill added successfully",
      skill: addedSkill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error adding skill",
      error: error.message
    });
  }
};

/**
 * Actualizar habilidad de un usuario
 */
export const updateUserSkill = async (req, res = response) => {
  try {
    const { id, skillId } = req.params;
    const { levelSkill } = req.body;

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    const skillIndex = user.skills.findIndex(skill => skill.skillId.toString() === skillId);
    
    if (skillIndex === -1) {
      return res.status(404).json({
        success: false,
        msg: "Skill not found for this user"
      });
    }

    // Actualizar el nivel de la habilidad
    if (levelSkill) {
      user.skills[skillIndex].levelSkill = levelSkill;
    }

    await user.save();

    // Obtener la habilidad actualizada con la información completa
    const populatedUser = await User.findById(id)
      .populate('skills.skillId', 'nameSkill levelSkill category');

    res.status(200).json({
      success: true,
      msg: "Skill updated successfully",
      skill: populatedUser.skills[skillIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error updating skill",
      error: error.message
    });
  }
};

/**
 * Eliminar habilidad de un usuario
 */
export const deleteUserSkill = async (req, res = response) => {
  try {
    const { skillId } = req.params;
    const authenticatedUser = req.user;

    const user = await User.findById(authenticatedUser._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    console.log('Received skillId:', skillId);
    console.log('User skills:', user.skills.map(s => ({ _id: s._id.toString(), skillId: s.skillId })));

    const skillIndex = user.skills.findIndex(skill => skill._id.toString() === skillId);
    
    if (skillIndex === -1) {
      return res.status(404).json({
        success: false,
        msg: "Skill not found for this user"
      });
    }

    // Eliminar la habilidad
    const deletedSkill = user.skills.splice(skillIndex, 1)[0];
    await user.save();

    res.status(200).json({
      success: true,
      msg: "Skill deleted successfully",
      skill: deletedSkill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error deleting skill",
      error: error.message
    });
  }
};


/**
 * Actualizar información del usuario
 */
export const updateUser = async (req, res = response) => {
  try {
    const { id } = req.params;
    const { _id, password, email, summary, ...data } = req.body;

    if (password) {
      data.password = await hash(password);
    }

    // Handle Supabase PDF upload URL
    if (req.supabaseFileUrl) {
      data.cvAdjunto = req.supabaseFileUrl;
    }

    // Handle summary field mapping to descripcion for compatibility
    if (summary !== undefined) {
      data.descripcion = summary;
    }

    const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });

    res.status(200).json({
      success: true,
      msg: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error updating user",
      error: error.message
    });
  }
};

/**
 * Desactivar un usuario (soft delete)
 */
export const deleteUser = async (req, res = response) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(id, { status: false }, { new: true });

    res.status(200).json({
      success: true,
      msg: "User deleted (status set to false)",
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error deleting user",
      error: error.message
    });
  }
};

/**
 * Actualizar solo la contraseña
 */
export const updatedPassword = async (req, res = response) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        msg: "Password is required"
      });
    }

    const encryptedPassword = await hash(password);

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { password: encryptedPassword },
      { new: true }
    );

    res.status(200).json({
      success: true,
      msg: "Password updated successfully",
      updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error updating password",
      error: error.message
    });
  }
};

/**
 * Crear automáticamente un administrador GRADCONNECT si no existe
 */
export const crateAdmin = async () => {
  try {
    const adminD = await User.findOne({ email: "admin@gradconnect.com" });

    if (!adminD) {
      const passwordEncrypted = await hash("Admin123");

      const admin = new User({
        firstName: "Admin",
        lastName: "GradConnect",
        email: "admin@gradconnect.com",
        password: passwordEncrypted,
        role: "GRADCONNECT"
      });

      await admin.save();
      console.log("GradConnect admin created");
    } else {
      console.log("GradConnect admin already exists");
    }
  } catch (error) {
    console.error("Error creating admin:", error);
  }
};
