const HELPER = require('../utilities/helper')

module.exports = (req, res, next) => {
    if (!HELPER.isAdmin(req)) {
        return res.status(500).send({
            message: 'Only Admin can access'
        })
    }
    next();
}