import { Router } from 'express';
import multer from 'multer';
import propertyController from './controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  validateCreateProperty,
  validateUpdateProperty,
} from '../middlewares/propertyValidation.js';
import reserveRoutes from '../reserve/routes.js';
import propertyValuationController from '../propertyValuation/controller.js';

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
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 type:
 *                   type: string
 *                 description:
 *                   type: string
 *                 dailyRate:
 *                   type: number
 *                   format: float
 *                 images:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *       '400':
 *         description: Erro de validação nos dados enviados.
 */
router.post(
  '/',
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
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   type:
 *                     type: string
 *                   description:
 *                     type: string
 *                   dailyRate:
 *                     type: number
 *                     format: float
 *                   images:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                   user:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *       '500':
 *         description: Erro interno do servidor.
 */
router.get('/', propertyController.getAll);

/**
 * @swagger
 * /property/available:
 *   get:
 *     summary: Busca imóveis disponíveis por período
 *     tags: [Imóveis]
 *     parameters:
 *       - in: query
 *         name: dateStart
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: "Data de início da busca (formato ISO 8601: 2025-12-20T14:00:00Z)"
 *       - in: query
 *         name: dateEnd
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: "Data final da busca (formato ISO 8601: 2025-12-27T11:00:00Z)"
 *     responses:
 *       '200':
 *         description: Lista de imóveis disponíveis no período.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Property'
 *       '400':
 *         description: Datas de busca não fornecidas ou inválidas.
 */
router.get('/available', propertyController.findAvailable);

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
 *       '404':
 *         description: Imóvel não encontrado.
 */
router.get('/:id', propertyController.getById);

/**
 * @swagger
 * /property/{propertyId}/valuations:
 *   get:
 *     summary: Retorna todas as avaliações de um imóvel específico
 *     tags: [Imóveis, Avaliações]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: O ID do imóvel para buscar as avaliações.
 *     responses:
 *       '200':
 *         description: Uma lista de avaliações, da maior para a menor nota.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PropertyValuation'
 *       '404':
 *         description: Nenhuma avaliação encontrada para este imóvel.
 */
router.get(
  '/:propertyId/valuations',
  propertyValuationController.getByProperty
);

/**
 * @swagger
 * /property/{propertyId}/images:
 *   get:
 *     summary: Retorna todas as imagens de um imóvel específico
 *     tags: [Imóveis]
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: O ID do imóvel para o qual buscar as imagens.
 *     responses:
 *       '200':
 *         description: Uma lista de objetos de imagem.
 *       '404':
 *         description: Imóvel ou imagens não encontradas.
 */
router.get('/:propertyId/images', propertyController.getAllImages);

/**
 * @swagger
 * /property/{id}:
 *   put:
 *     summary: Atualiza os dados de um imóvel (sem alterar imagens)
 *     tags: [Imóveis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: O ID do imóvel a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       '200':
 *         description: Imóvel atualizado com sucesso.
 *       '400':
 *         description: Dados inválidos.
 *       '403':
 *         description: Ação não autorizada.
 *       '404':
 *         description: Imóvel não encontrado.
 */
router.put(
  '/:id',
  authMiddleware,
  validateUpdateProperty,
  propertyController.updateData
);

/**
 * @swagger
 * /property/{id}/images:
 *   put:
 *     summary: Atualiza (substitui) todas as imagens de um imóvel
 *     tags: [Imóveis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: O ID do imóvel para o qual as imagens serão atualizadas
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array de arquivos de imagem para upload.
 *     responses:
 *       '200':
 *         description: Imagens do imóvel atualizadas com sucesso.
 *       '400':
 *         description: Nenhuma imagem foi enviada.
 *       '403':
 *         description: Ação não autorizada.
 *       '404':
 *         description: Imóvel não encontrado.
 */
router.put(
  '/:id/images',
  authMiddleware,
  upload.array('images', 10),
  propertyController.updateImages
);

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
 *         description: Ação não autorizada.
 *       '404':
 *         description: Imóvel não encontrado.
 */
router.delete('/:id', authMiddleware, propertyController.delete);

router.use('/:propertyId/reserve', reserveRoutes);
export default router;
