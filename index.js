const express = require('express');

const config = require('./config/config');
const logger = require('./logger');
const sequelize = require('./config/db');

///routes
const authRouter = require('./routes/auth.route');
const userRouter = require('./routes/user.route');
const teamRouter = require('./routes/team.route');
const seasonRouter = require('./routes/season.route');
const gameweekRouter = require('./routes/gameweek.route');
const leagueRouter = require('./routes/league.route');

const server = express();

server.use(express.json());

server.get('/', (req, res) => {
    logger.info('attempting to GET base path');
    return res.json({
        status: 'success',
        data: {
            name: 'scorebase'
        }
    });
});

server.use('/auth', authRouter);
server.use('/user', userRouter);
server.use('/team', teamRouter);
server.use('/season', seasonRouter);
server.use('/gameweek', gameweekRouter);
server.use('/league', leagueRouter);

//Handle all errors
/* eslint-disable */
server.use((error, req, res, next) => {
  if (error && error.error && error.error.isJoi) {
    // joi error
    error.statusCode = 422;
    error.message = error.error.message;
  }
  return res
    .status(error.statusCode || 500)
    .json({ status: 'error', message: error.message, data: null });
});

server.listen(config.port, async () => {
  try {
    await sequelize.authenticate();
    logger.info('Connection has been established successfully.');
    logger.info('Server running on PORT ' + config.port);
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
  }
});

module.exports = server;
