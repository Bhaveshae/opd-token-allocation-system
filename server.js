require("dotenv").config();

const express = require("express");
const pool = require("./config/db");

const tokenRoutes = require("./routes/tokenRoutes");
const doctorRoutes = require("./routes/doctorRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: "ok", 
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: "error", 
      database: "disconnected",
      error: error.message 
    });
  }
});

// API Routes
app.use("/doctor", doctorRoutes);
app.use("/token", tokenRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "OPD Token Allocation System API",
    version: "1.0.0",
    endpoints: {
      doctors: {
        "POST /doctor": "Create doctor",
        "GET /doctor": "Get all doctors",
        "GET /doctor/:id": "Get doctor by ID",
        "POST /doctor/:id/slot": "Create slot for doctor",
        "GET /doctor/:id/slots": "Get all slots for doctor",
        "GET /doctor/:id/summary": "Get allocation summary"
      },
      tokens: {
        "POST /token/book": "Book normal token",
        "POST /token/emergency": "Book emergency token",
        "POST /token/cancel/:id": "Cancel token",
        "GET /token/:id": "Get token details",
        "GET /token/doctor/:doctorId": "Get all tokens for doctor",
        "GET /token/slot/:slotId": "Get all tokens for slot"
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: err.message 
  });
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("========================================");
  console.log("🏥 OPD Token Allocation System");
  console.log("========================================");
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log("========================================");
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing server...');
  await pool.end();
  process.exit(0);
});
