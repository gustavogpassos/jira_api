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

exports.getAllUsers = async (req, res) => {
    const response = await api.get(`${baseUrl}/users/search`)

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

exports.getRunningTasks = async (req, res) => {
    let { dateIni, dateEnd } = req.body

    dateIni = Date.parse(dateIni)
    dateEnd = Date.parse(dateEnd)

    const usersReponse = await api.get(`${baseUrl}/users/search`)

    const userStructure = await Promise.all(
        usersReponse.data.map(async (user) => {
            if (user.accountType == "atlassian") {
                const { accountId, accountType, emailAddress, displayName } =
                    user

                const responseTasks = await api.get(
                    `${baseUrl}/search?jql=assignee=${accountId}`
                )

                let tasks = {
                    running: [],
                    done: [],
                }

                let doneTasks = await Promise.all(
                    responseTasks.data.issues.map(async (issue) => {
                        let statusDate = Date.parse(
                            issue.fields.statuscategorychangedate
                        )
                        if (
                            ["10014"].indexOf(issue.fields.status.id) + 1 &&
                            dateIni <= statusDate &&
                            statusDate <= dateEnd
                        ) {
                            const { project, status, summary } = issue.fields
                            const newIssue = {
                                key: issue.key,
                                statusDate:
                                    issue.fields.statuscategorychangedate,
                                project: project.name,
                                status: status.name,
                                statusId: status.id,
                                title: summary,
                                comments: [],
                            }
                            await api
                                .get(`${baseUrl}/issue/${issue.key}/comment`)
                                .then((comments) => {
                                    const issueComments =
                                        comments.data.comments.map(
                                            (comment) => {
                                                return {
                                                    description: comment.body,
                                                    createdAt: comment.created,
                                                    author: comment.author
                                                        .displayName,
                                                }
                                            }
                                        )

                                    newIssue.comments = issueComments
                                })
                            return newIssue
                        }
                    })
                )
                doneTasks = doneTasks.filter((task) => task != null)
                tasks.done = doneTasks

                let runningTasks = await Promise.all(
                    responseTasks.data.issues.map(async (issue) => {
                        if (["3"].indexOf(issue.fields.status.id) + 1) {
                            const { project, status, summary } = issue.fields
                            const newIssue = {
                                key: issue.key,
                                project: project.name,
                                status: status.name,
                                statusId: status.id,
                                title: summary,
                                comments: [],
                            }
                            await api
                                .get(`${baseUrl}/issue/${issue.key}/comment`)
                                .then((comments) => {
                                    const issueComments =
                                        comments.data.comments.map(
                                            (comment) => {
                                                return {
                                                    description: comment.body,
                                                    createdAt: comment.created,
                                                    author: comment.author
                                                        .displayName,
                                                }
                                            }
                                        )
                                    newIssue.comments = issueComments
                                })
                            return newIssue
                        }
                    })
                )
                runningTasks = runningTasks.filter((task) => task != null)
                tasks.running = runningTasks

                const newUser = {
                    accountId,
                    displayName,
                    accountType,
                    emailAddress,
                    tasks: tasks,
                }
                return newUser
            }
        })
    )
    const usersList = userStructure.filter((user) => user != null)
    return res.status(200).json(usersList)
}
