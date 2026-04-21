const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Signup Routes

router.post("/signup", async (req, res) => {
    try {
        const {name, email, password} = req.body;

        if(!name || !email || !password) {
            return res.status(400).json({msg : "All the fields are required!"});
        }

        const existingUser = await User.findOne({email});

        if (existingUser) {
            return res.status(400).json({msg: "User Already exist!"});
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name, 
            email,
            password: hashPassword,
            authProvider: "local",
        });

        const token = jwt.sign(
            {id: user._id, email: user.email},
            process.env.JSON_WEB_TOKEN_SECRET_KEY,
            {expiresIn: "7d"}
        );

        const userData = user.toObject();
        delete userData.password;

        res.status(201).json({
            user: userData,
            token,
            msg: "Signup successful",
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({msg: "Something went wrong"});
    }
});


// SignIn Routes

router.post("/signin", async (req, res) => {
    try {
        const {email, password} = req.body;

        if(!email || !password) {
            return res.status(400).json({msg: "Email and password are required!"});
        }

        const existingUser = await User.findOne({email});

        if(!existingUser) {
            return res.status(404).json({msg: "User not found !"});
        }

        if(existingUser.authProvider === "google") {
            return res.status(400).json({
                msg: "This email is registered using Google. Please login with Google."
            });
        }

        const matchPassword = await bcrypt.compare(password, existingUser.password);

        if(!matchPassword) {
            return res.status(400).json({msg: "Invalid credentials"});
        }

        const token = jwt.sign(
            {id: existingUser._id, email: existingUser.email},
            process.env.JSON_WEB_TOKEN_SECRET_KEY,
            {expiresIn: "7d"}
        );

        const userData = existingUser.toObject();
        delete userData.password;

        res.status(200).json({
            user: userData,
            token,
            msg: "User Authenticated",
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({msg: "Soemthing went wrong"});
    }
});

// Google Authentication 

router.post("/authWithGoogle", async (req, res) => {
    try {
        const {name, email, firebaseUid} = req.body;

        if(!name || !email) {
            return res.status(400).json({msg: "Name and email are required!"});
        }

        let user = await User.findOne({email});

        if(!user) {
            user = await User.create({
                name,
                email,
                password: null,
                authProvider: "google",
                firebaseUid: firebaseUid || null,
            });
        }

        const token = jwt.sign(
            {id: user._id, email: user.email},
            process.env.JSON_WEB_TOKEN_SECRET_KEY,
            {expiresIn: "7d"}
        );

        const userData = user.toObject();
        delete userData.password;

        return res.status(200).json({
            user: userData,
            token,
            msg: "Google login successful!",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({msg: "Something went wrong!"});
    }
});

// user count

router.get("/get/count", async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        res.status(200).json({userCount});

    } catch (error) {
        res.status(500).json({success: false, msg: "Failed to fetch user count"});
    }
});

// get all users

router.get("/", async (req,res) => {
    try {
        const userList = await User.find().select("-password");

        res.status(200).json(userList);
    } catch (error) {
        res.status(500).json({msg: "Failed to fetch users"});
    }
});

// getting user by id


router.get("/:id", async(req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if(!user) {
            return res.status(404).json({msg: "The user with the given ID was not found"});
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({msg : "Failed to fetch user"});
    }
});

// update the user

router.put("/:id", async(req, res) => {
    try {
        const {password} = req.body;

        const userExist = await User.findById(req.params.id);

        if(!userExist) {
            return res.status(404).json({msg: "User not found!"});
        }

        let newPassword = userExist.password;

        if(password) {
            newPassword = await bcrypt.hash(password, 10);
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {password: newPassword},
            {new: true}
        ).select("-password")

        res.status(200).json({user, msg: "User updated successfully!"});
    } catch (error) {
        res.status(500).json({msg: "The user cannot be updates"});
    }
});

router.delete("/:id", async(req, res) => {
    try {
        const user =  await User.findByIdAndDelete(req.params.id);

        if(user) {
            return res.status(200).json({success: true, message: "The user is deleted!"});
        } else {
            return res.status(404).json({success: false, message: "User not found!"});
        }
    } catch (error) {
        return res.status(500).json({success: false, error: error.message})
    }
});

module.exports = router;
