var mongoose = require('mongoose');
var User = require('./user');
var complaintSchema = new mongoose.Schema(
    {
        name: String,
        desc: String,
        createdAt: { type: Date, default: Date.now },
        reviewStartedAt: { type: Date },
        reviewPendingAt: { type: Date },
        reviewReopenAt: { type: Date },
        reviewClosedAt: { type: Date },
        author: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        },
        archived: { type: Boolean, default: false },
        archivingTime: { type: Date },
        status: {
            type: String,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        responseTime: String,
        resolveTime: String,
    },
    {
        timestamps: true,
    },
);

var Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
