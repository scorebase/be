const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const LeagueType = require('./league_types.model');
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
            allowNull: false,
            unique: true
        },
        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment : 'general, public or private league.'
        },
        max_participants: {
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
        },
        is_closed : {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment : 'League is closed to new entries.'
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

League.belongsTo(LeagueType, {
    foreignKey : 'type'
});

module.exports = League;