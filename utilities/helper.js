const ENCRYPTION = require("../utilities/encryption");
const DISCUSSION_STATE = require('../contants/discussion-state');

module.exports = {
    messageType: {
        string: "string",
        internalProduct: "internal_product",
        internalCatalog: "internal_product_catalog",
    },

    isDate: (date) => {
        return new Date(date) !== "Invalid Date" && !isNaN(new Date(date)) && Date.parse(date) > 0;
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

    isTodayInDateRange(dt1, dt2) {
        if (!dt1 || dt2) return false;
        const start = new Date(dt1).getTime();
        const end_date = new Date(dt2);
        end_date.setHours(23, 59, 59, 999);
        const end = end_date.getTime();
        const today = new Date().getTime();
        return today >= start && today <= end;
    },
    
    isRegistrationOpen(discussion) {
        if (discussion["isRegistrationAllowed"] && discussion.state === DISCUSSION_STATE.regOpen) return true;
        return false;
    },
    
    isVotingOpen(discussion) {
        if (discussion.state === DISCUSSION_STATE.open || discussion.state === DISCUSSION_STATE.reopened) return true;
        return false;
    },

    validateCommentForm(payload) {
        let errors = {};
        let isFormValid = true;

        if (!payload || typeof payload.content !== "string" || payload.content.trim().length < 3) {
            isFormValid = false;
            errors.content = "Comment must be more than 3 symbols long.";
        }

        return {
            success: isFormValid,
            errors,
        };
    },

    newOTP(len = 6) {
        const digits = "0123456789";
        let result = "";
        for (let i = 0; i < len; i++) {
            result += digits[Math.floor(Math.random() * 10)];
        }
        return result;
    },

    getOTPMailData(toEmail, OTP) {
        return {
            from: "FirstBook_ITTeam@gmail.com", // sender address
            to: toEmail, // list of receivers
            subject: "Password Recovery",
            html: "<b>" + OTP + "</b> is your OTP to reset your password.",
        };
    },

    getStandardSearchCollation() {
        return {
            locale: "en", // use English as the language
            strength: 2, //  ignore case and diacritics, such as accents
        };
    },

    getOnlyDatePart(dt) {
        return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    },

    getUTCDatePart(dt) {
        return new Date(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate(), dt.getUTCHours(), dt.getUTCMinutes());
    },

    removeUserCreds(user) {
        if (!user) return undefined;
        user = JSON.parse(JSON.stringify(user));
        delete user.salt;
        delete user.password;
        return user;
    },
};

