const express = require('express');
const {Brand} = require('../models/brands');
const {Category} = require('../models/category');
const {Product} = require('../models/products');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const {extractPublicId} = require('../utils/cloudinaryHelper');
const multer = require('multer');
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

const upload= multer({storage : storage});

router.post('/create', upload.array('images'), async(req, res) => {

    const brand = await Brand.findById(req.body.brand);
    if(! brand) return res.status(404).send('Invalid brand');

    const category = await Category.findById(req.body.category);
    if(!category) return res.status(404).send('Invalid category');

    const files = req.files;
    let imgurls= [];

    try {
        for (let file of files) {
            const localPath = file.path;

            const result = await cloudinary.uploader.upload(localPath, {
                folder: 'products',
            });

            imgurls.push(result.secure_url);
            fs.unlinkSync(localPath);
        }
    } catch (error) {
        console.log('Images upload error:', error);
        return res.status(400).json({
            message: 'Failed to upload images',
            error: error.message,
        });
    }

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        brand: req.body.brand,
        category: req.body.category,
        price: req.body.price,
        newPrice: req.body.newPrice,
        countInStock: req.body.countInStock,
        size: req.body.size,
        sizeUnit: req.body.sizeUnit,
        isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true,
        images: imgurls,
    });

    product = await product.save();

    if(!product) {
        return res.status(500).json({success: false, message: 'Cannot create product'});
    }

    res.status(201).json(product);
});

router.get('/', async (req, res) => {
    try {
        const { featured, category, maxPrice, limit} = req.query;

        let filter={};

        if(featured === 'true') {
            filter.isFeatured = true;
        }

        if(category) {
            filter.category = category;
        }

        if(maxPrice) {
            filter.newPrice = { $lte: Number(maxPrice)};
        }

        const productList = await Product.find(filter)
        .populate('category brand')
        .limit(Number(limit) || 0);

        res.json(productList);

    } catch (error) {
        res.status(500).json({message: 'Server error'});
    }
})


router.get('/', async (req, res) => {
    const productList = await Product.find().populate('category brand');

    if(!productList) {
        return res.status(500).json({ success: false});
    }

    res.send(productList);
});

router.get('/search', async (req, res) => {
    const query = req.query.q;

    if(!query || query.trim() === '') {
        return res.status(400).json({message: 'Search query is required'});
    }

    try {
        const results = await Product.find({
            name: { $regex: query, $options: 'i'}
        }).populate('brand category');

        res.json(results);
    } catch (error) {
        console.error('Search error :', error);
        res.status(500).json({message: 'Search failed', error: error.message});
    }
});

router.get('/:id', async(req, res) => {
    const product = await Product.findById(req.params.id)
    .populate('brand', 'name')
    .populate('category', 'name slug');

    if(!product) {
        return res.status(404).json({message: 'Product not found!'});
    }

    return res.status(200).send(product);
});

router.put('/:id', upload.array('images'), async(req,res) => {
    try {
        let retainedImages = req.body.existingImages || [];
        if(typeof retainedImages === 'string') {
            retainedImages = [retainedImages];
        }

        let newImages = [];

        if(req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file => cloudinary.uploader.upload(file.path, {folder: 'products'})
        );

        const results = await Promise.all(uploadPromises);
        newImages = results.map(i => i.secure_url);

        req.files.forEach(file => fs.unlinkSync(file.path));

        }

        const finalImages = [...retainedImages, ...newImages];

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                description: req.body.description,
                brand: req.body.brand,
                category: req.body.category,
                price: req.body.price,
                newPrice: req.body.newPrice,
                countInStock: req.body.countInStock,
                size: req.body.size,
                sizeUnit: req.body.sizeUnit,
                isFeatured: req.body.isFeatured === "true" || req.body.isFeatured === true,
                images: finalImages
            },
            {new: true}
        )

        if(!updatedProduct) {
            return res.status(404).json({
                message: 'Cannot update the product!',
                status: false
            });
        }

        res.status(200).json({
            message: 'Product is updated!',
            status: true,
            product: updatedProduct
        });

    } catch (error) {
        res.status(500).json({
            message: 'Cannot update the product!',
            status: false,
            error: error.message
        });
    }
});

router.delete('/:id', async(req,res) => {
    const deleteProduct = await Product.findByIdAndDelete(req.params.id);

    if(!deleteProduct) {
        return res.status(404).json({
            message: 'Product not found!',
            status: false
        })
    }

    res.status(200).send({
        message: 'The product is deleted!',
        status: true
    })
});

module.exports = router;