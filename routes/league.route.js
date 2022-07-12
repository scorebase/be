const express = require('express');

const LeagueController = require('../controllers/league.controller');
const { isLoggedIn } = require('../middlewares/auth.middleware');
const { validateBody } = require('../validators');
const { createLeagueSchema, updateLeagueSchema } = require('../validators/league.validator');

const leagueRouter = express.Router();

leagueRouter.post('/', validateBody(createLeagueSchema), isLoggedIn, LeagueController.createLeague);

leagueRouter.put('/:leagueId', validateBody(updateLeagueSchema), isLoggedIn, LeagueController.updateLeague);

leagueRouter.put('/:leagueId/code', isLoggedIn, LeagueController.regenerateLeagueCode);

module.exports = leagueRouter;