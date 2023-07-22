const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const todoComments = require('./repos/todoComments.js');
const todos = require('./repos/todos.js');
const root = require('./repos/root.js');

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:'],
            connectSrc: ["'self'"],
            reportUri: '/report-violation',
        }
    },
    dnsPrefetchControl: true,
    expectCt: {
        maxAge: 86400,
    },
    frameguard: {
        action: 'deny'
    },
    hidePoweredBy: {
        setTo: 'PHP 4.2.0'
    },
    hsts: {
        maxAge: 86400,
        includeSubDomains: true,
        preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    permittedCrossDomainPolicies: true,
    referrerPolicy: {
        policy: 'no-referrer'
    },
    xssFilter: true,
}));

app.use('/todos/:id/comments', todoComments);
app.use('/todos', todos);
app.use('/', root);

const env=process.env.ENV;
const apiport = process.env.PORT || process.env[`api_listen_port_${env}`];

app.listen(apiport, () => {
    console.log(`Todo API listening to port ${apiport}`);
});
