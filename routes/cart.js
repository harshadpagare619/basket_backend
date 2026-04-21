const express = require('express');
const router = express.Router();
const {Cart} = require('../models/cart');
const {Product} = require('../models/products');

router.get('/', async(req, res) => {
    try {
        const cartList = await Cart.find(req.query);

        return res.status(200).json(cartList);
    } catch (error) {
        return res.status(500).json({success: false, message: error.message});
    }
});

router.post('/add', async(req, res) => {
    try {
        const {productId, quantity, userId, guestId, size} = req.body;

        const product = await Product.findById(productId);
        if(!product) {
            return res.status(400).json({success: false, message: 'Product not found'});
        }

        const unitPrice = product.newPrice;
        const subTotal = unitPrice * quantity;

        const cartItem = new Cart({
            productTitle: product.name,
            image: product.image[0],
            unitPrice,
            quantity,
            subTotal,
            productId: product._id,
            size,
            userId: userId || null,
            guestId: guestId || null
        });

        const savedItem = await cartItem.save();
        return res.status(201).json(savedItem);
    } catch (err) {
        return res.status(500).json({success: false, message: err.message});
    }
});

router.put('/:id', async(req, res) => {
    try {
        const { quantity} = req.body;
        const cartItem = await Cart.findById(req.params.id);

        if(!cartItem){
            return res.status(404).json({success: false, message: 'Cart item not found'});
        }

        const product = await Product.findById(cartItem.productId);
        const unitPrice = product.newPrice;
        const subTotal = unitPrice * quantity;

        cartItem.quantity = quantity;
        cartItem.unitPrice = unitPrice;
        cartItem.subTotal = subTotal;

        const updatedCart = await cartItem.save();
        return res.status(200).jsone(updatedCart);

    } catch (error) {
        return res.status(500).jsone({success: false, message: err.message});
    }
});


router.delete('/:id', async(req, res) => {
    try {
        const deletedItem = await Cart.findByIdAndDelete(req.params.id);
        if(!deletedItem) {
            return res.status(404).jsone({success: false, message: 'Cart Item not found'});
        }

        return res.status(200).json({success: true, message: 'Cart item deleted'});
    } catch (error) {
        return res.status(500).jsone({success: false, message: error.message});
    }
});


module.exports = router;