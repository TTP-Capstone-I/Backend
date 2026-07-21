require("dotenv").config();
const morgan = require("morgan");
const express = require("express");
const app = express();

const allRoutes = require('./routes')
const allModels = require("./models");
const dbConnection = require("./db");

const pollsRouter = allRoutes.pollsRouter
const optionsRouter = allRoutes.optionsRouter
const votesRouter = allRoutes.votesRouter

const Polls = allModels.Polls;
const Options = allModels.Options;
const Votes = allModels.Votes;

const PORT = process.env.PORT;

app.use(express.json());
app.use(morgan("dev"));

// Make express use the routes we created.
app.use(pollsRouter)
app.use(optionsRouter)
app.use(votesRouter)

// Route for checking if the server works or not.
app.get("/check", async (request, response, next) => {
  try {
    return response.status(200).send("working");
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
