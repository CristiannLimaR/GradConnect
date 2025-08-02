import { Router } from "express";
import { check } from "express-validator";
import { 
  updateUser, 
  deleteUser, 
  updatedPassword, 
  getUsers,
  getUserById,
  getUserSkills,
  addUserSkill,
  updateUserSkill,
  deleteUserSkill,
  getAdminDashboardStats
} from "./user.controller.js";
import { validateFields } from '../middlewares/validate-fields.js'; 
import { validateUserDelete, validatePasswordUpdate, validateUpdateUser } from "../middlewares/validate-user.js";
import { validateJWT } from "../middlewares/validate-jwt.js";
import { haveRol } from "../middlewares/validate-role.js";
import upload from "../middlewares/upload.js";;
import { pdfUpload, uploadPDFWithSupabase } from "../middlewares/supabaseUpload.js";

const router = Router();

// Ruta para estadísticas globales de admin
router.get(
  '/admin-stats',
  [validateJWT, haveRol('GRADCONNECT')],
  getAdminDashboardStats
);

// Rutas existentes
router.get(
    "/",
    [
        validateJWT,
    ],
    getUsers
)


router.get(
    "/:id",
    [
        validateJWT,
        check("id", "User ID is not valid").isMongoId(),
        validateFields
    ],
    getUserById
)

router.put(
    "/updatePassword/:id",
    [
        validateJWT,
        check("id", "id is not valid").isMongoId(),
        validatePasswordUpdate,
        validateFields
    ],
    updatedPassword
)

router.put(
    "/:id",
    [
        validateJWT,
        check("id", "id is invalid").isMongoId(),
        validateUpdateUser,
        validateFields,
        pdfUpload,
        uploadPDFWithSupabase
    ],
    updateUser
)

router.delete(
    "/:id",
    [
        validateJWT,
        check("id", "id is invalid").isMongoId(),
        validateUserDelete
    ],
    deleteUser
)

// Nuevas rutas para habilidades del usuario

// Obtener habilidades de un usuario
router.get(
    "/skills/mySkills",
    [
        validateJWT
    ],
    getUserSkills
)

// Agregar habilidad a un usuario
router.post(
    "/skills",
    [
        validateJWT,
        check("skillId", "Skill ID is required").isMongoId(),
        check("levelSkill", "Invalid skill level").optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
        validateFields
    ],
    addUserSkill
)

// Actualizar habilidad de un usuario
router.put(
    "/skills/:skillId",
    [
        validateJWT,
        check("skillId", "Skill ID is not valid").isMongoId(),
        check("levelSkill", "Invalid skill level").optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
        validateFields
    ],
    updateUserSkill
)

// Eliminar habilidad de un usuario
router.delete(
    "/skills/:skillId",
    [
        validateJWT,
        check("skillId", "Skill ID is not valid").isMongoId(),
        validateFields
    ],
    deleteUserSkill
)


export default router;
