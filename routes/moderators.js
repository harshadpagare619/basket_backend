const express = require('express');
const router = express.Router();
const { Moderator } = require('../models/moderator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// SIGNUP ADMIN
router.post("/signup", async(req, res) => {
  const {name, email, password} = req.body;

  try {
    const existingModerator = await Moderator.findOne({ email });

    if(existingModerator) {
      return res.status(400).json({ msg: "Moderator already exists!" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const result = await Moderator.create({
      name,
      email,
      password: hashPassword,
      isAdmin: true,
    });

    const token = jwt.sign(
      {
        id: result._id,
        email: result.email,
        isAdmin: result.isAdmin,
        type: "ADMIN",
      },
      process.env.JSON_WEB_TOKEN_SECRET_KEY,
      { expiresIn: "1d"}
    );

    res.status(201).json({
      success: true,
      admin: result,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Something went wrong", error: error.message });
  }
});

// SIGNIN ADMIN

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingModerator = await Moderator.findOne({ email });

    if(!existingModerator) {
      return res.status(404).json({ msg: "Moderator not found!"});
    }

    const matchPassword = await bcrypt.compare(
      password,
      existingModerator.password
    );

    if(!matchPassword) {
      return res.status(400).json({ msg: "Invalid credentials "});
    }

    const token = jwt.sign(
      {
        id: existingModerator._id,
        email: existingModerator.email,
        isAdmin: existingModerator.isAdmin,
        type: "ADMIN",
      },
      process.env.JSON_WEB_TOKEN_SECRET_KEY,
      { expiresIn: "1d"}
    );

    res.status(200).json({
      success: true,
      admin: existingModerator,
      token,
      msg: "Admin authenticated",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Something went wrong", error:error.message });
  }
});

// GET COUNT  (must be above :id route)
router.get("/get/count", async (req, res) => {
  try {
    const moderatorCount = await Moderator.countDocuments();
    res.status(200).json({ moderatorCount });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// GET ALL MODERATORS
router.get("/", async (req, res) => {
  try {
    const moderatorList = await Moderator.find();

    if (!moderatorList) {
      return res.status(404).json({ success: false });
    }

    res.status(200).json(moderatorList);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// GET MODERATOR BY ID
router.get("/:id", async (req, res) => {
  try {
    const moderator = await Moderator.findById(req.params.id);

    if (!moderator) {
      return res.status(404).json({ msg: "Moderator not found!" });
    }

    res.status(200).json(moderator);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// DELETE MODERATOR
router.delete("/:id", async (req, res) => {
  try {
    const moderator = await Moderator.findByIdAndDelete(req.params.id);

    if (moderator) {
      return res.status(200).json({
        success: true,
        message: "The moderator is deleted!",
      });
    } else {
      return res.status(404).json({ success: false, message: "Not found" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE MODERATOR PASSWORD
router.put("/:id", async (req, res) => {
  try {
    const moderatorExist = await Moderator.findById(req.params.id);

    if (!moderatorExist) {
      return res.status(404).json({ msg: "Moderator not found" });
    }

    let newPassword = moderatorExist.password;

    if (req.body.password) {
      newPassword = bcrypt.hashSync(req.body.password, 10);
    }

    const moderator = await Moderator.findByIdAndUpdate(
      req.params.id,
      {
        password: newPassword,
      },
      { new: true }
    );

    res.status(200).json(moderator);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
});

module.exports = router;


