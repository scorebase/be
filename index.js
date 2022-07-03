const express = require('express');
const config = require('./config/config');
const logger = require('./logger');

const sequelize = require('./config/db');

const server = express();

server.use(express.json());

server.get('/', (req, res) => {
    logger.info('attempting to GET base path');
    return res.json({
        status : 'success',
        data : {
            name : 'scorebase'
        }
    });
});

server.listen(config.port, async() => {
    try {
        await sequelize.authenticate();
        logger.info('Connection has been established successfully.');
        logger.info('Server running on PORT ' + config.port);
    } catch (error) {
        logger.error('Unable to connect to the database:', error);
    }
});

module.exports = server;