const MONGOOSE = require('mongoose');

MONGOOSE.Promise = global.Promise;

module.exports = () => {
    MONGOOSE.connect(process.env.connectionString,
        { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {

            console.log('Connected to MongoDB');
            let db = MONGOOSE.connection;
            db.on('open', (err) => {
                if (err) {
                    throw err;
                }

                console.log('MongoDB is ready!');
            });
        })
        .catch(err => {

            console.log('MongoDB Error: ', err);
        })


    require('../schema/vote');
    require('../schema/user');
    require('../schema/discussion');
};