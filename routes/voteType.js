var express = require('express');
var router = express.Router();
const VOTETYPE_CONTROLLER = require('../controllers/voteType');

router.get('/getAll', VOTETYPE_CONTROLLER.getAll);
router.post('/add', VOTETYPE_CONTROLLER.add);
router.put('/edit/:id', VOTETYPE_CONTROLLER.edit);
router.delete('/delete/:id', VOTETYPE_CONTROLLER.deleteById);

module.exports = router;
