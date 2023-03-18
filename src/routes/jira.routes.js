const express = require("express")

const jiraRouter = express.Router()

jiraRouter.get("/", (req, res) => {
    return res.status(200).json({ message: "ok" })
})

module.exports = jiraRouter
