require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/nexus-gear";
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully!'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ==========================================================================
// Mongoose Models
// ==========================================================================

const ProductSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: String,
  category: String,
  brand: String,
  price: Number,
  originalPrice: Number,
  tag: String,
  image: String,
  images: [String],
  description: String,
  specifications: String,
  isNewItem: Boolean,
  isFeatured: Boolean
});
const Product = mongoose.model('Product', ProductSchema);

const OrderSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  customer: String,
  phone: String,
  address: String,
  items: [Object],
  total: Number,
  status: String,
  date: String
});
const Order = mongoose.model('Order', OrderSchema);

const UserSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: String,
  phone: { type: String, unique: true },
  address: String,
  pass: String
});
const User = mongoose.model('User', UserSchema);

// ==========================================================================
// 1. PRODUCT ROUTES
// ==========================================================================

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ id: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const imagesArray = req.body.images && req.body.images.length > 0 
      ? req.body.images 
      : [req.body.image];

    const newProduct = new Product({
      id: Date.now(),
      name: req.body.name,
      category: req.body.category,
      brand: req.body.brand || '',
      price: parseFloat(req.body.price),
      tag: req.body.tag || '',
      isNewItem: req.body.isNewItem === true,
      isFeatured: req.body.isFeatured === true,
      image: imagesArray[0] || '',
      images: imagesArray,
      description: req.body.description || '',
      specifications: req.body.specifications || ''
    });

    await newProduct.save();
    res.status(201).json({ success: true, product: newProduct });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const imagesArray = req.body.images && req.body.images.length > 0 
      ? req.body.images 
      : [req.body.image];

    const updatedData = {
      name: req.body.name,
      category: req.body.category,
      brand: req.body.brand || '',
      price: parseFloat(req.body.price),
      tag: req.body.tag || '',
      isNewItem: req.body.isNewItem === true,
      isFeatured: req.body.isFeatured === true,
      image: imagesArray[0] || '',
      images: imagesArray,
      description: req.body.description || '',
      specifications: req.body.specifications || ''
    };

    const product = await Product.findOneAndUpdate({ id: productId }, updatedData, { new: true });
    
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    await Product.findOneAndDelete({ id: productId });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================================================
// 2. ORDER ROUTES
// ==========================================================================

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ id: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/orders/track', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: "Please provide an Order ID or Phone number." });

    const cleanQuery = query.toString().trim().replace('#', '');
    const isId = !isNaN(cleanQuery) && cleanQuery.length > 4;

    const orders = await Order.find({
      $or: [
        { id: isId ? parseInt(cleanQuery, 10) : -1 },
        { phone: cleanQuery }
      ]
    });

    if (orders.length > 0) {
      res.json({ success: true, orders });
    } else {
      res.status(404).json({ success: false, message: "No orders found matching your search." });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/orders/user/:phone', async (req, res) => {
  try {
    const userPhone = req.params.phone.trim();
    const orders = await Order.find({ phone: userPhone }).sort({ id: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const newOrder = new Order({
      id: Date.now(),
      customer: req.body.customer,
      phone: req.body.phone,
      address: req.body.address || '',
      items: req.body.items,
      total: parseFloat(req.body.total),
      status: "Pending",
      date: req.body.date || new Date().toISOString().split('T')[0]
    });

    await newOrder.save();
    res.status(201).json({ success: true, order: newOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/orders/:id/status', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { status } = req.body;
    
    const order = await Order.findOneAndUpdate(
      { id: orderId },
      { status },
      { new: true }
    );

    if (order) {
      res.json({ success: true, order });
    } else {
      res.status(404).json({ success: false, message: "Order not found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================================================
// 3. USER AUTHENTICATION ROUTES
// ==========================================================================

app.post('/api/register', async (req, res) => {
  try {
    const { name, phone, address, pass } = req.body;

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this phone number already exists.' });
    }

    const newUser = new User({
      id: Date.now(),
      name,
      phone,
      address,
      pass
    });

    await newUser.save();
    res.status(201).json({ success: true, user: { name: newUser.name, phone: newUser.phone, address: newUser.address } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { phone, pass } = req.body;

    const user = await User.findOne({ phone, pass });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid phone number or password.' });
    }

    res.json({ success: true, user: { name: user.name, phone: user.phone, address: user.address } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================================================
// 4. START SERVER
// ==========================================================================
app.listen(PORT, () => {
  console.log(`🚀 Server running live at http://localhost:${PORT}`);
});