const express = require('express');

const LeagueController = require('../controllers/league.controller');
const { isLoggedIn } = require('../middlewares/auth.middleware');
const { validateBody } = require('../validators');
const { createLeagueSchema, updateLeagueSchema, joinLeagueSchema } = require('../validators/league.validator');

const leagueRouter = express.Router();

leagueRouter.post('/', validateBody(createLeagueSchema), isLoggedIn, LeagueController.createLeague);

leagueRouter.route('/:leagueId')
    .put(validateBody(updateLeagueSchema), isLoggedIn, LeagueController.updateLeague)
    .delete(isLoggedIn, LeagueController.deleteLeague);

leagueRouter.put('/:leagueId/code', isLoggedIn, LeagueController.regenerateLeagueCode);

leagueRouter.post('/join', validateBody(joinLeagueSchema), isLoggedIn, LeagueController.joinLeague);

leagueRouter.put('/:leagueId/leave', isLoggedIn, LeagueController.leaveLeague);

module.exports = leagueRouter;