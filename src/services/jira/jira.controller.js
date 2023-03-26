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

    const usersReponse = await api.get(`${baseUrl}/users/search`)

    const userStructure = await Promise.all(
        usersReponse.data.map(async (user) => {
            if (user.accountType == "atlassian") {
                const { accountId, accountType, emailAddress, displayName } =
                    user

                const responseTasks = await api.get(
                    `${baseUrl}/search?accountId=${accountId}`
                )
                let tasks = {
                    running: [],
                    done: [],
                }
                await Promise.all(
                    responseTasks.data.issues.map(async (issue) => {
                        const responseComments = await api.get(
                            `${baseUrl}/issue/${issue.key}/comment`
                        )

                        let comments = responseComments.data.comments.map(
                            (comment) => {
                                const dateParse = Date.parse(comment.created)
                                console.log(dateParse)
                                dateIni = Date.parse(dateIni)
                                dateEnd = Date.parse(dateEnd)
                                if (
                                    dateParse >= dateIni &&
                                    dateParse <= dateEnd
                                ) {
                                    return {
                                        description: comment.body,
                                        createdAt: comment.created,
                                        author: comment.author.displayName,
                                    }
                                }
                            }
                        )
                        comments = comments.filter((comment) => comment != null)
                        if (["10001"].indexOf(issue.fields.status.id) + 1) {
                            const { project, status, summary } = issue.fields
                            const newIssue = {
                                key: issue.key,
                                project: project.name,
                                status: status.name,
                                title: summary,
                                comments: comments,
                            }
                            //console.log(newIssue)
                            tasks.running.push(newIssue)
                        }
                        if (["10002"].indexOf(issue.fields.status.id) + 1) {
                            const { project, status, summary } = issue.fields
                            const newIssue = {
                                key: issue.key,
                                project: project.name,
                                status: status.name,
                                title: summary,
                                comments: comments,
                            }
                            console.log(newIssue)
                            tasks.done.push(newIssue)
                        }
                    })
                )
                //console.log(tasks)

                const newUser = {
                    accountId,
                    displayName,
                    accountType,
                    emailAddress,
                    tasks: tasks,
                }
                console.log(newUser)
                return newUser
            }
        })
    )
    const usersList = userStructure.filter((user) => user != null)
    return res.status(200).json(usersList)
}
