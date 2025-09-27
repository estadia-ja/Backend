import Joi from 'joi';

const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/).optional(),
  cpf: Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).optional(),
  password: Joi.string().min(6).required()
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/).optional(),
  cpf: Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).optional(),
  password: Joi.string().min(6).required()
});

module.exports = { createUserSchema, updateUserSchema };