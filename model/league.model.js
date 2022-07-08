const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class League extends Model {}

League.init(
    {
        id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        invite_code: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        max_participant: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        administrator: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        starting_gameweek: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: 'League'
    }
);
