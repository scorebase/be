const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const GameWeek = require('./gameweek.model');
const User = require('./user.model');

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
            allowNull: false,
            defaultValue: 0
        }
    },
    {
        sequelize,
        modelName: 'Picks',
        tableName: 'picks'
    }
);

Picks.belongsTo(User, {
    foreignKey : 'player_id'
});

Picks.belongsTo(GameWeek, {
    foreignKey : 'gameweek_id'
});

module.exports = Picks;
