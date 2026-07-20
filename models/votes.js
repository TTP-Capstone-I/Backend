const { DataTypes} = require('sequelize');
const dbConnection = require('../db')

const Votes = dbConnection.define('vote',{
    
} );

module.exports = Votes;