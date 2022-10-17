const joi = require('joi');

const fixtureValidator = {
    createFixtureSchema: joi.object({
        home_team_id: joi.number().integer().min(1).required(),
        away_team_id: joi.number().integer().min(1).required(),
        date_time: joi.date().required(),
        gameweek_id: joi.number().integer().min(1).required()
    }),
    updateFixtureSchema: joi.object({
        home_team_id: joi.number().integer().min(1),
        away_team_id: joi.number().integer().min(1),
        away_score: joi.number().integer().min(0),
        home_score: joi.number().integer().min(0),
        date_time: joi.date(),
        gameweek_id: joi.number().integer().min(1),
        is_complete: joi.bool()
    }).with('home_team_id', 'away_team_id').with('away_team_id', 'home_team_id'),
    recentFixturesSchema: joi.object({
        last: joi.number().integer().min(1).required()
    }),
    headToheadSchema: joi.object({
        teamOne: joi.number().integer().min(1).required(),
        teamTwo: joi.number().integer().min(1).required()
    })
};

module.exports = fixtureValidator;
