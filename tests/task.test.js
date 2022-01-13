const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const { userOneId, userOne, userTwo, taskThree, setupDatabase } = require('./fixtures/db')


beforeEach(setupDatabase)

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
                description: 'From my test'
            })
        .expect(200)
    
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.status).toEqual(false)
})


test('Should get task for given user', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    expect(response.body.length).toBe(2)
})

test('Shouldn\'t get task for other users', async () => {
    const response = await request(app)
        .get(`/tasks/${taskThree._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(404)
})