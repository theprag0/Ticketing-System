const mongoose = require('mongoose');
const User = require('./user');

const companySchema = new mongoose.Schema({
    name: String,
    type: String,
    admin: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
});

const Company = mongoose.model('Company', companySchema);
module.exports = Company;
