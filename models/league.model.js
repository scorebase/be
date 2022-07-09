const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const GameWeek = require('./gameweek.model');
const User = require('./user.model');

class League extends Model {}

League.init(
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        invite_code: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        max_participant: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        administrator_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        starting_gameweek: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: 'League',
        tableName : 'leagues'
    }
);

League.belongsTo(User, {
    foreignKey : 'administrator_id',
    as : 'administrator'
});

League.belongsTo(GameWeek, {
    foreignKey : 'starting_gameweek',
    as : 'startingGameweek'
});

module.exports = League;