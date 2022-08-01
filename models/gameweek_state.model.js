const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const GameWeek = require('./gameweek.model');

class GameWeekState extends Model {}

GameWeekState.init(
    {
        state: {
            type: DataTypes.STRING(32),
            allowNull: false,
            primaryKey : true
        },
        id: {
            type: DataTypes.INTEGER
        }
    },
    {
        sequelize,
        timestamps: false,
        modelName: 'GameWeekState',
        tableName: 'gameweek_states'
    }
);

GameWeekState.belongsTo(GameWeek, {
    foreignKey : 'id',
    as : 'gameweek',
    onDelete : 'SET NULL'
});

//populate with our two states
// GameWeekState.bulkCreate([
//     { state : 'current'},
//     { state : 'next' }
// ]);

module.exports = GameWeekState;
