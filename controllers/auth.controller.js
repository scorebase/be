const { authMessages } = require('../helpers/messages');
const successResponse = require('../helpers/success_response');
const AuthService = require('../services/auth.service');

const { PASSWORD_UPDATE_SUCCESS,
    REGISTRATION_SUCCESS,
    LOGIN_SUCCESS,
    TOKEN_VERIFIED_SUCCESS,
    RESET_PASSWORD_SUCCESS
} = authMessages;

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
    },

    async createResetPasswordToken(req, res, next) {
        try {
            const { email } = req.body;
            const token = await AuthService.getResetPasswordToken(email);

            return successResponse(res, 'Token created successfully', token);
        }catch (error) {
            next(error);
        }
    },

    async verifyResetPasswordToken(req, res, next) {
        try {
            const { email, token } = req.body;

            const data = await AuthService.verifyResetPasswordToken(email, token);

            return successResponse(res, TOKEN_VERIFIED_SUCCESS, data);
        }catch(error) {
            next(error);
        }
    },

    async resetPassword(req, res, next) {
        try{
            const { email, token, new_password } = req.body;

            const data = await AuthService.resetPassword(email, token, new_password);

            return successResponse(res, RESET_PASSWORD_SUCCESS, data);

        } catch (error) {
            next(error);
        }
    }
};

module.exports = AuthController;