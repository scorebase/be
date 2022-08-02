const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const Fixture = require('./fixture.model');
const Picks = require('./picks.model');

class PickItem extends Model {}

PickItem.init(
    {
        fixture_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        home_pick: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        away_pick: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        points: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue : 0
        },
        picks_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        is_master_pick: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    },
    {
        sequelize,
        modelName: 'PickItem',
        tableName: 'pick_items'
    }
);

PickItem.belongsTo(Picks, {
    foreignKey : 'picks_id',
    onDelete : 'CASCADE'
});

PickItem.belongsTo(Fixture, {
    foreignKey : 'fixture_id',
    as : 'fixture',
    onDelete : 'CASCADE'
});

module.exports = PickItem;
