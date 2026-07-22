const express = require("express");
const app = express();
const router = express.Router()

const allModels = require("../models");
const dbConnection = allModels.dbConnection
const Polls = allModels.Polls;
const Options = allModels.Options;
const Votes = allModels.Votes;
const Users = allModels.Users;

// Route for getting all users.
router.get("/users", async (request, response, next) => {
  try {
    const allUsers = await Users.findAll();
    if (!allUsers) {
      return response.status(404).send("No Users were found.");
    }
    return response.status(200).json(allUsers);
  } catch (error) {
    next(error);
  }
});

// Route for getting all an option by its Id
router.get("/users/:id", async (request, response, next) => {
  try {
    const id = Number(request.params.id);
    const foundUser = await Users.findByPk(id);
    if (!foundUser) {
      return response.status(404).send("No User was found.");
    }
    return response.status(200).json(foundUser);
  } catch (error) {
    next(error);
  }
});

// This function should check if option can be created before continuing.
// If there is no title or pollId return status 400 with a message.
// Otherwise continue.
function validateUserCreation(request, response, next) {
  const { name, email } = request.body;

  if (!name || !email) {
    console.log("validation failed!");
    return response.status(400).send("Name and Email are required!");
  }
  console.log("validation passed!");
  next();
}

// Route for creating a new User.
// Expects a pollId in the body.
// Later create a validation middleware.'
// Using localStorage on the frontend we can add to the users.
router.post("/users", validateUserCreation, async (request, response, next) => {
  try {
    const newUser = await Users.create(request.body);
    if (!newUser) {
      return response.status(404).send("Failed to add new User.");
    }
    return response.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

// Route for updating a user by its Id.
router.patch("/users/:id", validateUserCreation, async (request, response, next) => {
  try {
    const id = Number(request.params.id);
    const foundUser = await Users.findByPk(id)

    if (!foundUser) {
      return response.status(404).send("Failed to find User with id:", id);
    }

    const updatedUser = await foundUser.update(request.body);
    return response.status(201).json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// Route for deleting a user by its Id.
router.delete("/users/:id", async (request, response, next) => {
  try {
    const id = Number(request.params.id);
    const foundUser = await Users.findByPk(id);

    if (!foundUser) {
      return response.status(404).send("Failed to find User with id:", id);
    }

    await foundUser.destroy();
    return response.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

module.exports = router