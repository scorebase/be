const express = require('express');

const AuthController = require('../controllers/auth.controller');
const { isLoggedIn } = require('../middlewares/auth.middleware');
const { validateBody } = require('../validators');
const {
    registerUserSchema,
    loginUserSchema,
    updatePasswordSchema,
    getResetPasswordTokenSchema,
    verifyResetPasswordTokenSchema,
    resetPasswordSchema
} = require('../validators/auth.validator');

const authRouter = express.Router();

authRouter.post('/login', validateBody(loginUserSchema), AuthController.login);
authRouter.post('/register', validateBody(registerUserSchema), AuthController.register);
authRouter.put('/password', validateBody(updatePasswordSchema), isLoggedIn, AuthController.updatePassword);
authRouter.post('/resetPasswordToken',
    validateBody(getResetPasswordTokenSchema),
    AuthController.createResetPasswordToken);

authRouter.post('/verifyResetPasswordToken',
    validateBody(verifyResetPasswordTokenSchema),
    AuthController.verifyResetPasswordToken);

authRouter.put('/resetPassword',
    validateBody(resetPasswordSchema),
    AuthController.resetPassword);

module.exports = authRouter;