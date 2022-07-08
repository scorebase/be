const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Picks extends Model {}

Picks.init(
    {
        player_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        gameweek_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        total_points: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: 'Picks',
        tableName: 'picks'
    }
);

module.exports = Picks;
