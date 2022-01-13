const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, setupDatabase } = require('./fixtures/db')


beforeEach(setupDatabase)


test('Should signup a new user', async () => {
    const response = await request(app).post('/users/signup').send({
                name: 'ismail',
                email: 'ismail@test.com',
                password: 'MyPass777!'
            })
            .expect(201)
    
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    expect(response.body).toMatchObject({
        user: {
            name: 'ismail',
            email: 'ismail@test.com'
        },
        token: user.tokens[0].token
    })

    expect(user.password).not.toBe('MyPass777!')

})

test('Shouldn\'t signup an old user', async () => {
    await request(app)
            .post('/users/signup')
            .send({
                name: 'ismail',
                email: 'test@email.com',
                password: 'MyPass777!'
            })
            .expect(422)
})


test('Should login an old user', async () => {
    const response = await request(app)
            .post('/users/login')
            .send({
                email: userOne.email,
                password: userOne.password
            })
            .expect(200)
    
    const user = await User.findById(response.body.user._id)

    expect(response.body.token).toBe(user.tokens[1].token)
})

test('User Shouldn\'t login with wrong credentials', async () => {
    await request(app)
            .post('/users/login')
            .send({
                email: userOne.email,
                password: 'userOne.password'
            })
            .expect(401)
})

test('Should get profile for user', async () => {
    await request(app)
                .get('/users/me')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
                .expect(200)
})

test('UnAuthenticated users Should\'t get profile for user', async () => {
    await request(app)
                .get('/users/me')
                .send()
                .expect(401)
})

test('Should delete profile for user', async () => {
    await request(app)
                .delete('/users/me')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
                .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})


test('UnAuthenticated users Should\'t delete profile for user', async () => {
    await request(app)
                .delete('/users/me')
                .send()
                .expect(401)
})


test('Should upload avatar image', async () => {
    await request(app)
            .post('/users/me/avatar')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .attach('avatar', 'tests/fixtures/profile-pic.png')
            .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
    
})

test('Should update profile for user', async () => {
    await request(app)
                .patch('/users/me')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send({
                    name: 'Ali'
                })
                .expect(200)

    const user = await User.findById(userOneId)
    expect(user.name).toBe('Ali')
})

test('Shouldn\'t update profile for user with invalid input', async () => {
    await request(app)
                .patch('/users/me')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send({
                    name: ''
                })
                .expect(422)
})