var express = require('express');
var router = express.Router();
const AUTH_GUARD = require('../middlewares/auth-guard');
const VOTE_CONTROLLER = require('../controllers/vote');

router.post('/add', AUTH_GUARD, VOTE_CONTROLLER.add);
router.put('/edit/:id', AUTH_GUARD, VOTE_CONTROLLER.edit);
router.delete('/delete/:id', AUTH_GUARD, VOTE_CONTROLLER.delete);

module.exports = router;
