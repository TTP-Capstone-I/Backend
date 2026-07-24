const { DataTypes } = require('sequelize');
const dbConnection = require('../db')

const Polls = dbConnection.define('poll', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ownerTokenHash: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Polls