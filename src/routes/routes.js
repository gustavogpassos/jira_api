const express = require("express")
const jiraRouter = require("./jira.routes")

const router = express.Router()

router.use("/jira", jiraRouter)

module.exports = router
