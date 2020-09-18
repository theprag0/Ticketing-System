const Complaint = require('./models/complaints');
const emailServer = require('./utils/sendEmail');

const hour = 60 * 60 * 1000;
let firstAlert = Date;
const updateComplaints = async () => {
    const complaints = await Complaint.find({
        status: { $in: ['Open', 'Pending', 'Re-Open'] },
        // reviewStartedAt: { $gte: [new Date(Date.now()) - hour,hour] }
    }).populate('assignedTo');
    console.log(complaints);
    complaints.map((complaint) => {
        if (complaint.assignedTo) {
            emailServer.sendNotificationEmail(complaint);
        }
    });
    console.log('setInterval was triggered');
};

const timer = setInterval(updateComplaints, hour);

// if(P-01){
//     //set 4 points with one hour in between
//     var checkPoints=[1*60*60*1000,2*60*60*1000,3*60*60*1000,4*60*60*1000];

//     //check if closed at each point
//     i=60*60*1000;
//     while(i<4*60*60*1000){
//         setTimeout(function(){
//             checkPoints.forEach(function(point){
//                 if(complaint.status='Open'){
//                    console.log("hello");
//                 }
//         },i)
//         i=i+1*60*60*1000;
//     })
// }
//     //if closed , stop
//     //else sendemail
// }
