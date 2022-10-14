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
    },
    color_code : {
        type : DataTypes.STRING(10),
        comment : 'Team color code to display stats on frontend.'
    }
}, {
    sequelize,
    modelName: 'Team',
    tableName: 'teams'
});

module.exports = Team;