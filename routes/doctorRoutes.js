const express = require("express");
const router = express.Router();

const Doctor = require("../models/Doctor");
const Slot = require("../models/Slot");
const { getAllocationSummary } = require("../services/allocationService");

/**
 * POST /doctor
 * Create a new doctor
 */
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Doctor name is required" });
    }

    const doctor = await Doctor.create(name);
    
    res.status(201).json({
      success: true,
      data: doctor
    });

  } catch (error) {
    console.error("Error creating doctor:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /doctor
 * Get all doctors
 */
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.findAll();
    
    res.json({
      success: true,
      data: doctors
    });

  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /doctor/:id
 * Get doctor by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.json({
      success: true,
      data: doctor
    });

  } catch (error) {
    console.error("Error fetching doctor:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /doctor/:id/slot
 * Create a time slot for a doctor
 */
router.post("/:id/slot", async (req, res) => {
  try {
    const { start, end, capacity } = req.body;
    const doctorId = req.params.id;

    if (!start || !end || !capacity) {
      return res.status(400).json({ 
        error: "start, end, and capacity are required" 
      });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const slot = await Slot.create(doctorId, start, end, capacity);
    
    res.status(201).json({
      success: true,
      data: slot
    });

  } catch (error) {
    console.error("Error creating slot:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /doctor/:id/slots
 * Get all slots for a doctor
 */
router.get("/:id/slots", async (req, res) => {
  try {
    const slots = await Slot.findAllWithAvailability(req.params.id);
    
    res.json({
      success: true,
      data: slots
    });

  } catch (error) {
    console.error("Error fetching slots:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /doctor/:id/summary
 * Get allocation summary for a doctor
 */
router.get("/:id/summary", async (req, res) => {
  try {
    const summary = await getAllocationSummary(req.params.id);
    
    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error("Error fetching summary:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
