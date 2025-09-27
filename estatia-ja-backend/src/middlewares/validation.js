import { createUserSchema, updateUserSchema } from '../validations/userValidation.js';

export const validateCreateUser = (req, res, next) => {
  const { error, value } = createUserSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  req.validatedData = value;
  next();
};

export const validateUpdateUser = (req, res, next) => {
  const { error, value } = updateUserSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  req.validatedData = value;
  next();
};
