const VOTETYPE = require('mongoose').model('VoteType');
const HELPER = require('../utilities/helper')
const HTTP = require('../utilities/http')
module.exports = {


    add: (req, res) => {
        let votetypeBody = req.body;
        votetypeBody['createdBy'] = HELPER.getAuthUserId(req);
        votetypeBody['createdOn'] = new Date();
        VOTETYPE.create(votetypeBody).then((votetype) => {

            VOTETYPE.findById(votetype._id)
                .then((addedCoteType) => {

                    return HTTP.success(res, addedCoteType, 'Vote Type added successfully!');
                }).catch(err => HTTP.handleError(res, err));
        }).catch(err => HTTP.handleError(res, err));
    },

    edit: (req, res) => {
        let voteTypeIdId = req.params.id;
        let edittedVote = req.body;

        VOTETYPE.findById(voteTypeIdId).then((voteType) => {
            if (!voteType) return HTTP.error(res, 'There is no voteType with the given id in our database.');

            voteType.name = edittedVote.name;
            voteType.icon = edittedVote.icon;
            voteType.reportName = edittedVote.reportName;
            voteType.save();

            return HTTP.success(res, voteType, 'Vote Type edited successfully!');
        }).catch(err => HTTP.handleError(res, err));
    },

    getAll: (req, res) => {

        VOTETYPE.find({})
            .then((voteTypes) => {
                if (!voteTypes) return HTTP.error(res, 'There is no voteTypes in our database.');


                return HTTP.success(res, voteTypes);
            }).catch(err => HTTP.handleError(res, err));
    },

    deleteById: (req, res) => {
        let voteTypeIdId = req.params.id;

        VOTETYPE.findByIdAndDelete(voteTypeIdId)
            .then((voteType) => {
                if (!voteType) return HTTP.error(res, 'There is no voteTypes with the given id in our database.');


                return HTTP.success(res, 'Deleted successfully');
            }).catch(err => HTTP.handleError(res, err));
    },
};