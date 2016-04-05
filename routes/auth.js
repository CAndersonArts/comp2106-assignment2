var express = require('express');
var router = express.Router();

var passport = require('passport');
var mongoose = require('mongoose');
var Account = require('../models/account');
var configDb = require('../config/db.js');
var gitHub = require('passport-github2');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    Account.findById(id, function(err, user) {
        done(err, user);
    });
});


passport.use(new gitHub({
    clientID: configDb.githubClientId,
    clientSecret: configDb.githubClientSecret,
    callbackURL: configDb.githubCallbackUrl
}, function(accessToken, refreshToken, profile, done) {
        var searchQuery = { name: profile.displayName };

        var updates = {
            name: profile.displayName,
            someID: profile.id
        };

        var options = { upsert: true };

        Account.findOneAndUpdate(searchQuery, updates, options, function(err, user) {
            if (err) {
                return done(err);
            }
            else {
                return done(null, user);
            }
        });
    }
));

router.get('/github', passport.authenticate('github', { scope: ['user.email'] }));

router.get('/github/callback', passport.authenticate('github', {
    failureRedirect: '/auth/login'}),
    function(req, res) {
        res.redirect('/articles');
    }
);

router.get('/login', function(req, res, next) {
    var messages = req.session.messages || [];

    req.session.messages = [];

    if (req.isAuthenticated()) {
        res.redirect('/auth/welcome');
    }
    else {
        res.render('auth/login', {
            title: 'Login',
            user: req.user,
            messages: messages
        });
    }

});


 router.post('/login', passport.authenticate('local', {
    successRedirect: '/auth/welcome',
    failureRedirect: '/auth/login',
    failureMessage: 'Invalid Login'
    //failureFlash: true
}));

router.get('/register', function(req, res, next) {
   res.render('auth/register', {
    title: 'Register'
   });
});

router.get('/welcome', isLoggedIn, function(req, res, next) {
   res.render('auth/welcome', {
       title: 'Welcome',
       user: req.user
   });
});

router.post('/register', function(req, res, next) {

    Account.register(new Account({ username: req.body.username }), req.body.password, function(err, account) {
        if (err) {
           return res.render('auth/register', { title: 'Register' });
        }
        else {
            res.redirect('/auth/login');
        }
    });
});

router.get('/logout', function(req, res, next) {
    req.logout();
    res.redirect('/');
});

function isLoggedIn(req, res, next) {

    if (req.isAuthenticated()) {
        return next();
    }
    else {
        res.redirect('/auth/login');
    }
}

module.exports = router, passport;
