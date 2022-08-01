const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const GameWeek = require('./gameweek.model');
const Team = require('./team.model');

class Fixture extends Model {}

Fixture.init({
    home_team_id: {
        type: DataTypes.INTEGER,
        allowNull : false
    },
    away_team_id: {
        type: DataTypes.INTEGER,
        allowNull : false
    },
    away_score: {
        type: DataTypes.INTEGER,
        comment: 'Away team result score'
    },
    home_score : {
        type: DataTypes.INTEGER,
        comment: 'Home team result score'
    },
    date_time : {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'The date and time of the fixture.'
    },
    gameweek_id : {
        type: DataTypes.INTEGER
    },
    is_complete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment : 'Match is complete'
    }
}, {
    sequelize,
    modelName: 'Fixture',
    tableName: 'fixtures'
});

Fixture.belongsTo(Team, {
    foreignKey : 'away_team_id',
    as: 'away_team',
    onDelete : 'CASCADE'
});

Fixture.belongsTo(Team, {
    foreignKey : 'home_team_id',
    as: 'home_team',
    onDelete : 'CASCADE'
});

Fixture.belongsTo(GameWeek, {
    foreignKey : 'gameweek_id',
    as : 'gameweek',
    onDelete : 'SET NULL'
});

module.exports = Fixture;