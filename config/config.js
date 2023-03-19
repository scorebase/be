const dotenv = require('dotenv');

dotenv.config();

const config = {
    port : process.env.PORT,
    mode : process.env.NODE_ENV,
    database : {
        dialect : process.env.DB_DIALECT,
        development : {
            'username': process.env.DB_USER_DEV,
            'password': process.env.DB_PASS_DEV,
            'database': process.env.DB_NAME_DEV,
            'host': process.env.DB_HOST_DEV
        },
        test : {
            'username': process.env.DB_USER_TEST,
            'password': process.env.DB_PASS_TEST,
            'database': process.env.DB_NAME_TEST,
            'host': process.env.DB_HOST_TEST
        },
        production : {
            'username': process.env.DB_USER,
            'password': process.env.DB_PASS,
            'database': process.env.DB_NAME,
            'host': process.env.DB_HOST
        }
    },
    auth : {
        secret : process.env.JWT_SECRET,
        adminSecret : process.env.ADMIN_SECRET
    },
    mail : {
        api_key : process.env.SENGRID_API_KEY
    },
    mongo : {
        connection_string : process.env.MONGO_CONNECTION_STRING
    }
};

//if test mode, update PORT so that PORT does not clash with the one already running on development.
if(config.mode === 'test') config.port = process.env.PORT_TEST;

module.exports = config;