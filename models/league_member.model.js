const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const League = require('./league.model');
const User = require('./user.model');

class LeagueMember extends Model {};

LeagueMember.init({
    league_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    player_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'LeagueMember',
    tableName: 'league_members'
});

LeagueMember.belongsTo(League, {
    foreignKey : 'league_id'
});

LeagueMember.belongsTo(User, {
    foreignKey : 'player_id',
    as: 'player'
});

module.exports = LeagueMember;