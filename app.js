require("dotenv").config();
const morgan = require("morgan");
const express = require("express");
const cors = require("cors")
// const cookieParser = require("cookie-parser")
const app = express();

const allRoutes = require('./routes')
const allModels = require("./models");
const dbConnection = require("./db");

const pollsRouter = allRoutes.pollsRouter
const optionsRouter = allRoutes.optionsRouter
const votesRouter = allRoutes.votesRouter
const usersRouter =  allRoutes.usersRouter

const Polls = allModels.Polls;
const Options = allModels.Options;
const Votes = allModels.Votes;
const Users = allModels.Users;

const PORT = process.env.PORT;

app.use(express.json());
app.use(morgan("dev"));
app.use(cors())
// app.use(cookieParser())

// Make express use the routes we created.
app.use(pollsRouter)
app.use(optionsRouter)
app.use(votesRouter)
// app.use(usersRouter)

// app.get("/cookie", async (request, response, next) => {
//   try {
//     // response.cookie('username', 'me')
//     // response.cookie('something', 'again')
//     return response.status(200).send("working");
//   } catch (error) {
//     next(error);
//   }
// });

// Route for checking if the server works or not.
app.get("/", async (request, response, next) => {
  try {
    return response.status(200).send("working");
  } catch (error) {
    next(error);
  }
});

function logErrors(error, request, response, next) {
  console.error(error)

  return response.status(500).json({
    message: "Something went wrong",
    error: error.message,
  })
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
