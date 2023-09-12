const LOCAL_STRATEGY = require('passport-local').Strategy;
const ENCRYPTION = require('../utilities/encryption');
const USER = require('mongoose').model('User');


module.exports = {
    localRegister: () => {
        return new LOCAL_STRATEGY({
            usernameField: 'email',
            passwordField: 'password',
            session: false,
            passReqToCallback: true
        }, (req, email, password, done) => {
            let user = {
                email: email,
                name: req.body.name,
                password: password
            };

            let salt = ENCRYPTION.generateSalt();
            let hashedPassword = ENCRYPTION.generateHashedPassword(salt, password);

            user.salt = salt;
            user.password = hashedPassword;


            USER.create(user).then((newUser) => {

                return done(null, newUser);

            }).catch(() => {
                return done(null, false);
            });
        }
        );
    },

    localLogin: () => {
        return new LOCAL_STRATEGY({
            usernameField: 'email',
            passwordField: 'password',
            session: false,
            passReqToCallback: true
        }, (req, email, password, done) => {

            USER.findOne({ email: { $regex: new RegExp(email, 'i') } })
                .then((user) => {
                    if (!user) {
                        return done(null, false);
                    }

                    if (!user.authenticate(password)) {
                        return done(null, false);
                    }

                    return done(null, user);
                });
        });
    }
};