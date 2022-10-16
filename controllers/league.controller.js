const { leagueMessages } = require('../helpers/messages');
const successResponse = require('../helpers/success_response');
const LeagueService = require('../services/league.service');
const CacheService = require('../services/cache.service');
const cacheResponse = require('../helpers/cacheResponse');

const lgCache = new CacheService('league');
const standingsCache = new CacheService('lg_standing', 0);

const LeagueController = {
    async createLeague(req, res, next) {
        try {
            const { name, max_participants, type, starting_gameweek } = req.body;

            const data = await LeagueService.createLeague(req.userId, name, max_participants, type, starting_gameweek);
            lgCache.remove('player_' + req.userId);
            return successResponse(res, leagueMessages.LEAGUE_CREATION_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },

    async leagueDetails(req, res, next) {
        try{
            const leagueId = req.params.leagueId;
            const data = await cacheResponse(
                lgCache,
                'details_' + leagueId,
                () => LeagueService.getLeagueDetails(leagueId)
            );

            return successResponse(res, leagueMessages.LEAGUE_LIST_SUCCESS ,data);
        } catch (error) {
            next(error);
        }
    },

    async updateLeague(req, res, next) {
        try {
            const { name, max_participants, is_closed } = req.body;
            const { leagueId } = req.params;
            const leagueChanges = {};
            if(name) leagueChanges.name = name;
            if(max_participants) leagueChanges.max_participants = max_participants;
            if(typeof is_closed === 'boolean') leagueChanges.is_closed = is_closed;

            const data = await LeagueService.updateLeague(req.userId , leagueId, leagueChanges);
            lgCache.removeMultiple([leagueId,'details_' + leagueId ]);
            return successResponse(res, leagueMessages.LEAGUE_UPDATE_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },

    async deleteLeague(req, res, next) {
        try {
            const { leagueId } = req.params;
            const data = await LeagueService.deleteLeague(req.userId, req.params.leagueId);
            lgCache.removeMultiple([leagueId, 'details_' + leagueId, 'player_' + req.userId]);
            return successResponse(res, leagueMessages.LEAGUE_DELETE_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },

    async regenerateLeagueCode(req, res, next) {
        try {
            const { leagueId } = req.params;
            const data = await LeagueService.regenerateCode(req.userId, leagueId);
            lgCache.removeMultiple([leagueId, 'details_' + leagueId]);
            return successResponse(res, leagueMessages.NEW_CODE_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },

    async joinLeague(req, res, next) {
        try {
            const { invite_code } = req.body;
            const data = await LeagueService.joinLeague(req.userId, invite_code);
            lgCache.removeMultiple(['details_' + data.id, 'player_' + req.userId]);
            return successResponse(res, leagueMessages.LEAGUE_JOIN_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },

    async leaveLeague(req, res, next) {
        try {
            const { leagueId } = req.params;
            const data = await LeagueService.leaveLeague(req.userId, leagueId);
            lgCache.removeMultiple(['details_' + leagueId, 'player_' + req.userId]);
            return successResponse(res, leagueMessages.LEAGUE_EXIT_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },

    async removePlayer(req, res, next) {
        try {
            const { playerId, leagueId } = req.params;
            const data = await LeagueService.removePlayer(playerId, leagueId, req.userId);
            lgCache.removeMultiple(['details_' + leagueId, 'player_' + playerId, 'suspended_' + leagueId]);
            return successResponse(res, leagueMessages.PLAYER_REMOVE_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },

    async restorePlayer(req, res, next) {
        try {
            const { playerId, leagueId } = req.params;
            const data = await LeagueService.restorePlayer(playerId, leagueId, req.userId);
            lgCache.removeMultiple(['details_' + leagueId, 'player_' + playerId, 'suspended_' + leagueId]);
            return successResponse(res, leagueMessages.PLAYER_RESTORE_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },

    async getLeagueSuspendedPlayers(req, res, next) {
        try {
            const leagueId = req.params.leagueId;
            const data = await cacheResponse(
                lgCache,
                'suspended_' + leagueId,
                () => LeagueService.suspendedPlayersList(req.params.leagueId, req.userId)
            );

            return successResponse(res, leagueMessages.SUSPENDED_LIST_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },

    async getPlayerLeagues(req, res, next) {
        try{
            const { playerId } = req.params;
            const data = await cacheResponse(
                standingsCache,
                'player_' + playerId,
                () => LeagueService.getPlayerLeagues(playerId)
            );

            return successResponse(res, leagueMessages.LEAGUE_LIST_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },

    async getLatestPlayerLeaguesWithoutStandings(req, res, next) {
        try{
            const { playerId } = req.params;
            const data = await cacheResponse(
                lgCache,
                'player_' + playerId,
                () => LeagueService.listPlayerLeagues(playerId)
            );

            return successResponse(res, leagueMessages.LEAGUE_LIST_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },

    async leagueStanding(req, res, next) {
        try {
            const { leagueId } = req.params;
            const page = +req.query.page || 1;
            const data = await cacheResponse(
                standingsCache,
                leagueId + '_' + page,
                () => LeagueService.leagueStanding(leagueId, page)
            );

            return successResponse(res, leagueMessages.LEAGUE_LIST_SUCCESS, data);
        } catch(error) {
            next(error);
        }
    },

    async changeAdmin(req, res, next) {
        try {
            const { playerId, leagueId } = req.params;
            const data = await LeagueService.updateAdmin(playerId, leagueId, req.userId);
            lgCache.removeMultiple(['player_' + playerId, 'player_' + req.userId, leagueId, 'details_' + leagueId]);
            return successResponse(res, leagueMessages.ADMIN_UPDATE_SUCCESS, data);
        } catch(error) {
            next(error);
        }
    }
};

module.exports = LeagueController;