const express = require('express');

const UserController = require('../controllers/user.controller');
const { isLoggedIn } = require('../middlewares/auth.middleware');

const userRouter = express.Router();

userRouter.get('/profile', isLoggedIn, UserController.getProfile);

userRouter.put('/updateProfile', isLoggedIn, UserController.updateUserProfile);

module.exports = userRouter;