const express = require('express');
const StatsController = require('../controllers/stats.controller');

const StatsRouter = express.Router();

StatsRouter.get('/round/:gameweekId', StatsController.roundStats);

StatsRouter.get('/player/:playerId/round/:roundId/rank', StatsController.playerRoundRank);

StatsRouter.get('/player/:playerId/total', StatsController.playerTotalPoints);

module.exports = StatsRouter;