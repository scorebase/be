const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const Season = require('./season.model');

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
        season_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: 'GameWeek',
        tableName: 'gameweeks'
    }
);

GameWeek.belongsTo(Season, {
    foreignKey: 'season_id',
    onDelete: 'cascade',
    onUpdate: 'cascade'
});

module.exports = GameWeek;
