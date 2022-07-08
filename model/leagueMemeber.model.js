const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class LeagueMember extends Model {};

LeagueMember.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
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
    modelName: 'LeagueMember'
});