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
        processed: {
            type: DataTypes.BOOLEAN,
            defaultValue : false,
            comment : 'This is used to indicate that this pick item has been ' +
                'processed and its points equivalent has been added to its corresponding pick.'
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
