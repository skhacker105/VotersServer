const ENCRYPTION = require('../utilities/encryption');

module.exports = {

    messageType: {
        string: 'string',
        internalProduct: 'internal_product',
        internalCatalog: 'internal_product_catalog'
    },

    isDate: (date) => {
        return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date)) && Date.parse(date) > 0;
    },

    getAuthUserId: (req) => {
        return ENCRYPTION.parseJwt(req.headers.authorization).sub._id;
    },

    getAuthLocations: (req) => {
        const sub = ENCRYPTION.parseJwt(req.headers.authorization).sub;
        return [sub?.longitude, sub?.latitude];
    },

    isAdmin: (req) => {
        return ENCRYPTION.parseJwt(req.headers.authorization).sub.isAdmin;
    },

    validateCommentForm(payload) {
        let errors = {};
        let isFormValid = true;

        if (!payload || typeof payload.content !== 'string' || payload.content.trim().length < 3) {
            isFormValid = false;
            errors.content = 'Comment must be more than 3 symbols long.';
        }

        return {
            success: isFormValid,
            errors
        };
    },

    newOTP(len = 6) {
        const digits = '0123456789';
        let result = ''
        for (let i = 0; i < len; i++) {
            result += digits[Math.floor(Math.random() * 10)];
        }
        return result;
    },

    getOTPMailData(toEmail, OTP) {
        return {
            from: 'FirstBook_ITTeam@gmail.com',  // sender address
            to: toEmail,   // list of receivers
            subject: 'Password Recovery',
            html: '<b>' + OTP + '</b> is your OTP to reset your password.'
        }
    },

    getStandardSearchCollation() {
        return {
            'locale': 'en', // use English as the language
            'strength': 2, //  ignore case and diacritics, such as accents
        };
    },

    getOnlyDatePart(dt) {
        return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
    },

    getUTCDatePart(dt) {
        return new Date(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate(), dt.getUTCHours(), dt.getUTCMinutes())
    },

    removeUserCreds(user) {
        if (!user) return undefined;
        user = JSON.parse(JSON.stringify(user))
        delete user.salt;
        delete user.password;
        return user;
    }
};

function updateComparision(comparison, key, added, updated, deleted) {
    if (comparison.updated.length > 0) {
        updated[key] = comparison.updated;
    }
    if (comparison.added.length > 0) {
        added[key] = comparison.added;
    }
    if (comparison.deleted.length > 0) {
        deleted[key] = comparison.deleted;
    }
}


