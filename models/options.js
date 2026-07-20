const { DataTypes} = require('sequelize');
const dbConnection = require('../db')

const Options = dbConnection.define('option',{
    text:{
        type: DataTypes.STRING,
        allowNull: false
    },
} );

module.exports = Options;