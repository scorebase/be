const joi = require('joi');

const seasonValidator = {
    createSeasonSchema : joi.object({
        season_name: joi.string().required()
    }),
    updateSeasonSchema : joi.object({
        season_name: joi.string().required()
    })
};

module.exports = seasonValidator;