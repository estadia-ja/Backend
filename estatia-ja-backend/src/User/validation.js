const Joi = require('joi');

const createUserShema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/).optional(),
    cpf: Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).optional(),
    password: Joi.string().min(6).required
});

module.exports = createUserShema;