var express = require('express');
var router = express.Router();
const VOTE_CONTROLLER = require('../controllers/vote');

router.post('/add', VOTE_CONTROLLER.add);
router.put('/edit/:id', VOTE_CONTROLLER.edit);
router.delete('/delete/:id', VOTE_CONTROLLER.delete);

module.exports = router;
