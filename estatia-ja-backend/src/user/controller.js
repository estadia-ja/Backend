import userService from './service.js';

const userController = {
    async create(req,res){
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
            res.json(users.map(user => user.toJSON()));
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
            res.status(500).json({ error: "Erro ao buscar as avaliações do usuário." });
        }
    },

    async update(req, res) {
        try {
            const idUser = req.params.id
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
            res.status(404).json({ error: error.message })
        }
    },

    async uploadImage(req, res) {
        try {
            const { id } = req.params;
            const imageBuffer = req.file?.buffer;

            if (!imageBuffer) {
                return res.status(400).json({ error: "Nenhum arquivo enviado" });
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

            res.set("Content-Type", "image/png");
            res.send(image);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
}

export default userController;