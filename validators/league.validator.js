const joi = require('joi');
const { LEAGUE_TYPES, LEAGUE_CODE_LENGTH } = require('../helpers/constants');

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
    }),
    joinLeagueSchema : joi.object({
        invite_code : joi.string().alphanum().length(LEAGUE_CODE_LENGTH).required()
    }),
    usernameQuerySchema : joi.object({
        username: joi.string().regex(/^[a-zA-Z0-9_]+$/).min(3).max(30).required()
    })
};

module.exports = leagueValidator;