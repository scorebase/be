const express = require('express');

const LeagueController = require('../controllers/league.controller');
const { isLoggedIn, isAdmin } = require('../middlewares/auth.middleware');
const { validateBody } = require('../validators');
const { createLeagueSchema,
    updateLeagueSchema,
    joinLeagueSchema
} = require('../validators/league.validator');

const leagueRouter = express.Router();

leagueRouter.post('/', validateBody(createLeagueSchema), isLoggedIn, LeagueController.createLeague);

leagueRouter.route('/:leagueId')
    .put(validateBody(updateLeagueSchema), isLoggedIn, LeagueController.updateLeague)
    .delete(isLoggedIn, LeagueController.deleteLeague)
    .get(isAdmin, LeagueController.leagueDetails);

leagueRouter.put('/:leagueId/code', isLoggedIn, LeagueController.regenerateLeagueCode);

leagueRouter.get('/:leagueId/standing', LeagueController.leagueStanding);

leagueRouter.post('/join', validateBody(joinLeagueSchema), isLoggedIn, LeagueController.joinLeague);

leagueRouter.put('/:leagueId/leave', isLoggedIn, LeagueController.leaveLeague);

leagueRouter.put('/:leagueId/suspend/:playerId',
    isLoggedIn,
    LeagueController.removePlayer
);

leagueRouter.put('/:leagueId/restore/:playerId', isLoggedIn, LeagueController.restorePlayer);

leagueRouter.get('/:leagueId/suspended', isLoggedIn, LeagueController.getLeagueSuspendedPlayers);

leagueRouter.get('/list/:playerId', LeagueController.getPlayerLeagues);

leagueRouter.get('/list/:playerId/slim', LeagueController.getLatestPlayerLeaguesWithoutStandings);

leagueRouter.put('/:leagueId/admin/:playerId',
    isLoggedIn,
    LeagueController.changeAdmin
);

module.exports = leagueRouter;