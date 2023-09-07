module.exports = (req, res, next) => {
    if (!req.headers.latitude || !req.headers.longitude) {
        return res.status(500).send({
            error: 'Need Location Access'
        })
    }
    next();
}