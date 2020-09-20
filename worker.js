const Complaint = require('./models/complaints');
const emailServer = require('./utils/sendEmail');

const hour = 60 * 60 * 1000;
const updateComplaints = async () => {
    const complaints = await Complaint.find({
        status: { $in: ['Open', 'Pending', 'Re-Open'] },
        // reviewStartedAt: { $gte: [new Date(Date.now()) - hour,hour] }
    }).populate('assignedTo');
    complaints.map((complaint) => {
        if (complaint.assignedTo) {
            emailServer.sendNotificationEmail(complaint);
        }
    });
    console.log('setInterval was triggered');
};

const timer = setInterval(updateComplaints, hour);

const mins = 15 * 60 * 1000;
const archiveComplaints = async () => {
    const complaints = await Complaint.find({
        archivingTime: { $gte: Date.now() },
        archived: false,
    });
    complaints.map((complaint) => {
        complaint.archived = true;
        complaint.save();
    });
};
const archiveTimer = setInterval(archiveComplaints, mins);
