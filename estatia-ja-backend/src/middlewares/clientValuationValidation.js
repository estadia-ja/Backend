import { createClientValuationShema } from "../validations/clientValuationValidation";

export const validateCreateCLientValuation = (req, res, next) => {
    const { error, value } = createClientValuationShema.validate.apply(req.body);

    if(error){
        return res. status(400).json({ error: error.details[0].message });
    }

    req.validatedData = value;
    next();
}