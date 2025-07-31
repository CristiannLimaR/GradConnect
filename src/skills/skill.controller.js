import Skill from "./skill.model.js";

// Create Skill
export const createSkill = async (req, res) => {
  try {
    const { nameSkill, levelSkill } = req.body;

    if (!nameSkill) {
      return res
        .status(400)
        .json({ message: "nameSkill is required" });
    }

    const newSkill = new Skill({
      nameSkill,
      levelSkill, // El valor predeterminado será 'PRINCIPIANTE' si no se proporciona, según el esquema
      userId: req.user._id,
    });

    const savedSkill = await newSkill.save();
    res.status(201).json(savedSkill);
    } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Error creating skill:", error);
    res
      .status(500)
      .json({ message: "Error creating skill", error: error.message });
  }
};

// Get All Skills (for a specific user)
export const getSkillsByUser = async (req, res) => {
  try {
    const { userId } = req.params; // Suponiendo que userId se pasa como parámetro de URL
    if (!userId) {
      return res.status(400).json({ message: "userId parameter is required" });
    }
    const skills = await Skill.find({ userId: userId });
    res.status(200).json(skills);
  } catch (error) {
    console.error("Error fetching skills by user:", error);
    res
      .status(500)
      .json({ message: "Error fetching skills", error: error.message });
  }
};

// Get Skill by ID
export const getSkillById = async (req, res) => {
  try {
    const { skillId } = req.params;
    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }
    res.status(200).json(skill);
  } catch (error) {
    console.error("Error fetching skill by ID:", error);
    // Maneje CastError específicamente si el formato de ID no es válido para MongoDB ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid skill ID format" });
    }
    res
      .status(500)
      .json({ message: "Error fetching skill", error: error.message });
  }
};

// Update Skill
export const updateSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const updateData = req.body; // e.g., { nameSkill, levelSkill }

    // Evitar que el ID de usuario se actualice directamente a través de esta ruta por motivos de seguridad y coherencia.
    if (updateData.userId) {
      delete updateData.userId;
    }
    // Evitar que el estado se actualice directamente a través de este punto de actualización general.
    // Podría necesitarse un punto de actualización independiente para los cambios de estado (p. ej., activar/desactivar).
    if (typeof updateData.status !== "undefined") {
      delete updateData.status;
    }

    const updatedSkill = await Skill.findByIdAndUpdate(skillId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedSkill) {
      return res.status(404).json({ message: "Skill not found" });
    }
    res.status(200).json(updatedSkill);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    // Maneje CastError específicamente si el formato de ID no es válido para MongoDB ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid skill ID format" });
    }
    console.error("Error updating skill:", error);
    res
      .status(500)
      .json({ message: "Error updating skill", error: error.message });
  }
};

// Delete Skill
export const deleteSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const deletedSkill = await Skill.findByIdAndDelete(skillId);

    if (!deletedSkill) {
      return res.status(404).json({ message: "Skill not found" });
    }
    res.status(204).send(); // Sin contenido, eliminación exitosa
  } catch (error) {
    // Maneje CastError específicamente si el formato de ID no es válido para MongoDB ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid skill ID format" });
    }
    console.error("Error deleting skill:", error);
    res
      .status(500)
      .json({ message: "Error deleting skill", error: error.message });
  }
};

/*Podría ser útil tener una forma de obtener TODAS las habilidades para fines administrativos,
pero para funciones orientadas al usuario, getSkillsByUser es más apropiado.*/
export const getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.find();
    res.status(200).json(skills);
  } catch (error) {
    console.error("Error fetching all skills:", error);
    res
      .status(500)
      .json({ message: "Error fetching all skills", error: error.message });
  }
};