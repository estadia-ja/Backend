const express = require('express');
const router = express.Router();
const userController = require('./controller');
const { validationCreateUser } = require('./middleware');

router.post('/', validationCreateUser, userController.create);

module.exports = router;