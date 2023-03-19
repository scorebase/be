const express = require('express');

const UserController = require('../controllers/user.controller');
const { isLoggedIn } = require('../middlewares/auth.middleware');
const { validateBody } = require('../validators');
const { updateUserProfileSchema } = require('../validators/user.validator');

const userRouter = express.Router();

userRouter.get('/profile', isLoggedIn, UserController.getProfile);

userRouter.put('/updateProfile',
    validateBody(updateUserProfileSchema),
    isLoggedIn,
    UserController.updateUserProfile);

module.exports = userRouter;