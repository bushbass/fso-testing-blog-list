const bcryptjs = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
    const users = await User
        .find({}).populate('blogs', { title: 1, author: 1 })

    response.json(users)
})

usersRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body
    if (!(username && password)) {
        return response.status(400).json({ error: "username and password are required" })
    }
    if (password.length < 4 || username.length < 4) {
        return response.status(400).json({ error: 'usernames and passwords must be greater than 3 characters' })
    }
    const saltRounds = 10
    const passwordHash = await bcryptjs.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash,
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
})

module.exports = usersRouter