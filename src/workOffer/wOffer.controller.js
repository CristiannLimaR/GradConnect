import wOffer from "./wOffer.model.js";
import mongoose from "mongoose";

export const saveWOffer = async (req, res) => {
  try {
    let {
      title,
      description,
      company,
      location,
      modality,
      salary,
      ubication,
      requirements,
      closingDate,
      skills,
      applications,
    } = req.body;

    // Detectar y convertir fecha en formato dd/mm/yyyy
    if (typeof closingDate === "string" && closingDate.includes("/")) {
      const [day, month, year] = closingDate.split("/");
      closingDate = new Date(`${year}-${month}-${day}`);
    }

    const newOffer = new wOffer({
      title,
      description,
      company,
      location,
      modality,
      salary,
      ubication,
      requirements,
      closingDate,
      skills,
      applications,
    });

    await newOffer.save();

    res.status(200).json({
      msg: "Work Offer created successfully :)",
      newOffer,
    });
  } catch (e) {
    return res.status(500).json({
      msg: "Error saving work offer.",
      error: e.message,
    });
  }
};

export const getWOffers = async (req, res) => {
  try {
    const { query } = { status: true };
    const offers = await wOffer.find(query);

    // Mapear las ofertas para incluir la cantidad de aplicaciones
    const offersWithApplicationsCount = offers.map((offer) => ({
      ...offer.toObject(), // Convertir a objeto para evitar problemas con Mongoose
      applicationsCount: offer.applications.length,
    }));

    res.status(200).json({
      msg: "Work Offers fetched successfully.",
      offers: offersWithApplicationsCount,
    });
  } catch (e) {
    return res.status(500).json({
      msg: "Error getting work offers.",
      error: e.message,
    });
  }
};

export const searchWOffer = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si es un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        msg: "Invalid ID format.",
      });
    }

    const offer = await wOffer.findById(id);

    if (!offer) {
      return res.status(404).json({
        msg: "Work Offer not found",
      });
    }

    // Mapear las ofertas para incluir la cantidad de aplicaciones
    const offersWithApplicationsCount = {
      ...offer.toObject(), // Convertir a objeto para evitar problemas con Mongoose
      applicationsCount: offer.applications.length,
    }
    res.status(200).json({
      msg: "Work Offer found successfully.",
      offer: offersWithApplicationsCount,
    });
  } catch (e) {
    return res.status(500).json({
      msg: "Error searching work offer.",
      error: e.message,
    });
  }
};

export const updateWOffer = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si es un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        msg: "Invalid ID format.",
      });
    }

    const offer = await wOffer.findById(id);
    if (!offer) {
      return res.status(404).json({
        msg: "Work Offer not found",
      });
    }

    let {
      title,
      description,
      company,
      location,
      modality,
      salary,
      ubication,
      requirements,
      closingDate,
      skills,
      applications,
    } = req.body;

    // Detectar y convertir fecha en formato dd/mm/yyyy
    if (typeof closingDate === "string" && closingDate.includes("/")) {
      const [day, month, year] = closingDate.split("/");
      closingDate = new Date(`${year}-${month}-${day}`);
    }

    const updateWOffer = await wOffer.findByIdAndUpdate(
      id,
      {
        title,
        description,
        company,
        location,
        modality,
        salary,
        ubication,
        requirements,
        closingDate,
        skills,
        applications,
      },
      { new: true }
    );

    res.status(200).json({
      msg: "Work Offer updated successfully",
      updateWOffer,
    });
  } catch (e) {
    return res.status(500).json({
      msg: "Error updating work offer",
      error: e.message,
    });
  }
};

export const deleteWOffer = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si es un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        msg: "Invalid ID format.",
      });
    }

    const offer = await wOffer.findById(id);

    if (!offer) {
      return res.status(404).json({
        msg: "Work Offer not found",
      });
    }

    const deletedOffer = await wOffer.findByIdAndUpdate(
      offer,
      { status: false },
      { new: true }
    );

    res.status(200).json({
      msg: "Work Offer deleted successfully",
      deletedOffer,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Error deleting work offer",
      error: error.message,
    });
  }
};
