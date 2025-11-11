import { Router } from 'express';
import paymentController from './controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateCreatePayment } from '../middlewares/paymentValidation.js';

const router = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Pagamentos
 *   description: Endpoints para simulação de pagamentos de reservas
 */

/**
 * @swagger
 * /reserve/{reserveId}/payment:
 *   post:
 *     summary: (Hóspede) Efetua o pagamento simulado de uma reserva
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reserveId
 *         required: true
 *         schema:
 *           type: string
 *         description: O ID da reserva a ser paga.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 enum: [PIX, CREDIT_CARD, BOLETO]
 *                 description: Método de pagamento simulado.
 *                 example: CREDIT_CARD
 *     responses:
 *       '201':
 *         description: Pagamento efetuado com sucesso.
 *       '403':
 *         description: Ação não autorizada (reserva não pertence ao usuário).
 *       '404':
 *         description: Reserva não encontrada.
 *       '409':
 *         description: Conflito (a reserva já foi paga).
 */
router.post(
  '/',
  authMiddleware,
  validateCreatePayment,
  paymentController.create
);

export default router;
