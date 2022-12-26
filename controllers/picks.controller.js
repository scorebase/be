const successResponse = require('../helpers/success_response');
const { picksMessages } = require('../helpers/messages');
const PicksService = require('../services/picks.service');
const CacheService = require('../services/cache.service');
const {ServiceError} = require('../errors/http_errors');
const GameweekService = require('../services/gameweek.service');
const {picksErrors} = require('../errors');
const cacheResponse = require('../helpers/cacheResponse');

const { PICK_CREATE_SUCCESS, PICK_UPDATE_SUCCESS, PICK_FOUND_SUCCESS } = picksMessages;

const picksCache = new CacheService('pick');

const PicksController = {
    async createPick(req, res, next) {
        try {
            const data = await PicksService.createPick(req.body, req.userId);
            const { next } = await GameweekService.getGameweekState();
            picksCache.remove(req.userId + '_' + next.id);
            return successResponse(res, PICK_CREATE_SUCCESS, data);
        } catch(error) {
            next(error);
        }
    },

    async updatePick(req, res, next) {
        try {
            const data = await PicksService.updatePick(req.body, req.userId);
            const { next } = await GameweekService.getGameweekState();
            picksCache.remove(req.userId + '_' + next.id);
            return successResponse(res, PICK_UPDATE_SUCCESS, data);
        } catch(error) {
            next(error);
        }
    },

    async getPick(req, res, next) {
        try {
            const { next } = await GameweekService.getGameweekState();
            const playerId = +req.params.playerId;
            const userId = +req.userId;
            const gameweekId = +req.params.gameweekId;

            //if another player is trying to get pick of a player and it is for next gameweek, deny access.
            if((playerId !== userId) && (gameweekId === next?.id)) {
                throw new ServiceError(picksErrors.PICK_ACCESS_DENIED);
            }
            const cacheKey = playerId + '_' + gameweekId;
            const data = await cacheResponse(
                picksCache,
                cacheKey,
                () => PicksService.getPick(playerId, userId, gameweekId)
            );

            return successResponse(res, PICK_FOUND_SUCCESS, data);
        } catch(error) {
            next(error);
        }
    },
    async updatePickScores(req, res, next) {
        try{
            const data = await PicksService.updatePicksScoreForFixture(req.params.fixtureId);

            return successResponse(res, PICK_UPDATE_SUCCESS, data);
        } catch(error) {
            next(error);
        }
    }
};

module.exports = PicksController;