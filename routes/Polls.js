const express = require("express");
const router = express.Router()
const crypto = require("crypto")

const allModels = require("../models");
const Polls = allModels.Polls;
const Options = allModels.Options;
const Votes = allModels.Votes;

function generateOwnerToken() {
    return crypto.randomBytes(32).toString("hex");
}

function hashOwnerToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

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
            return response.status(404).send("Poll not found.")
        }

        const givenTokenHash = hashOwnerToken(givenToken)
        if (givenTokenHash !== poll.ownerTokenHash) {
            return response.status(403).send("You are not the authorized to modify this poll.")
        }

        request.poll = poll
        next()
    } catch (error) {
        next(error)
    }
}

// Route for getting all polls including the options with them.
router.get("/polls", async (request, response, next) => {
    try {
        const allPolls = await Polls.findAll({
            include: [{ model: Options, include: Votes },],
            attributes: { exclude: ["ownerTokenHash"], },  // IMPORTANT: Do not include ownerTokenHash in any get responses.
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
            attributes: { exclude: ["ownerTokenHash"], },  // IMPORTANT: Do not include ownerTokenHash in any get responses.
        });
        if (!poll) {
            return response.status(404).send("Failed to find poll with id: " + id);
        }
        return response.status(200).json(poll);
    } catch (error) {
        next(error);
    }
});

// This function should check if poll can be created before continuing.
// If there is no title and description return status 400 with a message.
// The logic changes based off of which request is happening whether its PATCH or POST
function validatePollCreation(request, response, next) {
    const { title, description, options } = request.body;

    if (request.method === "POST") {
        if (typeof(title) !== "string" || !title.trim() || typeof(description) !== "string" || !description.trim()) {
            return response.status(400).send("Title and description are required!");
        }

        if (!Array.isArray(options)) {
            return response.status(400).send("Options must be an array.");
        }

        if (options.length < 2 || options.length > 5) {
            if (options.length < 2) {
                return response.status(400).send("A poll is required to have at least two options!");
            } else if (options.length > 5) {
                return response.status(400).send("A poll is required to have at no more than five options!");
            }
            return response.status(400).send("An error occured with options on this poll.");
        }

        const hasEmptyOption = options.some((option) => {
            return (typeof(option?.title) !== "string" || !option.title.trim())
        })

        if (hasEmptyOption) {
            return response.status(400).send("Every option must have a title.")
        }
    } else if (request.method === "PATCH") {
        const updates = {}
        if (title !== undefined) {
            if (typeof (title) !== "string" || !title.trim()) {
                return response.status(400).send("Title cannot be empty")
            }
            updates.title = title.trim() // Will be sent to the patch route
        }

        if (description !== undefined) {
            if (typeof (description) !== "string" || !description.trim()) {
                return response.status(400).send("Description cannot be empty")
            }
            updates.description = description.trim() // Will be sent to the patch route
        }

        if (Object.keys(updates).length === 0) {
            return response.status(400).send("Provide a title or description to update.")
        }

        request.pollUpdates = updates
        return next()
    }

    console.log("validation passed!");
    next();
}

// Route for creating a new poll.
// Later create a validation middleware.
// This should also create new options without needing to make a seperate request for each option.
router.post("/polls", validatePollCreation, async (request, response, next) => {
    let newPoll
    try {
        const { title, description, options } = request.body
        // This will get sent back to the browser that created the poll.
        const ownerToken = generateOwnerToken();
        const ownerTokenHash = hashOwnerToken(ownerToken);

        newPoll = await Polls.create({
            title: title,
            description: description,
            ownerTokenHash: ownerTokenHash,
        });
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

        return response.status(201).json({ ...cleanPoll, ownerToken });
    } catch (error) {
        await newPoll.destroy() // Destroy the new poll if any error happens during its creation.
        next(error);
    }
});

// Route for updating a poll by its Id.
router.patch("/polls/:id", requirePollOwner, validatePollCreation, async (request, response, next) => {
    try {
        const id = Number(request.params.id);
        const updatedPoll = await request.poll.update(request.pollUpdates)

        const cleanPoll = updatedPoll.toJSON()
        delete cleanPoll.ownerTokenHash
        return response.status(200).json(cleanPoll);
    } catch (error) {
        next(error);
    }
});

// Route for deleting a poll by its Id.
router.delete("/polls/:id", requirePollOwner, async (request, response, next) => {
    try {
        await request.poll.destroy()
        return response.sendStatus(204) // This is important it must be sendStatus or else the response will hang
    } catch (error) {
        next(error);
    }
});

module.exports = router