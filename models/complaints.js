var mongoose = require('mongoose');
var User = require('./user');
var complaintSchema = new mongoose.Schema(
    {
        name: String,
        desc: String,
        reviewStartedAt: { type: Date },
        author: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            username: String,
            firstName: String,
            lastName: String,
            email: String,
        },
        status: String /** Pending => createdAt
        Open => reviewStartedAt
        Close => updatedAt */,
        assignedTo: String,
    },
    {
        timestamps: true,
    }
);

var Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
