import { body } from "express-validator";
import { validarCampos } from "./validar-campos.js";
import { existenteEmail } from "../helpers/db-validator.js";

/**
 * Validaciones para el registro de usuario
 */
export const registerValidator = [
  body("firstName", "First name is required")
    .notEmpty()
    .isString()
    .trim()
    .isLength({ max: 40 }),

  body("lastName", "Last name is required")
    .notEmpty()
    .isString()
    .trim(),

  body("email", "You must enter a valid email")
    .isEmail()
    .normalizeEmail(),
  body("email").custom(existenteEmail),

  body("password", "Password must be at least 8 characters")
    .isLength({ min: 8 }),

  body("role")
    .optional()
    .isIn(["CANDIDATE", "RECRUITER", "GRADCONNECT"])
    .withMessage("Invalid role"),

  body("location")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage("Location must be a string"),

  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Phone must be a valid mobile number"),

  body("profilePhoto")
    .optional()
    .isURL()
    .withMessage("Profile photo must be a valid URL"),

  body("summary")
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage("Summary must be 1000 characters or fewer"),

  body("linkedinUrl")
    .optional()
    .isURL()
    .withMessage("LinkedIn URL must be valid"),

  validarCampos
];

/**
 * Validaciones para login (email + password)
 */
export const loginValidator = [
  body("email", "Enter a valid email address")
    .notEmpty()
    .isEmail()
    .normalizeEmail(),

  body("password", "Password must be at least 8 characters")
    .isLength({ min: 8 }),

  validarCampos
];
