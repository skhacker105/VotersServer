const HELPER = require('../utilities/helper')

module.exports = (req, res, next) => {
    const loginuserid = HELPER.getAuthUserId(req);
    if (!loginuserid) {
        return res.status(500).send({
            message: 'Invalid Login'
        })
    }
    next();
}