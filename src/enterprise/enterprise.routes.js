import { Router } from "express";
import { saveEnterprise, getEnterprises, getEnterpriseById, updateEnterprise, deleteEnterprise, addEnterpriseRecruiters, addSocialMediaLinks, getEnterpriseByRecruiter, getEnterpriseRecruiters, removeEnterpriseRecruiters, removeSocialMediaLinks, getEnterpriseStats } from "./enterprise.controller.js";
import { canSaveEnterprise, canGetEnterprises, canGetEnterpriseById, canUpdateEnterprise, canDeleteEnterprise } from "../middlewares/validate-enterprise.js";
import { validateJWT } from "../middlewares/validate-jwt.js";
import { haveRol } from "../middlewares/validate-role.js";
import { uploadProfileImage } from "../middlewares/upload.js";

const router = Router();

// Ruta para crear empresa durante el registro (sin autenticación)
router.post(
  "/register",
  uploadProfileImage.single('logo'),
  canSaveEnterprise,
  saveEnterprise
);

// Ruta existente para crear empresa (con autenticación)
router.post(
  "/",
  validateJWT,
  uploadProfileImage.single('logo'),
  canSaveEnterprise,
  saveEnterprise
);
router.get(
    "/", 
    canGetEnterprises, 
    getEnterprises
);
router.get(
    "/:id",  
    canGetEnterpriseById, 
    getEnterpriseById
);
router.get(
  "/recruiter/:recruiterId",
  validateJWT,
  haveRol("RECRUITER", "GRADCONNECT"),
  getEnterpriseByRecruiter
);
router.get(
  "/:enterpriseId/stats",
  validateJWT,
  haveRol("ENTERPRISE", "RECRUITER", "GRADCONNECT"),
  getEnterpriseStats
);

router.get(
  "/:id/recruiters",
  validateJWT,
  haveRol("RECRUITER", "GRADCONNECT"),
  getEnterpriseRecruiters
);
router.put(
  "/:id",
  validateJWT,
  haveRol("RECRUITER", "GRADCONNECT"),
  canUpdateEnterprise,
  updateEnterprise
);
router.patch(
  "/:id/recruiters",
  validateJWT,
  haveRol("RECRUITER", "GRADCONNECT"),
  addEnterpriseRecruiters
);
router.patch(
  "/:id/social-media",
  validateJWT,
  haveRol("RECRUITER", "GRADCONNECT"),
  addSocialMediaLinks
);
router.delete(
  "/:id/recruiters",
  validateJWT,
  haveRol("RECRUITER", "GRADCONNECT"),
  removeEnterpriseRecruiters
);
router.delete(
  "/:id/social-media",
  validateJWT,
  haveRol("RECRUITER", "GRADCONNECT"),
  removeSocialMediaLinks
);
router.delete(
  "/:id",
  validateJWT,
  haveRol("RECRUITER", "GRADCONNECT"),
  canDeleteEnterprise,
  deleteEnterprise
);

export default router;
