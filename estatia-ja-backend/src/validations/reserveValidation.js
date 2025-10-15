import Joi from 'joi';

export const createReserveSchema = Joi.object({
    dateStart:Joi.date().iso().required().messages({
        'any.required': 'A data de início é obrigatória.',
        'date.format': 'O formato da data de início deve ser ISO 8601  (ex: 2025-12-20T14:00:00Z).'
    }),
    dateEnd: Joi.date().iso().greater(Joi.ref('dateStart')).required().message({
        'any.required': 'A data final é obrigatória',
        'date.format': 'O formato da data final deve ser ISO 8601  (ex: 2025-12-20T14:00:00Z).',
        'date.greater': 'A data final deve ser posterior à data de início'
    })
});