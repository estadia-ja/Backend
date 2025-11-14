import userService from './service.js';

const userController = {
  async create(req, res) {
    try {
      const user = await userService.createUser(req.validatedData);
      res.status(201).json(user.toJSON());
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getAll(req, res) {
    try {
      const users = await userService.getAllUsers();
      res.json(users.map((user) => user.toJSON()));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      res.json(user.toJSON());
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  async getClientValuations(req, res) {
    try {
      const { id } = req.params;
      const valuations = await userService.getClientValuationsForUser(id);
      res.status(200).json(valuations);
    } catch (error) {
      if (error.message.includes('Usuário não existe.')) {
        return res.status(404).json({ error: error.message });
      }
      res
        .status(500)
        .json({ error: 'Erro ao buscar as avaliações do usuário.' });
    }
  },

  async update(req, res) {
    try {
      const idUser = req.params.id;
      const user = await userService.updateUser(idUser, req.validatedData);
      res.json(user.toJSON());
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const idUser = req.params.id;
      await userService.deleteUser(idUser);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  async uploadImage(req, res) {
    try {
      const { id } = req.params;
      const imageBuffer = req.file?.buffer;

      if (!imageBuffer) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      const user = await userService.updateImage(id, imageBuffer);
      res.json(user.toJSON());
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getImage(req, res) {
    try {
      const { id } = req.params;
      const image = await userService.getImage(id);

      res.set('Content-Type', 'image/png');
      res.send(image);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email é obrigatório." });
      }
      
      await userService.requestPasswordReset(email);

      res.status(200).json({ 
        message: "Se este email estiver cadastrado, um link de recuperação foi enviado para o console." 
      });
    } catch (error) {
      if (error.message === 'Usuário não encontrado') {
        res.status(200).json({ 
          message: "Se este email estiver cadastrado, um link de recuperação foi enviado para o console." 
        });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },
  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ error: "Token e nova senha são obrigatórios." });
      }
      
      const result = await userService.resetPassword(token, password);
      res.status(200).json(result);

    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};

export default userController;
