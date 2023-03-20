const express = require("express")
const jiraRouter = express.Router()
const controller = require("../services/jira/jira.controller")

jiraRouter.get("/", async (req, res) => {
    return await controller.getProject(req, res)
})

jiraRouter.get("/tasks/:id", async (req, res) => {
    return await controller.getTasks(req, res)
})

jiraRouter.get("/users", async (req, res) => {
    return await controller.getUser(req, res)
})

module.exports = jiraRouter
