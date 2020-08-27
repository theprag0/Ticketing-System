/** calculate resolve times */
module.exports.responseTime = function (a, b) {
    var time = Math.floor((b - a) / 60000);
    if (time <= 60) {
        return time + ' mins';
    } else if (time > 60) {
        return time / 60 + ' hours';
    } else if ((time = 0)) {
        return time + ' mins, Lightning fast!! Employee Of the Month';
    }
};

module.exports.resolveTime = function (a, b, c, d) {
    if (c == undefined || d == undefined) {
        c = 0;
        d = 0;
    }
    var openToClose = Math.floor((b - a) / 60000);
    var pendingToReopen = Math.floor((d - c) / 60000);
    var time = openToClose - pendingToReopen;
    if (time <= 60) {
        return time + ' mins';
    } else if (time > 60) {
        return time / 60 + ' hours';
    }
};
