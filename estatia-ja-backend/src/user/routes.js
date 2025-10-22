import { Router } from "express";
import multer from "multer";
import userController from "./controller.js";
import { validateCreateUser, validateUpdateUser } from "../middlewares/validation.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: João da Silva
 *               email:
 *                 type: string
 *                 example: joao.silva@email.com
 *               cpf:
 *                 type: string
 *                 example: "123.456.789-00"
 *               password:
 *                 type: string
 *                 example: SenhaSegura123
 *               phones:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "(11) 98765-4321"
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 cpf:
 *                   type: string
 *                 phones:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       phone:
 *                         type: string
 *       400:
 *         description: Erro na validação dos dados.
 */
router.post("/", validateCreateUser, userController.create);

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Retorna a lista de todos os usuários
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: Lista de usuários obtida com sucesso.
 */
router.get("/", userController.getAll);

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Retorna um usuário pelo ID
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuário encontrado.
 *       404:
 *         description: Usuário não encontrado.
 */
router.get("/:id", userController.getById);

/**
 * @swagger
 * /user/{id}/client-valuations:
 *   get:
 *     summary: Retorna todas as avaliações que um usuário recebeu como hóspede
 *     tags: [Usuários, Avaliações]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: O ID do usuário para buscar as avaliações.
 *     responses:
 *       '200':
 *         description: Uma lista de avaliações recebidas pelo usuário.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ClientValuation'
 *       '404':
 *         description: Usuário não encontrado.
 */
router.get(
    '/:id/client-valuations',
    userController.getClientValuations
);
  
/**
 * @swagger
 * /user/{id}:
 *   put:
 *     summary: Atualiza um usuário pelo ID
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: João Atualizado
 *               email:
 *                 type: string
 *                 example: joao.atualizado@email.com
 *               phones:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "(11) 99999-8888"
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso.
 *       400:
 *         description: Erro na validação dos dados.
 *       404:
 *         description: Usuário não encontrado.
 */
router.put("/:id", validateUpdateUser, userController.update);

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Deleta um usuário pelo ID
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Usuário deletado com sucesso.
 *       404:
 *         description: Usuário não encontrado.
 */
router.delete("/:id", userController.delete);

/**
 * @swagger
 * /user/{id}/upload:
 *   post:
 *     summary: Faz upload de uma imagem para o usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Imagem salva com sucesso
 *       400:
 *         description: Nenhum arquivo enviado
 */
router.post("/:id/upload", upload.single("image"), userController.uploadImage);

/**
 * @swagger
 * /user/{id}/image:
 *   get:
 *     summary: Retorna a imagem do usuário pelo ID
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Imagem retornada com sucesso
 *         content:
 *           image/png: {}
 *           image/jpeg: {}
 *       404:
 *         description: Usuário ou imagem não encontrada
 */
router.get("/:id/image", userController.getImage);

export default router;
