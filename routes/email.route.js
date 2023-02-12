const express = require('express');

const EmailController = require('../controllers/email.controller');

const { isLoggedIn, isAdmin } = require('../middlewares/auth.middleware');
const { validateBody } = require('../validators');
const { createTemplateSchema, updateTemplateSchema, sendEmailSchema } = require('../validators/email.validator');

const emailRouter = express.Router();

emailRouter.post('/template',
    validateBody(createTemplateSchema),
    isLoggedIn,
    isAdmin,
    EmailController.createTemplate);

emailRouter.put('/template/:name',
    validateBody(updateTemplateSchema),
    isLoggedIn,
    isAdmin,
    EmailController.editTemplate
);

emailRouter.get('/template/:name',
    isLoggedIn,
    isAdmin,
    EmailController.getTemplate
);

emailRouter.post('/send',
    validateBody(sendEmailSchema),
    isLoggedIn,
    isAdmin,
    EmailController.sendEmail
);

module.exports = emailRouter;
