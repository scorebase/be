const joi = require('joi');

const gameweekValidator = {
    createGameweekSchema : joi.object({
        deadline : joi.date().required(),
        title: joi.string().required(),
        seasonId: joi.number().integer().required()
    }),
    updateGameweekSchema: joi.object({
        deadline : joi.date().required(),
        title: joi.string().required(),
        seasonId: joi.number().integer().required()
    })
};

module.exports = gameweekValidator;