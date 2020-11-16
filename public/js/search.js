// Search for tickets in user/support history
const searchOption = document.querySelector('#search-option');
const option1 = document.querySelector('#by-id');
const option2 = document.querySelector('#by-date');
const idForm = document.querySelector('#id-form');
const dateForm = document.querySelector('#date-form');

option1.addEventListener('click', (e) => {
    e.preventDefault();
    searchOption.classList.add('hide-search');
    idForm.classList.remove('hide-search');
});
option2.addEventListener('click', (e) => {
    e.preventDefault();
    searchOption.classList.add('hide-search');
    dateForm.classList.remove('hide-search');
});
