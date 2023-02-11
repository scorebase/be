const joi = require('joi');

const emailValidator = {
    createTemplateSchema: joi.object({
        name: joi.string().regex(/^[a-zA-Z0-9_]+$/).min(3).max(30).required(),
        body: joi.string().required(),
        subject: joi.string().required(),
        sender_name: joi.string().required(),
        sender_email : joi.string().email().required()
    }),
    updateTemplateSchema : joi.object({
        body: joi.string(),
        subject: joi.string(),
        sender_name: joi.string(),
        sender_email : joi.string().email()
    }),
    sendEmailSchema : joi.object({
        template_name : joi.string().regex(/^[a-zA-Z0-9_]+$/).min(3).max(30).required(),
        recipient : joi.alternatives([
            joi.string().email().required(),
            joi.array().items(joi.string().email().required())
        ]).required(),
        variables : joi.object(),
        sender_name : joi.string(),
        sender_email : joi.string().email()
    })
};

module.exports = emailValidator;
