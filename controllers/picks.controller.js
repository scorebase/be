const successResponse = require('../helpers/success_response');
const { picksMessages } = require('../helpers/messages');
const PicksService = require('../services/picks.service');

const { PICK_CREATE_SUCCESS, PICK_UPDATE_SUCCESS, PICK_FOUND_SUCCESS } = picksMessages;

const PicksController = {
    async createPick(req, res, next) {
        try {
            const data = await PicksService.createPick(req.body, req.userId, req.params.gameweekId);
            return successResponse(res, PICK_CREATE_SUCCESS, data);
        } catch(error) {
            next(error);
        }
    },

    async updatePick(req, res, next) {
        try {
            const data = await PicksService.updatePick(req.body, req.userId, req.params.id);
            return successResponse(res, PICK_UPDATE_SUCCESS, data);
        } catch(error) {
            next(error);
        }
    },

    async getPick(req, res, next) {
        try {
            const data = await PicksService.getPick(req.params.playerId, req.userId, req.params.gameweekId);
            return successResponse(res, PICK_FOUND_SUCCESS, data);
        } catch(error) {
            next(error);
        }
    }
};

module.exports = PicksController;