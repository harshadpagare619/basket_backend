const express = require('express');
const router = express.Router();
const {Order} = require('../models/orders');

router.get("/test", (req, res) => {
  res.json({ msg: "Orders route working", auth: req.auth });
});

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: err.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    if (!req.auth || !req.auth.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const order = new Order({
      user: req.auth.id,
      items: req.body.items,
      totalAmount: req.body.totalAmount,
      deliveryAddress: req.body.deliveryAddress,
      paymentInfo: req.body.paymentInfo,
      orderStatus: req.body.orderStatus || "pending",
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
});

router.get("/myOrders", async (req, res) => {
  try {
    if (!req.auth || !req.auth.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const orders = await Order.find({ user: req.auth.id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: err.message,
    });
  }
});



module.exports = router;