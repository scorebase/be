const express = require('express');

const teamController = require('../controllers/team.controller');
const { isLoggedIn, isAdmin } = require('../middlewares/auth.middleware');
const { validateBody } = require('../validators');

const { createTeamSchema, updateTeamSchema } = require('../validators/team.validator');

const teamRouter = express.Router();

teamRouter.post('/', validateBody(createTeamSchema), isLoggedIn, isAdmin, teamController.createTeam);
teamRouter.get('/all', teamController.getAllTeams);
teamRouter.get('/:teamId', teamController.getTeam);
teamRouter.put('/:teamId', validateBody(updateTeamSchema), isLoggedIn, isAdmin, teamController.updateTeam);
teamRouter.delete('/:teamId', isLoggedIn, isAdmin, teamController.deleteTeam);

module.exports =  teamRouter;