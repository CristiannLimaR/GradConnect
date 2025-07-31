import {validationResult} from 'express-validator'

export const validarCampos = (req, res, next) =>{
    console.log('ValidarCampos')
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            msg: "Error de validación",
            
        });
    } 

    next();
}