var express = require('express');
var router = express.Router();
const AUTH_GUARD = require('../middlewares/auth-guard');
const USER_CONTROLLER = require('../controllers/user');

router.get('/registerLocationChange', AUTH_GUARD, USER_CONTROLLER.registerLocationChange);
router.post('/register', USER_CONTROLLER.register);
router.post('/login', USER_CONTROLLER.login);

module.exports = router;
