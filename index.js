const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const logger = require('./logger');
const Sequelize = require('sequelize');
const sequelize = require('./config/db');
const { startAgenda }= require('./config/agenda');

///routes
const authRouter = require('./routes/auth.route');
const userRouter = require('./routes/user.route');
const fixtureRouter = require('./routes/fixture.route');
const picksRouter = require('./routes/picks.route');
const teamRouter = require('./routes/team.route');
const seasonRouter = require('./routes/season.route');
const gameweekRouter = require('./routes/gameweek.route');
const leagueRouter = require('./routes/league.route');
const statsRouter = require('./routes/stats.route');
const cacheRouter = require('./routes/cache.route');
const emailRouter = require('./routes/email.route');

const server = express();

server.use(cors());

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
server.use('/fixture', fixtureRouter);
server.use('/picks', picksRouter);
server.use('/team', teamRouter);
server.use('/season', seasonRouter);
server.use('/gameweek', gameweekRouter);
server.use('/league', leagueRouter);
server.use('/stats', statsRouter);
server.use('/cache', cacheRouter);
server.use('/email', emailRouter);

//Handle all errors
/* eslint-disable */
server.use((error, req, res, _) => {
  if (error && error.error && error.error.isJoi) {
    // joi error
    error.statusCode = 422;
    error.message = error.error.message;
  } else if(error instanceof Sequelize.BaseError) {
    //dont show sequelize error to users, log the error for debugging purpose
    logger.error(`
      Sequelize error occurred on url ${req.originalUrl}
      with request body : ${JSON.stringify(req.body) || null}
      with error ${error.message}
    `);
    error.message = 'Unknown error occurred.'
  }
  return res
    .status(error.statusCode || 500)
    .json({ status: 'error', message: error.message, data: null });
});

server.listen(config.port, async () => {
  try {
    await sequelize.authenticate();
    //start agenda anytime server is listening/restarted
    await startAgenda();
    logger.info('Connection has been established successfully.');
    logger.info('Server running on PORT ' + config.port);
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
  }
});

module.exports = server;
