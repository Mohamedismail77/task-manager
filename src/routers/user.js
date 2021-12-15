const express = require('express')
const User = require('../models/user')
const router = express.Router()

router.post('/users', async (req, res) => {
    const user = User(req.body)
    try {
        const savedUser = await user.save()
        res.status(201).send(savedUser)
    } catch (e) {
        res.status(422).send(e)
    }
})

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch (error) {
        res.status(500).send(error)

    }
})

router.get('/users/:id', async (req,res) =>{
    const _id = req.params.id
    try {
        const user = await User.findById(_id)
        if(!user){
            return res.status(404).send()
        }
        res.send(user)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.patch('/users/:id', async (req, res) => {
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every( (update)=> allowedUpdates.includes(update) )     

    if(!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates'})
    }

    try {
        const user = await User.findByIdAndUpdate(_id, req.body, { new:true, runValidators:true })
        if(!user){
            return res.status(404).send()
        }
        res.send(user)
    } catch (error) {
        res.status(422).send(error)
    }


})

router.delete('/users/:id', async (req, res)=>{
    const _id = req.params.id
    try {
        const user = await User.findByIdAndDelete(_id)
        if(!user) {
            return res.status(404).send()
        }
        res.send(user)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router