const { Pool } = require('pg');
require('dotenv').config();

const env = process.env.ENV;
const dbhost = process.env[`db_host_${env}`];
const dbport = process.env[`db_port_${env}`];
const dbuser = process.env[`db_user_${env}`];
const dbpassword = process.env[`db_password_${env}`];
const dbdatabase = process.env[`db_database_${env}`];
const dbssl = process.env[`db_reject_unauthorized_${env}`];

const pool = new Pool({
    host: dbhost,
    port: dbport,
    user: dbuser,
    password: dbpassword,
    database: dbdatabase,
    ssl: dbssl ? {
        rejectUnauthorized: dbssl
    } : null
});

module.exports = pool;