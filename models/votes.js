const { DataTypes } = require('sequelize');
const dbConnection = require('../db')

const Votes = dbConnection.define('vote', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true // Change this later when users will be needed to vote
    },
    optionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
});

module.exports = Votes;