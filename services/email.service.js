const EmailTemplate = require('../models/email_template.model');
const {emailErrors} = require('../errors');
const {ServiceError, NotFoundError} = require('../errors/http_errors');
const CacheService = require('./cache.service');
const sgMail = require('@sendgrid/mail');
const config = require('../config/config');
const logger = require('../logger');

sgMail.setApiKey(config.mail.api_key);

const cache = new CacheService('email_template');

class EmailService {
    static async createTemplate(name, body, subject, sender_name, sender_email) {
        const nameExists = await this.loadTemplate(name);
        if(nameExists) throw new ServiceError(emailErrors.NAME_ALREADY_EXISTS);

        await EmailTemplate.create({ name, body, subject, sender_name, sender_email });
    }

    static async editTemplate(name, updates) {
        const template = await this.loadTemplate(name, false);
        if(!template) throw new NotFoundError(emailErrors.TEMPLATE_NOT_FOUND);

        for(const key in updates) {
            template[key] = updates[key];
        }

        await template.save();
    }

    static async fetchTemplate(name) {
        const template = await this.loadTemplate(name);
        if(!template) throw new NotFoundError(emailErrors.TEMPLATE_NOT_FOUND);

        return template;
    }

    static async deleteTemplate(name) {
        const template = await this.loadTemplate(name);
        if(!template) throw new NotFoundError(emailErrors.TEMPLATE_NOT_FOUND);

        await template.destroy();
    }

    static async sendEmail(template_name, recipient, data, s_name = null, s_email = null) {
        const template = await this.loadTemplate(template_name);
        if(!template) throw new NotFoundError(emailErrors.TEMPLATE_NOT_FOUND);
        const { body, sender_name, sender_email, subject } = template;

        //Sender
        //pick either the name and email passed to method, or use the one in the template by default.
        const name = s_name || sender_name;
        const email = s_email || sender_email;

        //Replace variables in body and subject
        const parsedBody = this.injectVariables(body, data);
        const parsedSubject = this.injectVariables(subject, data);

        //Sendgrid mail config
        const msg = {
            to: recipient,
            from: `${name} <${email}>`,
            subject: parsedSubject,
            html : parsedBody,
            text : parsedBody
        };

        try {
            await sgMail.sendMultiple(msg);
        } catch (error) {
            //Log sendgrid error.
            logger.error(
                `Error sending mail to ${recipient} with template ${template_name}. 
                Error body : ${JSON.stringify(error.response.body)}`
            );
            //Throw more friendly error to client
            throw new ServiceError(emailErrors.SENDGRID_MAIL_ERROR);
        }
    }

    static async loadTemplate(template_name, rawData = true) {
        if(rawData) {
            const cached = cache.load(template_name);
            if(cached) return cached;
        }
        const template = await EmailTemplate.findOne({ where : { name : template_name }, raw : rawData });

        if(rawData && template) cache.insert(template_name, template);

        return template;
    }

    static injectVariables(body, variables) {
        return body.replace(/\{\{(.+?)\}\}/g, (_, g) => {
            if (!variables[g.trim()]) {
                return '';
            }
            return variables[g.trim()];
        });
    }
}

module.exports = EmailService;