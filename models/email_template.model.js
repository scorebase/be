const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class EmailTemplate extends Model {}

EmailTemplate.init(
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        body: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        subject: {
            type: DataTypes.STRING,
            comment : 'Subject of email.'
        },
        sender_name: {
            type: DataTypes.STRING,
            allowNull: false,
            comment : 'Name of default sender.'
        },
        sender_email: {
            type: DataTypes.STRING,
            allowNull: false,
            comment : 'Email of default sender'
        }
    },
    {
        sequelize,
        modelName: 'EmailTemplate',
        tableName : 'email_templates'
    }
);

module.exports = EmailTemplate;