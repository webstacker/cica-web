'use strict';

const express = require('express');

const app = express();

const clientSessions = require('./client-sessions');

console.log(
    '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@4444444444444444444444444444444444444@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@'
);
const csrf = require('./csrf');

// certralised middleware calls.
// grouping them here as it de-clutters the app.js file.
// and these can be run in succession, so they are here together.
app.use(clientSessions);
console.log(
    '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@155555555555555555555555555555555555@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@'
);
app.use(csrf);

module.exports = app;
