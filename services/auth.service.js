const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const { customAlphabet } = require('nanoid');
const User = require('../models/user.model');
const Token = require('../models/token.model');
const { NotFoundError, ServiceError, UnauthorizedError } = require('../errors/http_errors');
const sequelize = require('../config/db');
const config = require('../config/config');
const { authErrors } = require('../errors');
const LeagueMember = require('../models/league_member.model');
const Token = require('../models/token.model');
const GameweekService = require('./gameweek.service');
const {
    REGISTER_USER_TOKEN_LENGTH,
    TOKEN_TYPES,
    REGISTER_USER_TOKEN_EXP_TIME,
    ONE_MINUTE
} = require('../helpers/constants');

const {
    ONE_MINUTE,
    RESET_PASSWORD_EXP_TIME,
    RESET_PASSWORD_TOKEN_LENGTH,
    TOKEN_TYPES
} = require('../helpers/constants');

const {
    INVALID_CREDENTIALS_ERROR,
    USERNAME_EXISTS_ERROR,
    EMAIL_EXISTS_ERROR ,
    ACCOUNT_NOT_FOUND,
    INCORRECT_PASSWORD,
    EMAIL_NOT_FOUND,
    EMAIL_NOT_VERIFIED,
    RESET_PASSWORD_TOKEN_ERROR,
    EXPIRED_TOKEN_ERROR,
    TOKEN_NOT_FOUND,
    REGISTER_USER_TOKEN_ERROR,
    REGISTER_USER_TOKEN_NOT_FOUND,
    REGISTER_USER_TOKEN_EXP,
    REGISTER_USER_TOKEN_INVALID
} = authErrors;

class AuthService {
    /**
     *
     * @param {string} userId the user's username or email
     * @param {string} password user's password
     */
    static async loginUser(userId, password) {

        const user = await User.findOne({ where : { [Op.or] :  [{username : userId}, { email : userId }] } });
        if(!user) throw new NotFoundError(INVALID_CREDENTIALS_ERROR);

        const validPassword = await user.validatePassword(password);
        if(!validPassword) throw new UnauthorizedError(INVALID_CREDENTIALS_ERROR);

        const token = this.generateToken({ id : user.id });

        //delete password_hash from response
        user.password = undefined;

        const data = {
            token,
            user
        };
        return data;
    }

    /**
     *
     * @param {string} full_name
     * @param {string} username
     * @param {string} email
     * @param {string} password
     */
    static async registerUser(full_name, username, email, password) {
        const userExists = await User.findOne({ where : {[Op.or] : [ { email }, { username } ] }});
        if(userExists) {
            //if it was email that matched
            if(userExists.email === email) throw new ServiceError(EMAIL_EXISTS_ERROR);
            //else throw username error
            throw new ServiceError(USERNAME_EXISTS_ERROR);
        }

        const t = await sequelize.transaction();
        try {
            const user = await User.create({
                full_name, username, email, password
            }, { transaction : t });

            const token = this.generateToken({ id : user.id });

            //add user to general league
            await LeagueMember.create(
                { player_id : user.id, league_id : 1 },
                { transaction : t }
            );

            //add them to their round league
            const { next } = await GameweekService.getGameweekState();
            await LeagueMember.create(
                { player_id : user.id, league_id : 1 + +next.id },
                { transaction : t }
            );

            await t.commit();
            //delete password_hash from response
            user.password = undefined;

            const data = {
                token,
                user
            };

            return data;
        } catch(e) {
            await t.rollback();
            throw e;
        }

    }

    /**
     * Update a user's password
     * @param {number} id User id
     * @param {string} old_password Old password
     * @param {string} new_password New password
     * @throws {UnauthorizedError( | NotFoundError}
     * @returns null
     */
    static async updatePassword(id, old_password, new_password) {
        const user = await User.findByPk(id);

        if(!user) throw new NotFoundError(ACCOUNT_NOT_FOUND);

        const validPassword = await user.validatePassword(old_password);
        if(!validPassword) throw new UnauthorizedError(INCORRECT_PASSWORD);

        user.password = new_password;

        await user.save();
    }

    static async getResetPasswordToken(email) {
        const user = await User.findOne({ where: { email }});

        if(!user) throw new NotFoundError(EMAIL_NOT_FOUND);

        if(!user.email_verified) throw new ServiceError(EMAIL_NOT_VERIFIED);

        const token = this.generateTokenForUse(RESET_PASSWORD_TOKEN_LENGTH);

        let resetPasswordToken = await Token.findOne({
            where : {
                [Op.and] : [{user_id : user.id}, {token_type : TOKEN_TYPES.resetPassword}]
            }});
        if(resetPasswordToken){
            resetPasswordToken.value = token;
            resetPasswordToken.expires_at = new Date( Date.now() + (ONE_MINUTE * RESET_PASSWORD_EXP_TIME));
            await resetPasswordToken.save();
        }else{
            resetPasswordToken = await Token.create({
                user_id : user.id,
                value : token,
                token_type : TOKEN_TYPES.resetPassword,
                expires_at : new Date( Date.now() + (ONE_MINUTE * RESET_PASSWORD_EXP_TIME))
            });
        }

        if(!resetPasswordToken) throw new ServiceError(RESET_PASSWORD_TOKEN_ERROR);

        return token;
    }

    static async verifyResetPasswordToken(token) {
        const tokenEntity = await this.verifyToken(token, TOKEN_TYPES.resetPassword);

        const tokenToReturn = {
            token : tokenEntity.value,
            verified : true
        };

        return tokenToReturn;
    }

    static async resetPassword(token, newPassword){
        const tokenEntity = await this.verifyToken(token, TOKEN_TYPES.resetPassword);

        tokenEntity.expires_at = new Date( Date.now() - ONE_MINUTE);

        const user = await User.findByPk(tokenEntity.user_id);
        if(user === null) throw new NotFoundError(EMAIL_NOT_FOUND);

        user.password = newPassword;

        await tokenEntity.save();
        await user.save();

        return null;
    }

    static async verifyToken(token, tokenType) {
        const tokenExists = await Token.findOne({
            where: { [Op.and] : [ { value : token }, { token_type : tokenType }]}
        });

        if(tokenExists === null) throw new NotFoundError(TOKEN_NOT_FOUND);

        if(Date.now() > tokenExists.expires_at.getTime()) throw new ServiceError(EXPIRED_TOKEN_ERROR);

        return tokenExists;
    }

    static generateTokenForUse(length) {
        const alphanumericChars = '123456789ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const nanoid = customAlphabet(alphanumericChars, length);

        return nanoid();
    }

    /**
     *
     * @param {object} data The payload to use to generate JWT
     * @returns {string} a jwt token
     */
    static generateToken(data) {
        return jwt.sign(data, config.auth.secret);
    }

    /**
     *
     * @param {string} email User email
     * @returns null. Sends email to user
    */
    static async createToken(email) {
        //find user in database
        const user = await User.findOne({ where: { email : email } });

        //generate token
        const token = this.generateRegisterUserToken();

        //find token for a user, if token exists, update token properties else create new token
        let registerUserToken = await Token.findOne({
            where: { [Op.and] : [{user_id: user.id}, {token_type: TOKEN_TYPES.registerUser}] }
        });
        if (registerUserToken) {
            registerUserToken.value = token;
            registerUserToken.expires_at = new Date(Date.now() + (ONE_MINUTE * REGISTER_USER_TOKEN_EXP_TIME));
            await registerUserToken.save();
        } else {
            //create token ans store in db for user
            //expires in 20 minutes. 1 minute = 60000 milliseconds, 20 minutes = 1200000 milliseconds
            registerUserToken = await Token.create({
                user_id: user.id,
                value: token,
                token_type: TOKEN_TYPES.registerUser,
                expires_at: new Date(Date.now() + (ONE_MINUTE * REGISTER_USER_TOKEN_EXP_TIME))
            });

            if (!registerUserToken) throw new ServiceError(REGISTER_USER_TOKEN_ERROR);
        }

        //send email to user with token
    }

    static generateRegisterUserToken() {
        const alphabet = '0123456789';
        const nanoid = customAlphabet(alphabet, REGISTER_USER_TOKEN_LENGTH);
        return nanoid();
    }

    /**
     *
     * @param {string} inputToken Register user token
     * @param {string} email User email
     * @returns null
    */
    static async verifyToken(inputToken, email) {
        //find token
        const token = await Token.findOne({
            where: { [Op.and] : [{value: inputToken}, {token_type: TOKEN_TYPES.registerUser}] }
        });
        if (!token) throw new NotFoundError(REGISTER_USER_TOKEN_NOT_FOUND);
        
        //check for expiry
        if (Date.now() > token.expires_at.getTime()) throw new ServiceError(REGISTER_USER_TOKEN_EXP);

        //check if it belongs to the user
        const user = await User.findOne({ where: { email: email} });
        if (user.id !== token.user_id) throw new ServiceError(REGISTER_USER_TOKEN_INVALID);

        //verify the user
        user.email_verified = true;

        //make token invalid
        token.expires_at = new Date(Date.now() - ONE_MINUTE);

        await user.save();
        await token.save();
    }
}

module.exports = AuthService;
