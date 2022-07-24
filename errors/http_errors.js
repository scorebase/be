class NotFoundError extends Error {
    /**
     *
     * @param {string} message Error message
     */
    constructor(message) {
        super(message);
        this.statusCode = 404;
    }
}

class ServiceError extends Error {
    /**
     *
     * @param {string} message Error message
     */
    constructor(message) {
        super(message);
        this.statusCode = 400;
    }
}

class UnauthorizedError extends Error {
    /**
     *
     * @param {string} message Error message
     */
    constructor(message) {
        super(message);
        this.statusCode = 401;
    }
}

class ForbiddenError extends Error {
    /**
     *
     * @param {string} message Error message
     */
    constructor(message) {
        super(message);
        this.statusCode = 403;
    }
}
module.exports = { NotFoundError,  ServiceError, UnauthorizedError, ForbiddenError };