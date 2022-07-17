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
    },
    is_suspended : {
        type: DataTypes.BOOLEAN,
        defaultValue : false,
        comment : 'If a player has been suspended from a league.'
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