const StatsService = require('../services/stats.service');
const successResponse = require('../helpers/success_response');
const {statsMessages} = require('../helpers/messages');

const StatsController = {
    async roundStats(req, res, next) {
        try {
            const data = await StatsService.getRoundStats(+req.params.gameweekId);

            return successResponse(res, statsMessages.STATS_FETCH_SUCCESS ,data);
        } catch(error) {
            next(error);
        }
    },

    async playerRoundRank(req, res, next) {
        try {
            const data = await StatsService.playerRoundRank(+req.params.playerId, +req.params.roundId);

            return successResponse(res, statsMessages.STATS_FETCH_SUCCESS ,data);
        } catch (error) {
            next(error);
        }
    },

    async playerTotalPoints(req, res, next) {
        try {
            const data = await StatsService.playerTotalPoints(+req.params.playerId);

            return successResponse(res, statsMessages.STATS_FETCH_SUCCESS ,data);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = StatsController;