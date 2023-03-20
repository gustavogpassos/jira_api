const api = require("../../utils/api")
const { baseUrl } = api.defaults
exports.getProject = async (req, res) => {
    const response = await api.get(`${baseUrl}/project`)
    return res.status(response.status).json(response.data)
}

exports.getTasks = async (req, res) => {
    const { id } = req.params
    const response = await api.get(`${baseUrl}/issue/${id}`)
    return res.status(response.status).json(response.data)
}

exports.getUser = async (req, res) => {
    const response = await api.get(`${baseUrl}/users`)

    const users = response.data.map((user) => {
        if (user.active) {
            const { accountId, accountType, emailAddress, displayName } = user
            const newUser = {
                accountId,
                displayName,
                accountType,
                emailAddress,
            }
            return newUser
        }
    })
    return res.status(response.status).json(users)
}
