import { Router } from 'express';
import { login, register } from './auth.controller.js'
import { registerValidator, loginValidator } from '../middlewares/validate.js';
import { validateLoginUser, validateRegisterUser } from '../middlewares/validate-auth.js';
import { validarCampos } from '../middlewares/validar-campos.js';
import { uploadProfileImage } from '../middlewares/upload.js';
import { parseJsonFields } from '../middlewares/parseJsonFields.js';
const router = Router();

router.post(
    '/login',
    loginValidator,
    validateLoginUser,
    login
);

router.post(
    '/register',
    uploadProfileImage.single('profilePhoto'),
    parseJsonFields(['firstName', 'lastName', 'email', 'password', 'location', 'phone', 'role']),
    registerValidator,
    validateRegisterUser,
    validarCampos,
    register
);

export default router;