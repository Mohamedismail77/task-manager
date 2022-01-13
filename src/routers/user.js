const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = express.Router()
const multer = require('multer')
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {

        if(!file.originalname.match(/\.(jpg|png|jpeg)$/)){
            return cb(Error('Please upload an Image'))
        }         
        cb(undefined, true)
    }
})

router.post('/users/signup', async (req, res) => {
    const userBody = User(req.body)
    try {
        const user = await userBody.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(422).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (error) {
        res.status(401).send()
    }
})


router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter( (token) => token.token !== req.token )
        await req.user.save()

        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/users/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/users/me', auth ,async (req, res) => {
    res.send(req.user)
})


router.patch('/users/me', auth, async (req, res) => {
    
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every( (update)=> allowedUpdates.includes(update) )     

    if(!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates'})
    }

    try {

        const user = req.user
        updates.forEach( (update) => user[update] = req.body[update] )
        await user.save()
        res.send(user)
    } catch (error) {
        res.status(422).send(error)
    }


})

router.delete('/users/me', auth, async (req, res)=>{
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar') ,async (req, res) => {
    req.user.avatar = req.file.buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(422).send({error: error.message})
})

router.delete('/users/me/avatar', auth ,async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(422).send({error: error.message})
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw Error('No Image found')
        }

        res.set('Content-Type', 'image/*')
        res.send(user.avatar)

    } catch (error) {
        res.status(404).send(error)
    }
})


module.exports = router