const mongoose = require('mongoose');

mongoose
    .connect(process.env.DATABASE, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Connected to DB!'))
    .catch((error) => console.log(error.message));
