import { Router } from 'express';
import { createEducation, getEducations, updateEducation, deleteEducation } from './education.controller.js';
import { validateJWT } from '../middlewares/validate-jwt.js';

const router = Router();

router.post('/', validateJWT, createEducation);
router.get('/', validateJWT, getEducations);
router.put('/:id', validateJWT, updateEducation);
router.delete('/:id', validateJWT, deleteEducation);

export default router;

