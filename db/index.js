const { Pool } = require('pg');


const devConfig = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;

const proConfig = process.env.PG_URL;

const pool = new Pool({
    connectionString: process.env.NODE === 'production'
                        ? proConfig
                        : devConfig
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};