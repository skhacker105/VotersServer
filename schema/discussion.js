const MONGOOSE = require('mongoose');

const ENCRYPTION = require('../utilities/encryption');
const STRING = MONGOOSE.Schema.Types.String;
const NUMBER = MONGOOSE.Schema.Types.Number;
const BOOLEAN = MONGOOSE.Schema.Types.Boolean;
const OBJECT_ID = MONGOOSE.Schema.Types.ObjectId;
const DATE = MONGOOSE.Schema.Types.Date;

const DISCUSSION_SCHEMA = MONGOOSE.Schema({
    title: { type: STRING, required: true },
    message: { type: STRING, required: true },
    state: { type: STRING },
    votes: [{ type: OBJECT_ID, ref: 'Vote' }],
    createdBy: { type: OBJECT_ID, ref: 'User' },
    createdOn: { type: DATE, dafault: Date.now }
});


const DISCUSSION = MONGOOSE.model('Discussion', DISCUSSION_SCHEMA);

module.exports = DISCUSSION;