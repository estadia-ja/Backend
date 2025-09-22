const express = require('express');
const router = express.Router();
const userController = require('./controller');
const { validateCreateUser, validateUpdateUser } = require('../middlewares/validation');

router.post('/', validateCreateUser, userController.create);
router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.put('/:id', validateUpdateUser,userController.update);
router.delete('/:id', userController.delete);

module.exports = router;