const express = require('express');
const { isLoggedIn } = require('../middlewares/auth.middleware');
const seasonController = require('../controllers/season.controller');
const { validateBody } = require('../validators/index');
const { createSeasonSchema, updateSeasonSchema } = require('../validators/season.validator');

const SeasonRouter = express.Router();

SeasonRouter.post('/', validateBody(createSeasonSchema), isLoggedIn, seasonController.createSeason);
SeasonRouter.get('/:seasonId', isLoggedIn, seasonController.getSeason);
SeasonRouter.put('/:seasonId', validateBody(updateSeasonSchema), isLoggedIn, seasonController.updateSeason);
SeasonRouter.delete('/:seasonId', isLoggedIn, seasonController.deleteSeason);

module.exports = SeasonRouter;