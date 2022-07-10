const { DataTypes, Model } = require('sequelize');
const util = require('util');

const sequelize = require('../config/db');
const bcrypt = require('bcrypt');
const logger = require('../logger');

class User extends Model {
    static async hashPassword(user) {
        try {
            const hash = await bcrypt.hash(user.password, 10);
            user.password = hash;
        } catch (error) {
            logger.error(
                util.format(
                    'Error hashing password for user with username %s and error message [%s]',
                    user.username,
                    error.message
                )
            );
            return false;
        }
    }
    async validatePassword(password) {
        try {
            const valid = await bcrypt.compare(password, this.password);
            return valid;
        } catch (error) {
            logger.error(
                util.format(
                    'Error validating password for user with username %s and error message [%s]',
                    this.username,
                    error.message
                )
            );
            return false;
        }
    }
};

User.init({
    full_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email : {
        type: DataTypes.STRING,
        allowNull: false,
        unique : true
    },
    password: {
        type  : DataTypes.STRING,
        allowNull: false
    },
    email_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue : false
    }
}, {
    sequelize,
    modelName: 'User',
    tableName: 'users'
});

User.beforeCreate(User.hashPassword);
User.beforeUpdate(User.hashPassword);

module.exports = User;