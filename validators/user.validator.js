const joi = require('joi');

const userValidator = {
    updateUserProfileSchema : joi.object({
        full_name : joi.string(),
        username : joi.string()
    })
};

module.exports = userValidator;