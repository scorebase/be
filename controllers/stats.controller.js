const StatsService = require('../services/stats.service');
const successResponse = require('../helpers/success_response');
const {statsMessages} = require('../helpers/messages');
const cacheResponse = require('../helpers/cacheResponse');
const CacheService = require('../services/cache.service');

const statsCache = new CacheService('stat');

const StatsController = {
    async roundStats(req, res, next) {
        try {
            const cacheKey = 'round_' + req.params.gameweekId;
            const data = await cacheResponse(
                statsCache,
                cacheKey,
                () => StatsService.getRoundStats(+req.params.gameweekId)
            );

            return successResponse(res, statsMessages.STATS_FETCH_SUCCESS ,data);
        } catch(error) {
            next(error);
        }
    },

    async playerRoundRank(req, res, next) {
        try {
            const cacheKey = 'player_'+ req.params.playerId + '_round_' + req.params.roundId;

            const data = await cacheResponse(
                statsCache,
                cacheKey,
                () => StatsService.playerRoundRank(+req.params.playerId, +req.params.roundId)
            );

            return successResponse(res, statsMessages.STATS_FETCH_SUCCESS ,data);
        } catch (error) {
            next(error);
        }
    },

    async playerTotalPoints(req, res, next) {
        try {
            const cacheKey = 'player_total_'+ req.params.playerId;
            const data = await cacheResponse(
                statsCache,
                cacheKey,
                () => StatsService.playerTotalPoints(+req.params.playerId)
            );

            return successResponse(res, statsMessages.STATS_FETCH_SUCCESS ,data);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = StatsController;