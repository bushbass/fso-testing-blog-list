const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })

    response.json(blogs)

})

blogsRouter.get('/:id', async (request, response, next) => {
    const blog = await Blog.findById(request.params.id)
    if (blog) {
        response.json(blog)
    } else {
        response.status(401).end()
    }

})


blogsRouter.post('/', async (request, response, next) => {
    const body = request.body
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    console.log({ decodedToken })

    if (!decodedToken.id) {
        return response.status(401).json({ error: 'token invalid' })
    }
    const user = await User.findById(decodedToken.id)

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes || 0,
        user: user._id
    })


    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)

})

// blogsRouter.delete('/:id', async (request, response, next) => {
//     const blogToDelete = await Blog.findByIdAndDelete(request.params.id)
//     response.status(204).end()

// })

blogsRouter.put('/:id', async (request, response, next) => {
    const body = request.body

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    }

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updatedBlog)
})

blogsRouter.delete('/:id', async (request, response, next) => {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    console.log({ decodedToken })

    if (!decodedToken.id) {
        return response.status(401).json({ error: 'token invalid' })
    }


    // req.params.id is the blog's id
    // so get the blog using req.params
    const blog = await Blog.findById(request.params.id)
    console.log({ blog })
    // this includes the authors userId
    // compare logged in userId with id from blog before proceeding
    if (blog.user.toString() === decodedToken.id.toString()) {
        console.log('blog user and token id match')
        const deletedBlog = await Blog.findByIdAndDelete(request.params.id)
        response.send(deletedBlog)
    }
    else {
        console.log('blog user and token id dont match')
        response.status(401).send({ message: "blog not owned by current user" })
    }
})

module.exports = blogsRouter