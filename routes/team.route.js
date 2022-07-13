const express = require('express');

const teamController = require('../controllers/team.controller');
const { isLoggedIn } = require('../middlewares/auth.middleware');
const { validateBody } = require('../validators');

const { createTeamSchema, updateTeamSchema } = require('../validators/team.validator');

const teamRouter = express.Router();

teamRouter.post('/', validateBody(createTeamSchema), isLoggedIn, teamController.createTeam);
teamRouter.get('/:teamId', isLoggedIn, teamController.getTeam);
teamRouter.put('/:teamId', validateBody(updateTeamSchema), isLoggedIn, teamController.updateTeam);
teamRouter.delete('/:teamId', isLoggedIn, teamController.deleteTeam);

module.exports =  teamRouter;