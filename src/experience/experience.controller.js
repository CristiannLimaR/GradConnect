import Experience from "./experience.model.js";

export const saveExperience = async (req, res) => {
    try {
        const { title, company, startDate, endDate, description } = req.body;

        const newExperience = new Experience({
            user: req.user._id, 
            title,
            company,
            startDate,
            endDate,
            description,
        });

        const savedExperience = await newExperience.save();

        res.status(201).json({
            success: true,
            msg: "Experience saved successfully",
            experience: savedExperience,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error saving experience",
            error: error.message,
        });
    }
};

export const getExperiences = async (req, res) => {
    try {
        const experiences = await Experience.find()
            .populate("user")
            .populate("company", "name");

        res.status(200).json({
            success: true,
            msg: "Experiences fetched successfully",
            experiences,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error fetching experiences",
            error: error.message,
        });
    }
};

export const updateExperience = async (req, res) => {
    try {
        const { id } = req.params;
        const { user, title, company, startDate, endDate, description } = req.body;

        const updatedExperience = await Experience.findByIdAndUpdate(
            id,
            { user, title, company, startDate, endDate, description },
            { new: true }
        );

        res.status(200).json({
            success: true,
            msg: "Experience updated successfully",
            experience: updatedExperience,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error updating experience",
            error: error.message,
        });
    }
};

export const deleteExperience = async (req, res) => {
    try {
        const { id } = req.params;

        const deleteExperience = await Experience.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            msg: "Experience deleted successfully",
            experience: deleteExperience,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error deleting experience",
            error: error.message,
        });
    }
};
