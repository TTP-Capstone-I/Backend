require("dotenv").config();
const morgan = require("morgan");
const express = require("express");
const app = express();

const allModels = require("./models");
const dbConnection = require("./db");
const Polls = allModels.Polls;
const Options = allModels.Options;
const Votes = allModels.Votes;

const PORT = process.env.PORT;

app.use(express.json());
app.use(morgan("dev"));

// Route for checking if the server works or not.
app.get("/check", async (request, response, next) => {
  try {
    return response.status(200).send("working");
  } catch (error) {
    next(error);
  }
});

// Route for getting all polls including the options with them.
app.get("/polls", async (request, response, next) => {
  try {
    // Uses query `?include=true` to also get all the polls with options & votes attached. 
    const include = request.query.include
    const where = include === 'true' ?  {
      include: [{model: Options, include: Votes},]
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
app.get("/polls/:id", async (request, response, next) => {
  try {
    const id = Number(request.params.id);
    const include = request.query.include
    const where = include === 'true' ?  {
      include: [{model: Options, include: Votes},]
    } : {}

    const poll = await Polls.findByPk(id, where);
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
    next()
}

// Route for creating a new poll.
// Later create a validation middleware.
app.post("/polls", validatePollCreation, async (request, response, next) => {
  try {
    const newPoll = await Polls.create(request.body);
    if (!newPoll) {
      return response.status(404).send("Failed to add new Poll");
    }
    return response.status(201).json(newPoll);
  } catch (error) {
    next(error);
  }
});

// Route for updating a poll by its Id.
app.patch("/polls/:id", validatePollCreation, async (request, response, next) => {
  try {
    const id = Number(request.params.id);
    const foundPoll = await Polls.findByPk(id)

    if (!foundPoll) {
      return response.status(404).send("Failed to find Poll with id:", id);
    }

    const updatedPoll = await foundPoll.update(request.body);
    return response.status(201).json(updatedPoll);
  } catch (error) {
    next(error);
  }
});

// Route for deleting a poll by its Id.
app.delete("/polls/:id", async (request, response, next) => {
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

// Route for getting all options on a poll.
app.get("/options", async (request, response, next) => {
  try {
    const include = request.query.include
    const where = include === 'true' ?  {
      include: [{model: Votes},]
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
app.get("/options/:id", async (request, response, next) => {
  try {
    const id = Number(request.params.id);
    const include = request.query.include
    const where = include === 'true' ?  {
      include: [{model: Votes},]
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
    next()
}

// Route for creating a new option.
// Expects a pollId in the body.
// Later create a validation middleware.'
app.post("/options", validateOptionCreation, async (request, response, next) => {
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
app.patch("/options/:id", validateOptionCreation, async (request, response, next) => {
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
app.delete("/options/:id", async (request, response, next) => {
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

// Route for getting all votes.
app.get("/votes", async (request, response, next) => {
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
app.get("/votes/:id", async (request, response, next) => {
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
function validateVote(request, response, next) {
    next()
}

// Route for posting a vote 
app.post("/votes", validateVote,  async (request, response, next) => {
  try {
    const newVote = await Votes.create(request.body);
    if (!newVote) {
      return response.status(404).send("Failed to add new Vote");
    }
    return response.status(201).json(newVote);
  } catch (error) {
    next(error);
  }
});

// Route for updating a vote
app.patch("/votes/:id", validateVote,  async (request, response, next) => {
  try {
    const id = Number(request.params.id);
    const foundVote = await Votes.findByPk(id);
    if (!foundVote) {
      return response.status(404).send("Failed to update Vote with id:" + id);
    }
    const updatedVote = await foundVote.update(request.body);
    return response.status(201).json(updatedVote);
  } catch (error) {
    next(error);
  }
});

// Route for deleting a vote
app.delete("/votes/:id", validateVote,  async (request, response, next) => {
  try {
    const id = Number(request.params.id);
    const foundVote = await Votes.findByPk(id);
    if (!foundVote) {
      return response.status(404).send("Failed to update Vote with id:" + id);
    }
    await foundVote.destroy();
    return response.sendStatus(204)
  } catch (error) {
    next(error);
  }
});

function logErrors(error, request, response, next) {
    console.error(error)
    next()
}
app.use(logErrors)

async function startApp() {
  await dbConnection
    .sync()
    .then(() => {
      app.listen(PORT, () => {
        console.log("Server is running on port:", PORT);
      });
    })
    .catch((error) => {
      console.log(error);
    });
}

startApp();
