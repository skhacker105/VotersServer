const JWT = require("jsonwebtoken");
const PASSPORT = require("passport");
const HTTP = require("../utilities/http");
const USER = require("mongoose").model("User");
const ENCRYPTION = require("../utilities/encryption");
const HELPER = require('../utilities/helper');

// Secret Key Values
const SECRET = '5b362e2a094b97392c3d7bba';

function generateToken(userInfo, longitude, latitude) {
    const USER = {
        _id: userInfo._id,
        email: userInfo.email,
        name: userInfo.name,
        avatar: userInfo.avatar,
        isAdmin: userInfo.isAdmin,
        longitude: longitude,
        latitude: latitude,
    };
    const PAYLOAD = { sub: USER };

    return JWT.sign(PAYLOAD, SECRET, { expiresIn: +process.env.sessionExpiry });
}

function logLocationChanged(req, dbuserId = undefined) {
    return new Promise((resolve, reject) => {
        const [longitude, latitude] = getLongLat(req);
        const userId = dbuserId ? dbuserId : HELPER.getAuthUserId(req);
        if (!userId) return reject('No loggedin user found.');

        USER.findById(userId).then((user) => {
            if (!user) return reject('Loggedin user not found in our database.');

            if (!user.address) user.address = [];
            user.address.push({ longitude, latitude });
            user.save();

            let token = generateToken(user, longitude, latitude);
            return resolve(token);
        })
        .catch(err => reject(err));
    });
}

function getLongLat(req) {
    return [req.headers.longitude, req.headers.latitude];
}

module.exports = {
    resetPassword: (req, res) => {
        const userId = req.params.userId;
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;
        if (confirmPassword != password) return HTTP.error(res, "Password nad confirm password do not match");

        let salt = ENCRYPTION.generateSalt();
        let hashedPassword = ENCRYPTION.generateHashedPassword(salt, password);

        USER.findById(userId)
            .then((user) => {
                if (!user) return HTTP.error(res, `User not found in our database`);

                user.password = hashedPassword;
                user.salt = salt;
                user.save();
                return HTTP.success(res, true);
            })
            .catch((err) => HTTP.handleError(res, err));
    },

    register: (req, res) => {
        PASSPORT.authenticate("local-register", (err, newuser) => {
            if (err || !newuser) {
                return res.status(400).json({
                    message: "Registration failed!",
                    errors: { taken: "Username or email already taken" },
                });
            }

            logLocationChanged(req, newuser._id)
            .then((token) => {
                if (!token) HTTP.error(res, 'Location Registration failed');

                return res.status(200).json({
                    message: "Registration successful!",
                    data: token,
                });
            })
            .catch((err) => HTTP.handleError(res, err));
        })(req, res);
    },

    login: (req, res) => {
        PASSPORT.authenticate("local-login", (err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    message: "Invalid Credentials!",
                });
            }

            logLocationChanged(req, user._id)
            .then((token) => {
                if (!token) HTTP.error(res, 'Location Registration failed');

                return res.status(200).json({
                    message: "Login successful!",
                    data: token,
                });
            })
            .catch((err) => HTTP.handleError(res, err));
        })(req, res);
    },

    getProfile: (req, res) => {
        let email = req.params.email;

        USER.findOne({ username: username })
            .then((user) => {
                if (!user) {
                    return res.status(400).json({
                        message: `User ${username} not found in our database`,
                    });
                }

                let userToSend = {
                    _id: user._id,
                    avatar: user.avatar,
                    name: user.name,
                    email: user.email,
                    address: user.address,
                    isAdmin: user.isAdmin,
                };

                return res.status(200).json({
                    message: "",
                    data: userToSend,
                });
            })
            .catch((err) => {
                return res.status(400).json({
                    message: "Something went wrong, please try again.",
                });
            });
    },

    updateProfile: (req, res) => {
        let userToChange = req.body._id;

        USER.findById(userToChange).then((user) => {
            if (!user) return HTTP.error(res, `User not found in our database`);

            user.name = req.body.name;
            user.save();
            HTTP.success(res, user, "User information updated successfully");
        });
    },

    registerLocationChange: (req, res) => {
        logLocationChanged(req)
            .then((token) => {
                if (!token) HTTP.error(res, 'Location Registration failed');

                return HTTP.success(res, token)
            })
            .catch((err) => HTTP.handleError(res, err));
    },
};
