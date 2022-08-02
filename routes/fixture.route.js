const express = require('express');

const FixtureController = require('../controllers/fixture.controller');

const { isLoggedIn, isAdmin } = require('../middlewares/auth.middleware');
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
    isAdmin,
    FixtureController.createFixture);

fixtureRouter.delete('/:id', isLoggedIn, isAdmin, FixtureController.deleteFixture);

fixtureRouter.put('/:id',
    validateBody(updateFixtureSchema),
    isAdmin,
    FixtureController.updateFixture);
    
fixtureRouter.get('/all/headtohead',
    validateQuery(headToheadSchema),
    FixtureController.getHeadToHeadFixtures);

fixtureRouter.get('/all/:gameweekId', FixtureController.getFixtures);

fixtureRouter.get('/all/recent/:teamId',
    validateQuery(recentFixturesSchema),
    FixtureController.getRecentFixtures);

module.exports = fixtureRouter;
