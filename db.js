const { Sequelize} = require('sequelize');
const URL = process.env.DB_URL
const db = new Sequelize(URL, {logging: false, ssl: true})

module.exports = db