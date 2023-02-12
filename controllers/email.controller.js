const EmailService = require('../services/email.service');
const successResponse = require('../helpers/success_response');
const {emailMessages} = require('../helpers/messages');
const CacheService = require('../services/cache.service');

const templateCache = new CacheService('email_template');

const EmailController = {
    async createTemplate(req, res, next) {
        try{
            const { name, body, subject, sender_email, sender_name } = req.body;
            await EmailService.createTemplate(name, body, subject, sender_name, sender_email);
            return successResponse(res, emailMessages.TEMPLATE_CREATE_SUCCESS , null);
        } catch (e) {
            next(e);
        }
    },

    async editTemplate(req, res, next) {
        try {
            const { name } = req.params;
            await EmailService.editTemplate(name, req.body);
            templateCache.remove(name);
            return successResponse(res, emailMessages.TEMPLATE_UPDATE_SUCCESS, null);
        } catch(error) {
            next(error);
        }
    },

    async getTemplate(req, res, next) {
        try {
            const data = await EmailService.fetchTemplate(req.params.name);
            return successResponse(res, emailMessages.TEMPLATE_FETCH_SUCCESS, data);
        } catch(error) {
            next(error);
        }
    },

    async sendEmail(req, res, next) {
        try {
            const { template_name, recipient, variables, sender_name, sender_email } = req.body;
            await EmailService.sendEmail(template_name, recipient, variables, sender_name, sender_email);
            return successResponse(res, emailMessages.EMAIL_SENT_SUCCESS, null);
        } catch (error) {
            next(error);
        }
    }
};
module.exports = EmailController;