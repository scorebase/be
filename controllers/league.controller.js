const { leagueMessages } = require('../helpers/messages');
const successResponse = require('../helpers/success_response');
const LeagueService = require('../services/league.service');

const LeagueController = {
    async createLeague(req, res, next) {
        try {
            const { name, max_participants, type, starting_gameweek } = req.body;

            const data = await LeagueService.createLeague(req.userId, name, max_participants, type, starting_gameweek);

            return successResponse(res, leagueMessages.LEAGUE_CREATION_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = LeagueController;