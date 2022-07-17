const express = require('express');

const LeagueController = require('../controllers/league.controller');
const { isLoggedIn } = require('../middlewares/auth.middleware');
const { validateBody, validateQuery } = require('../validators');
const { createLeagueSchema,
    updateLeagueSchema,
    joinLeagueSchema,
    removePlayerSchema
} = require('../validators/league.validator');

const leagueRouter = express.Router();

leagueRouter.post('/', validateBody(createLeagueSchema), isLoggedIn, LeagueController.createLeague);

leagueRouter.route('/:leagueId')
    .put(validateBody(updateLeagueSchema), isLoggedIn, LeagueController.updateLeague)
    .delete(isLoggedIn, LeagueController.deleteLeague);

leagueRouter.put('/:leagueId/code', isLoggedIn, LeagueController.regenerateLeagueCode);

leagueRouter.post('/join', validateBody(joinLeagueSchema), isLoggedIn, LeagueController.joinLeague);

leagueRouter.put('/:leagueId/leave', isLoggedIn, LeagueController.leaveLeague);

leagueRouter.put('/:leagueId/suspend', validateQuery(removePlayerSchema), isLoggedIn, LeagueController.removePlayer);
leagueRouter.put('/:leagueId/restore/:playerId', isLoggedIn, LeagueController.restorePlayer);

module.exports = leagueRouter;