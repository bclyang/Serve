var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var programSchema = require('./program').schema;

var userSchema = mongoose.Schema({

    local: {
        phone: String,
        password: String,
    },

    name: String,
    programs: [programSchema]

});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
