import { createPropertyValuationShema } from "../validations/propertyValuationValidation.js";

export const propertyValuationValidation = (req, res, next) => {
    const { error, value } = createPropertyValuationShema.validate(req.body);

    if (error){
        return res.status(400).json({ error: error.details[0].message });
    }

    req.validatedData = value;
    next();
}