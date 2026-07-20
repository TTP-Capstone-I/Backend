require("dotenv").config()
const allModels = require("./models");
const dbConnection = require("./db");
const Polls = allModels.Polls;
const Options = allModels.Options;
const Votes = allModels.Votes;

async function seed(){
    await dbConnection.sync({force: true})
    const newPoll = await Polls.create({
        title: "Test Poll",
        description: "testing 123",
    })
    const optionOne = await Options.create({
        title: "Test Option One",
        pollId: newPoll.id,
    })
    const optionTwo = await Options.create({
        title: "Test Option Two",
        pollId: newPoll.id,
    })
    const optionThree = await Options.create({
        title: "Test Option Three",
        pollId: newPoll.id,
    })
    const VoteOne = await Votes.create({
        name: "Vote One",
        optionId: optionOne.id
    })
    const VoteTwo = await Votes.create({
        name: "Vote Two",
        optionId: optionTwo.id
    })
    const VoteThree = await Votes.create({
        name: "Vote Three",
        optionId: optionThree.id
    })
    const VoteFour = await Votes.create({
        name: "Vote Four",
        optionId: optionOne.id
    })
    console.log("SEEDED!")
    dbConnection.close()
}
seed()