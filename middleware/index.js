'use strict';

const express = require('express');

const app = express();

const clientSessions = require('./client-sessions');

app.use(clientSessions);

module.exports = app;
