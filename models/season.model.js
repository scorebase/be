const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Season extends Model {}

Season.init(
    {
        season_name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: 'Season',
        tableName: 'seasons',
        timestamps : false
    }
);

module.exports = Season;