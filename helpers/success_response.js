/**
 * Build a success response
 * @param {ExpressResponse} res The response object
 * @param {string} message The response message
 * @param {*} data Response data
 * @returns {object}
 */
const successResponse = (res, message, data) => {
    return res.json({
        status : 'success',
        message,
        data
    });
};

module.exports = successResponse;