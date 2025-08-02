import Skill from "./skill.model.js";

// Create Global Skill (Admin only)
export const createGlobalSkill = async (req, res) => {
  try {
    const { nameSkill, levelSkill = "BEGINNER", category = "TECHNICAL" } = req.body;

    if (!nameSkill) {
      return res.status(400).json({ message: "nameSkill is required" });
    }

    const newSkill = new Skill({
      nameSkill: nameSkill.trim(),
      levelSkill,
      category
    });

    const savedSkill = await newSkill.save();
    res.status(201).json(savedSkill);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Skill already exists" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Error creating global skill:", error);
    res.status(500).json({ 
      message: "Error creating global skill", 
      error: error.message 
    });
  }
};

// Get All Global Skills
export const getAllGlobalSkills = async (req, res) => {
  try {
    const skills = await Skill.find({ status: true })
      .select('nameSkill levelSkill category')
      .sort({ nameSkill: 1 });
    
    res.status(200).json(skills);
  } catch (error) {
    console.error("Error fetching global skills:", error);
    res.status(500).json({ 
      message: "Error fetching global skills", 
      error: error.message 
    });
  }
};

// Get Global Skill by ID
export const getGlobalSkillById = async (req, res) => {
  try {
    const { skillId } = req.params;
    const skill = await Skill.findById(skillId);
    
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }
    
    res.status(200).json(skill);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid skill ID format" });
    }
    console.error("Error fetching skill by ID:", error);
    res.status(500).json({ 
      message: "Error fetching skill", 
      error: error.message 
    });
  }
};

// Update Global Skill (Admin only)
export const updateGlobalSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const updateData = req.body;

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
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid skill ID format" });
    }
    console.error("Error updating global skill:", error);
    res.status(500).json({ 
      message: "Error updating global skill", 
      error: error.message 
    });
  }
};

// Delete Global Skill (Admin only)
export const deleteGlobalSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const deletedSkill = await Skill.findByIdAndDelete(skillId);

    if (!deletedSkill) {
      return res.status(404).json({ message: "Skill not found" });
    }
    
    res.status(204).send();
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid skill ID format" });
    }
    console.error("Error deleting global skill:", error);
    res.status(500).json({ 
      message: "Error deleting global skill", 
      error: error.message 
    });
  }
};

// Search Global Skills
export const searchGlobalSkills = async (req, res) => {
  try {
    const { query, category } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ 
        message: "Query parameter is required and must be at least 2 characters long" 
      });
    }

    const searchQuery = {
      nameSkill: { $regex: query.trim(), $options: 'i' },
      status: true
    };

    if (category) {
      searchQuery.category = category;
    }

    const skills = await Skill.find(searchQuery)
      .select('_id nameSkill levelSkill category')
      .limit(10)
      .sort({ nameSkill: 1 });

    res.status(200).json(skills);
  } catch (error) {
    console.error("Error searching global skills:", error);
    res.status(500).json({ 
      message: "Error searching global skills", 
      error: error.message 
    });
  }
};

// Get Skills by Category
export const getSkillsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const skills = await Skill.find({ 
      category: category.toUpperCase(), 
      status: true 
    })
    .select('nameSkill levelSkill category')
    .sort({ nameSkill: 1 });

    res.status(200).json(skills);
  } catch (error) {
    console.error("Error fetching skills by category:", error);
    res.status(500).json({ 
      message: "Error fetching skills by category", 
      error: error.message 
    });
  }
};

// Bulk Import Global Skills (Admin only)
export const bulkImportSkills = async (req, res) => {
  try {
    const { skills } = req.body;

    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ 
        message: "Skills array is required and must not be empty" 
      });
    }

    const skillsToInsert = skills.map(skill => ({
      nameSkill: skill.nameSkill.trim(),
      levelSkill: skill.levelSkill || "BEGINNER",
      category: skill.category || "TECHNICAL",
      status: true
    }));

    const result = await Skill.insertMany(skillsToInsert, { 
      ordered: false,
      rawResult: true 
    });

    res.status(201).json({
      message: "Skills imported successfully",
      inserted: result.insertedCount,
      total: skills.length
    });
  } catch (error) {
    console.error("Error bulk importing skills:", error);
    res.status(500).json({ 
      message: "Error bulk importing skills", 
      error: error.message 
    });
  }
};
