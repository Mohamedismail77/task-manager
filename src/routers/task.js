const express = require('express')
const Task = require('../models/task')
const router = express.Router()


router.post('/tasks', async (req, res) => {
    const task = Task(req.body)
    try {
        const savedTask = await task.save()
        res.send(savedTask)
    } catch (error) {
        res.status(422).send(error)
    }
})

router.get('/tasks', async (req, res) => {

    try {
        const tasks = await Task.find({})
        res.send(tasks)
    } catch (error) {
        res.status(500).send(error)
    }

})

router.get('/tasks/:id', async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findById(_id)
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.patch('/tasks/:id', async(req,res) => {
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description','status']
    const isValidUpdates = updates.every((update)=> allowedUpdates.includes(update))

    if(!isValidUpdates) {
        return res.status(400).send({error:'Invalid updates'})
    }

    try {
        const task = await Task.findById(_id)
        updates.forEach( (update) => task[update] = req.body[update])
        task = await task.save()

        if(!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (error) {
        res.status(422).send(error)
    }
})

router.delete('/tasks/:id', async (req, res)=>{
    const _id = req.params.id
    try {
        const task = await Task.findByIdAndDelete(_id)
        if(!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router