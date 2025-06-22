import { Router } from "express";
import * as skillController from "./skill.controller.js";
import { validateFields } from "../middlewares/validateFields.js";
import { check } from "express-validator";

const router = Router();

// Route to create a new skill
// POST /api/skills/
// Example body: { "nameSkill": "JavaScript", "levelSkill": "INTERMEDIATE", "userId": "someUserId" }
router.post(
  "/",
  [
    check('nameSkill', 'Skill name is required').not().isEmpty().trim().escape(),
    check('levelSkill', 'Invalid skill level').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
    check('userId', 'User ID is required').not().isEmpty().isMongoId(),
    validateFields
  ],
  skillController.createSkill
);

// Route to get all skills for a specific user
// GET /api/skills/user/:userId
router.get(
  "/user/:userId",
   [
      check('userId', 'User ID is required').not().isEmpty().isMongoId(),
      check('userId', 'Valid User ID is required').isMongoId(),
      validateFields
   ],
  skillController.getSkillsByUser
);

// Route to get a specific skill by its ID
// GET /api/skills/:skillId
router.get(
  "/:skillId",
   [
      check('skillId', 'Valid Skill ID is required').isMongoId(),
      validateFields
   ],
  skillController.getSkillById
);

// Route to update a skill by its ID
// PUT /api/skills/:skillId
// Example body: { "nameSkill": "Node.js", "levelSkill": "ADVANCED" }
router.put(
  "/:skillId",
   [
      check('skillId', 'Valid Skill ID is required').isMongoId(),
      check('nameSkill', 'Skill name must be a string').optional().isString().trim().escape(),
      check('levelSkill', 'Invalid skill level').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
       validateFields
   ],
  skillController.updateSkill
);

// Route to delete a skill by its ID
// DELETE /api/skills/:skillId
router.delete(
  "/:skillId",
   [
      check('skillId', 'Valid Skill ID is required').isMongoId(),
      validateFields
   ],
  skillController.deleteSkill
);

export default router;