const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class LeagueType extends Model {}

LeagueType.init(
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: 'LeagueType',
        tableName : 'league_types'
    }
);

// LeagueType.bulkCreate(
//     [
//         {name : 'general'},
//         { name : 'public' },
//         { name : 'private' }
//     ]
// );

module.exports = LeagueType;