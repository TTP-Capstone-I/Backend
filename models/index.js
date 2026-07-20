const dbConnection = require('../db')
const Polls = require("./polls")
const Votes = require("./votes")
const Options = require("./options")

Polls.hasMany(Options, {
    foreignKey: "pollId",
    onDelete: "CASCADE",
    hooks: true,
})
Options.belongsTo(Polls,{
    foreignKey: "pollsId"
})
Options.hasMany(Votes, {
    foreignKey: "voteId",
    onDelete: "CASCADE",
    hooks: true,
})
Votes.belongsTo(Options, {
    foreignKey: "voteId"
})

module.exports = {dbConnection , Polls, Votes, Options};