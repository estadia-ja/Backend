import { createReserveSchema } from '../validations/reserveValidation.js'

export const validateCreateReserve = (req, res, next) => {
    const { error, value } = createReserveSchema.validate(req.body);

    if(error){
        return res.status(400).json({ error: error.details[0].message });
    }

    req.validatedData = value;
    next();
}