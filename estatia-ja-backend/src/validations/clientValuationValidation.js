import Joi from 'joi';

export const createClientValuationShema = Joi.object({
    noteClient: Joi.number().min(1).max(5).required().messages({
        'number.base': 'A nota deve ser um número.',
        'number.min': 'A nota deve ser no mínimo 1.',
        'number.max': 'A nota deve ser no máximo 5.',
        'any.required': 'A nota do cliente é obrigatória.'
    }),
    commentCLient: Joi.string().max(500).optional().messages({
        'string.base': 'O comentário deve ser um texto.',
        'string.max': 'O comentário não pode ter mais de 500 caracteres.'
    })
})