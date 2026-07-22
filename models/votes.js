const { DataTypes } = require('sequelize');
const dbConnection = require('../db')

const Votes = dbConnection.define('vote', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    optionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
});

module.exports = Votes;