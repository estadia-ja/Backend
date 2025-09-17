const userService = require('./service');

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

    async update(req, res) {
        try {
            const idUser = req.params.id
            const user = await userService.updateUser(idUser, req.validatedData);
            res.json(user.toJSON());
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
}

module.exports = userController;