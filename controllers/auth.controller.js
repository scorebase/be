const { authMessages } = require('../helpers/messages');
const successResponse = require('../helpers/success_response');
const AuthService = require('../services/auth.service');

const { PASSWORD_UPDATE_SUCCESS, REGISTRATION_SUCCESS, LOGIN_SUCCESS } = authMessages;

const AuthController = {
    async login(req, res, next) {
        try {
            const { user, password } = req.body;
            const data = await AuthService.loginUser(user, password);
            return successResponse(res, LOGIN_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },

    async register(req, res, next) {
        try {
            const {fullName, email, username, password } = req.body;
            const data = await AuthService.registerUser(fullName, username, email, password);
            return successResponse(res, REGISTRATION_SUCCESS, data);

        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    async updatePassword(req, res, next) {
        try {
            const { userId } = req;
            const { oldPassword, newPassword } = req.body;

            await AuthService.updatePassword(userId, oldPassword, newPassword);

            return successResponse(res, PASSWORD_UPDATE_SUCCESS, null);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = AuthController;