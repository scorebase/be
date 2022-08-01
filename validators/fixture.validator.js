const joi = require('joi');

const fixtureValidator = {
    createFixtureSchema: joi.object({
        home_team_id: joi.number().integer().min(1).required(),
        away_team_id: joi.number().integer().min(1).required(),
        date_time: joi.date().required(),
        gameweek_id: joi.number().integer().min(1).required()
    }),
    updateFixtureSchema: joi.object({
        home_team_id: joi.number().integer().min(1).required(),
        away_team_id: joi.number().integer().min(1).required(),
        away_score: joi.number().integer().min(0).allow(null).required(),
        home_score: joi.number().integer().min(0).allow(null).required(),
        date_time: joi.date().required(),
        gameweek_id: joi.number().integer().min(1).required(),
        is_complete: joi.bool().required()
    }),
    recentFixturesSchema: joi.object({
        last: joi.number().integer().min(1).required()
    }),
    headToheadSchema: joi.object({
        teamOne: joi.number().integer().min(1).required(),
        teamTwo: joi.number().integer().min(1).required()
    })
};

module.exports = fixtureValidator;
