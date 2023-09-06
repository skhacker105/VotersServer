const JWT = require('jsonwebtoken');
const LOCAL_STRATEGY = require('passport-local').Strategy;
const ENCRYPTION = require('../utilities/encryption');
const USER = require('mongoose').model('User');

const SECRET = '5b362e2a094b97392c3d7bba';

function generateToken(userInfo) {
    const USER = {
        _id: userInfo._id,
        email: userInfo.email,
        name: userInfo.name,
        avatar: userInfo.avatar,
        isAdmin: userInfo.isAdmin
    };
    const PAYLOAD = { sub: USER };

    return JWT.sign(PAYLOAD, SECRET, { expiresIn: +process.env.sessionExpiry });
}

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

                let token = generateToken(newUser);
                return done(null, token);

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
            session: false
        }, (email, password, done) => {
            USER.findOne({ email: { $regex: new RegExp(email, 'i') } })
                .then((user) => {
                    if (!user) {
                        return done(null, false);
                    }

                    if (!user.authenticate(password)) {
                        return done(null, false);
                    }

                    let token = generateToken(user);

                    return done(null, token);
                });
        }
        );
    }
};