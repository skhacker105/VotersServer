var express = require('express');
var router = express.Router();
const ADMIN_GUARD = require('../middlewares/admin-guard');
const VOTETYPE_CONTROLLER = require('../controllers/voteType');

router.get('/getAll', VOTETYPE_CONTROLLER.getAll);
router.post('/add', ADMIN_GUARD, VOTETYPE_CONTROLLER.add);
router.put('/edit/:id', ADMIN_GUARD, VOTETYPE_CONTROLLER.edit);
router.delete('/delete/:id', ADMIN_GUARD, VOTETYPE_CONTROLLER.deleteById);

module.exports = router;
