const VOTE = require('mongoose').model('Vote');
const HELPER = require('../utilities/helper')
const HTTP = require('../utilities/http');
const DISCUSSION = require('mongoose').model('Discussion');
const DISCUSSION_STATE = require('../contants/discussion-state');
const USER_SELECT_COLUMN = require('../contants/user-select-columns');

module.exports = {


    add: (req, res) => {
        let voteBody = req.body;
        voteBody['createdBy'] = HELPER.getAuthUserId(req);
        voteBody['createdOn'] = new Date();

        DISCUSSION.findById(voteBody.discussion)
            .then(discussion => {
                if (discussion.state === DISCUSSION_STATE.closed || discussion.state === DISCUSSION_STATE.blocked)
                    return HTTP.error(res, `Voting is blocked.`);

                VOTE.create(voteBody).then((vote) => {

                    VOTE.findById(vote._id)
                        .populate('user', USER_SELECT_COLUMN)
                        .then((addedVote) => {

                            return HTTP.success(res, addedVote, 'Vote added successfully!');
                        }).catch(err => HTTP.handleError(res, err));
                }).catch(err => HTTP.handleError(res, err));
            })
            .catch(err => HTTP.handleError(res, err));

    },

    edit: (req, res) => {
        let voteId = req.params.id;
        let edittedVote = req.body;
        const loginuserid = HELPER.getAuthUserId(req);

        VOTE.findById(voteId)
            .populate('discussion')
            .then((vote) => {
                if (!vote) return HTTP.error(res, 'There is no vote with the given id in our database.');
                if (!vote.user.equals(loginuserid)) return HTTP.error(res, 'You cannot edit someone else\'s vote.');
                if (vote.discussion.state === DISCUSSION_STATE.closed || vote.discussion.state === DISCUSSION_STATE.blocked)
                    return HTTP.error(res, `Voting cannot be edited for blocked discussion.`);

                vote.message = edittedVote.message;
                vote.voteType = edittedVote.voteType;
                vote.save()
                    .then(vt => {

                        VOTE.findById(vote._id)
                            .populate('user', USER_SELECT_COLUMN)
                            .then((updateVote) => {

                                return HTTP.success(res, updateVote, 'Vote updated successfully!');
                            }).catch(err => HTTP.handleError(res, err));
                    })
                    .catch(err => HTTP.handleError(res, err));

            }).catch(err => HTTP.handleError(res, err));
    },

    delete: (req, res) => {
        let voteId = req.params.id;
        const loginuserid = HELPER.getAuthUserId(req);

        VOTE.findById(voteId).then((vote) => {
            if (!vote) return HTTP.error(res, 'There is no vote with the given id in our database.');
            if (!vote.user.equals(loginuserid)) return HTTP.error(res, 'You cannot delete someone else\'s vote.');

            VOTE.findByIdAndDelete(voteId)
                .then(vt => {

                    DISCUSSION.findById(vote.discussion)
                        .then(discussion => {
                            if (!discussion) return HTTP.error(res, 'Vote was deleted but did not find any linked discussion.');

                            const idx = discussion.votes.findIndex(v => v.equals(voteId))
                            if (idx >= 0) discussion.votes.splice(idx, 1)
                            discussion.save()
                            return HTTP.success(res, 'Vote deleted successfully!');
                        })
                        .catch(err => HTTP.handleError(res, err));
                })
                .catch(err => HTTP.handleError(res, err));

        }).catch(err => HTTP.handleError(res, err));
    }
};