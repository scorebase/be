const joi = require('joi');

const userValidator = {
    updateUserProfileSchema : joi.object({
        full_name : joi.string().required(),
        username : joi.string().required()
    })
};

module.exports = userValidator;