const { DataTypes} = require('sequelize');
const dbConnection = require('../db')

const Users = dbConnection.define('user',{
    name:{
        type: DataTypes.STRING,
        allowNull: true
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notNull:{ msg: 'Email is required.'},
            notEmpty:{ msg: 'Email is cannot be empty.'},
            isEmail:{ msg: 'Must be a valid email.'}
        }
    }
} );

module.exports = Users