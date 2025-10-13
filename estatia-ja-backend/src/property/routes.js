import { Router } from 'express';
import multer from 'multer';
import propertyController from './controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateCreateProperty, validateUpdateProperty } from '../middlewares/propertyValidation.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * tags:
 *   name: Imóveis
 *   description: API para gerenciamento de imóveis
 */

/**
 * @swagger
 * /property:
 *   post:
 *     summary: Cria um novo imóvel com seus dados e imagens
 *     tags: [Imóveis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - description
 *               - numberOfBedroom
 *               - numberOfSuite
 *               - numberOfGarage
 *               - numberOfRoom
 *               - numberOfBathroom
 *               - outdoorArea
 *               - pool
 *               - barbecue
 *               - street
 *               - number
 *               - neighborhood
 *               - state
 *               - city
 *               - CEP
 *               - dailyRate
 *             properties:
 *               type:
 *                 type: string
 *                 example: "Casa"
 *               description:
 *                 type: string
 *                 example: "Casa espaçosa com 3 quartos e piscina."
 *               numberOfBedroom:
 *                 type: integer
 *                 example: 3
 *               numberOfSuite:
 *                 type: integer
 *                 example: 1
 *               numberOfGarage:
 *                 type: integer
 *                 example: 2
 *               numberOfRoom:
 *                 type: integer
 *                 example: 2
 *               numberOfBathroom:
 *                 type: integer
 *                 example: 3
 *               outdoorArea:
 *                 type: boolean
 *                 example: true
 *               pool:
 *                 type: boolean
 *                 example: true
 *               barbecue:
 *                 type: boolean
 *                 example: true
 *               street:
 *                 type: string
 *                 example: "Rua das Flores"
 *               number:
 *                 type: integer
 *                 example: 123
 *               neighborhood:
 *                 type: string
 *                 example: "Centro"
 *               state:
 *                 type: string
 *                 example: "SP"
 *               city:
 *                 type: string
 *                 example: "São Paulo"
 *               CEP:
 *                 type: string
 *                 example: "01001-000"
 *               dailyRate:
 *                 type: number
 *                 format: float
 *                 example: 250.50
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Arquivos de imagem do imóvel (até 5).
 *     responses:
 *       '201':
 *         description: Imóvel criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Property'
 *       '400':
 *         description: Erro de validação nos dados enviados.
 */
router.post(
    "/",
    authMiddleware,
    upload.array('images', 5),
    validateCreateProperty,
    propertyController.create
);

/**
 * @swagger
 * /property:
 *   get:
 *     summary: Retorna a lista de todos os imóveis
 *     tags: [Imóveis]
 *     responses:
 *       '200':
 *         description: Lista de imóveis obtida com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Property'
 *       '500':
 *         description: Erro interno do servidor.
 */
router.get("/", propertyController.getAll);

/**
 * @swagger
 * /property/{id}:
 *   get:
 *     summary: Retorna um imóvel específico pelo seu ID
 *     tags: [Imóveis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único do imóvel.
 *     responses:
 *       '200':
 *         description: Imóvel encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Property'
 *       '404':
 *         description: Imóvel não encontrado.
 */
router.get("/:id", propertyController.getById);

/**
 * @swagger
 * /property/{id}:
 *   delete:
 *     summary: Deleta um imóvel
 *     tags: [Imóveis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do imóvel a ser deletado.
 *     responses:
 *       '204':
 *         description: Imóvel deletado com sucesso.
 *       '403':
 *         description: Ação não autorizada (usuário não é o proprietário).
 *       '404':
 *         description: Imóvel não encontrado.
 */
router.delete("/:id", authMiddleware, propertyController.delete);


export default router;
