var express = require('express');
var router = express.Router();
const DISCUSSION_CONTROLLER = require('../controllers/discussion');

router.get('/get/:id', DISCUSSION_CONTROLLER.getSingle);
router.get('/getAll', DISCUSSION_CONTROLLER.getAll);
router.post('/getMyDiscussions', DISCUSSION_CONTROLLER.getMyDiscussions);
router.post('/add', DISCUSSION_CONTROLLER.add);
router.post('/voteFor/:id', DISCUSSION_CONTROLLER.voteFor);
router.put('/edit/:id', DISCUSSION_CONTROLLER.edit);
router.delete('/delete/:id', DISCUSSION_CONTROLLER.deleteById);

module.exports = router;
