const {Brand} = require('../models/brands');
const express = require('express');
const router = express.Router();

router.get('/', async(req,res) => {
    const brandList = await Brand.find();

    if(!brandList) {
        res.status(404).json({success: false})
    }

    res.send(brandList);
})

router.get('/:id', async(req, res) => {
    const brand = await Brand.findById(req.params.id);

    if(!brand) {
        res.status(404).json({message: "The Brand with the given ID was not found"})
    }

    return res.status(200).send(brand);
})

router.post('/create', async(req,res) => {
    let brand = new Brand({
        name: req.body.name
    })

    if(!brand){
        res.status(404).json({
            error: err,
            success: false
        })
    }

    brand = await brand.save();

    res.status(201).json(brand);
})

router.delete('/:id', async(req,res) => {
    const deleteBrand = await Brand.findByIdAndDelete(req.params.id);

    if(!deleteBrand){
        res.status(404).json({
            message:"Brand is not found",
            success: false
        })
    }

    res.status(200).json({
        message: "Brand is deleted!",
        success: true
    })
})

router.put('/:id', async(req,res) => {
    const brand = await Brand.findByIdAndUpdate(
        req.params.id,
        {
            name:req.body.name
        },
        {new:true}
    )

    if(!brand) {
        return res.status(404).json({
            message: "Brand cannot be updatd!",
            success: false
        })
    }

    res.send(brand)
})

module.exports = router;