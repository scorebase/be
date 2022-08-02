const joi = require('joi');

const gameweekValidator = {
    createGameweekSchema : joi.object({
        deadline : joi.date().required(),
        title: joi.string().required()
    }),
    updateGameweekSchema: joi.object({
        deadline : joi.date().required(),
        title: joi.string().required()
    }),
    updateGameweekStatusSchema : joi.object({
        current : joi.number().integer().required(),
        next : joi.number().integer().invalid(joi.ref('current')).required()
    })
};

module.exports = gameweekValidator;