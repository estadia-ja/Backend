import { Router } from 'express';
import propertyValuationController from './controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { propertyValuationValidation } from '../middlewares/propertyValuationValidation.js';

const router = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Avaliações
 *   description: Endpoints para gerenciar avaliações de estadias
 */

/**
 * @swagger
 * /reserve/{reserveId}/property-valuation:
 *   post:
 *     summary: (Hóspede) Cria uma avaliação para o imóvel de uma reserva concluída
 *     tags: [Avaliações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reserveId
 *         required: true
 *         schema:
 *           type: string
 *         description: O ID da reserva que será avaliada.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePropertyValuation'
 *     responses:
 *       '201':
 *         description: Avaliação criada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PropertyValuation'
 *       '400':
 *         description: "Dados inválidos ou a reserva ainda não terminou."
 *       '403':
 *         description: "Ação não autorizada (reserva não pertence ao usuário)."
 *       '404':
 *         description: "Reserva não encontrada."
 *       '409':
 *         description: "Conflito (a reserva já foi avaliada)."
 */
router.post(
  '/',
  authMiddleware,
  propertyValuationValidation,
  propertyValuationController.create
);

export default router;
