const express = require("express");
const router = express.Router();

const Token = require("../models/Token");
const {
  allocateToken,
  insertEmergency,
  cancelToken,
  rebalance
} = require("../services/allocationService");

/**
 * POST /token/book
 * Book a normal token
 */
router.post("/book", async (req, res) => {
  try {
    const { patient, doctorId, type } = req.body;

    // Validation
    if (!patient || !doctorId || !type) {
      return res.status(400).json({ 
        error: "patient, doctorId, and type are required" 
      });
    }

    const validTypes = ['PRIORITY', 'FOLLOWUP', 'ONLINE', 'WALKIN'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: `type must be one of: ${validTypes.join(', ')}` 
      });
    }

    const token = await allocateToken({
      patient,
      doctorId,
      type
    });

    res.status(201).json({
      success: true,
      data: token,
      message: token.status === 'WAITING' 
        ? "Added to waiting list - all slots are full"
        : "Token confirmed"
    });

  } catch (error) {
    console.error("Error booking token:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /token/emergency
 * Book an emergency token (uses ripple algorithm)
 */
router.post("/emergency", async (req, res) => {
  try {
    const { patient, doctorId } = req.body;

    // Validation
    if (!patient || !doctorId) {
      return res.status(400).json({ 
        error: "patient and doctorId are required" 
      });
    }

    const token = await insertEmergency({
      patient,
      doctorId
    });

    res.status(201).json({
      success: true,
      data: token,
      message: "Emergency token inserted with ripple reallocation"
    });

  } catch (error) {
    console.error("Error inserting emergency:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /token/cancel/:id
 * Cancel a token
 */
router.post("/cancel/:id", async (req, res) => {
  try {
    const result = await cancelToken(req.params.id);

    if(result?.slotId){
      await rebalance(result.slotId);
    }
    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error("Error cancelling token:", error);
    res.status(500).json({ error: error.message });
  }
});


/**
 * GET /token/:id
 * Get token details
 */
router.get("/:id", async (req, res) => {
  try {
    const token = await Token.findById(req.params.id);

    if (!token) {
      return res.status(404).json({ error: "Token not found" });
    }

    res.json({
      success: true,
      data: token
    });

  } catch (error) {
    console.error("Error fetching token:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /token/doctor/:doctorId
 * Get all tokens for a doctor with details
 */
router.get("/doctor/:doctorId", async (req, res) => {
  try {
    const tokens = await Token.findByDoctorIdWithDetails(req.params.doctorId);

    res.json({
      success: true,
      data: tokens
    });

  } catch (error) {
    console.error("Error fetching tokens:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /token/slot/:slotId
 * Get all tokens for a specific slot
 */
router.get("/slot/:slotId", async (req, res) => {
  try {
    const tokens = await Token.findBySlotId(req.params.slotId);

    res.json({
      success: true,
      data: tokens
    });

  } catch (error) {
    console.error("Error fetching slot tokens:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
