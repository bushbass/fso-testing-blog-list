const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const helper = require('./test_helper')
const bcryptjs = require('bcryptjs')
const User = require('../models/user')
const middleware = require('../utils/middleware')
const jwt = require('jsonwebtoken')

const mongoose = require('mongoose')
const supertest = require('supertest')
const Blog = require('../models/blog')
const app = require('../app')

const api = supertest(app)
const initialBlogs = [{
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0
},
{
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0
}]


describe('when there is initially some blogs saved', () => {
    beforeEach(async () => {

        await Blog.deleteMany({})
        let blogObject = new Blog(helper.initialBlogs[0])
        await blogObject.save()
        blogObject = new Blog(helper.initialBlogs[1])
        await blogObject.save()
    })
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })
    test('expect _id to be changed to id', async () => {
        await api
        const response = await api.get('/api/blogs')
        assert.ok(response.body[0].hasOwnProperty('id'), 'User object should have an "id" field');
    })
    test('expect there should be no _id field', async () => {
        await api
        const response = await api.get('/api/blogs')
        assert.ok(!response.body[0].hasOwnProperty('_id'), 'User object should not have an "_id" field');
    })
    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')
        assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })
    test('a specific blog is returned within the blogs', async () => {
        const response = await api.get('/api/blogs')
        const titles = response.body.map(e => e.title)
        assert(titles.includes('Go To Statement Considered Harmful'))
    })
    describe('when a new blog is added', () => {


        test('a valid blog can be added ', async () => {
            const newBlog = {
                title: "Canonical string reduction",
                author: "Edsger W. Dijkstra",
                url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
                likes: 12,
            }

            const loginResult = await api.post('/api/login')
                .send({ username: 'root', "password": 'sekret' })
            const token = await JSON.parse(loginResult.text).token

            await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

            const titles = blogsAtEnd.map(n => n.title)
            assert(titles.includes('Canonical string reduction'))
        })

        test('if likes is empty, adds 0 to likes', async () => {
            const newBlog = {
                title: "Canonical string reduction",
                author: "Edsger W. Dijkstra",
                url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
            }
            await api
            const loginResult = await api.post('/api/login')
                .send({ username: 'root', "password": 'sekret' })
            const token = await JSON.parse(loginResult.text).token


            const result = await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)

            assert.deepStrictEqual(result.body.likes, 0)
        })

        test('if title is empty, expect 400 response', async () => {
            const newBlog = {
                author: "Edsger W. Dijkstra",
                url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
                likes: 3
            }
            await api
            const loginResult = await api.post('/api/login')
                .send({ username: 'root', "password": 'sekret' })
            const token = await JSON.parse(loginResult.text).token

            const result = await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)
                .expect(400)
        })

        test('if url is empty, expect 400 response', async () => {
            const newBlog = {
                title: "Canonical string reduction",
                author: "Edsger W. Dijkstra",
                likes: 4
            }
            await api
            const loginResult = await api.post('/api/login')
                .send({ username: 'root', "password": 'sekret' })
            const token = await JSON.parse(loginResult.text).token

            const result = await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)
                .expect(400)
        })

        test('blog without title is not added', async () => {
            const newBlog = {
                author: "Edsger W. Dijkstra",
                url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
                likes: 12,
            }
            const loginResult = await api.post('/api/login')
                .send({ username: 'root', "password": 'sekret' })
            const token = await JSON.parse(loginResult.text).token

            await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)
                .expect(400)
            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)

        })
    })
    describe('when returning a specific blog', () => {
        test('a specific blog can be viewed', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToView = blogsAtStart[0]
            const resultBlog = await api
                .get(`/api/blogs/${blogToView.id}`)
                .expect(200)
                .expect('Content-Type', /application\/json/)
            assert.deepStrictEqual(resultBlog.body, blogToView)
        })
    })
    describe('when a blog is deleted', () => {
        test('a blog can be deleted', async () => {

            const loginResult = await api.post('/api/login')
                .send({ username: 'root', "password": 'sekret' })
            const token = await JSON.parse(loginResult.text).token
            const username = await JSON.parse(loginResult.text).username
            const decodedToken = jwt.verify(token, process.env.SECRET)
            const newBlog = {
                title: "Canonical string reduction",
                author: "Edsger W. Dijkstra",
                url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
                likes: 12,
                userId: decodedToken.id
            }
            await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)
            const blogsAtStart = await helper.blogsInDb()
            const blogToDelete = blogsAtStart[0]


            await api
                .delete(`/api/blogs/${blogsAtStart[2].id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(204)
            const blogsAtEnd = await helper.blogsInDb()
            const titles = blogsAtEnd.map(r => r.title)
            assert(!titles.includes(blogsAtStart[2].title))
            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
        })
    })

    describe('when there is initially one user in db', () => {
        beforeEach(async () => {
            await User.deleteMany({})

            const passwordHash = await bcryptjs.hash('sekret', 10)
            const user = new User({ username: 'root', passwordHash })

            await user.save()


        })

        test('creation succeeds with a fresh username', async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                username: 'mluukkai',
                name: 'Matti Luukkainen',
                password: 'salainen',
            }

            await api
                .post('/api/users')
                .send(newUser)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const usersAtEnd = await helper.usersInDb()
            assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

            const usernames = usersAtEnd.map(u => u.username)
            assert(usernames.includes(newUser.username))
        })


        test('creation fails with proper statuscode and message if username already taken', async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                username: 'root',
                name: 'Superuser',
                password: 'salainen',
            }

            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            const usersAtEnd = await helper.usersInDb()
            assert(result.body.error.includes('expected `username` to be unique'))

            assert.strictEqual(usersAtEnd.length, usersAtStart.length)
        })
    })
})

after(async () => {
    await mongoose.connection.close()
})