import Joi from 'joi';

export const createPaymentSchema = Joi.object({
  paymentMethod: Joi.string()
    .valid('PIX', 'CREDIT_CARD', 'BOLETO')
    .required()
    .messages({
      'any.required': 'O método de pagamento é obrigatório.',
      'any.only':
        'O método de pagamento deve ser um dos seguintes: PIX, CREDIT_CARD, BOLETO.',
    }),
});
