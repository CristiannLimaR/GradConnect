import { Router } from "express";
import { saveExperience, getExperiences, updateExperience, deleteExperience, getExperiencesByUserId } from "./experience.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validateJWT } from "../middlewares/validate-jwt.js";

const router = Router();

router.post(
    "/save/",
    validarCampos,
    validateJWT,
    saveExperience
    
)

router.get(
    "/",
    validateJWT,
    getExperiences
)

router.get(
    "/user/:userId",
    validateJWT,
    getExperiencesByUserId
)

router.put(
    "/update/:id",
    validarCampos,
    validateJWT,
    updateExperience
    
)

router.delete(
    "/delete/:id",
    validateJWT,
    deleteExperience
)

export default router