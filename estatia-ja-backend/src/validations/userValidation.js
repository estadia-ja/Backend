import Joi from 'joi';

const phoneSchema = Joi.string().pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/).messages({
  'string.pattern.base': 'O número de telefone precisa estar no formato (XX) XXXXX-XXXX'
});

export const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  cpf: Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).optional(),
  password: Joi.string().min(6).required(),
  phones: Joi.array().items(phoneSchema).optional().min(1) 
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  phones: Joi.array().items(phoneSchema).optional().min(1)
});
