import { Router } from "express";

import { saveWOffer, getWOffers, searchWOffer, updateWOffer, deleteWOffer } from "./wOffer.controller.js";
import { validateFields } from '../middlewares/validate-fields.js'; 
import { validateJWT } from "../middlewares/validate-jwt.js";
import { haveRol } from "../middlewares/validate-role.js"
import {validateDate} from "../middlewares/validate-date.js"

const router = Router()

router.get("/", getWOffers)
router.get("/search/:id",searchWOffer)

router.post(
    "/save",
    [
        //validateJWT,
        //haveRol,
        validateFields,
        validateDate
    ],
    saveWOffer
)

router.put(
    "/update/:id",
    [
        //validateJWT,
        //haveRol,
        validateFields,
        validateDate
    ],
    updateWOffer
)

router.delete(
    "/delete/:id",
    [
        //validateJWT,
        //haveRol,
    ],
    deleteWOffer
)


export default router