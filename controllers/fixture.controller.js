const { fixtureMessages } = require('../helpers/messages');
const successResponse = require('../helpers/success_response');
const FixtureService = require('../services/fixture.service');

const {
    FIXTURE_CREATED_SUCCESS,
    FIXTURES_FOUND_SUCCESS,
    FIXTURE_DELETED_SUCCESS,
    FIXTURE_UPDATE_SUCCESS } = fixtureMessages;

const FixtureController = {
    async createFixture(req, res, next) {
        try {
            const { home_team_id, away_team_id, date_time, gameweek_id } = req.body;
            const data = await FixtureService.createFixture(home_team_id, away_team_id, date_time, gameweek_id);
            return successResponse(res, FIXTURE_CREATED_SUCCESS, data);
        } catch(error) {
            next(error);
        }
    },

    async deleteFixture(req, res, next) {
        try {
            const data = await FixtureService.deleteFixture(req.params.id);
            return successResponse(res, FIXTURE_DELETED_SUCCESS, data);
        } catch(error) {
            next(error);
        }
    },

    async updateFixture(req, res, next) {
        try {
            const fixtureData = req.body;
            const updatedFixtureData = {...fixtureData, id: req.params.id};
            const data = await FixtureService.updateFixture(updatedFixtureData);
            return successResponse(res, FIXTURE_UPDATE_SUCCESS, data);
        } catch(error) {
            next(error);
        }
    },

    async getFixtures(req, res, next) {
        try {
            const data = await FixtureService.getFixtures(req.params.gameweekId);
            return successResponse(res, FIXTURES_FOUND_SUCCESS, data);
        } catch(error) {
            next(error);
        }
    },

    async getRecentFixtures(req, res, next) {
        try {
            const data = await FixtureService.getRecentFixtures(req.params.teamId, req.query.last);
            return successResponse(res, FIXTURES_FOUND_SUCCESS, data);
        } catch(error) {
            next(error);
        }
    },

    async getHeadToHeadFixtures(req, res, next) {
        try {
            const data = await FixtureService.getHeadToHeadFixtures(req.query.teamOne, req.query.teamTwo);
            return successResponse(res, FIXTURES_FOUND_SUCCESS, data);
        } catch(error) {
            next(error);
        }
    }
};

module.exports = FixtureController;