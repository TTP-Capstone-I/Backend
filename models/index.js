const dbConnection = require("../db");
const Polls = require("./polls");
const Votes = require("./votes");
const Options = require("./options");
const Users = require("./users");

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

Users.hasMany(Votes, {
  foreignKey: "userId",
});
Votes.belongsTo(Users, {
  foreignKey: "userId",
});

module.exports = { dbConnection, Polls, Votes, Options, Users };
