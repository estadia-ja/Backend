import Joi from 'joi';

export const createReserveSchema = Joi.object({
    dateStart: Joi.date().iso().required().label('Data de início'),
    dateEnd: Joi.date().iso().greater(Joi.ref('dateStart')).required().label('Data final')

}).messages({
    'any.required': 'O campo {#label} é obrigatório.',
    'date.base': 'O campo {#label} deve ser uma data válida.',
    'date.format': 'O campo {#label} deve estar no formato ISO 8601 (ex: 2025-12-20T14:00:00Z).',
    'date.greater': 'O campo {#label} deve ser posterior à {#limit.root}.'
});