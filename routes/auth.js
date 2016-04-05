var express = require('express');
var router = express.Router();

var passport = require('passport');
var mongoose = require('mongoose');
var Account = require('../models/account');
var configDb = require('../config/db.js');
var gitHub = require('passport-github2');
var FacebookStrategy = require('passport-facebook').Strategy;
var fbConfig = require('../config/fb.js');

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
        res.redirect('/bars');
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

passport.use(new FacebookStrategy({
  clientID        : fbConfig.appID,
  clientSecret    : fbConfig.appSecret,
  callbackURL     : fbConfig.callbackUrl
},
 
  // facebook will send back the tokens and profile
  function(access_token, refresh_token, profile, done) {
    // asynchronous
    process.nextTick(function() {
     
      // find the user in the database based on their facebook id
      User.findOne({ 'id' : profile.id }, function(err, account) {
 
        // if there is an error, stop everything and return that
        // ie an error connecting to the database
        if (err)
          return done(err);
 
          // if the user is found, then log them in
          if (account) {
            return done(null, user); // user found, return that user
          } else {
            // if there is no user found with that facebook id, create them
            var newUser = new Account();
 
            // set all of the facebook information in our user model
            newUser.fb.id    = profile.id; // set the users facebook id                 
            newUser.fb.access_token = access_token; // we will save the token that facebook provides to the user                    
            newUser.fb.firstName  = profile.name.givenName;
            newUser.fb.lastName = profile.name.familyName; // look at the passport user profile to see how names are returned
            newUser.fb.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
 
            // save our user to the database
            newUser.save(function(err) {
              if (err)
                throw err;
 
              // if successful, return the new user
              return done(null, newUser);
            });
         } 
      });
    });
}));

// route for facebook authentication and login
// different scopes while logging in
router.get('/facebook', 
  passport.authenticate('facebook', { scope : 'email' }
));
 
// handle the callback after facebook has authenticated the user
router.get('/auth/facebook/callback',
  passport.authenticate('/auth/facebook', {
    failureRedirect : '/auth/login',
    function(req, res) {
        res.redirect('/bars');
    }
  })
);

function isLoggedIn(req, res, next) {

    if (req.isAuthenticated()) {
        return next();
    }
    else {
        res.redirect('/auth/login');
    }
}

module.exports = router, passport;
