const joi = require('joi');
const { REGISTER_USER_TOKEN_LENGTH } = require('../helpers/constants');

const authValidator = {
    registerUserSchema : joi.object({
        fullName : joi.string().min(5).required(),
        username: joi.string().regex(/^[a-zA-Z0-9_]+$/).min(3).max(30).required(),
        email : joi.string().email().required(),
        password : joi.string().min(7).required()
    }),

    loginUserSchema : joi.object({
        password : joi.string().min(7).required(),
        user : joi.alternatives([
            joi.string().regex(/^[a-zA-Z0-9_]+$/).min(3).allow('_'),
            joi.string().email()
        ]).label('username or email').required()
    }),

    updatePasswordSchema : joi.object({
        oldPassword : joi.string().min(7).required(),
        newPassword : joi.string().disallow(joi.ref('oldPassword')).min(7).required()
    }),

    createTokenSchema : joi.object({
        email : joi.string().email().required()
    }),

    verifyTokenSchema : joi.object({
        token : joi.string().length(REGISTER_USER_TOKEN_LENGTH).required(),
        email : joi.string().email().required()
    })
};

module.exports = authValidator;