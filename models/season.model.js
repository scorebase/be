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
        timestamps : false,
        modelName: 'Season',
        tableName: 'seasons'
    }
);

module.exports = Season;
