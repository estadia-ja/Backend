import Joi from 'joi';

export const createPropertySchema = Joi.object({
    type: Joi.string().required(),
    description: Joi.string().min(10).required(),
    maxGuests:Joi.number().integer().min(1).required(),
    numberOfBedroom: Joi.number().integer().min(0).required(),
    numberOfSuite: Joi.number().integer().min(0).required(),
    numberOfGarage: Joi.number().integer().min(0).required(),
    numberOfRoom: Joi.number().integer().min(0).required(),
    numberOfBathroom: Joi.number().integer().min(0).required(),
    outdoorArea: Joi.boolean().required(),
    barbecue: Joi.boolean().required(),
    pool: Joi.boolean().required(),
    street: Joi.string().required(),
    number: Joi.number().integer().required(),
    neighborhood: Joi.string().required(),
    state: Joi.string().length(2).required(),
    city: Joi.string().required(),
    CEP: Joi.string().pattern(/^\d{5}-\d{3}$/).required(),
    dailyRate: Joi.number().positive().required()
});

export const updatePropertySchema = Joi.object({
    type: Joi.string().required(),
    description: Joi.string().min(10).required(),
    maxGuests:Joi.number().integer().min(1).required(),
    numberOfBedroom: Joi.number().integer().min(0).required(),
    numberOfSuite: Joi.number().integer().min(0).required(),
    numberOfGarage: Joi.number().integer().min(0).required(),
    numberOfRoom: Joi.number().integer().min(0).required(),
    numberOfBathroom: Joi.number().integer().min(0).required(),
    outdoorArea: Joi.boolean().required(),
    barbecue: Joi.boolean().required(),
    pool: Joi.boolean().required(),
    street: Joi.string().required(),
    number: Joi.number().integer().required(),
    neighborhood: Joi.string().required(),
    state: Joi.string().length(2).required(),
    city: Joi.string().required(),
    CEP: Joi.string().pattern(/^\d{5}-\d{3}$/).required(),
    dailyRate: Joi.number().positive().required()
}).min(1);