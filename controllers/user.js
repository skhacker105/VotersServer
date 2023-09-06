const PASSPORT = require('passport');
const HTTP = require('../utilities/http');
const USER = require('mongoose').model('User');
const ENCRYPTION = require('../utilities/encryption');

module.exports = {

    resetPassword: (req, res) => {
        const userId = req.params.userId;
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;
        if (confirmPassword != password) return HTTP.error(res, 'Password nad confirm password do not match')

        let salt = ENCRYPTION.generateSalt();
        let hashedPassword = ENCRYPTION.generateHashedPassword(salt, password);

        USER.findById(userId).then(user => {
            if (!user) return HTTP.error(res, `User not found in our database`);

            user.password = hashedPassword;
            user.salt = salt
            user.save();
            return HTTP.success(res, true);
        })
            .catch((err) => HTTP.handleError(res, err));
    },

    register: (req, res) => {
        PASSPORT.authenticate('local-register', (err, token) => {
            if (err || !token) {
                return res.status(400).json({
                    message: 'Registration failed!',
                    errors: { 'taken': 'Username or email already taken' }
                });
            }

            return res.status(200).json({
                message: 'Registration successful!',
                data: token
            });
        })(req, res);
    },

    login: (req, res) => {
        PASSPORT.authenticate('local-login', (err, token) => {
            if (err || !token) {
                return res.status(400).json({
                    message: 'Invalid Credentials!'
                });
            }

            return res.status(200).json({
                message: 'Login successful!',
                data: token
            });
        })(req, res);
    },

    getProfile: (req, res) => {
        let email = req.params.email;

        USER.findOne({ username: username })
            .then((user) => {
                if (!user) {
                    return res.status(400).json({
                        message: `User ${username} not found in our database`
                    });
                }

                let userToSend = {
                    _id: user._id,
                    avatar: user.avatar,
                    name: user.name,
                    email: user.email,
                    address: user.address,
                    isAdmin: user.isAdmin
                };

                return res.status(200).json({
                    message: '',
                    data: userToSend
                });
            })
            .catch((err) => {
                console.log(err);
                return res.status(400).json({
                    message: 'Something went wrong, please try again.'
                });
            });
    },

    updateProfile: (req, res) => {
        let userToChange = req.body._id;

        USER.findById(userToChange).then((user) => {
            if (!user) return HTTP.error(res, `User not found in our database`);

            user.name = req.body.name;
            user.save();
            HTTP.success(res, user, 'User information updated successfully')
        });
    }
};