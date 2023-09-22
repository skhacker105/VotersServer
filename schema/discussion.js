const MONGOOSE = require("mongoose");
const { VOTE_TYPE_SCHEMA, REGISTER_TYPE_SCHEMA } = require("./vote");
const HELPER_SERVICE = require("../utilities/helper");
const REGISTRATION_STATE = require("../contants/registration-state");

const ENCRYPTION = require("../utilities/encryption");
const STRING = MONGOOSE.Schema.Types.String;
const NUMBER = MONGOOSE.Schema.Types.Number;
const BOOLEAN = MONGOOSE.Schema.Types.Boolean;
const OBJECT_ID = MONGOOSE.Schema.Types.ObjectId;
const DATE = MONGOOSE.Schema.Types.Date;

const DISCUSSION_SCHEMA = MONGOOSE.Schema({
    title: { type: STRING, required: true },
    message: { type: STRING, required: true },
    state: { type: STRING },
    voteTypes: [{ type: VOTE_TYPE_SCHEMA }],
    startDate: { type: DATE, dafault: Date.now },
    endDate: { type: DATE, dafault: Date.now },
    votes: [{ type: OBJECT_ID, ref: "Vote" }],
    registrations: [{ type: REGISTER_TYPE_SCHEMA }],
    isRegistrationAllowed: { type: BOOLEAN },
    registrationStartDate: { type: DATE },
    registrationEndDate: { type: DATE },
    createdBy: { type: OBJECT_ID, ref: "User" },
    createdOn: { type: DATE, dafault: Date.now },
});

DISCUSSION_SCHEMA.method({
    validateAndChangeState: function (registrationId, newState, loggedInUser) {
        return new Promise((resolve, reject) => {
            // Check Owners
            const isDiscussionOwner = this.createdBy.equals(loggedInUser);
            const registration = this.registrations.find((r) => r._id.equals(registrationId));
            if (!registration) return reject("There is no registration found with the given id in our database.");
            const isProfileOwner = registration.createdBy.equals(loggedInUser);

            // Discussion owner and it's actions
            if (
                isDiscussionOwner &&
                !isProfileOwner &&
                registration.state !== REGISTRATION_STATE.pendingApproval &&
                registration.state !== REGISTRATION_STATE.approved
            )
                reject("Participant has not submitted yet.");
            // Profile owner
            // Can edit only draft and rejected version
            else if (isProfileOwner && !HELPER_SERVICE.isRegistrationDraft(registration) && !HELPER_SERVICE.isRegistrationRejected(registration))
                return reject("You cannot edit submitted or approved versions");
            else if (!isDiscussionOwner && !isProfileOwner) return reject("You cannot edit someone else's profile");

            try {
                if (newState === REGISTRATION_STATE.approved) this.handleApprove(registration);
                else if (newState === REGISTRATION_STATE.draft && registration.state === REGISTRATION_STATE.approved) this.handleUnApprove(registration);
            } catch (err) {
                return reject(err);
            }
            registration["stateHistory"] = registration.stateHistory ? registration.stateHistory : [];
            registration.stateHistory.push({
                state: registration.state,
                createdBy: registration.lastStateChangedBy,
                createdOn: registration.lastStateChangedOn,
            });
            registration.state = newState;
            registration.lastStateChangedOn = new Date();
            registration.lastStateChangedBy = loggedInUser;
            resolve();
        });
    },

    handleApprove(registration, loggedInUser) {
        if (this.voteTypes.some((vt) => vt.ui_id === registration.ui_id)) throw new Error("Profile is already present in voting options.");

        this.voteTypes.push({
            ui_id: registration.ui_id,
            iconOption: registration.iconOption,
            name: registration.name,
            image: registration.image,
            profile: registration.profile,
            createdBy: loggedInUser,
            createdOn: new Date(),
            iconOption: registration.iconOption,
        });
    },

    handleUnApprove(registration) {
        const idx = this.voteTypes.findIndex((vt) => vt.ui_id === registration.ui_id);
        if (idx < 0) throw new Error("Profile is not present in voting options.");
        this.voteTypes.splice(idx, 1);
    },
});

const DISCUSSION = MONGOOSE.model("Discussion", DISCUSSION_SCHEMA);

module.exports = DISCUSSION;
