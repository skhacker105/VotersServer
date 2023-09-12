const MONGOOSE = require('mongoose');
const STRING = MONGOOSE.Schema.Types.String;
const DATE = MONGOOSE.Schema.Types.Date;

const GEOLOCATION_SCHEMA = MONGOOSE.Schema({
    location: { type: STRING },
    accessDate: { type: DATE },
    latitude: { type: STRING, reqired: true },
    longitude: { type: STRING, reqired: true }
});

module.exports = GEOLOCATION_SCHEMA;