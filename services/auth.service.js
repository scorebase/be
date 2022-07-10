const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

const User = require('../models/user.model');
const { NotFoundError, ServiceError, UnauthorizedError } = require('../errors/http_errors');
const config = require('../config/config');
const { authErrors } = require('../errors');

const {
    INVALID_CREDENTIALS_ERROR,
    USERNAME_EXISTS_ERROR,
    EMAIL_EXISTS_ERROR ,
    ACCOUNT_NOT_FOUND,
    INCORRECT_PASSWORD
} = authErrors;

class AuthService {
    /**
     *
     * @param {string} user the user's username or email
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
        };

        const user = await User.create({
            full_name, username, email, password
        });

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

        return;
    }

    /**
     *
     * @param {object} data The payload to use to generate JWT
     * @returns {string} a jwt token
     */
    static generateToken(data) {
        return jwt.sign(data, config.auth.secret);
    }
};

module.exports = AuthService;