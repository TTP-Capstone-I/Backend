require("dotenv").config()
const morgan = require("morgan")
const express = require("express") 
const app = express()

const allModels = require("./models")
const dbConnection = require('./db')
const Polls = allModels.Polls
const Options = allModels.Options
const Votes = allModels.Votes

const PORT = process.env.PORT

app.use(express.json())
app.use(morgan('dev'))

async function startApp() {
    await dbConnection.sync()
    .then(() => {
        app.listen(PORT, () => {
            console.log("Server is running on port:", PORT)
        })
    })
    .catch((error) => {
        console.log(error)
    })
}

startApp()