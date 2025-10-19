import { Router } from 'express';
import clientValuationController from './controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateCreateClientValuation } from '../middlewares/clientValuationValidation.js';

const router = Router({mergeParams: true});

/**
 * @swagger
 * tags:
 *   name: Avaliações
 *   description: Endpoints para gerenciar avaliações de estadias
 */

/**
 * @swagger
 * /reserve/{reserveId}/client-valuation:
 *   post:
 *     summary: (Proprietário) Cria uma avaliação para o cliente de uma reserva concluída
 *     tags: [Avaliações cliente]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reserveId
 *         required: true
 *         schema:
 *           type: string
 *         description: O ID da reserva cujo cliente será avaliado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateClientValuation'
 *           examples:
 *             exemplo:
 *               summary: Exemplo de avaliação do cliente
 *               value:
 *                 noteClient: 5
 *                 commentClient: "Hóspede educado, deixou o imóvel limpo e organizado."
 *     responses:
 *       '201':
 *         description: Avaliação do cliente criada com sucesso.
 *       '400':
 *         description: "Dados inválidos ou a reserva ainda não terminou."
 *       '403':
 *         description: "Ação não autorizada (você não é o dono do imóvel)."
 *       '404':
 *         description: "Reserva não encontrada."
 *       '409':
 *         description: "Conflito (o cliente já foi avaliado para esta reserva)."
 */
router.post(
    '/',
    authMiddleware,
    validateCreateClientValuation,
    clientValuationController.create
);

/**
 * @swagger
 * /client-valuation/{valuationId}:
 *   delete:
 *     summary: (Proprietário) Deleta uma avaliação de cliente que você fez
 *     tags: [Avaliações cliente]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: valuationId
 *         required: true
 *         schema:
 *           type: string
 *         description: O ID da avaliação do cliente a ser deletada.
 *     responses:
 *       '204':
 *         description: Avaliação deletada com sucesso.
 *       '403':
 *         description: "Ação não autorizada (avaliação não foi feita por você)."
 *       '404':
 *         description: "Avaliação não encontrada."
 */
router.delete(
    '/:valuationId',
    authMiddleware,
    clientValuationController.delete
);
  

export default router;