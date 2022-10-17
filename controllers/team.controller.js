const teamService = require('../services/team.service');
const successResponse = require('../helpers/success_response');
const { teamMessages } = require('../helpers/messages');

const {
    TEAM_CREATED_SUCCESS,
    TEAM_FOUND_SUCCESS,
    TEAM_UPDATED_SUCCESS,
    TEAM_DELETED_SUCCESS,
    TEAM_LIST_LOADED
} = teamMessages;

const teamController = {
    async createTeam(req, res, next) {
        try {
            const { name, short_name, jersey, color_code } = req.body;
            const data = await teamService.createATeam(name, short_name, jersey, color_code);
            return successResponse(res, TEAM_CREATED_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },

    async getTeam(req, res, next) {
        try {
            const teamId = req.params.teamId;
            const data = await teamService.getATeam(teamId);
            return successResponse(res, TEAM_FOUND_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },

    async updateTeam(req, res, next) {
        try {
            const teamId = req.params.teamId;
            const teamData = req.body;
            const updatedTeam = {...teamData, id: teamId};
            await teamService.updateATeam(updatedTeam);
            return successResponse(res, TEAM_UPDATED_SUCCESS, updatedTeam);
        } catch (error) {
            next(error);
        }
    },

    async deleteTeam(req, res, next) {
        try {
            const teamId = req.params.teamId;
            const data = await teamService.deleteATeam(teamId);
            return successResponse(res, TEAM_DELETED_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },

    async getAllTeams(req, res, next) {
        try {
            const data = await teamService.getAllTeams();
            return successResponse(res, TEAM_LIST_LOADED, data);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = teamController;