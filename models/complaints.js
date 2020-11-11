const mongoose = require('mongoose');
const User = require('./user');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const complaintSchema = new mongoose.Schema(
    {
        name: String,
        desc: String,
        type: String, //service or incident request
        ticketId: Number, //auto-incrementing sequence based on type
        createdAt: { type: Date, default: Date.now },
        reviewStartedAt: { type: Date },
        reviewPendingAt: { type: Date },
        reviewReopenAt: { type: Date },
        reviewClosedAt: { type: Date },
        companyId:{
           id:{
               type:mongoose.Schema.Types.ObjectId,
               ref:'Company'
           }
        },
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
        priority: String,
    },
    {
        timestamps: true,
    },
);

complaintSchema.plugin(AutoIncrement, {
    id: 'ticket_seq',
    inc_field: 'ticketId',
    reference_fields: ['type','companyId'],
    start_seq: '0001',
});

var Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
