'use strict';

const express = require('express');

console.log(
    '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@111111111111111111111111@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@'
);
const csrf = require('csurf');

const csrfProtection = csrf({
    cookie: false,
    sessionKey: 'cicaSession'
});

const app = express();

console.log(
    '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@222222222222222222222222222@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@'
);
app.use(csrfProtection);

// // error handler
// app.use((err, req, res, next) => {
//     if (err.code === 'EBADCSRFTOKEN') {
//         const error = Error(`Your session has expired`);
//         error.name = 'EBADCSRFTOKEN';
//         error.error = 'Your session has expired';
//         throw error;
//     }
//     return next(err);
// });

module.exports = app;
