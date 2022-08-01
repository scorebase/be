const express = require('express');
const { validateBody } = require('../validators');
const { createPickSchema, updatePickSchema} = require('../validators/picks.validator');
const { isLoggedIn } = require('../middlewares/auth.middleware');
const PicksController = require('../controllers/picks.controller');

const picksRouter = express.Router();

picksRouter.post('/', validateBody(createPickSchema), isLoggedIn, PicksController.createPick);
picksRouter.put('/', validateBody(updatePickSchema), isLoggedIn, PicksController.updatePick);
picksRouter.get('/:playerId/:gameweekId', isLoggedIn, PicksController.getPick);
module.exports = picksRouter;