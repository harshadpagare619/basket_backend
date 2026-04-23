const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');

const authJwt = require('./utils/jwtHelper');

// Middleware

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:4000",
    "https://basket-dashboard-nine.vercel.app",
    "https://basketwebapp.vercel.app/"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.options("*", cors());

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(bodyParser.json({ limit : "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));


// JWT Middleware 
app.use(authJwt());


// Routes 

const brandRoutes = require("./routes/brands");
const categoryRoutes = require("./routes/categories");
const productRoutes = require("./routes/products");
const userRoutes = require("./routes/users");
const orderRoutes = require("./routes/orders");
const moderatorRoutes = require("./routes/moderators");

// API Routes 

app.use("/api/brands", brandRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use('/api/moderators', moderatorRoutes);

app.use("/uploads", express.static("uploads"));

// Error handling for login failed

app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ msg: "Unauthorized user"});
  }

  return res.status(500).json({ msg: "Server error", error: err.message});
});


// Database 

mongoose
.connect(process.env.CONNECTION_STRING)
.then(() => {
  console.log("Database connection is ready...");

  app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
  });
})
.catch((err) => {
  console.log(err);
})