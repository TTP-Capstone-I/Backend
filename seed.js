require("dotenv").config()

if (process.env.NODE_ENV === "production") {
    console.error("Seed script cannot run in production.")
    process.exit(1)
}

const allModels = require("./models");
const dbConnection = require("./db");
const Polls = allModels.Polls;
const Options = allModels.Options;
const Votes = allModels.Votes;
const Users = allModels.Users;

async function seed(){
    await dbConnection.sync({force: true})

    const UserOne = await Users.create({
        email: 'user1@gmail.com',
    })

    const UserTwo = await Users.create({
        email: 'user2@gmail.com',
    })

    const UserThree = await Users.create({
        email: 'user3@gmail.com',
    })

    const UserFour = await Users.create({
        email: 'user4@gmail.com',
    })


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
        // name: "Vote One",
        optionId: optionOne.id,
        userId: UserOne.id
    })
    const VoteTwo = await Votes.create({
        // name: "Vote Two",
        optionId: optionTwo.id,
        userId: UserTwo.id
    })
    const VoteThree = await Votes.create({
        // name: "Vote Three",
        optionId: optionThree.id,
        userId: UserThree.id
    })
    const VoteFour = await Votes.create({
        // name: "Vote Four",
        optionId: optionOne.id,
        userId: UserFour.id
    })

    const newPoll2 = await Polls.create({
        title: "What is the best programming language?",
        description: "What do you think is the best programming language?",
    })
    const option_one = await Options.create({
        title: "JavaScript",
        pollId: newPoll2.id,
    })
    const option_two = await Options.create({
        title: "Python",
        pollId: newPoll2.id,
    })
    const option_three = await Options.create({
        title: "C++",
        pollId: newPoll2.id,
    })
    const option_four = await Options.create({
        title: "C#",
        pollId: newPoll2.id,
    })
    await Votes.create({
        // name: "Vote One",
        optionId: option_one.id,
        userId: UserOne.id
    })
    await Votes.create({
        // name: "Vote Two",
        optionId: option_two.id,
        userId: UserTwo.id
    })
    await Votes.create({
        // name: "Vote Three",
        optionId: option_three.id,
        userId: UserThree.id
    })
    await Votes.create({
        // name: "Vote Four",
        optionId: option_one.id,
        userId: UserFour.id
    })

    console.log("SEEDED!")
    dbConnection.close()
}

seed()