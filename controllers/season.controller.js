const { seasonMessages } = require('../helpers/messages');
const successResponse = require('../helpers/success_response');
const SeasonService = require('../services/season.service');

const {
    SEASON_CREATED_SUCCESS,
    SEASON_UPDATED_SUCCESS,
    SEASON_LOADED_SUCCESS,
    SEASON_DELETED_SUCCESS
} = seasonMessages;

const seasonController = {
    async createSeason(req, res, next){
        try {
            const { season_name } = req.body;
            const season = await SeasonService.createASeason(season_name);

            return successResponse(res, SEASON_CREATED_SUCCESS, season);
        } catch (error) {
            next(error);
        }
    },

    async getSeason(req, res, next){
        try {
            const seasonId = req.params.seasonId;
            const season = await SeasonService.loadSeason(seasonId);

            return successResponse(res, SEASON_LOADED_SUCCESS, season);
        } catch (error) {
            next(error);
        }
    },

    async updateSeason(req, res, next){
        try {
            const seasonId = req.params.seasonId;
            const { season_name } = req.body;
            await SeasonService.updateASeason(seasonId, season_name);

            return successResponse(res, SEASON_UPDATED_SUCCESS, { id: seasonId, season_name });
        } catch (error) {
            next(error);
        }
    },

    async deleteSeason(req, res, next){
        try {
            const seasonId = req.params.seasonId;
            const season = await SeasonService.deleteASeason(seasonId);

            return successResponse(res, SEASON_DELETED_SUCCESS, season);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = seasonController;