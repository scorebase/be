const express = require('express');

const FixtureController = require('../controllers/fixture.controller');

const { isLoggedIn } = require('../middlewares/auth.middleware');
const { validateBody, validateQuery } = require('../validators');
const {
    createFixtureSchema,
    updateFixtureSchema,
    recentFixturesSchema,
    headToheadSchema } = require('../validators/fixture.validator');

const fixtureRouter = express.Router();

fixtureRouter.post('/',
    validateBody(createFixtureSchema),
    isLoggedIn,
    FixtureController.createFixture);

fixtureRouter.delete('/:id', isLoggedIn, FixtureController.deleteFixture);

fixtureRouter.put('/:id',
    validateBody(updateFixtureSchema),
    isLoggedIn,
    FixtureController.updateFixture);
    
fixtureRouter.get('/all/headtohead',
    validateQuery(headToheadSchema),
    isLoggedIn,
    FixtureController.getHeadToHeadFixtures);

fixtureRouter.get('/all/:gameweekId', isLoggedIn ,FixtureController.getFixtures);

fixtureRouter.get('/all/recent/:teamId',
    validateQuery(recentFixturesSchema),
    isLoggedIn,
    FixtureController.getRecentFixtures);

module.exports = fixtureRouter;
