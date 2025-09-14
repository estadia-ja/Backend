const userService = require('./service');

const userController = {
    async create(req, res) {
        try {
            const user = await userService.createUser(req.validatedData);
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ error:error.message });
        }
    },
}

module.exports = userController;