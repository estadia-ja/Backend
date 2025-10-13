import { createPropertySchema, updatePropertySchema } from '../validations/propertyValidation.js';

export const validateCreateProperty = (req, res, next) => {
    const body = req.body;

    const numericFields = ['numberOfBedroom', 'numberOfSuite', 'numberOfGarage', 'numberOfRoom', 'numberOfBathroom', 'number', 'dailyRate'];
    numericFields.forEach(field => {
        if (body[field]) body[field] = Number(body[field]);
    });

    const booleanFields = ['outdoorArea', 'pool', 'barbecue'];
    booleanFields.forEach(field => {
        if (body[field]) body[field] = (body[field] === 'true');
    });

    const { error, value } = createPropertySchema.validate(body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    
    req.validatedData = value;
    next();
};

export const validateUpdateProperty = (req, res, next) => {
    const { error, value } = updatePropertySchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    req.validatedData = value;
    next();
};