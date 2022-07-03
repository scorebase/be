const { Sequelize } = require('sequelize');
const config = require('./config');

//production, development or test
const mode = config.mode;

const sequelize = new Sequelize(
    config.database[mode].database,
    config.database[mode].username,
    config.database[mode].password,
    
    {
        host: config.database[mode].host,
        dialect: config.database.dialect
    }
);

module.exports = sequelize;