const express = require("express");
const app = express();
const router = express.Router()

const allModels = require("../models");
const dbConnection = allModels.dbConnection
const Polls = allModels.Polls;
const Options = allModels.Options;
const Votes = allModels.Votes;

// Route for getting all options on a poll.
router.get("/options", async (request, response, next) => {
    try {
        const include = request.query.include
        const where = include === 'true' ? {
            include: [{ model: Votes },]
        } : {}
        const allOptions = await Options.findAll(where);
        if (!allOptions) {
            return response.status(404).send("No Options were found.");
        }
        return response.status(200).json(allOptions);
    } catch (error) {
        next(error);
    }
});

// Route for getting all an option by its Id
router.get("/options/:id", async (request, response, next) => {
    try {
        const id = Number(request.params.id);
        const include = request.query.include
        const where = include === 'true' ? {
            include: [{ model: Votes },]
        } : {}
        const foundOption = await Options.findByPk(id, where);
        if (!foundOption) {
            return response.status(404).send("No Option was found.");
        }
        return response.status(200).json(foundOption);
    } catch (error) {
        next(error);
    }
});

// This function should check if option can be created before continuing.
// If there is no title or pollId return status 400 with a message.
// Otherwise continue.
function validateOptionCreation(request, response, next) {
    const { title, pollId } = request.body;

    if (!title || !pollId) {
        console.log("validation failed!");
        return response.status(400).send("Title and PollId are required!");
    }
    console.log("validation passed!");
    next();
}

// Route for creating a new option.
// Expects a pollId in the body.
// Later create a validation middleware.'
router.post("/options", validateOptionCreation, async (request, response, next) => {
    try {
        const newOption = await Options.create(request.body);
        if (!newOption) {
            return response.status(404).send("Failed to add new Option");
        }
        return response.status(201).json(newOption);
    } catch (error) {
        next(error);
    }
});

// Route for updating a option by its Id.
router.patch("/options/:id", validateOptionCreation, async (request, response, next) => {
    try {
        const id = Number(request.params.id);
        const foundOption = await Options.findByPk(id)

        if (!foundOption) {
            return response.status(404).send("Failed to find Option with id:", id);
        }

        const updatedOption = await foundOption.update(request.body);
        return response.status(201).json(updatedOption);
    } catch (error) {
        next(error);
    }
});

// Route for deleting a option by its Id.
router.delete("/options/:id", async (request, response, next) => {
    try {
        const id = Number(request.params.id);
        const foundOption = await Options.findByPk(id);

        if (!foundOption) {
            return response.status(404).send("Failed to find Option with id:", id);
        }

        await foundOption.destroy();
        return response.sendStatus(204);
    } catch (error) {
        next(error);
    }
});

module.exports = router