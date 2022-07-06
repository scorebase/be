const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Team extends Model {}

Team.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    short_name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'short name for the team. e.g ARS for Arsenal'
    },
    jersey : {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'URL to the team\'s jersey image'
    }
}, {
    sequelize,
    modelName: 'Team'
});

module.exports = Team;