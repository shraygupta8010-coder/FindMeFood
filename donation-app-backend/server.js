const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const ngoRoutes = require('./routes/ngoRoutes');
const donationRoutes = require('./routes/donationRoutes');
const userRoutes = require('./routes/userRoutes');
const contactRoutes = require('./routes/contactRoutes');
const aadhaarRoutes = require('./routes/aadhaarRoutes');
const pool = require('./config/database'); // ADD THIS LINE

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ngo', ngoRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/user', userRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/aadhaar', aadhaarRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Donation App API is running!',
    timestamp: new Date().toISOString()
  });
});

// ✅ GOOGLE CLOUD TEST ROUTE ✅
app.get('/api/test-google-cloud', async (req, res) => {
  try {
    const { VertexAI } = require('@google-cloud/vertexai');
    
    // Initialize Vertex AI
    const vertexAI = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT,
      location: 'us-central1',
    });
    
    res.json({ 
      success: true, 
      message: '✅ Google Cloud Vertex AI connected successfully!',
      project: process.env.GOOGLE_CLOUD_PROJECT,
      vertexAI: 'Initialized successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Check your .env and JSON file location'
    });
  }
});

// 🔍 STEP 1: Database Schema Debug Route
app.get('/api/debug/tables', async (req, res) => {
  try {
    console.log('🔍 Checking database schema...');
    
    // Get all tables
    const tables = await pool.query(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    
    console.log('📊 Found tables:', tables.rows.map(t => t.name));
    
    const schema = {};
    
    // Get columns for each table
    for (let table of tables.rows) {
      const columns = await pool.query(`PRAGMA table_info(${table.name})`);
      schema[table.name] = columns.rows;
      console.log(`📋 Table ${table.name} columns:`, columns.rows.map(c => c.name));
    }
    
    res.json({
      success: true,
      message: 'Database schema retrieved',
      tables: tables.rows.map(t => t.name),
      schema: schema
    });
    
  } catch (error) {
    console.error('❌ Schema debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      schema: null
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Google Cloud test: http://localhost:${PORT}/api/test-google-cloud`);
  console.log(`👤 User profile routes: http://localhost:${PORT}/api/user/profile`);
  console.log(`📞 Contact support routes: http://localhost:${PORT}/api/contact`);
  console.log(`🆔 Aadhaar verification routes: http://localhost:${PORT}/api/aadhaar`);
  console.log(`🔍 Database debug: http://localhost:${PORT}/api/debug/tables`);
});