var mongoose = require('mongoose');

var barSchema = new mongoose.Schema({
   created: {
       type: Date,
       default: Date.now
   },
    title: {
        type: String,
        default: '',
        trim: true,
        required: 'Title cannot be blank'
    },
    location: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('Bar', barSchema);
