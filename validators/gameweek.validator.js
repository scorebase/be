const joi = require('joi');

const gameweekValidator = {
    createGameweekSchema : joi.object({
        deadline : joi.date().required(),
        title: joi.string().required()
    }),
    updateGameweekSchema: joi.object({
        deadline : joi.date().required(),
        title: joi.string().required()
    })
};

module.exports = gameweekValidator;