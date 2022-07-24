const { leagueMessages } = require('../helpers/messages');
const successResponse = require('../helpers/success_response');
const LeagueService = require('../services/league.service');
const UserService = require('../services/user.service');

const LeagueController = {
    async createLeague(req, res, next) {
        try {
            const { name, max_participants, type, starting_gameweek } = req.body;

            const data = await LeagueService.createLeague(req.userId, name, max_participants, type, starting_gameweek);

            return successResponse(res, leagueMessages.LEAGUE_CREATION_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },

    async updateLeague(req, res, next) {
        try {
            const { name, max_participants, is_closed } = req.body;

            const leagueChanges = {};
            if(name) leagueChanges.name = name;
            if(max_participants) leagueChanges.max_participants = max_participants;
            if(typeof is_closed === 'boolean') leagueChanges.is_closed = is_closed;

            const data = await LeagueService.updateLeague(req.userId , req.params.leagueId, leagueChanges);

            return successResponse(res, leagueMessages.LEAGUE_UPDATE_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },

    async deleteLeague(req, res, next) {
        try {
            const data = await LeagueService.deleteLeague(req.userId, req.params.leagueId);

            return successResponse(res, leagueMessages.LEAGUE_DELETE_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },

    async regenerateLeagueCode(req, res, next) {
        try {
            const data = await LeagueService.regenerateCode(req.userId, req.params.leagueId);

            return successResponse(res, leagueMessages.NEW_CODE_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },

    async joinLeague(req, res, next) {
        try {
            const { invite_code } = req.body;
            const data = await LeagueService.joinLeague(req.userId, invite_code);

            return successResponse(res, leagueMessages.LEAGUE_JOIN_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },

    async leaveLeague(req, res, next) {
        try {
            const data = await LeagueService.leaveLeague(req.userId, req.params.leagueId);

            return successResponse(res, leagueMessages.LEAGUE_EXIT_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },

    async removePlayer(req, res, next) {
        try {
            const { id : playerId }  = await UserService.loadByUserName(req.query.username);
            const data = await LeagueService.removePlayer(playerId, req.params.leagueId, req.userId);

            return successResponse(res, leagueMessages.PLAYER_REMOVE_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },

    async restorePlayer(req, res, next) {
        try {
            const data = await LeagueService.restorePlayer(req.params.playerId, req.params.leagueId, req.userId);

            return successResponse(res, leagueMessages.PLAYER_RESTORE_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },

    async getLeagueSuspendedPlayers(req, res, next) {
        try {
            const data = await LeagueService.suspendedPlayersList(req.params.leagueId, req.userId);

            return successResponse(res, leagueMessages.SUSPENDED_LIST_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = LeagueController;