const express = require('express');

const config = require('./config/config');
const logger = require('./logger');
const sequelize = require('./config/db');

// const Fixture = require('./models/fixture.model');
// const GameWeek = require('./models/gameweek.model');
// const LeagueMember = require('./models/league_member.model');
// const League = require('./models/league.model');
// const PickItem = require('./models/pickItem.model');
// const Picks = require('./models/picks.model');
// const Season = require('./models/season.model');
// const Team = require('./models/team.model');
// const User = require('./models/user.model');

// User.create({
// "username" : 'aolamide',
// "password" : '123444',
// "email" : 'olamide@olamide.co',
// "full_name" : "Kayolo Ola"
// });
// Team.create({
//   "name": "Arsenal",
//   "short_name": "ARS",
//   "jersey": "arsenal.png"
// });
// Team.create({
//   "name": "Chelsea",
//   "short_name": "CHE",
//   "jersey": "chelsea.png"
// });
// Season.create({
// season_name : '2019/2020'
// });
// GameWeek.create({
// title : '2',
// season_id : 1,
// deadline : new Date('2022-08-18')
// })

// Fixture.create({
// home_team_id : 1,
// away_team_id : 2,
// gameweek_id : 1,
// date_time : new Date('2022-08-18')
// })

// Picks.create({
// player_id : 1,
// gameweek_id : 1,
// total_points : 0
// })

// PickItem.create({
// fixture_id : 1,
// home_pick : 1,
// away_pick : 4,
// picks_id : 1
// })

// League.create({
// name : 'Nigeria',
// invite_code : 'abcd123',
// type : 'public',
// max_participant : 50,
// starting_gameweek : 1,
// administrator_id : 1
// });

// LeagueMember.create({
// league_id : 1,
// player_id : 1
// });
///routes
const authRouter = require('./routes/auth.route');
const userRouter = require('./routes/user.route');
const fixtureRouter = require('./routes/fixture.route');
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
server.use('/fixture', fixtureRouter);

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
    .json({ status: "error", message: error.message, data: null });
});

server.listen(config.port, async () => {
  try {
    await sequelize.authenticate();
    logger.info("Connection has been established successfully.");
    logger.info("Server running on PORT " + config.port);
  } catch (error) {
    logger.error("Unable to connect to the database:", error);
  }
});

module.exports = server;
