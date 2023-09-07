var express = require('express');
var router = express.Router();
const AUTH_GUARD = require('../middlewares/auth-guard');
const DISCUSSION_CONTROLLER = require('../controllers/discussion');

router.get('/get/:id', DISCUSSION_CONTROLLER.getSingle);
router.get('/getAll', DISCUSSION_CONTROLLER.getAll);
router.post('/getMyDiscussions', AUTH_GUARD, DISCUSSION_CONTROLLER.getMyDiscussions);
router.post('/add', AUTH_GUARD, DISCUSSION_CONTROLLER.add);
router.post('/voteFor/:id', AUTH_GUARD, DISCUSSION_CONTROLLER.voteFor);
router.put('/edit/:id', AUTH_GUARD, DISCUSSION_CONTROLLER.edit);
router.put('/updateState/:id', AUTH_GUARD, DISCUSSION_CONTROLLER.updateState);
router.delete('/delete/:id', AUTH_GUARD, DISCUSSION_CONTROLLER.deleteById);

module.exports = router;
