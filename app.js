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

app.get("/check", async (request, response, next) => {
  try {
    return response.status(200).send("working");
  } catch (error) {
    next(error);
  }
});

app.get("/polls", async (request, response, next) => {
  try {
    const allPolls = await Polls.findAll();
    if (!allPolls) {
      return response.status(404).send("No polls were found.");
    }
    return response.status(200).json(allPolls);
  } catch (error) {
    next(error);
  }
});

app.post("/polls", async (request, response, next) => {
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

app.get("/polls/:id", async (request, response, next) => {
  try {
    const id = Number(request.params.id);
    const poll = await Polls.findByPk(id);
    if (!poll) {
      return response.status(404).send("Fail to find post with id: " + id);
    }
    return response.status(200).json(poll);
  } catch (error) {
    next(error);
  }
});

app.post("/polls/:id/vote", async (request, response, next) => {
  try {
    
    const newVote = await Votes.create(request.body);
    if (!newVote) {
      return response.status(404).send("Failed to add new Vote");
    }
    return response.status(201).json(newVote);
  } catch (error) {
    console.log(error);
  }
});

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
