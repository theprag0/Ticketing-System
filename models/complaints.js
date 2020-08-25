var mongoose = require('mongoose');
var User = require('./user');
var complaintSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        desc: { type: String },
        reviewStartedAt: { type: Date },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        status: { type: String } /** Pending => createdAt
        Open => reviewStartedAt
        Close => updatedAt */,
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

var Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
