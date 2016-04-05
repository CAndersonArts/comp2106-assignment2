var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Bar = require('../models/bar');
var passport = require('passport');

router.get('/', isLoggedIn, function(req, res, next) {
    Bar.find(function (err, bars) {
        if (err) {
            console.log(err);
            res.end(err);
        }
        else {
            res.render('bars/index', {

                title: 'Bars',
                bars: bars
            });
        }
    });
});

router.get('/add', isLoggedIn, function(req, res, next) {

    res.render('bars/add', {
        title: 'Add a New Bar'
    });
});

router.post('/add', isLoggedIn, function(req, res, next) {

    Bar.create( {
            title: req.body.title,
            location: req.body.location,
            website: req.body.website,
            city: req.body.city,
            founded: req.body.founded
        }
    );

    res.redirect('/bars');
});

router.get('/:id', isLoggedIn, function(req, res, next) {
    var id = req.params.id;

    Bar.findById(id,  function(err, bar) {
       if (err) {
           console.log(err);
           res.end(err);
       }
        else {
           res.render('bars/edit', {
               title: 'Bar Details',
               bar: bar
           });
       }
    });
});

router.post('/:id', isLoggedIn, function(req, res, next) {
    var id = req.params.id;

    var bar = new Bar( {
        _id: id,
        title: req.body.title,
        location: req.body.location,
        website: req.body.website,
        city: req.body.city,
        founded: req.body.founded
    });

    Bar.update( { _id: id }, bar,  function(err) {
        if (err) {
            console.log(err)
            res.end(err);
        }
        else {
            res.redirect('/bars');
        }
    });
});

router.get('/delete/:id', isLoggedIn, function(req, res, next) {
    var id = req.params.id;

    console.log('trying to delete');

    Bar.remove({ _id: id }, function(err) {
        if (err) {
            console.log(err);
            res.end(err);
        }
        else {
            res.redirect('/bars');
        }
    });
});

function isLoggedIn(req, res, next) {

    if (req.isAuthenticated()) {
        return next();
    }
    else {
        res.redirect('/auth/login');
    }
}

module.exports = router;
