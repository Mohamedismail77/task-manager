const express = require('express')
const auth = require('../middleware/auth')
const Task = require('../models/task')
const router = express.Router()


router.post('/tasks', auth, async (req, res) => {
    const task = Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        const savedTask = await task.save()
        res.send(savedTask)
    } catch (error) {
        res.status(422).send(error)
    }
})

router.get('/tasks', auth,async (req, res) => {
    const match = {}
    const sort = {}

    if(req.query.status) {
        match.status = req.query.status === 'true'
    }

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split('_')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        const user = await req.user.populate({
            path:'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort            
            }
        })
        const tasks = user.tasks
        res.send(tasks)
    } catch (error) {
        res.status(500).send(error)
    }

})



router.get('/tasks/:id', auth,async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOne({ _id, owner: req.user._id})

        if(!task){
            return res.status(404).send()
        }

        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.patch('/tasks/:id', auth, async(req,res) => {
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description','status','owner']
    const isValidUpdates = updates.every((update)=> allowedUpdates.includes(update))

    if(!isValidUpdates) {
        return res.status(400).send({error:'Invalid updates'})
    }

    try {
        var task = await Task.findOne({_id, owner:req.user._id})


        if(!task) {
            return res.status(404).send()
        }

        updates.forEach( (update) => task[update] = req.body[update])
        task = await task.save()

        res.send(task)
    } catch (error) {
        res.status(422).send(error)
    }
})

router.delete('/tasks/:id', auth, async (req, res)=>{
    const _id = req.params.id
    try {
        const task = await Task.findOneAndDelete({_id, owner:req.user._id})
        if(!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router