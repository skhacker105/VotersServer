const CRYPTO = require('crypto');

module.exports = {
    generateSalt: () => {
        return CRYPTO.randomBytes(128).toString('base64');
    },

    generateHashedPassword: (salt, password) => {
        return CRYPTO.createHmac('sha256', salt).update(password).digest('hex');
    },

    parseJwt(token) {
        var base64Payload = token.split('.')[1];
        var payload = Buffer.from(base64Payload, 'base64');
        return JSON.parse(payload.toString());
    }
};