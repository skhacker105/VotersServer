const HELPER = require("../utilities/helper");

module.exports = (req, res, next) => {
    if (!req.headers.latitude || !req.headers.longitude) {
        return res.status(500).send({
            message: "Need Location Access",
        });
    }

    if (req.headers.authorization) {
        [authLongitude, authLatitude] = HELPER.getAuthLocations(req);
        if (authLongitude && authLatitude) {
            if (req.originalUrl != '/users/registerLocationChange' && (req.headers.longitude != authLongitude || req.headers.latitude != authLatitude)) {
                return res.status(444).send({
                    message: "Your location has changed. Please login again.",
                });
            }
        }
    }
    next();
};
