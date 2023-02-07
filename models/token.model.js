const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Token extends Model {}

Token.init({
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    value: {
        type: DataTypes.STRING,
        allowNull: true
    },
    token_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Token',
    tableName: 'tokens'
});

module.exports = Token;