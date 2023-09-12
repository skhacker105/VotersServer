const MONGOOSE = require("mongoose");

const ENCRYPTION = require("../utilities/encryption");
const GEOLOCATION_SCHEMA = require("./geoLocation");
const STRING = MONGOOSE.Schema.Types.String;
const BOOLEAN = MONGOOSE.Schema.Types.Boolean;

const USER_SCHEMA = MONGOOSE.Schema({
    email: { type: STRING, required: true, unique: true },
    name: { type: STRING, default: "" },
    address: [GEOLOCATION_SCHEMA],
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
    email: "text",
    password: "text",
    salt: "text",
});

const USER = MONGOOSE.model("User", USER_SCHEMA);

module.exports = USER;
