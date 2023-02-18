const { authMessages } = require('../helpers/messages');
const successResponse = require('../helpers/success_response');
const AuthService = require('../services/auth.service');
const EmailService = require('../services/email.service');

const { RESET_PASSWORD_TEMPLATE_NAME } = require('../helpers/constants');

const { PASSWORD_UPDATE_SUCCESS,
    REGISTRATION_SUCCESS,
    LOGIN_SUCCESS,
    TOKEN_VERIFIED_SUCCESS,
    TOKEN_CREATED_SUCCESS,
    RESET_PASSWORD_SUCCESS,
    REGISTER_USER_TOKEN_CREATED_SUCCESS,
    REGISTER_USER_TOKEN_VERIFIED_SUCCESS
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
            //call authservice for token
            await AuthService.createToken(email);
            return successResponse(res, REGISTRATION_SUCCESS, data);

        } catch (error) {
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
            const userData = await AuthService.getResetPasswordToken(email);

            await EmailService.sendEmail(RESET_PASSWORD_TEMPLATE_NAME, email, userData);

            return successResponse(res, TOKEN_CREATED_SUCCESS, null);
        }catch (error) {
            next(error);
        }
    },

    async verifyResetPasswordToken(req, res, next) {
        try {
            const { token } = req.body;

            const data = await AuthService.verifyResetPasswordToken(token);

            return successResponse(res, TOKEN_VERIFIED_SUCCESS, data);
        }catch(error) {
            next(error);
        }
    },
    
    async createToken(req, res, next) {
        try {
            const { email } = req.body;

            await AuthService.createToken(email);

            return successResponse(res, REGISTER_USER_TOKEN_CREATED_SUCCESS, null);
        } catch (error) {
            next(error);
        }
    },

    async resetPassword(req, res, next) {
        try{
            const { token, newPassword } = req.body;

            const data = await AuthService.resetPassword(token, newPassword);

            return successResponse(res, RESET_PASSWORD_SUCCESS, data);
        } catch (error) {
            next(error);
        }
    },
    
    async verifyToken(req, res, next) {
        try {
            const { token, email } = req.body;

            await AuthService.verifyToken(token, email);

            return successResponse(res, REGISTER_USER_TOKEN_VERIFIED_SUCCESS, null);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = AuthController;
