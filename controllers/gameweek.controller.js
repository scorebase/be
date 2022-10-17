const { gameweekMessages } = require('../helpers/messages');
const successResponse = require('../helpers/success_response');
const GameweekService = require('../services/gameweek.service');
const CacheService = require('../services/cache.service');
const cacheResponse = require('../helpers/cacheResponse');
const {
    GAMEWEEK_CREATED_SUCCESS,
    GAMEWEEK_DELETED_SUCCESS,
    GAMEWEEK_LOADED_SUCCESS,
    GAMEWEEK_UPDATED_SUCCESS,
    GAMEWEEK_STATUS_GET_SUCCESS,
    GAMEWEEK_STATUS_UPDATED_SUCCESS,
    GAMEWEEKS_LOAD_SUCCESS
} = gameweekMessages;

const gwCache = new CacheService('gw');

const gameweekController = {
    async createAGameweek(req, res, next){
        try {
            const { title, deadline } = req.body;
            const data = await GameweekService.createGameweek(deadline, title);
            gwCache.remove('all');
            return successResponse(res, GAMEWEEK_CREATED_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },

    async getGameweek(req, res, next){
        try {
            const gameweekId = req.params.gameweekId;
            const data = await GameweekService.loadGameweek(gameweekId);

            return successResponse(res, GAMEWEEK_LOADED_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },

    async editGameweek(req, res, next) {
        try {
            const gameweekId = req.params.gameweekId;
            const { deadline, title } = req.body;
            const data = await GameweekService.updateGameweek(gameweekId, deadline, title);
            gwCache.removeMultiple(['all', gameweekId, 'state']);
            return successResponse(res, GAMEWEEK_UPDATED_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },

    async deleteAGameweek(req, res, next) {
        try {
            const gameweekId = req.params.gameweekId;
            const data = await GameweekService.deleteGameweek(gameweekId);
            gwCache.removeMultiple(['all', gameweekId]);
            return successResponse(res, GAMEWEEK_DELETED_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },
    async getGameweekState(req, res, next) {
        try {
            const data = await GameweekService.getGameweekState();
            return successResponse(res, GAMEWEEK_STATUS_GET_SUCCESS , data);
        } catch (error) {
            next(error);
        }
    },

    async updateGameweekState(req, res, next) {
        try {
            let { next, current } = req.body;
            if(next === 0) next = null;
            if(current === 0) current = null;
            await GameweekService.updateGameweekState(current, next);
            gwCache.remove('state');
            return successResponse(res, GAMEWEEK_STATUS_UPDATED_SUCCESS, undefined);
        } catch (error) {
            next(error);
        }
    },

    async getAllGameweeks(req, res, next) {
        try {
            const data = await cacheResponse(gwCache, 'all', GameweekService.getAllGameweeks);

            return successResponse(res, GAMEWEEKS_LOAD_SUCCESS ,data);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = gameweekController;