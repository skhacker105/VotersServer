const MONGOOSE = require('mongoose');

const ENCRYPTION = require('../utilities/encryption');
const STRING = MONGOOSE.Schema.Types.String;
const NUMBER = MONGOOSE.Schema.Types.Number;
const BOOLEAN = MONGOOSE.Schema.Types.Boolean;
const OBJECT_ID = MONGOOSE.Schema.Types.ObjectId;
const DATE = MONGOOSE.Schema.Types.Date;

const VOTE_TYPE_SCHEMA = MONGOOSE.Schema({
    ui_id: { type: STRING, required: true },
    iconOption: { type: STRING, required: true },
    name: { type: STRING, required: true },
    matIcon: { type: STRING },
    image: { type: STRING },
    profile: { type: STRING },
    createdBy: { type: OBJECT_ID, ref: 'User' },
    createdOn: { type: DATE, dafault: Date.now }
});

const VOTE_SCHEMA = MONGOOSE.Schema({
    user: { type: OBJECT_ID, required: true, ref: 'User' },
    message: { type: STRING },
    voteType: { type: VOTE_TYPE_SCHEMA, required: true },
    discussion: { type: OBJECT_ID, ref: 'Discussion' },
    createdOn: { type: DATE, dafault: Date.now }
});


// const VOTETYPE = MONGOOSE.model('VoteType', VOTE_TYPE_SCHEMA);
const VOTE = MONGOOSE.model('Vote', VOTE_SCHEMA);

module.exports = { VOTE, VOTE_TYPE_SCHEMA };