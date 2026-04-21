const {Moderator} = require('../models/mods');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/signup', async (req,res) => {
    const { name, email, password} = req.body;

    try {
        const existingModerator = await Moderator.findOne({email: email});

        if(existingModerator) {
            return res.status(400).json({msg: 'Moderator already exist'});
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const result = await Moderator.create({
            name: name,
            email: email,
            password: hashPassword,
            isAdmin: true
        });

        const token = jwt.sign({email: result.email, id:result._id}, process.env.JSON_WEB_TOKEN_SECRET_KEY);

        res.status(200).json({
            user: result,
            token: token
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({msg: "Something went wrong"});
    }
});

router.post('/signin', async(req,res) => {
    const {email, password} = req.body;

    try {
        const existingModerator = await Moderator.findOne({email});
        
        if(!existingModerator) {
            return res.status(404).json({msg: "Moderator not found"});
        }

        const matchPassword = await bcrypt.compare(password, existingModerator.password);

        if(!matchPassword) {
            return res.status(400).json({msg: "Invalid credentials"});
        }

        const token = jwt.sign(
            {
                email: existingModerator.email,
                id: existingModerator._id,
            },
            process.env.JSON_WEB_TOKEN_SECRET_KEY
        );

        res.status(200).json({
            user: existingModerator,
            token: token,
            msg: "User authenticated"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({msg: 'Something went wrong'});
        
    }
});

router.get('/', async(req, res) => {

    const moderatorList = await Moderator.find();

    if(!moderatorList) {
        res.status(500).json({success: false});
    }

    res.send(moderatorList);

});

router.get('/:id', async(req, res) => {
    const moderator = await Moderator.findById(req.params.id);

    if(!moderator) {
        res.status(500).json({msg: "The user with given Id was not found"});
    }

    res.status(200).send(moderator);
});

router.delete('/:id', async(req, res) => {

    try {

        const moderator = await Moderator.findByIdAndDelete(req.params.id);

        if(moderator) {
            return res.status(200).json({success: true, message: "The user is deleted"});
        } else {
            return res.status(404).json({success: false, message: "User not found"});
        }

    } catch (error) {
        return res.status(500).json({success: false, error: error});
    }
});

router.get('/get/count', async(req, res) => {
    try {
        const moderatorCount = await Moderator.countDocuments();
        res.status(200).send({moderatorCount});
    } catch (error) {
        res.status(500).json({success: false});
    }
})


router.put('/:id', async(req, res) => {
    const {password} = req.body

    const moderatorExist = await Moderator.findById(req.params.id);

    let newPassword
    if((!password || password.trim() === '')){
        newPassword = bcrypt.hashSync(req.body.password, 10);
    } else {
        newPassword = moderatorExist.password;
    }

    const moderator = await Moderator.findByIdAndUpdate(
        req.params.id,
        {
            password: newPassword,
        },
        {new: true}
    )

    if(!moderator) return  res.status(400).send("The user cannot be updated");

    res.send(moderator);
})

module.exports = router;