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

exports.getUserTasks = async (req, res) => {
    const { id } = req.params
    const response = await api.get(`${baseUrl}/search?accountId=${id}`)
    const issues = await Promise.all(
        response.data.issues.map(async (issue) => {
            if (["10001"].indexOf(issue.fields.status.id) + 1) {
                const apiComments = await api.get(
                    `${baseUrl}/issue/${issue.key}/comment`
                )
                const taskComments = apiComments.data.comments.map(
                    (comment) => {
                        const newComment = {
                            author: comment.author.name,
                            body: comment.body,
                            created: comment.created,
                        }
                        return newComment
                    }
                )
                const { fields } = issue
                const newIssue = {
                    key: issue.key,
                    project: fields.project.name,
                    status: fields.status.name,
                    title: fields.summary,
                    comments: taskComments,
                }
                return newIssue
            }
        })
    )
    return res.status(response.status).json(issues)
}
