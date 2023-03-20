const axios = require("axios")

const apiAuth = `Basic ${Buffer.from(`${process.env.LOGIN_STRING}`).toString(
    "base64"
)}`

const api = axios.create({
    baseUrl: "https://emporio-leads.atlassian.net/rest/api/3",
    headers: {
        Authorization: `Basic ${process.env.B64_TOKEN}`,
    },
})

module.exports = api
