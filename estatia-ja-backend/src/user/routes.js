const express = require('express');
const router = express.Router();
const userController = require('./controller');
const { validateCreateUser, validateUpdateUser } = require('../middlewares/validation');

router.post('/', validateCreateUser, userController.create);

module.exports = router;