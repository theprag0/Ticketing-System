// Filter tickets in support panel
var recentTickets = document.querySelector('#recent-tickets');
var allTickets = document.querySelector('#all-tickets');
recentTickets.classList.add('hide');
function filter($i) {
    if ($i === 'Recent') {
        recentTickets.classList.remove('hide');
        allTickets.classList.add('hide');
    } else if ($i === 'All') {
        allTickets.classList.remove('hide');
        recentTickets.classList.add('hide');
    }
}

// Toggle Email Box in ticket-show page
function emailBox($i) {
    var emailButton = document.getElementById('email-button');
    var emailBox = document.getElementById('collapseEmail');
    if ($i === 'Pending') {
        emailButton.classList.add('collapsed');
        emailButton.setAttribute('aria-expanded', 'true');
        emailBox.classList.add('show');
    }
}


