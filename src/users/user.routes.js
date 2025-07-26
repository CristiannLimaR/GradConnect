import { Router } from "express";
import { check } from "express-validator";
import { updateUser, deleteUser, updatedPassword, getUsers } from "./user.controller.js";
import { validateFields } from '../middlewares/validate-fields.js'; 
import { validateUserDelete, validatePasswordUpdate, validateUpdateUser } from "../middlewares/validate-user.js";
import { validateJWT } from "../middlewares/validate-jwt.js";
import upload from "../middlewares/upload.js";

const router = Router();

router.get(
    "/",
    [
        validateJWT,
    ],
    getUsers
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
        upload.single('cvAdjunto')
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

export default router;
