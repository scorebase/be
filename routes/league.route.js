const express = require('express');

const LeagueController = require('../controllers/league.controller');
const { isLoggedIn } = require('../middlewares/auth.middleware');
const { validateBody } = require('../validators');
const { createLeagueSchema } = require('../validators/league.validator');

const leagueRouter = express.Router();

leagueRouter.post('/', validateBody(createLeagueSchema), isLoggedIn, LeagueController.
    createLeague);

module.exports = leagueRouter;