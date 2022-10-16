const { fixtureMessages } = require('../helpers/messages');
const successResponse = require('../helpers/success_response');
const FixtureService = require('../services/fixture.service');
const CacheService = require('../services/cache.service');
const cacheResponse = require('../helpers/cacheResponse');
const {
    FIXTURE_CREATED_SUCCESS,
    FIXTURES_FOUND_SUCCESS,
    FIXTURE_DELETED_SUCCESS,
    FIXTURE_UPDATE_SUCCESS } = fixtureMessages;

const fixturesCache = new CacheService('fixture');

const FixtureController = {
    async createFixture(req, res, next) {
        try {
            const { home_team_id, away_team_id, date_time, gameweek_id } = req.body;
            const data = await FixtureService.createFixture(home_team_id, away_team_id, date_time, gameweek_id);
            fixturesCache.remove('round_' + gameweek_id);
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
            fixturesCache.remove('round_' + data.gameweek_id);
            return successResponse(res, FIXTURE_UPDATE_SUCCESS, data);
        } catch(error) {
            next(error);
        }
    },

    async getFixtures(req, res, next) {
        try {
            const gameweekId = req.params.gameweekId;
            const data = await cacheResponse(
                fixturesCache,
                'round_' + gameweekId,
                () => FixtureService.getFixtures(gameweekId)
            );
            return successResponse(res, FIXTURES_FOUND_SUCCESS, data);
        } catch(error) {
            next(error);
        }
    },

    async getRecentFixtures(req, res, next) {
        try {
            const teamId = req.params.teamId;
            const count = req.query.last;

            const cacheKey = 'recent_' + teamId + '_' + count;
            const data = await cacheResponse(
                fixturesCache,
                cacheKey,
                () => FixtureService.getRecentFixtures(teamId, count)
            );

            return successResponse(res, FIXTURES_FOUND_SUCCESS, data);
        } catch(error) {
            next(error);
        }
    },

    async getHeadToHeadFixtures(req, res, next) {
        try {
            const { teamOne, teamTwo } = req.query;
            const cacheKey = 'h2h_' + teamOne + '_' + teamTwo;
            const data = await cacheResponse(
                fixturesCache,
                cacheKey,
                () => FixtureService.getHeadToHeadFixtures(teamOne, teamTwo)
            );
            return successResponse(res, FIXTURES_FOUND_SUCCESS, data);
        } catch(error) {
            next(error);
        }
    }
};

module.exports = FixtureController;