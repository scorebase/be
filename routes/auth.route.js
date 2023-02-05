const express = require('express');

const AuthController = require('../controllers/auth.controller');
const { isLoggedIn } = require('../middlewares/auth.middleware');
const { validateBody } = require('../validators');
const {
    registerUserSchema,
    loginUserSchema,
    updatePasswordSchema,
    createTokenSchema,
    verifyTokenSchema
} = require('../validators/auth.validator');

const authRouter = express.Router();

authRouter.post('/login', validateBody(loginUserSchema), AuthController.login);
authRouter.post('/register', validateBody(registerUserSchema), AuthController.register);
authRouter.put('/password', validateBody(updatePasswordSchema), isLoggedIn, AuthController.updatePassword);
authRouter.post('/token', validateBody(createTokenSchema), AuthController.createToken);
authRouter.post('/token/verify', validateBody(verifyTokenSchema), AuthController.verifyToken);

module.exports = authRouter;