var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var supportSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    email: String,
});

supportSchema.plugin(passportLocalMongoose);

var Support = mongoose.model('Support', supportSchema);
module.exports = Support;
