var express = require('express');
var router = express.Router();
const USER_CONTROLLER = require('../controllers/user');

router.post('/register', USER_CONTROLLER.register);
router.post('/login', USER_CONTROLLER.login);

module.exports = router;
