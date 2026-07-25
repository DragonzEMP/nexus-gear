const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const PRODUCTS_FILE = path.join(__dirname, 'products.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');
const USERS_FILE = path.join(__dirname, 'users.json');

// Helper: Read JSON file safely
function readJSON(filePath, fallbackData = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallbackData, null, 2));
      return fallbackData;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallbackData;
  }
}

// Helper: Write JSON file safely
function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// ==========================================================================
// 1. PRODUCT ROUTES (FILE BACKED)
// ==========================================================================

// GET: Fetch products
app.get('/api/products', (req, res) => {
  const products = readJSON(PRODUCTS_FILE);
  res.json(products);
});

// POST: Add new product
app.post('/api/products', (req, res) => {
  const products = readJSON(PRODUCTS_FILE);
  const imagesArray = req.body.images && req.body.images.length > 0 
    ? req.body.images 
    : [req.body.image];

  const newProduct = {
    id: Date.now(),
    name: req.body.name,
    category: req.body.category,
    brand: req.body.brand || '',
    price: parseFloat(req.body.price),
    tag: req.body.tag || '',
    isNew: req.body.isNew === true,           // <--- Added boolean flag
    isFeatured: req.body.isFeatured === true, // <--- Added boolean flag
    image: imagesArray[0] || '',
    images: imagesArray,
    description: req.body.description || '',
    specifications: req.body.specifications || ''
  };

  products.push(newProduct);
  writeJSON(PRODUCTS_FILE, products);
  res.status(201).json({ success: true, product: newProduct });
});

// PUT: Edit existing product
app.put('/api/products/:id', (req, res) => {
  const products = readJSON(PRODUCTS_FILE);
  const productId = parseInt(req.params.id, 10);
  const index = products.findIndex(p => p.id === productId);

  if (index === -1) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  const imagesArray = req.body.images && req.body.images.length > 0 
    ? req.body.images 
    : [req.body.image];

  products[index] = {
    ...products[index],
    name: req.body.name,
    category: req.body.category,
    brand: req.body.brand || '',
    price: parseFloat(req.body.price),
    tag: req.body.tag || '',
    isNew: req.body.isNew === true,           // <--- Added boolean flag
    isFeatured: req.body.isFeatured === true, // <--- Added boolean flag
    image: imagesArray[0] || '',
    images: imagesArray,
    description: req.body.description || '',
    specifications: req.body.specifications || ''
  };

  writeJSON(PRODUCTS_FILE, products);
  res.json({ success: true, product: products[index] });
});

// DELETE: Remove product
app.delete('/api/products/:id', (req, res) => {
  let products = readJSON(PRODUCTS_FILE);
  const productId = parseInt(req.params.id, 10);
  products = products.filter(p => p.id !== productId);
  
  writeJSON(PRODUCTS_FILE, products);
  res.json({ success: true, message: 'Product deleted successfully' });
});

// ==========================================================================
// 2. ORDER ROUTES (FILE BACKED)
// ==========================================================================

// GET: Fetch orders
app.get('/api/orders', (req, res) => {
  const orders = readJSON(ORDERS_FILE);
  res.json(orders);
});

// GET: Fetch single order by ID or Phone for tracking
app.get('/api/orders/track', (req, res) => {
  const orders = readJSON(ORDERS_FILE);
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ success: false, message: "Please provide an Order ID or Phone number." });
  }

  const cleanQuery = query.toString().trim().replace('#', '');

  const results = orders.filter(o => 
    o.id.toString() === cleanQuery || 
    (o.phone && o.phone.trim() === cleanQuery)
  );

  if (results.length > 0) {
    res.json({ success: true, orders: results });
  } else {
    res.status(404).json({ success: false, message: "No orders found matching your search." });
  }
});

// GET: Fetch orders for a specific customer by phone number (ADD THIS ROUTE HERE)
app.get('/api/orders/user/:phone', (req, res) => {
  const orders = readJSON(ORDERS_FILE);
  const userPhone = req.params.phone.trim();

  const userOrders = orders.filter(o => o.phone && o.phone.trim() === userPhone);
  res.json({ success: true, orders: userOrders });
});

// POST: Create a new order (from Checkout page)
app.post('/api/orders', (req, res) => {
  const orders = readJSON(ORDERS_FILE);

  const newOrder = {
    id: Date.now(),
    customer: req.body.customer,
    phone: req.body.phone,
    address: req.body.address || '',
    items: req.body.items,
    total: parseFloat(req.body.total),
    status: "Pending",
    date: req.body.date || new Date().toISOString().split('T')[0]
  };

  orders.push(newOrder);
  writeJSON(ORDERS_FILE, orders);
  res.status(201).json({ success: true, order: newOrder });
});

// POST: Update order status (from Admin page)
app.post('/api/orders/:id/status', (req, res) => {
  const orders = readJSON(ORDERS_FILE);
  const orderId = parseInt(req.params.id, 10);
  const { status } = req.body;
  const order = orders.find(o => o.id === orderId);

  if (order) {
    order.status = status;
    writeJSON(ORDERS_FILE, orders);
    res.json({ success: true, order });
  } else {
    res.status(404).json({ success: false, message: "Order not found" });
  }
});

// ==========================================================================
// 3. USER AUTHENTICATION ROUTES (FILE BACKED)
// ==========================================================================

// POST: Register User
app.post('/api/register', (req, res) => {
  const users = readJSON(USERS_FILE);
  const { name, phone, address, pass } = req.body;

  const existingUser = users.find(u => u.phone === phone);
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'An account with this phone number already exists.' });
  }

  const newUser = {
    id: Date.now(),
    name,
    phone,
    address,
    pass
  };

  users.push(newUser);
  writeJSON(USERS_FILE, users);

  res.status(201).json({ success: true, user: { name: newUser.name, phone: newUser.phone, address: newUser.address } });
});

// POST: Login User
app.post('/api/login', (req, res) => {
  const users = readJSON(USERS_FILE);
  const { phone, pass } = req.body;

  const user = users.find(u => u.phone === phone && u.pass === pass);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid phone number or password.' });
  }

  res.json({ success: true, user: { name: user.name, phone: user.phone, address: user.address } });
});

// ==========================================================================
// 4. START SERVER
// ==========================================================================
app.listen(PORT, () => {
  console.log(`🚀 Server running live at http://localhost:${PORT}`);
});