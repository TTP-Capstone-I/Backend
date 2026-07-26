const express = require("express");
const router = express.Router();

const allModels = require("../models");
const dbConnection = allModels.dbConnection;
const Polls = allModels.Polls;
const Options = allModels.Options;
const Votes = allModels.Votes;

function hashOwnerToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

// Route for getting all votes.
router.get("/votes", async (request, response, next) => {
    try {
        const allVotes = await Votes.findAll()
        if (!allVotes) {
            return response.status(404).send("No Votes were found.");
        }
        return response.status(200).json(allVotes);
    } catch (error) {
        next(error);
    }
});

// Route for getting all an option by its Id
router.get("/votes/:id", async (request, response, next) => {
    try {
        const id = Number(request.params.id);
        const foundVote = await Votes.findByPk(id);
        if (!foundVote) {
            return response.status(404).send("No Vote was found.");
        }
        return response.status(200).json(foundVote);
    } catch (error) {
        next(error);
    }
});

// This function should check if a vote can be added before continuing.
// If there is no name or optionId return status 400 with a message.
// Otherwise continue.
async function validateVote(request, response, next) {
    try {
        const optionId = Number(request.body.optionId);
        if (!Number.isInteger(optionId) || optionId <= 0) {
            console.log("validation failed!");
            return response.status(400).send("A valid optionId is required!");
        }

        const foundOption = await Options.findByPk(optionId)
        if (!foundOption) {
            return response.status(404).send(`Option with id ${optionId} was not found.`)
        }

        console.log("validation passed!");
        next();
    } catch(error) {
        next(error)
    }
}

// Route for posting a vote 
// Check to see if a vote exists in the votes table that matches the pollId and optionId
router.post("/votes", validateVote, async (request, response, next) => {
    try {
        const optionId = Number(request.body.optionId)
        const newVote = await Votes.create({
            optionId: optionId
        });
        if (!newVote) {
            return response.status(404).send("Failed to add new Vote");
        }
        return response.status(201).json(newVote);
    } catch (error) {
        next(error);
    }
});

// DISABLED FOR NOW

// // Route for updating a vote
// router.patch("/votes/:id", validateVote, async (request, response, next) => {
//     try {
//         const id = Number(request.params.id);
//         const foundVote = await Votes.findByPk(id);
//         if (!foundVote) {
//             return response.status(404).send("Failed to Update Vote with id:" + id);
//         }
//         const updatedVote = await foundVote.update(request.body);
//         return response.status(200).json(updatedVote);
//     } catch (error) {
//         next(error);
//     }
// });

// // Route for deleting a vote
// router.delete("/votes/:id", async (request, response, next) => {
//     try {
//         const id = Number(request.params.id);
//         const foundVote = await Votes.findByPk(id);
//         if (!foundVote) {
//             return response.status(404).send("Failed to Delete Vote with id:" + id);
//         }
//         await foundVote.destroy();
//         return response.sendStatus(204)
//     } catch (error) {
//         next(error);
//     }
// });

module.exports = router;
