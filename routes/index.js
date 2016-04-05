var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Bar = require('../models/bar');

router.get('/', function(req, res, next) {
    Bar.find(function (err, bars) {
        if (err) {
            console.log(err);
            res.end(err);
        }
        else {
            res.render('index', {

                title: 'Rock Bar Directory',
                bars: bars
            });
        }
    });
});

module.exports = router;