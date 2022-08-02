const jwt = require('jsonwebtoken');

const config = require('../config/config');
const { authErrors } = require('../errors');
const { UnauthorizedError, ForbiddenError } = require('../errors/http_errors');
const { TOKEN_HEADER, ADMIN_SECRET_HEADER } = require('../helpers/constants');

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
    },
    /**
     * A mock isAdmin middleware to block access to normal users to some admin endpoints
     * this just ensures an admin secret is passed in the header
     */
    isAdmin(req, res, next) {
        //if in test mode, validate isAdmin and move to next.
        if(config.mode === 'test') return next();

        const secret = req.headers[ADMIN_SECRET_HEADER];

        if(!secret || secret !== config.auth.adminSecret) {
            throw new ForbiddenError(authErrors.NOT_PERMITTED);
        }

        next();
    }
};

module.exports = AuthMiddleware;