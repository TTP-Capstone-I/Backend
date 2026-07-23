const express = require("express");
const app = express();
const router = express.Router()

const allModels = require("../models");
const dbConnection = allModels.dbConnection
const Polls = allModels.Polls;
const Options = allModels.Options;
const Votes = allModels.Votes;

// Route for getting all polls including the options with them.
router.get("/polls", async (request, response, next) => {
    try {
        // Uses query `?include=true` to also get all the polls with options & votes attached. 
        const include = request.query.include
        const where = include === 'true' ? {
            include: [{ model: Options, include: Votes },]
        } : {}

        const allPolls = await Polls.findAll(where);
        if (!allPolls) {
            return response.status(404).send("No polls were found.");
        }
        return response.status(200).json(allPolls);
    } catch (error) {
        next(error);
    }
});

// Route for getting a poll by its Id.
router.get("/polls/:id", async (request, response, next) => {
    try {
        const id = Number(request.params.id);
        const include = request.query.include
        const poll = await Polls.findByPk(id, {include: [{ model: Options, include: Votes },]});
        if (!poll) {
            return response.status(404).send("Fail to find post with id: " + id);
        }
        return response.status(200).json(poll);
    } catch (error) {
        next(error);
    }
});

// This function should check if poll can be created before continuing.
// If there is no title and description return status 400 with a message.
// Otherwise continue.
function validatePollCreation(request, response, next) {
    const { title, description } = request.body;
    const options = request.body.options

    if (!title || !description) {
        console.log("validation failed!");
        return response.status(400).send("Title and description are required!");
    }

    if (!options.length >= 2) {
        console.log("validation failed!");
        return response.status(400).send("A poll is required to have at least two options!");
    }

    console.log("validation passed!");
    next();
}
// Route for creating a new poll.
// Later create a validation middleware.
// This should also create new options without needing to make a seperate request for each option.
router.post("/polls", validatePollCreation, async (request, response, next) => {
    const {title, description, options} = request.body
    const newPoll = await Polls.create({
        title: title,
        description: description
    });

    try {
        if (!newPoll) {
            return response.status(404).send("Failed to add new Poll");
        }

        for (const option of options) {
            const newOption = await Options.create({
                title: option.title,
                pollId: newPoll.id,
            });
        }

        // Reload the created poll with its new options
        await newPoll.reload({
            include: Options
        })

        return response.status(201).json(newPoll);
    } catch (error) {
        await newPoll.destroy() // Destroy the new poll if any error happens during its creation.
        next(error);
    }
});

// Route for updating a poll by its Id.
router.patch("/polls/:id", validatePollCreation, async (request, response, next) => {
    try {
        const id = Number(request.params.id);
        const foundPoll = await Polls.findByPk(id)

        if (!foundPoll) {
            return response.status(404).send("Failed to find Poll with id:", id);
        }

        const updatedPoll = await foundPoll.update(request.body);
        return response.status(200).json(updatedPoll);
    } catch (error) {
        next(error);
    }
});

// Route for deleting a poll by its Id.
router.delete("/polls/:id", async (request, response, next) => {
    try {
        const id = Number(request.params.id);
        const foundPoll = await Polls.findByPk(id)

        if (!foundPoll) {
            return response.status(404).send("Failed to find Poll with id:", id);
        }

        await foundPoll.destroy()
        return response.sendStatus(204) // This is important it must be sendStatus
    } catch (error) {
        next(error);
    }
});

module.exports = router