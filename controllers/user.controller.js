const successResponse = require('../helpers/success_response');
const UserService = require('../services/user.service');

const UserController = {
    async getProfile(req, res, next) {
        try {
            const data = await UserService.getProfile(req.userId);

            return successResponse(res, 'Profile loaded.', data);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = UserController;