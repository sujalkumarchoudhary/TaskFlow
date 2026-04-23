require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const insightRoutes = require('./routes/insights');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Log environment on startup
console.log(`🌍 Environment : ${process.env.NODE_ENV || 'development'}`);
console.log(`🔗 CORS origin : ${process.env.CLIENT_URL || 'http://localhost:5173'}`);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/insights', insightRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// ⚠️ TEMPORARY — One-time setup endpoint to create first super_manager
// Self-disabling: only works when DB has 0 users. DELETE THIS after first use.
app.post('/api/setup', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const bcrypt   = require('bcryptjs');
    const User     = require('./models/User');
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Provide name, email, password in body' });
    const count = await User.countDocuments();
    if (count > 0)
      return res.status(403).json({ message: 'Setup already done. Endpoint disabled.' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, role: 'super_manager' });
    res.status(201).json({ message: '✅ Super Manager created!', email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/task_management';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
