const { DataTypes} = require('sequelize');
const dbConnection = require('../db')

const Votes = dbConnection.define('vote',{
    name:{
        type: DataTypes.STRING,
        allowNull: false
    }
} );

module.exports = Votes;