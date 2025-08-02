import Enterprise from "./enterprise.model.js";
import User from "../users/user.model.js";
import wOffer from "../workOffer/wOffer.model.js";
import JobApplication from "../JobApplication/jobApplication.model.js";
import Message from "../messages/message.model.js";

export const saveEnterprise = async (req, res) => {
  try {
    const data = req.body;
    
    let logoUrl = data.logo;
    if (req.file && req.file.path) {
      logoUrl = req.file.path;
    }

    const enterprise = new Enterprise({
      name: data.name,
      description: data.description,
      logo: logoUrl,
      webSite: data.webSite,
      address: data.address,
      industry: data.industry,
      contactNumber: data.contactNumber,
      email: data.email,
      type: data.type,
      size: data.size,
    });
    

    // Only process recruiters if the field is provided and not empty
    if (data.recruiters && data.recruiters.trim() !== "") {
      const recruiterEmails = data.recruiters.split(",").map(email => email.trim()).filter(email => email !== "");

      if (recruiterEmails.length > 0) {
        const users = await User.find({ email: { $in: recruiterEmails } });

        if (users.length !== recruiterEmails.length) {
          const foundEmails = users.map((u) => u.email);
          const notFound = recruiterEmails.filter((e) => !foundEmails.includes(e));
          return res.status(404).json({
            msg: "Algunos correos de reclutadores no fueron encontrados.",
            notFound,
          });
        }

        const recruiterIds = users.map((user) => user._id);
        enterprise.recruiters.push(...recruiterIds);
      }
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

    recruiters = recruiters.filter(
      r => !updatedEnterprise.recruiters.includes(r)
    );

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

export const removeEnterpriseRecruiters = async (req, res) => {
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
      updatedEnterprise.recruiters = updatedEnterprise.recruiters.filter(
        (recruiter) => !recruiters.includes(recruiter.toString())
      );

      await updatedEnterprise.save();
    }
    res.status(200).json({
      msg: "Enterprise recruiters removed successfully.",
      updatedEnterprise,
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error removing enterprise recruiters.",
      error: e.message,
    });
  }
}

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

    socialMediaLinks = socialMediaLinks.filter(
      link => !updatedEnterprise.socialMediaLinks.includes(link)
    );

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

export const removeSocialMediaLinks = async (req, res) => {
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
      updatedEnterprise.socialMediaLinks = updatedEnterprise.socialMediaLinks.filter(
        (link) => !socialMediaLinks.includes(link)
      );

      await updatedEnterprise.save();
    }
    res.status(200).json({
      msg: "Social media links removed successfully.",
      updatedEnterprise,
    });
  } catch (e) {
    res.status(500).json({
      msg: "Error removing social media links.",
      error: e.message,
    });
  }
};

export const getEnterpriseByRecruiter = async (req, res) => {
  try {
    const { recruiterId } = req.params;
    const enterprise = await Enterprise.findOne({ recruiters: recruiterId });
    if (!enterprise || enterprise.length === 0) {
      return res.status(404).json({
        msg: "No enterprises found for this recruiter.",
      });
    }
    res.status(200).json({
      msg: "Enterprises found for recruiter.",
      enterprise,
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


export const getEnterpriseStats = async (req, res) => {
  try {
    const { enterpriseId } = req.params;

    const ofertas = await wOffer.find({ enterprise: enterpriseId });
    const totalOfertas = ofertas.length;
    const offerIds = ofertas.map(o => o._id);
    const aplicaciones = await JobApplication.find({ ofertaId: { $in: offerIds } });
    const totalCandidatos = aplicaciones.length;
    const mensajesNoLeidos = await Message.countDocuments({ receiver: enterpriseId, receiverModel: 'Enterprise', isRead: false });
    const ofertasActivas = ofertas.filter(o => o.status === true).length;
    const sieteDias = new Date();
    sieteDias.setDate(sieteDias.getDate() - 7);
    const candidatosRecientes = aplicaciones.filter(a => a.fechaPostulacion >= sieteDias).length;
    const mensajesTotales = await Message.countDocuments({ sender: enterpriseId, senderModel: 'Enterprise' });
    const tasaRespuesta = totalCandidatos > 0 ? Math.round((mensajesTotales / totalCandidatos) * 100) : 0;
    res.json({
      totalOfertas,
      totalCandidatos,
      mensajesNoLeidos,
      ofertasActivas,
      candidatosRecientes,
      tasaRespuesta
    });
  } catch (error) {
    res.status(500).json({
      msg: 'Error obteniendo estadísticas de la empresa',
      error: error.message
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
