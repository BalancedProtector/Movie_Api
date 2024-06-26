const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Models = require('./models.js'),
    passportJWT = require('passport-jwt');

let Users = Models.User,
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

passport.use(new LocalStrategy({
            usernameField: 'Name',
            passwordField: 'Password',
        }, async (name, password, callback) => {
            console.log(`${name} ${password}`);
            await Users.findOne({Name: name})
                .then((user) => {
                    if(!user) {
                        console.log('Incorrect Username');
                        return callback(null, false, {
                            message: 'Incorrect Username or Password.',
                        });
                    }
                    if (!user.validatePassword(password)) {
                        console.log('incorrect password');
                        return callback(null, false, {message: 'Incorrect Password.'});
                    }
                    console.log('Finished');
                    return callback(null, user);
                })
                .catch ((error) => {
                    if(error) {
                        console.log(error);
                        return callback(error);
                    }
                })
        }
    )
);
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret',
    }, async (jwtPayload, callback) => {
    return await Users.findById(jwtPayload._id)
        .then((user) => {
            return callback(null, user);
        })
        .catch((error) => {
            return callback(error)
        });
}));