const express = require('express');
const gameweekController = require('../controllers/gameweek.controller');
const { validateBody } = require('../validators/index');
const { createGameweekSchema, updateGameweekSchema } = require('../validators/gameweek.validator');
const { isLoggedIn } = require('../middlewares/auth.middleware');
const {
    createAGameweek,
    getGameweek,
    editGameweek,
    deleteAGameweek
} = gameweekController;

const gameweekRouter = express.Router();

gameweekRouter.post('/', validateBody(createGameweekSchema), isLoggedIn, createAGameweek);
gameweekRouter.get('/:gameweekId', isLoggedIn, getGameweek);
gameweekRouter.put('/:gameweekId', validateBody(updateGameweekSchema), isLoggedIn, editGameweek);
gameweekRouter.delete('/:gameweekId', isLoggedIn, deleteAGameweek);

module.exports = gameweekRouter;