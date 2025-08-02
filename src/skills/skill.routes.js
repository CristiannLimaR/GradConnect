import { Router } from "express";
import * as skillController from "./skill.controller.js";
import { validateFields } from "../middlewares/validate-fields.js";
import { check } from "express-validator";
import { validateJWT } from "../middlewares/validate-jwt.js";
const router = Router();

// Obtener todas las habilidades globales
// GET /api/skills/global
router.get(
  "/global",
  skillController.getAllGlobalSkills
);

// Buscar habilidades globales
// GET /api/skills/search?query=javascript&category=TECHNICAL
router.get(
  "/search",
  [
    check('query', 'Query parameter is required').not().isEmpty(),
    validateFields
  ],
  skillController.searchGlobalSkills
);

// Obtener habilidades por categoría
// GET /api/skills/category/TECHNICAL
router.get(
  "/category/:category",
  [
    check('category', 'Category is required').not().isEmpty(),
    validateFields
  ],
  skillController.getSkillsByCategory
);

// Crear habilidad global (Admin)
// POST /api/skills/global
router.post(
  "/global",
  [
    check('nameSkill', 'Skill name is required').not().isEmpty().trim().escape(),
    check('levelSkill', 'Invalid skill level').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
    check('category', 'Invalid category').optional().isIn(['TECHNICAL', 'ARCHITECTURE', 'FINANCE', 'SALES', 'HEALTH', 'OTHER']),
    validateJWT,
    validateFields
  ],
  skillController.createGlobalSkill
);

// Obtener habilidad global por ID
// GET /api/skills/:skillId
router.get(
  "/:skillId",
  [
    check('skillId', 'Valid Skill ID is required').isMongoId(),
    validateFields
  ],
  skillController.getGlobalSkillById
);

// Actualizar habilidad global (Admin)
// PUT /api/skills/:skillId
router.put(
  "/:skillId",
  [
    check('skillId', 'Valid Skill ID is required').isMongoId(),
    check('nameSkill', 'Skill name must be a string').optional().isString().trim().escape(),
    check('levelSkill', 'Invalid skill level').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
    check('category', 'Invalid category').optional().isIn(['TECHNICAL', 'ARCHITECTURE', 'FINANCE', 'SALES', 'HEALTH', 'OTHER']),
    validateJWT,
    validateFields
  ],
  skillController.updateGlobalSkill
);

// Eliminar habilidad global (Admin)
// DELETE /api/skills/:skillId
router.delete(
  "/:skillId",
  [
    check('skillId', 'Valid Skill ID is required').isMongoId(),
    validateJWT,
    validateFields
  ],
  skillController.deleteGlobalSkill
);

// Importar habilidades en lote (Admin)
// POST /api/skills/bulk-import
router.post(
  "/bulk-import",
  [
    check('skills', 'Skills array is required').isArray({ min: 1 }),
    validateJWT,
    validateFields
  ],
  skillController.bulkImportSkills
);

export default router;