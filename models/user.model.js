const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class User extends Model {}

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
    password_hash: {
        type  : DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'User',
    tableName: 'users'
});

module.exports = User;