const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class User extends Model {}

User.init({
    // Model attributes are defined here
    fullName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email : {
        type: DataTypes.STRING,
        allowNull: false
    },
    password_hash: {
        type  : DataTypes.STRING,
        allowNull: false
    }

}, {
    sequelize,
    modelName: 'User'
});