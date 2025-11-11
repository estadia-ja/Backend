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
 *               - maxGuests
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
 *               maxGuests:
 *                 type: integer
 *                 example: 4
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
 *                 maxGuests:
 *                   type: Number
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
 * /property/my-properties:
 *   get:
 *     summary: Retorna todos os imóveis do usuário autenticado
 *     tags: [Imóveis]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Lista de imóveis do usuário, cada um com sua nota média.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PropertyWithRating'
 *       '401':
 *         description: Não autorizado (token não fornecido ou inválido).
 *       '404':
 *         description: Nenhum imóvel encontrado para este usuário.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Nenhum imóvel encontrado para este usuário"
 */
router.get(
  '/my-properties',
  authMiddleware,
  propertyController.getMyProperties
);

/**
 * @swagger
 * /property/available:
 *   get:
 *     summary: Busca imóveis disponíveis por período, estado e capacidade
 *     tags: [Imóveis]
 *     parameters:
 *       - in: query
 *         name: dateStart
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: "Data de início da busca (ISO 8601: 2025-12-20T14:00:00Z)"
 *       - in: query
 *         name: dateEnd
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: "Data final da busca (ISO 8601: 2025-12-27T11:00:00Z)"
 *       - in: query
 *         name: state
 *         required: false
 *         schema:
 *           type: string
 *         description: "Filtra pelo estado (ex: SP, RJ, MG)"
 *       - in: query
 *         name: guests
 *         required: false
 *         schema:
 *           type: integer
 *         description: "Número de pessoas (capacidade mínima)"
 *     responses:
 *       '200':
 *         description: Lista de imóveis disponíveis que atendem aos filtros.
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
 * /property/ranked-by-valuation:
 *   get:
 *     summary: Retorna um ranking de imóveis pela média de suas avaliações
 *     tags: [Imóveis, Avaliações]
 *     responses:
 *       '200':
 *         description: Lista de imóveis ordenada da maior para a menor média de avaliação.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PropertyWithRating' # Schema customizado
 *       '500':
 *         description: Erro interno do servidor.
 */
router.get('/ranked-by-valuation', propertyController.findRanked);

/**
 * @swagger
 * /property/city/{city}:
 *   get:
 *     summary: Busca imóveis por cidade
 *     tags: [Imóveis]
 *     parameters:
 *       - in: path
 *         name: city
 *         required: true
 *         schema:
 *           type: string
 *         description: O nome da cidade para buscar imóveis.
 *     responses:
 *       '200':
 *         description: Lista de imóveis encontrados na cidade, cada um com sua nota média.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PropertyWithRating'
 *       '404':
 *         description: Nenhum imóvel encontrado nesta cidade.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Nenhum imóvel encontrado nesta cidade"
 */
router.get('/city/:city', propertyController.getByCity);

/**
 * @swagger
 * /property/{id}:
 *   get:
 *     summary: Retorna um imóvel específico pelo seu ID, incluindo sua avaliação média
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
 *               $ref: '#/components/schemas/PropertyWithRating' # ✅ Atualizado
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
 * /property/{id}/reservations:
 *   get:
 *     summary: Retorna todas as reservas de um imóvel
 *     tags: [Imóveis, Reservas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Uma lista de reservas com 'dateStart' e 'dateEnd'.
 *       '404':
 *         description: Imóvel não encontrado.
 */
router.get('/:id/reservations', propertyController.getReservations);

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
 * /property/image/{imageId}:
 *   get:
 *     summary: Retorna a imagem (arquivo) de um imóvel pelo ID da imagem
 *     tags: [Imóveis]
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: O arquivo de imagem.
 *         content:
 *           image/*: {}
 *       '404':
 *         description: Imagem não encontrada.
 */
router.get('/image/:imageId', propertyController.getImageById);

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
