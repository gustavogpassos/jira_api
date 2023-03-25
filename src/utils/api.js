const axios = require("axios")

const apiAuth = `Basic ${Buffer.from(
    `${process.env.API_USER}:${process.env.API_TOKEN}`,
    "utf-8"
).toString("base64")}`

const api = axios.create({
    baseUrl: process.env.BASE_URL,
    headers: {
        Authorization: apiAuth,
    },
})

module.exports = api
