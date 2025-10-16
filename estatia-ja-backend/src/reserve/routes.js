import { Router } from 'express';
import reserveController from './controller.js';
import { authMiddleware} from '../middlewares/authMiddleware.js'
import { validateCreateReserve, validateUpdateReserve } from '../middlewares/reserveValidation.js'

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

/**
 * @swagger
 * /reserve/owner:
 *   get:
 *     summary: Retorna todas as reservas feitas nos imóveis do proprietário logado
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Uma lista de reservas nos imóveis do proprietário.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reserve'
 *       '401':
 *         description: Não autorizado.
 *       '403':
 *         description: Acesso proibido.
 */
router.get(
    '/owner',
    authMiddleware,
    reserveController.getOwnerReservations
);  

/**
 * @swagger
 * /reserve/my-reservations:
 *   get:
 *     summary: (Hóspede) Retorna as reservas que você fez
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Uma lista com as suas reservas.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reserve'
 *       '401':
 *         description: Não autorizado.
 */
router.get(
    '/my-reservations',
    authMiddleware,
    reserveController.getUserReservations
);
  
/**
 * @swagger
 * /reserve/{reserveId}:
 *   put:
 *     summary: Atualiza as datas de uma reserva existente
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reserveId
 *         required: true
 *         schema:
 *           type: string
 *         description: O ID da reserva a ser atualizada.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateReserveData'
 *     responses:
 *       '200':
 *         description: Reserva atualizada com sucesso.
 *       '400':
 *         description: "Dados inválidos ou reserva já iniciada."
 *       '403':
 *         description: "Ação não autorizada."
 *       '404':
 *         description: "Reserva não encontrada."
 *       '409':
 *         description: "Conflito de disponibilidade para as novas datas."
 */
router.put(
    '/:reserveId',
    authMiddleware,
    validateUpdateReserve,
    reserveController.update
);

/**
 * @swagger
 * /reserve/{reserveId}:
 *   delete:
 *     summary: Cancela uma reserva
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reserveId
 *         required: true
 *         schema:
 *           type: string
 *         description: O ID da reserva a ser cancelada.
 *     responses:
 *       '204':
 *         description: Reserva cancelada com sucesso.
 *       '400':
 *         description: "Não é possível cancelar uma reserva que já começou."
 *       '403':
 *         description: "Ação não autorizada."
 *       '404':
 *         description: "Reserva não encontrada."
 */
router.delete(
    '/:reserveId',
    authMiddleware,
    reserveController.cancel
);

export default router;
  