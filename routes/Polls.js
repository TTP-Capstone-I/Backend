const express = require("express");
const app = express();
const router = express.Router()
const crypto = require("crypto")

const allModels = require("../models");
const dbConnection = allModels.dbConnection
const Polls = allModels.Polls;
const Options = allModels.Options;
const Votes = allModels.Votes;

function generateOwnerToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashOwnerToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Route for getting all polls including the options with them.
router.get("/polls", async (request, response, next) => {
    try {
        // Uses query `?include=true` to also get all the polls with options & votes attached. 
        const include = request.query.include
        const allPolls = await Polls.findAll({
            include: [{ model: Options, include: Votes },],
            attributes: {exclude: ["ownerTokenHash"],},  // IMPORTANT: Do not include ownerTokenHash in any get responses.
        });
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
        const poll = await Polls.findByPk(id, {
            include: [{ model: Options, include: Votes },],
            attributes: {exclude: ["ownerTokenHash"],},  // IMPORTANT: Do not include ownerTokenHash in any get responses.
        });
        if (!poll) {
            return response.status(404).send("Failed to find poll with id: " + id);
        }
        return response.status(200).json(poll);
    } catch (error) {
        next(error);
    }
});

// This function should only allow for patch & delete routes to work if the owner token is correct.
async function requirePollOwner(request, response, next) {
    try {
        const pollId = Number(request.params.id)
        const givenToken = request.get("x-owner-token")

        if (!givenToken) {
            return response.status(401).send("An ownership token is required.")
        }

        const poll = await Polls.findByPk(pollId)

        if (!poll) {
            return response.status(404).json({
                message: "Poll not found."
            })
        }

        const givenTokenHash = hashOwnerToken(givenToken)

        if (givenTokenHash !== poll.ownerTokenHash) {
            return response.status(403).send("You are not the authorized to delete this poll.")
        }

        request.poll = poll
        next()
    } catch (error) {
        next(error)
    }
}

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

    if (!Array.isArray(options) || options.length < 2 || options.length > 5) {
        if (options.length < 2) {
            return response.status(400).send("A poll is required to have at least two options!");
        } else if (options.length > 5) {
            return response.status(400).send("A poll is required to have at no more than five options!");
        }
        console.log("validation failed!");
        return response.status(400).send("An error occured with options on this poll.");
    }

    const hasEmptyOption = options.some((option) => {
        return !option.title?.trim()
    })

    if (hasEmptyOption) {
        return response.status(400).send("Every option must have a title.")
    }

    console.log("validation passed!");
    next();
}
// Route for creating a new poll.
// Later create a validation middleware.
// This should also create new options without needing to make a seperate request for each option.
router.post("/polls", validatePollCreation, async (request, response, next) => {
    const {title, description, options} = request.body

    // This will get sent back to the browser that created the poll.
    const ownerToken = generateOwnerToken();
    const ownerTokenHash = hashOwnerToken(ownerToken);
    const newPoll = await Polls.create({
        title: title,
        description: description,
        ownerTokenHash: ownerTokenHash,
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

        const cleanPoll = newPoll.toJSON()
        delete cleanPoll.ownerTokenHash  // Delete the stored hash never send it to frontend.

        return response.status(201).json({...cleanPoll, ownerToken});
    } catch (error) {
        await newPoll.destroy() // Destroy the new poll if any error happens during its creation.
        next(error);
    }
});

// Route for updating a poll by its Id.
router.patch("/polls/:id", requirePollOwner, validatePollCreation, async (request, response, next) => {
    try {
        const id = Number(request.params.id);
        const { title, description } = request.body
        const foundPoll = await Polls.findByPk(id)
        const updates = {}

        if (title !== undefined) {
            updates.title = title
        }

        if (description !== undefined) {
            updates.title = description
        }

        if (!foundPoll) {
            return response.status(404).send("Failed to find Poll with id:", id);
        }
        
        const updatedPoll = await request.poll.update(updates)
        const cleanPoll = updatedPoll.toJSON()
        delete cleanPoll.ownerTokenHash

        return response.status(200).json(cleanPoll);
    } catch (error) {
        next(error);
    }
});

// Route for deleting a poll by its Id.
router.delete("/polls/:id", requirePollOwner,  async (request, response, next) => {
    try {
        const id = Number(request.params.id);
        const givenToken = request.get("x-owner-token")

        if (!givenToken) {
            return response.status(401).send("An ownership token is required.")
        }

        const foundPoll = await Polls.findByPk(id)
        if (!foundPoll) {
            return response.status(404).send("Failed to find Poll with id:", id);
        }

        const givenTokenHash = hashOwnerToken(givenToken)
        if (givenTokenHash !== foundPoll.ownerTokenHash) {
            return response.status(403).send("You are not the authorized to delete this poll.")
        }

        await foundPoll.destroy()
        return response.sendStatus(204) // This is important it must be sendStatus or else the response will hang
    } catch (error) {
        next(error);
    }
});

module.exports = router