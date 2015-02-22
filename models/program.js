var mongoose = require('mongoose');

var programSchema = mongoose.Schema({

    name: String,
    description: String,
    recipients: [String],
    code: String

});

module.exports.schema = programSchema;
module.exports.model = mongoose.model('Program', programSchema);