const JwtStrategy = require('passport-jwt').Strategy;
const BearerStrategy = require('passport-http-bearer');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Client = require('../models/client');
const config = require('../config/database');

module.exports = function(passport) {
    let opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = config.secret;

    passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            const client = await Client.getClientById(jwt_payload._id);
            if(client){
                return done(null, client);
            } else {
                return done(null, false);
            }
        } catch (err) {
            return done(err, false);
        }
    }));
};
