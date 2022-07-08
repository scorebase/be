const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class PickItem extends Model {}

PickItem.init(
    {
        fixture_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        home_pick_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        away_pick_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        points: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        picks_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        is_master_pick: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: 'PickItem',
        tableName: 'pickitem'
    }
);

module.exports = PickItem;
