const { DataTypes } = require('sequelize');
const dbConnection = require('../db')

const Options = dbConnection.define('option', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
});

module.exports = Options;