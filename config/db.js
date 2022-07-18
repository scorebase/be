const { Sequelize } = require('sequelize');
const logger = require('../logger');
const config = require('./config');

//production, development or test
const mode = config.mode;

const sequelize = new Sequelize(
    config.database[mode].database,
    config.database[mode].username,
    config.database[mode].password,
    
    {
        host: config.database[mode].host,
        dialect: config.database.dialect,

        //show queries logs only in development
        logging : msg => config.mode === 'development' ? logger.debug(msg) : null
    }
);

module.exports = sequelize;