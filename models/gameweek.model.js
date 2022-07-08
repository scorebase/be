const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class GameWeek extends Model {}

GameWeek.init(
    {
        deadline: {
            type: DataTypes.DATE,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        season: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: 'GameWeek',
        tableName: 'gameweek'
    }
);

module.exports = GameWeek;
