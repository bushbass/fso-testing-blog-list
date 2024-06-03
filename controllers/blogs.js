const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)

})

blogsRouter.get('/:id', async (request, response, next) => {
    const blog = await Blog.findById(request.params.id)
    if (blog) {
        response.json(blog)
    } else {
        response.status(404).end()
    }

})

blogsRouter.post('/', async (request, response, next) => {
    const body = request.body
    console.log("request.body", body.userId)

    const user = await User.findById(body.userId)
    console.log(user)

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        user: body.userId,
        likes: body.likes || 0
    })


    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)

})

blogsRouter.delete('/:id', async (request, response, next) => {
    const blogToDelete = await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()

})

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

module.exports = blogsRouter