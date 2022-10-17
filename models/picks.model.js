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
            type: DataTypes.INTEGER
        },
        exact : {
            type : DataTypes.INTEGER,
            defaultValue: 0,
            comment : 'Number of exact picks'
        },
        close : {
            type : DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Number of close picks'
        },
        result : {
            type : DataTypes.INTEGER,
            defaultValue: 0,
            comment : 'Number of correct outcomes'
        },
        total_points: {
            type: DataTypes.INTEGER,
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
    foreignKey : 'player_id',
    onDelete : 'CASCADE'
});

Picks.belongsTo(GameWeek, {
    foreignKey : 'gameweek_id',
    onDelete : 'RESTRICT'
});

module.exports = Picks;
