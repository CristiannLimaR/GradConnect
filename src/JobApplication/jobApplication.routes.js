import express from 'express';
import {
  createJobApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus
} from './jobApplication.controller.js';
import {validateJWT} from '../middlewares/validate-jwt.js';
import { haveRol } from '../middlewares/validate-role.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.post(
  '/',
  validateJWT,
  haveRol('CANDIDATE'),
  createJobApplication
);

router.get('/', getAllApplications);
router.get('/:id', getApplicationById);
router.patch('/:id/estado', validateJWT, haveRol('CANDIDATE', 'ADMIN'), updateApplicationStatus);

export default router;
