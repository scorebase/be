const jwt = require('jsonwebtoken');

const config = require('../config/config');
const { authErrors } = require('../errors');
const { UnauthorizedError } = require('../errors/http_errors');
const { TOKEN_HEADER } = require('../helpers/constants');

const AuthMiddleware = {
    isLoggedIn(req, res, next) {
        const token = req.headers[TOKEN_HEADER];

        if(!token) throw new UnauthorizedError(authErrors.TOKEN_REQUIRED);

        try {
            const decoded = jwt.verify(token, config.auth.secret);
            req.userId = decoded.id;
            next();
        } catch (error) {
            throw new UnauthorizedError(authErrors.INVALID_SESSION);
        }
    }
};

module.exports = AuthMiddleware;