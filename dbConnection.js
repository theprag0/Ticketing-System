const mongoose = require('mongoose');

mongoose
    .connect(process.env.DATABASE, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    })
    .then(() => console.log('Connected to DB!'))
    .catch((error) => console.log(error.message));
