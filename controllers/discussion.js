const DISCUSSION = require("mongoose").model("Discussion");
const VOTE = require("mongoose").model("Vote");
const HELPER = require("../utilities/helper");
const HTTP = require("../utilities/http");
const DISCUSSION_STATES = require("../contants/discussion-state");
const REGISTRATION_STATES = require("../contants/registration-state");
const USER_SELECT_COLUMN = require("../contants/user-select-columns");

function validateEditDiscussion(discussion, loginuserid) {
    if (!discussion) return "There is no discussion with the given id in our database.";
    if (!discussion.createdBy.equals(loginuserid)) return "You cannot edit someone else's discussion.";
    if (discussion.state === DISCUSSION_STATES.blocked) return "You cannot edit a blocked discussion.";
    if ([DISCUSSION_STATES.reopened, DISCUSSION_STATES.open].indexOf(discussion.state) >= 0) return "You cannot change it. Discussion is up for voting.";
    if (HELPER.isVotingOpen(discussion)) return "You cannot change it. Discussion is up for voting..";
    if (HELPER.isRegistrationOpen(discussion)) return "You cannot change it. Discussion is up for registration.";

    return undefined;
}

module.exports = {
    add: (req, res) => {
        let discussionBody = req.body;
        discussionBody["createdBy"] = HELPER.getAuthUserId(req);
        discussionBody["createdOn"] = new Date();
        if (HELPER.isVotingOpen(discussionBody)) discussionBody["state"] = DISCUSSION_STATES.open;
        else if (HELPER.isRegistrationOpen(discussionBody)) discussionBody["state"] = DISCUSSION_STATES.regOpen;
        else discussionBody["state"] = DISCUSSION_STATES.draft;

        DISCUSSION.create(discussionBody)
            .then((discussion) => {
                DISCUSSION.findById(discussion._id)
                    .then((addedDiscussion) => {
                        return HTTP.success(res, addedDiscussion, "Discussion added successfully!");
                    })
                    .catch((err) => HTTP.handleError(res, err));
            })
            .catch((err) => HTTP.handleError(res, err));
    },

    edit: (req, res) => {
        let discussionId = req.params.id;
        let edittedDiscussion = req.body;
        const loginuserid = HELPER.getAuthUserId(req);

        DISCUSSION.findById(discussionId)
            .then((discussion) => {
                const anyError = validateEditDiscussion(discussion, loginuserid);
                if (anyError) return HTTP.error(res, anyError);

                discussion.isRegistrationAllowed = edittedDiscussion.isRegistrationAllowed;
                discussion.registrationStartDate = edittedDiscussion.registrationStartDate;
                discussion.registrationEndDate = edittedDiscussion.registrationEndDate;
                discussion.startDate = edittedDiscussion.startDate;
                discussion.endDate = edittedDiscussion.endDate;
                discussion.title = edittedDiscussion.title;
                discussion.voteTypes = edittedDiscussion.voteTypes;
                discussion.message = edittedDiscussion.message;
                discussion.save();

                DISCUSSION.findById(discussion._id)
                    .then((updatedDiscussion) => {
                        return HTTP.success(res, updatedDiscussion, "Discussion updated successfully!");
                    })
                    .catch((err) => HTTP.handleError(res, err));
            })
            .catch((err) => HTTP.handleError(res, err));
    },

    updateState: (req, res) => {
        let discussionId = req.params.id;
        let edittedState = req.body;
        const loginuserid = HELPER.getAuthUserId(req);

        DISCUSSION.findById(discussionId)
            .then((discussion) => {
                if (!discussion) return HTTP.error(res, "There is no discussion with the given id in our database.");
                if (!discussion.createdBy.equals(loginuserid)) return HTTP.error(res, "You cannot edit someone else's discussion.");
                if (discussion.state === DISCUSSION_STATES.blocked && edittedState.newState != DISCUSSION_STATES.draft)
                    return HTTP.error(res, "You cannot update a blocked discussion.");

                discussion.state = edittedState.newState;
                discussion.save();

                DISCUSSION.findById(discussion._id)
                    .then((updatedDiscussion) => {
                        return HTTP.success(res, updatedDiscussion, "Discussion updated successfully!");
                    })
                    .catch((err) => HTTP.handleError(res, err));
            })
            .catch((err) => HTTP.handleError(res, err));
    },

    getSingle: (req, res) => {
        let discussionId = req.params.id;
        const loginuserid = HELPER.getAuthUserId(req);

        DISCUSSION.findById(discussionId)
            .populate("createdBy", USER_SELECT_COLUMN)
            .populate("votes")
            .populate({
                path: "votes",
                populate: {
                    path: "user",
                    select: USER_SELECT_COLUMN,
                },
            })
            .populate({
                path: "registrations",
                populate: {
                    path: "createdBy",
                    select: USER_SELECT_COLUMN,
                },
            })
            .then((discussion) => {
                if (!discussion) return HTTP.error(res, "There is no discussions in our database with given id.");

                if (!discussion.createdBy.equals(loginuserid))
                    discussion.registrations = discussion.registrations.filter(
                        (r) => r.state === REGISTRATION_STATES.approved || r.createdBy.equals(loginuserid)
                    );
                return HTTP.success(res, discussion);
            })
            .catch((err) => HTTP.handleError(res, err));
    },

    getAll: (req, res) => {
        DISCUSSION.find({})
            .then((discussions) => {
                if (!discussions) return HTTP.error(res, "There is no discussions in our database.");

                return HTTP.success(res, discussions);
            })
            .catch((err) => HTTP.handleError(res, err));
    },

    getMyDiscussions: (req, res) => {
        const loggedInId = HELPER.getAuthUserId(req);
        const qry = req.body;
        let sorter = {};
        sorter[qry.sortColumn] = qry[qry.sortOrder];
        DISCUSSION.find({ createdBy: loggedInId })
            .count()
            .then((count) => {
                DISCUSSION.find({ createdBy: loggedInId })
                    .limit(qry.pageSize)
                    .skip(qry.pageSize * qry.pageNumber)
                    .sort(sorter)
                    .populate("createdBy", USER_SELECT_COLUMN)
                    .populate("votes")
                    .populate({
                        path: "votes",
                        populate: {
                            path: "user",
                            select: USER_SELECT_COLUMN,
                        },
                    })
                    .then((discussions) => {
                        if (!discussions) return HTTP.error(res, "There is no discussions in our database.");

                        qry["data"] = discussions.map((d) => {
                            d.registrations = [];
                            return d;
                        });
                        qry["dataLength"] = count;
                        return HTTP.success(res, qry);
                    })
                    .catch((err) => HTTP.handleError(res, err));
            })
            .catch((err) => HTTP.handleError(res, err));
    },

    getNewsPaper: (req, res) => {
        const qry = {};
        DISCUSSION.find(qry)
            .limit(qry.pageSize)
            .skip(qry.pageSize * qry.pageNumber)
            .populate("createdBy", USER_SELECT_COLUMN)
            .populate("votes")
            .populate({
                path: "votes",
                populate: {
                    path: "user",
                    select: USER_SELECT_COLUMN,
                },
            })
            .then((discussions) => {
                if (!discussions) return HTTP.error(res, "There is no discussions in our database.");

                qry["data"] = discussions;
                qry["dataLength"] = discussions.length;
                return HTTP.success(res, qry);
            })
            .catch((err) => HTTP.handleError(res, err));
    },

    deleteById: (req, res) => {
        let discussionId = req.params.id;

        DISCUSSION.findByIdAndDelete(discussionId)
            .then((discussion) => {
                if (!discussion) return HTTP.error(res, "There is no voteTypes with the given id in our database.");
                if (!discussion.createdBy.equals(loginuserid)) return HTTP.error(res, "You cannot delete someone else's discussion.");

                if (discussion.votes && discussion.votes.length > 0) {
                    const allCalls = discussion.votes.map((v) => VOTE.findByIdAndDelete(v._id));

                    Promise.all(allCalls)
                        .then((deletedVotes) => {
                            return HTTP.success(res, "Deleted successfully");
                        })
                        .catch((err) => HTTP.handleError(res, err));
                } else return HTTP.success(res, "Deleted successfully");
            })
            .catch((err) => HTTP.handleError(res, err));
    },

    voteFor: (req, res) => {
        let discussionId = req.params.id;
        let voteId = req.body.voteId;
        const loginuserid = HELPER.getAuthUserId(req);

        DISCUSSION.findById(discussionId)
            .populate("votes")
            .then((discussion) => {
                if (!discussion) return HTTP.error(res, "There is no discussion with the given id in our database.");

                if (discussion.votes.find((v) => v.user === loginuserid)) {
                    return HTTP.error(res, "You cannot have multiple votes.");
                }

                discussion.votes.push(voteId);
                discussion.save();
                return HTTP.success(res, "Voted successfully");
            })
            .catch((err) => HTTP.handleError(res, err));
    },

    registerProfile: (req, res) => {
        const discussionId = req.params.id;
        const loginuserid = HELPER.getAuthUserId(req);
        let registerForm = {
            ui_id: req.body.ui_id,
            iconOption: req.body.iconOption,
            name: req.body.name,
            image: req.body.image,
            profile: req.body.profile,
            createdBy: loginuserid,
            createdOn: new Date(),
            lastStateChangedOn: new Date(),
            iconOption: req.body.iconOption,
            state: REGISTRATION_STATES.draft,
        };

        DISCUSSION.findById(discussionId)
            .then((discussion) => {
                if (!discussion) return HTTP.error(res, "There is no discussion with the given id in our database.");
                if (!HELPER.isRegistrationOpen(discussion)) return HTTP.error(res, "Registrations are closed for this discussion.");

                // Find if already Voted
                let registration = discussion.registrations.find((r) => r.ui_id === loginuserid);
                if (registration) return HTTP.error(res, "You have already sent registration request before.");

                discussion.registrations = discussion.registrations ? discussion.registrations : [];
                discussion.registrations.push(registerForm);
                discussion
                    .save()
                    .then(() => {
                        DISCUSSION.findById(discussionId)
                            .then((updatedDiscussion) => {
                                return HTTP.success(
                                    res,
                                    updatedDiscussion.registrations[updatedDiscussion.registrations.length - 1],
                                    "Registered successfully!"
                                );
                            })
                            .catch((err) => HTTP.handleError(res, err));
                    })
                    .catch((err) => HTTP.handleError(res, err));
            })
            .catch((err) => HTTP.handleError(res, err));
    },

    updateProfile: (req, res) => {
        const discussionId = req.params.id;
        const loginuserid = HELPER.getAuthUserId(req);

        DISCUSSION.findById(discussionId)
            .then((discussion) => {
                if (!discussion) return HTTP.error(res, "There is no discussion with the given id in our database.");
                if (!HELPER.isRegistrationOpen(discussion)) return HTTP.error(res, "Registrations are closed for this discussion.");

                let registration = discussion.registrations.find((r) => r.ui_id === loginuserid);
                if (!registration) return HTTP.error(res, "Cannot find your registration to update.");
                if (!registration.createdBy.equals(loginuserid)) return HTTP.error(res, "You cannot edit someone else's profile.");
                if (!HELPER.isRegistrationDraft(registration) && !HELPER.isRegistrationRejected(registration))
                    return HTTP.error(res, "You cannot edit your profile now.");

                registration.profile = req.body.profile;
                discussion.save();

                return HTTP.success(res, registration, "Profile updated");
            })
            .catch((err) => HTTP.handleError(res, err));
    },

    updateRegistrationState: (req, res) => {
        const discussionId = req.params.id;
        const registrationId = req.params.registration_id;
        const loginuserid = HELPER.getAuthUserId(req);
        const newState = req.body.newState;

        DISCUSSION.findById(discussionId)
            .then((discussion) => {
                if (!discussion) return HTTP.error(res, "There is no discussion with the given id in our database.");
                if (!HELPER.isRegistrationOpen(discussion) && newState != REGISTRATION_STATES.approved && newState != REGISTRATION_STATES.rejected)
                    return HTTP.error(res, "Registrations are closed for this discussion.");

                // Validate State Change is allowed or not
                discussion
                    .validateAndChangeState(registrationId, newState, loginuserid)
                    .then(() => {
                        discussion.save();
                        return HTTP.success(res, "Status changed successfully");
                    })
                    .catch((err) => HTTP.handleError(res, err));
            })
            .catch((err) => HTTP.error(res, err));
    },
};
