import { createPaymentSchema } from '../validations/paymentValidation.js';

export const validateCreatePayment = (req, res, next) => {
  const { error, value } = createPaymentSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  req.validatedData = value;
  next();
};
