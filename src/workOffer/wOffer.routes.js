import { Router } from "express";

import { saveWOffer, getWOffers, searchWOffer, updateWOffer, deleteWOffer,getOffersByEnterprise } from "./wOffer.controller.js";
import { validateFields } from '../middlewares/validate-fields.js'; 
import { validateJWT } from "../middlewares/validate-jwt.js";
import { haveRol } from "../middlewares/validate-role.js"
import { validateDate } from "../middlewares/validate-date.js"
import {isRecruiter} from "../middlewares/recruiter-valitate.js"

const router = Router()

router.get("/", getWOffers)
router.get("/search/:id", searchWOffer)

router.get("/search/woffers/enterprise/:enterpriseId",
    [
        validateJWT,
        isRecruiter
    ],
    getOffersByEnterprise
)

router.post(
    "/save",
    [
        validateJWT,
        isRecruiter,
        validateFields,
        validateDate
    ],
    saveWOffer
)

router.put(
    "/update/:id",
    [
        validateJWT,
        isRecruiter,
        validateFields,
        validateDate
    ],
    updateWOffer
)

router.delete(
    "/delete/:id",
    [
        validateJWT,
        isRecruiter,
    ],
    deleteWOffer
)


export default router