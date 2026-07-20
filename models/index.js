const dbConnection = require("../db");
const Polls = require("./polls");
const Votes = require("./votes");
const Options = require("./options");

Polls.hasMany(Options, {
  foreignKey: "pollId",
  onDelete: "CASCADE",
  hooks: true,
});
Options.belongsTo(Polls, {
  foreignKey: "pollId",
});
Options.hasMany(Votes, {
  foreignKey: "optionId",
  onDelete: "CASCADE",
  hooks: true,
});
Votes.belongsTo(Options, {
  foreignKey: "optionId",
});

module.exports = { dbConnection, Polls, Votes, Options };
