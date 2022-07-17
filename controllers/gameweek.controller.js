const { gameweekMessages } = require('../helpers/messages');
const successResponse = require('../helpers/success_response');
const GameweekService = require('../services/gameweek.service');
const {
    GAMEWEEK_CREATED_SUCCESS,
    GAMEWEEK_DELETED_SUCCESS,
    GAMEWEEK_LOADED_SUCCESS,
    GAMEWEEK_UPDATED_SUCCESS
} = gameweekMessages;

const gameweekController = {
    async createAGameweek(req, res, next){
        try {
            const { title, deadline, seasonId } = req.body;
            const data = await GameweekService.createGameweek(deadline, title, seasonId);

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
            const { deadline, title, seasonId } = req.body;
            const data = await GameweekService.updateGameweek(gameweekId, deadline, title, seasonId);

            return successResponse(res, GAMEWEEK_UPDATED_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },

    async deleteAGameweek(req, res, next) {
        try {
            const gameweekId = req.params.gameweekId;
            const data = await GameweekService.deleteGameweek(gameweekId);

            return successResponse(res, GAMEWEEK_DELETED_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = gameweekController;