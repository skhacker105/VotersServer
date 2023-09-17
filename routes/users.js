var express = require('express');
var router = express.Router();
const AUTH_GUARD = require('../middlewares/auth-guard');
const USER_CONTROLLER = require('../controllers/user');

router.get('/registerLocationChange', AUTH_GUARD, USER_CONTROLLER.registerLocationChange);
router.get('/getProfile/:id', AUTH_GUARD, USER_CONTROLLER.getProfile);
router.get('/getAvatar/:id', AUTH_GUARD, USER_CONTROLLER.getAvatar);
router.post('/updateProfile', AUTH_GUARD, USER_CONTROLLER.updateProfile);
router.post('/register', USER_CONTROLLER.register);
router.post('/login', USER_CONTROLLER.login);

module.exports = router;
