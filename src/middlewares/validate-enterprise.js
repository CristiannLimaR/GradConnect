import Enterprise from "../enterprise/enterprise.model.js";
import User from "../users/user.model.js";

export const canSaveEnterprise = (req, res, next) => {
    

    const { name, address, contactNumber, email, type, size, recruiters, industry, logo, description } = req.body;

    if (!name || !address || !contactNumber || !email || !type || !size || !recruiters || !industry || !logo || !description) {
        return res.status(400).json({
            success: false,
            msg: "All fields are required to create an enterprise."
        });
    }

    const industries = [
        "Technology",
        "Health",
        "Education",
        "Finance",
        "Retail",
        "Manufacturing",
        "Hospitality",
        "Construction",
        "Others",
      ];

    if (industry && !industries.includes(industry)) {
        return res.status(400).json({
            success: false,
            msg: `Invalid industry type. Allowed types are: ${industries.join(", ")}`
        });
    }

    if (size && !["Small", "Medium", "Large"].includes(size)) {
        return res.status(400).json({
            success: false,
            msg: "Invalid size type. Allowed types are: Small, Medium, Large"
        });
    }

    if (type && !["Startup", "SME", "Corporation", "Non-Profit"].includes(type)) {
        return res.status(400).json({
            success: false,
            msg: "Invalid type. Allowed types are: Startup, SME, Corporation, Non-Profit"
        });
    }

    if (description.length > 200) {
        return res.status(400).json({
            success: false,
            msg: "Description cannot exceed 200 characters."
        });
    }

    next();

};

export const canGetEnterprises = async (req, res, next) => {
        const enterprises = await Enterprise.find({ status: true });
        if (!enterprises || enterprises.length === 0) {
            return res.status(404).json({
                success: false,
                msg: "No enterprises found."
            });
        }
        next();
};

export const canGetEnterpriseById = async (req, res, next) => {
    const { id } = req.params;
    const enterprise = await Enterprise.findById(id);
    if (!enterprise) {
        return res.status(404).json({
            success: false,
            msg: "Enterprise not found."
        });
    }

    next();
};

export const canUpdateEnterprise = async (req, res, next) => {
    const { id } = req.params;
    const data = req.body;
    
    const enterprise = await Enterprise.findById(id);
    if (!enterprise) {
        return res.status(404).json({
            success: false,
            msg: "Enterprise not found."
        });
    }
    
    const industries = [
        "Technology",
        "Health",
        "Education",
        "Finance",
        "Retail",
        "Manufacturing",
        "Hospitality",
        "Construction",
        "Others",
        ];

    if (data.industry && !industries.includes(data.industry)) {
        return res.status(400).json({
            success: false,
            msg: `Invalid industry type. Allowed types are: ${industries.join(", ")}`
        });
    }

    if (data.size && !["Small", "Medium", "Large"].includes(data.size)) {
        return res.status(400).json({
            success: false,
            msg: "Invalid size type. Allowed types are: Small, Medium, Large"
        });
    }

    if (data.type && !["Startup", "SME", "Corporation", "Non-Profit"].includes(data.type)) {
        return res.status(400).json({
            success: false,
            msg: "Invalid type. Allowed types are: Startup, SME, Corporation, Non-Profit"
        });
    }

    if (data.description && data.description.length > 200) {
        return res.status(400).json({
            success: false,
            msg: "Description cannot exceed 200 characters."
        });
    }

    next();
}

export const canDeleteEnterprise = async (req, res, next) => {
    const { id } = req.params;
    const enterprise = await Enterprise.findById(id);
    if (!enterprise) {
        return res.status(404).json({
            success: false,
            msg: "Enterprise not found."
        });
    }

    if (enterprise.status === false) {
        return res.status(400).json({
            success: false,
            msg: "Enterprise is already deleted."
        });
    }

    next();
}

