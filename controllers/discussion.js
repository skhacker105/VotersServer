const DISCUSSION = require('mongoose').model('Discussion');
const VOTE = require('mongoose').model('Vote');
const HELPER = require('../utilities/helper')
const HTTP = require('../utilities/http')
module.exports = {


    add: (req, res) => {
        let discussionBody = req.body;
        discussionBody['createdBy'] = HELPER.getAuthUserId(req);
        discussionBody['createdOn'] = new Date;
        DISCUSSION.create(discussionBody).then((discussion) => {

            DISCUSSION.findById(discussion._id)
                .then((addedDiscussion) => {

                    return HTTP.success(res, addedDiscussion, 'Discussion added successfully!');
                }).catch(err => HTTP.handleError(res, err));
        }).catch(err => HTTP.handleError(res, err));
    },

    edit: (req, res) => {
        let discussionId = req.params.id;
        let edittedDiscussion = req.body;
        const loginuserid = HELPER.getAuthUserId(req);

        DISCUSSION.findById(discussionId).then((discussion) => {
            if (!discussion) return HTTP.error(res, 'There is no discussion with the given id in our database.');
            if (!discussion.createdBy.equals(loginuserid)) return HTTP.error(res, 'You cannot edit someone else\'s discussion.');

            discussion.title = edittedDiscussion.title;
            discussion.message = edittedDiscussion.message;
            discussion.save();

            DISCUSSION.findById(discussion._id)
                .then((updatedDiscussion) => {

                    return HTTP.success(res, updatedDiscussion, 'Discussion updated successfully!');
                }).catch(err => HTTP.handleError(res, err));
        }).catch(err => HTTP.handleError(res, err));
    },

    getSingle: (req, res) => {
        let discussionId = req.params.id;

        DISCUSSION.findById(discussionId)
            .populate('createdBy')
            .populate('votes')
            .populate({
                path: 'votes',
                populate: {
                    path: 'user'
                }
            })
            .then((discussion) => {
                if (!discussion) return HTTP.error(res, 'There is no discussions in our database with given id.');


                return HTTP.success(res, discussion);
            }).catch(err => HTTP.handleError(res, err));
    },

    getAll: (req, res) => {

        DISCUSSION.find({})
            .then((discussions) => {
                if (!discussions) return HTTP.error(res, 'There is no discussions in our database.');


                return HTTP.success(res, discussions);
            }).catch(err => HTTP.handleError(res, err));
    },

    getMyDiscussions: (req, res) => {

        const loggedInId = HELPER.getAuthUserId(req);
        const qry = req.body;
        DISCUSSION.find({ createdBy: loggedInId })
            .limit(qry.pageSize)
            .skip(qry.pageSize * qry.pageNumber)
            .populate('createdBy')
            .populate('votes')
            .populate({
                path: 'votes',
                populate: {
                    path: 'user'
                }
            })
            .then((discussions) => {
                if (!discussions) return HTTP.error(res, 'There is no discussions in our database.');

                qry['data'] = discussions;
                qry['dataLength'] = discussions.length;
                return HTTP.success(res, qry);
            }).catch(err => HTTP.handleError(res, err));
    },

    getNewsPaper: (req, res) => {

        const qry = {
            
        };
        DISCUSSION.find(qry)
            .limit(qry.pageSize)
            .skip(qry.pageSize * qry.pageNumber)
            .populate('createdBy')
            .populate('votes')
            .populate({
                path: 'votes',
                populate: {
                    path: 'user'
                }
            })
            .then((discussions) => {
                if (!discussions) return HTTP.error(res, 'There is no discussions in our database.');

                qry['data'] = discussions;
                qry['dataLength'] = discussions.length;
                return HTTP.success(res, qry);
            }).catch(err => HTTP.handleError(res, err));
    },

    deleteById: (req, res) => {
        let discussionId = req.params.id;

        DISCUSSION.findByIdAndDelete(discussionId)
            .then((discussion) => {
                if (!discussion) return HTTP.error(res, 'There is no voteTypes with the given id in our database.');
                if (!discussion.createdBy.equals(loginuserid)) return HTTP.error(res, 'You cannot delete someone else\'s discussion.');

                if (discussion.votes && discussion.votes.length > 0) {
                    const allCalls = discussion.votes.map(v => VOTE.findByIdAndDelete(v._id))

                    Promise.all(allCalls)
                    .then(deletedVotes => {
                        return HTTP.success(res, 'Deleted successfully'); 
                    })
                    .catch(err => HTTP.handleError(res, err));
                } else return HTTP.success(res, 'Deleted successfully');
            }).catch(err => HTTP.handleError(res, err));
    },

    voteFor: (req, res) => {
        let discussionId = req.params.id;
        let voteId = req.body.voteId;
        const loginuserid = HELPER.getAuthUserId(req);

        DISCUSSION.findById(discussionId)
            .populate('votes')
            .then((discussion) => {
                if (!discussion) return HTTP.error(res, 'There is no vote with the given id in our database.');

                if (discussion.votes.find(v => v.user === loginuserid)) {
                    return HTTP.error(res, 'You cannot have multiple votes.');
                }


                discussion.votes.push(voteId);
                discussion.save();
                return HTTP.success(res, 'Voted successfully');
            }).catch(err => HTTP.handleError(res, err));
    },
};