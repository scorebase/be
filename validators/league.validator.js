const joi = require('joi');
const { LEAGUE_TYPES } = require('../helpers/constants');

const leagueValidator = {
    createLeagueSchema : joi.object({
        name : joi.string().min(3).max(30).required(),
        max_participants : joi.number().integer().min(2).required(),
        type: joi.number().valid(LEAGUE_TYPES.general, LEAGUE_TYPES.public, LEAGUE_TYPES.private).required(),
        starting_gameweek : joi.number().integer().min(1).required()
    }),
    updateLeagueSchema : joi.object({
        name : joi.string().min(3).max(30),
        max_participants : joi.number().integer().min(2),
        is_closed : joi.boolean()
    })
};

module.exports = leagueValidator;