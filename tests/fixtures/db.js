const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'testName',
    email: 'test@email.com',
    password: 'test123!!',
    tokens: [{
        token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET)
    }]
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    name: 'test2Name',
    email: 'test2@email.com',
    password: 'test123!!',
    tokens: [{
        token: jwt.sign({_id: userTwoId}, process.env.JWT_SECRET)
    }]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Task one Desc',
    status: false,
    owner: userOneId,
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Task two Desc',
    status: true,
    owner: userOneId,
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Task Three Desc',
    status: false,
    owner: userTwo._id,
}

const setupDatabase = async () => {
    await User.deleteMany()
    await Task.deleteMany()

    await User(userOne).save()
    await User(userTwo).save()

    await Task(taskOne).save()
    await Task(taskTwo).save()
    await Task(taskThree).save()
}

module.exports = {
    userOneId,
    userOne,
    userTwo,
    taskThree,
    setupDatabase
}
