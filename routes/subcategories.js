const {Category} = require('../models/category');
const {SubCategory} = require('../models/subcategory');
const express = require('express');
const router = express.Router();

router.get('/', async(req, res) => {
    const subCategoryList = await SubCategory.find().populate('category');

    if(!subCategoryList) {
        res.status(500).json({success: false})
    }

    res.send(subCategoryList);
});

router.get('/slug/:slug', async(req, res) => {
    try {
        const subcategory = await SubCategory.findOne({slug: req.params.slug}).populate('category');
        if(!subcategory) return res.status(404).json({message: 'Subcategory not found'});
    } catch (error) {
        res.status(500).json({error: err.message});
    }
});

router.get('/:id', async(req, res) => {
    const subCategory = await SubCategory.findById(req.params.id);

    if(!subCategory) {
        res.status(404).json({message: 'The SubCategory with the given ID was not found!'})
    }

    return res.status(200).send(subCategory)
})

router.post('/create', async(req, res) => {
    const category = await Category.findById(req.body.category);

    if(!category) {
        return res.status(404).send("Invalid category")
    }

    let subCategory = new SubCategory({
        name: req.body.name,
        category: req.body.category
    })

    subCategory = await subCategory.save();

    if(!subCategory) {
        res.status(404).json({
            error: err,
            status: false
        })
    }

    res.status(201).json({subCategory});
})

router.delete('/:id', async(req, res) => {
    const subCategory = await SubCategory.findByIdAndDelete(req.params.id);

    if(!subCategory) {
        res.status(404).json({
            message: 'SubCategory not found!',
            success: false
        })
    }

    res.status(200).json({
        message: 'SubCategory is deleted!',
        success: true
    })
})

router.put('/:id', async(req, res) => {
    const subCategory = await SubCategory.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            category: req.body.category
        },
        {new: true}
    )

    if(!subCategory) {
        res.status(404).json({
            message: 'The subCategory cannot update!',
            status: false
        })
    }

    res.status(200).json({
        message: 'The SubCategory is updated!',
        success: true
    })
})

module.exports = router;
