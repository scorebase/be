const express = require('express');
const { isLoggedIn, isAdmin } = require('../middlewares/auth.middleware');
const seasonController = require('../controllers/season.controller');
const { validateBody } = require('../validators/index');
const { createSeasonSchema, updateSeasonSchema } = require('../validators/season.validator');

const SeasonRouter = express.Router();

SeasonRouter.post('/', validateBody(createSeasonSchema), isLoggedIn, isAdmin, seasonController.createSeason);
SeasonRouter.get('/:seasonId', seasonController.getSeason);
SeasonRouter.put('/:seasonId', validateBody(updateSeasonSchema), isLoggedIn, isAdmin, seasonController.updateSeason);
SeasonRouter.delete('/:seasonId', isLoggedIn, isAdmin, seasonController.deleteSeason);

module.exports = SeasonRouter;