const joi = require('joi');

const picksValidator = {
    createPickSchema: joi.object({
        pick_items: joi.array().min(1).items({
            fixture_id: joi.number().integer().min(1).required(),
            home_pick: joi.number().integer().min(0).required(),
            away_pick: joi.number().integer().min(0).required(),
            is_master_pick: joi.bool().required()
        })
    }),
    updatePickSchema: joi.object({
        pick_items: joi.array().min(1).items({
            fixture_id: joi.number().integer().min(1).required(),
            home_pick: joi.number().integer().min(0).required(),
            away_pick: joi.number().integer().min(0).required(),
            is_master_pick: joi.bool().required()
        })
    })
};

module.exports = picksValidator;