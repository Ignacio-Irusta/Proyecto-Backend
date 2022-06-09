const passport = require('passport');
const { db } = require('../models/user');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');

//
passport.serializeUser((user, done) =>{
    done(null, user.id);
});

passport.deserializeUser(async (id, done) =>{
    const user = await User.findById(id);
    done(null, user)
});

//
passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    const users = await User.findOne({'email': email});
    if(users){
        return done(null, false, req.flash('signupMessage', 'El email ya existe.'));
    }else {
        const user = new User(req.body);
        /*user.email = email;
        user.password = user.encryptPassword(password);*/
        await user.save();
        done(null, user);
    }
}));

passport.use('local-signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    const user = await User.findOne({'email': email, 'password': password});
    if(!user){
        return done(null, false, req.flash('signinMessage', 'Usuario o contraseña incorrecta, vuelva a intentar.'))
    } else {
        done(null, user);
    }
}));