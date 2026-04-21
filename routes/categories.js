const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const slugify = require("slugify");

// cloudinary configuration

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
});

const upload = multer({ storage: storage});

router.get('/', async (req, res) => {
    const categoryList = await Category.find();

    if(!categoryList) {
        return res.status(404).json({success: false})
    }

     res.send(categoryList);
});

router.get("/:id", async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res
      .status(404)
      .json({ message: "The category with the given ID was not found" });
  }

  return res.status(200).json(category);
});

router.post("/create", upload.array("images"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least 1 image",
      });
    }

    let imgUrls = [];

    for (let file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "products",
      });

      imgUrls.push(result.secure_url);
      fs.unlinkSync(file.path);
    }

    let category = new Category({
      name: req.body.name,
      images: imgUrls,
    });

    category = await category.save();

    res.status(201).send(category);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Image upload failed",
      error: error.message,
    });
  }
});

router.put("/:id", upload.array("images"), async (req, res) => {
  try {
    let retainedImages = req.body.existingImages || [];

    if (typeof retainedImages === "string") {
      retainedImages = [retainedImages];
    }

    let newImages = [];

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: "products" })
      );

      const results = await Promise.all(uploadPromises);

      newImages = results.map((item) => item.secure_url);

      req.files.forEach((file) => fs.unlinkSync(file.path));
    }

    const finalImages = [...retainedImages, ...newImages];

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        images: finalImages,
      },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        message: "Cannot update the category!",
        success: false,
      });
    }

    res.status(200).send(updatedCategory);
  } catch (error) {
    return res.status(500).json({
      message: "Cannot update the category!",
      success: false,
      error: error.message,
    });
  }
});


router.delete('/:id', async(req, res) => {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);

    if(!deletedCategory) {
        return res.status(404).json({message: "Category is not found", success: false})
    }

    res.status(200).json({message: "Category is deleted!", success: true})
});


module.exports = router;