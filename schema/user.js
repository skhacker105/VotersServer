const MONGOOSE = require('mongoose');

const ENCRYPTION = require('../utilities/encryption');
const STRING = MONGOOSE.Schema.Types.String;
const NUMBER = MONGOOSE.Schema.Types.Number;
const BOOLEAN = MONGOOSE.Schema.Types.Boolean;
const OBJECT_ID = MONGOOSE.Schema.Types.ObjectId;
const DATE = MONGOOSE.Schema.Types.Date;

const USER_SCHEMA = MONGOOSE.Schema({
    email: { type: STRING, required: true, unique: true },
    name: { type: STRING, default: '' },
    address: [{
        type: {
            location: { type: STRING },
            accessDate: { type: DATE },
            latitude: { type: STRING },
            longitude: { type: STRING }
        }
    }],
    avatar: { type: STRING },
    isAdmin: { type: BOOLEAN, default: false },
    password: { type: STRING, required: true },
    salt: { type: STRING, required: true },
});

USER_SCHEMA.method({
    authenticate: function (password) {
        let hashedPassword = ENCRYPTION.generateHashedPassword(this.salt, password);

        if (hashedPassword === this.password) {
            return true;
        }

        return false;
    }
});

USER_SCHEMA.index({
    email: 'text',
    password: 'text',
    salt: 'text'
});


const USER = MONGOOSE.model('User', USER_SCHEMA);

module.exports = USER;