const pool = require("../config/db");
const Slot = require("../models/Slot");
const Token = require("../models/Token");
const { calculatePriority } = require("../utils/priority");

/**
 * Normal token allocation
 * Tries to find available slot, otherwise adds to waiting list
 */
exports.allocateToken = async (data) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get all slots for the doctor, ordered by start time
    const slots = await Slot.findByDoctorId(data.doctorId);

    if (slots.length === 0) {
      await client.query('ROLLBACK');
      throw new Error("No slots available for this doctor");
    }

    // Calculate priority
    const createdAt = new Date();
    const priority = calculatePriority(data.type, createdAt);

    // Try to find a slot with available capacity
    for (let slot of slots) {
      if (slot.used < slot.capacity) {
        // Create token with confirmed status
        const token = await Token.create({
          patient: data.patient,
          doctorId: data.doctorId,
          slotId: slot.id,
          type: data.type,
          priority: priority,
          status: 'CONFIRMED'
        });

        // Increment slot usage
        await Slot.incrementUsage(slot.id);

        await client.query('COMMIT');
        return token;
      }
    }

    // No available slots - add to waiting list
    const token = await Token.create({
      patient: data.patient,
      doctorId: data.doctorId,
      slotId: null,
      type: data.type,
      priority: priority,
      status: 'WAITING'
    });

    await client.query('COMMIT');
    return token;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Emergency token insertion with ripple effect
 * Inserts emergency token and cascades reallocation if needed
 */
exports.insertEmergency = async (data) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get all slots for the doctor
    const slots = await Slot.findByDoctorId(data.doctorId);

    if (slots.length === 0) {
      await client.query('ROLLBACK');
      throw new Error("No slots available for this doctor");
    }

    // Calculate emergency priority
    const createdAt = new Date();
    const priority = calculatePriority('EMERGENCY', createdAt);

    // Create emergency token
    const token = await Token.create({
      patient: data.patient,
      doctorId: data.doctorId,
      slotId: null,
      type: 'EMERGENCY',
      priority: priority,
      status: 'WAITING'
    });

    // Start ripple insertion from first slot
    await rippleInsert(slots[0], token, client);

    await client.query('COMMIT');
    return token;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Ripple insertion algorithm
 * Recursively reallocates tokens when slots are full
 */
async function rippleInsert(slot, token, client) {
  // Base case: no more slots available
  if (!slot) {
    // Token remains in waiting list
    await Token.update(token.id, {
      status: 'WAITING',
      slotId: null
    });
    return;
  }

  // Assign token to this slot
  await Token.update(token.id, {
    slotId: slot.id,
    status: 'CONFIRMED'
  });

  // Increment slot usage
  await Slot.incrementUsage(slot.id);

  // Refresh slot data
  const updatedSlot = await Slot.findById(slot.id);

  // Check if slot is now overcapacity
  if (updatedSlot.used > updatedSlot.capacity) {
    // Find lowest priority token in this slot (victim)
    const victim = await Token.findLowestPriorityInSlot(slot.id);

    if (!victim) {
      throw new Error("Slot overcapacity but no victim found");
    }

    // Kick out the victim
    await Token.update(victim.id, {
      status: 'WAITING',
      slotId: null
    });

    // Decrement slot usage
    await Slot.decrementUsage(slot.id);

    // Find next slot
    const nextSlot = await Slot.findNextSlot(
      slot.doctor_id,
      slot.start_time
    );

    // Recursively insert victim into next slot
    await rippleInsert(nextSlot, victim, client);
  }
}

/**
 * Cancel token and free up slot
 */
exports.cancelToken = async (tokenId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const token = await Token.findById(tokenId);

    if (!token) {
      throw new Error("Token not found");
    }

    if (token.status === 'CANCELLED') {
      throw new Error("Token already cancelled");
    }

    // If token was confirmed and had a slot, free up the slot
    if (token.status === 'CONFIRMED' && token.slot_id) {
      await Slot.decrementUsage(token.slot_id);

      // Try to promote a waiting token
      const waitingTokens = await Token.findWaitingByDoctorId(token.doctor_id);
      
      if (waitingTokens.length > 0) {
        const toPromote = waitingTokens[0]; // Highest priority waiting token
        
        await Token.update(toPromote.id, {
          slotId: token.slot_id,
          status: 'CONFIRMED'
        });

        await Slot.incrementUsage(token.slot_id);
      }
    }

    // Cancel the token
    await Token.cancel(tokenId);

    await client.query('COMMIT');
    return { message: "Token cancelled successfully" };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get allocation summary for a doctor
 */
exports.getAllocationSummary = async (doctorId) => {
  const slots = await Slot.findAllWithAvailability(doctorId);
  const stats = await Token.getStatsByDoctorId(doctorId);
  
  return {
    slots: slots,
    statistics: stats
  };
};
