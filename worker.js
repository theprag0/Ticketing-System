const mongoose=require('mongoose');
const Complaint=require('./models/complaints');
const emailServer=require("./utils/sendEmail")
// this.onmessage = function (e) {
//     var status = e.data.status;
//     var maxTime = e.data.maxTime;
//     var firstAlert = 10 * 1000;
//     function doSetTimeout(i) {
//         setTimeout(function () {
//             console.log('ticket is not resolved yet');
//         }, i);
//     }
//     var finish = console.log('ticket closed');
//     if (status === 'Open') {
//         postMessage(doSetTimeout(i));
//     } else if (status === 'Closed') {
//         postMessage(finish);
//     }
// };

var execute=false;
setInterval(function(){
    execute=true;
 },60*60*1000);
    while(execute=true){
       Complaint.findById({status:{$all:["Open","Pending","Re-Open"]}},function(err,foundComplaint){
           if(foundComplaint.assignedTo){
         emailServer.sendNotificationEmail(foundComplaint);
           }
       }) ;       
    }

