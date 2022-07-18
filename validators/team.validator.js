const joi = require('joi');

const teamValidator = {
    createTeamSchema: joi.object({
        name: joi.string().required(),
        short_name: joi.string().length(3).required(),
        jersey: joi.string().label('jersey image url').required()
    }),
    updateTeamSchema: joi.object({
        name: joi.string().required(),
        short_name: joi.string().length(3).required(),
        jersey: joi.string().label('jersey image url').required()
    })
};

module.exports = teamValidator;