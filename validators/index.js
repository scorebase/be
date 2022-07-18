const validator = require('express-joi-validation').createValidator({ passError : true });

module.exports.validateBody = validator.body;
module.exports.validateQuery = validator.query;