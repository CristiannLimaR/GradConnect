import Experience from "./experience.model.js";

export const saveExperience = async (req, res) => {
    try {
        const { title, company, startDate, endDate, description, isCurrent } = req.body;

        const newExperience = new Experience({
            user: req.user._id, 
            title,
            company,
            startDate,
            endDate: isCurrent ? null : endDate,
            description,
            isCurrent: !!isCurrent,
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
        const experiences = await Experience.find({user: req.user._id})

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
        const { user, title, company, startDate, endDate, description, isCurrent } = req.body;

        const updatedExperience = await Experience.findByIdAndUpdate(
            id,
            {
                user,
                title,
                company,
                startDate,
                endDate: isCurrent ? null : endDate,
                description,
                isCurrent: !!isCurrent,
            },
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
        console.log("Intentando eliminar experiencia con ID:", id);


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

// Get experience data for a specific user by userId (for viewing other users' profiles)
export const getExperiencesByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const experiences = await Experience.find({ user: userId });

        res.status(200).json({
            success: true,
            msg: "Experiences retrieved successfully",
            experiences
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error retrieving experiences",
            error: error.message
        });
    }
};
