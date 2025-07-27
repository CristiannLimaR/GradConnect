import Enterprise from "./enterprise.model.js";

export const saveEnterprise = async (req, res) => {
  try {
    const data = req.body;

    const enterprise = new Enterprise({
      name: data.name,
      description: data.description,
      logo: data.logo,
      webSite: data.webSite,
      address: data.address,
      industry: data.industry,
      contactNumber: data.contactNumber,
      email: data.email,
      type: data.type,
      size: data.size,
    });

    const recruiters = Array.isArray(data.recruiters)
      ? data.recruiters
      : [data.recruiters];
    if (recruiters.length > 0) {
      enterprise.recruiters.push(...recruiters);
    }

    if (data.socialMediaLinks) {
      const links = Array.isArray(data.socialMediaLinks)
        ? data.socialMediaLinks
        : [data.socialMediaLinks];
      if (links.length > 0){
        enterprise.socialMediaLinks.push(...links);
      }
    }

    await enterprise.save();

    res.status(201).json({
      msg: "Enterprise created successfully.",
      enterprise,
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error creating enterprise.",
      error: e.message,
    });
  }
};

export const getEnterprises = async (req, res) => {
  try {
    const enterprises = await Enterprise.find({ status: true });
    res.status(200).json({
      msg: "Enterprises fetched successfully.",
      enterprises,
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error fetching enterprises.",
      error: e.message,
    });
  }
};

export const getEnterpriseById = async (req, res) => {
  try {
    const { id } = req.params;
    const enterprise = await Enterprise.findById(id);

    res.status(200).json({
      msg: "Enterprise found successfully.",
      enterprise,
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error fetching enterprise.",
      error: e.message,
    });
  }
};

export const updateEnterprise = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    
    if (data.recruiters) {
      Array.isArray(data.recruiters)
        ? data.recruiters
        : [data.recruiters];
    }
    
    
    if (data.socialMediaLinks) {
      Array.isArray(data.socialMediaLinks)
        ? data.socialMediaLinks
        : [data.socialMediaLinks];
    }

    const updatedEnterprise = await Enterprise.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      msg: "Enterprise updated successfully.",
      updatedEnterprise,
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error updating enterprise.",
      error: e.message,
    });
  }
};

export const addEnterpriseRecruiters = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    let recruiters = [];
    if (data.recruiters) {
      recruiters = Array.isArray(data.recruiters)
        ? data.recruiters
        : [data.recruiters];
      delete data.recruiters;
    }

    const updatedEnterprise = await Enterprise.findById(id);
    if (!updatedEnterprise) {
      return res.status(404).json({
        msg: "Enterprise not found.",
      });
    }

    if (recruiters.length > 0) {
      updatedEnterprise.recruiters.push(...recruiters);

      await updatedEnterprise.save();  
    }

    res.status(200).json({
      msg: "Enterprise recruiters updated successfully.",
      updatedEnterprise,
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error updating enterprise recruiters.",
      error: e.message,
    });
  }
};

export const addSocialMediaLinks = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    let socialMediaLinks = [];
    if (data.socialMediaLinks) {
      socialMediaLinks = Array.isArray(data.socialMediaLinks)
        ? data.socialMediaLinks
        : [data.socialMediaLinks];
      delete data.socialMediaLinks;
    }

    const updatedEnterprise = await Enterprise.findById(id);

    if (!updatedEnterprise) {
      return res.status(404).json({
        msg: "Enterprise not found.",
      });
    }

    if (socialMediaLinks.length > 0) {
      updatedEnterprise.socialMediaLinks.push(...socialMediaLinks);

      await updatedEnterprise.save();
    }

    res.status(200).json({
      msg: "Social media links updated successfully.",
      updatedEnterprise,
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error updating social media links.",
      error: e.message,
    });
  }
};

export const getEnterpriseByRecruiter = async (req, res) => {
  try {
    const { recruiterId } = req.params;
    const enterprises = await Enterprise.find({ recruiters: recruiterId });
    if (!enterprises || enterprises.length === 0) {
      return res.status(404).json({
        msg: "No enterprises found for this recruiter.",
      });
    }
    res.status(200).json({
      msg: "Enterprises found for recruiter.",
      enterprises,
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error fetching enterprises for recruiter.",
      error: e.message,
    });
  }
};

export const getEnterpriseRecruiters = async (req, res) => {
  try {
    const { id } = req.params;
    const enterprise = await Enterprise.findById(id);
    if (!enterprise) {
      return res.status(404).json({
        msg: "Enterprise not found.",
      });
    }
    res.status(200).json({
      msg: "Enterprise recruiters fetched successfully.",
      recruiters: enterprise.recruiters,
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error fetching enterprise recruiters.",
      error: e.message,
    });
  }
};

export const deleteEnterprise = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEnterprise = await Enterprise.findByIdAndUpdate(
      id,
      { status: false },
      { new: true }
    );

    res.status(200).json({
      msg: "Enterprise deleted successfully.",
      deletedEnterprise,
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error deleting enterprise.",
      error: e.message,
    });
  }
};
