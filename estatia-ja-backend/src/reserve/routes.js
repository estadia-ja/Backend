import { Router } from 'express';
import reserveController from './controller.js';
import { authMiddleware} from '../middlewares/authMiddleware.js'
import { validateCreateReserve } from '../middlewares/reserveValidation.js'

const router = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Reservas
 *   description: Endpoints para gerenciamento de reservas
 */

/**
 * @swagger
 * /property/{propertyId}/reserve:
 *   post:
 *     summary: Cria uma nova reserva para um imóvel
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: O ID do imóvel a ser reservado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dateStart
 *               - dateEnd
 *             properties:
 *               dateStart:
 *                 type: string
 *                 format: date-time
 *                 description: Data e hora de início da reserva (formato ISO 8601).
 *                 example: "2025-12-20T14:00:00Z"
 *               dateEnd:
 *                 type: string
 *                 format: date-time
 *                 description: Data e hora de término da reserva (formato ISO 8601).
 *                 example: "2025-12-27T11:00:00Z"
 *     responses:
 *       '201':
 *         description: Reserva criada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reserve'  # Lembre-se de definir este schema
 *       '400':
 *         description: Dados inválidos (datas no passado, data final antes da inicial).
 *       '403':
 *         description: "Ação não autorizada (ex: tentar reservar o próprio imóvel)."
 *       '404':
 *         description: Imóvel não encontrado.
 *       '409':
 *         description: Conflito de disponibilidade (imóvel já reservado para as datas).
 */
router.post(
'/',
authMiddleware,
validateCreateReserve, 
reserveController.create
);

export default router;
  