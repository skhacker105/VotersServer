const VOTE = require('mongoose').model('Vote');
const HELPER = require('../utilities/helper')
const HTTP = require('../utilities/http');
const { ObjectId } = require('mongodb');

module.exports = {


    add: (req, res) => {
        let voteBody = req.body;
        voteBody['createdBy'] = HELPER.getAuthUserId(req);
        voteBody['createdOn'] = new Date;
        VOTE.create(voteBody).then((vote) => {

            VOTE.findById(vote._id)
                .populate('user')
                .then((addedVote) => {

                    return HTTP.success(res, addedVote, 'Vote added successfully!');
                }).catch(err => HTTP.handleError(res, err));
        }).catch(err => HTTP.handleError(res, err));
    },

    edit: (req, res) => {
        let voteId = req.params.id;
        let edittedVote = req.body;
        const loginuserid = HELPER.getAuthUserId(req);

        VOTE.findById(voteId).then((vote) => {
            if (!vote) return HTTP.error(res, 'There is no vote with the given id in our database.');
            if (!vote.user.equals(loginuserid)) return HTTP.error(res, 'You cannot edit someone else\'s vote.');

            vote.message = edittedVote.message;
            vote.voteType = edittedVote.voteType;
            vote.save()
                .then(vt => {

                    VOTE.findById(vote._id)
                        .populate('user')
                        .then((updateVote) => {

                            return HTTP.success(res, updateVote, 'Vote updated successfully!');
                        }).catch(err => HTTP.handleError(res, err));
                })
                .catch(err => HTTP.handleError(res, err));

        }).catch(err => HTTP.handleError(res, err));
    }
};