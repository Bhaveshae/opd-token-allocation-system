const pool = require("../config/db");

class Slot {
  /**
   * Create a new slot
   */
  static async create(doctorId, startTime, endTime, capacity) {
    const query = `
      INSERT INTO slots (doctor_id, start_time, end_time, capacity)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    
    const result = await pool.query(query, [doctorId, startTime, endTime, capacity]);
    return result.rows[0];
  }

  /**
   * Find slot by ID
   */
  static async findById(id) {
    const query = `
      SELECT * FROM slots
      WHERE id = $1;
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Find all slots for a doctor (ordered by start time)
   */
  static async findByDoctorId(doctorId) {
    const query = `
      SELECT * FROM slots
      WHERE doctor_id = $1
      ORDER BY start_time;
    `;
    
    const result = await pool.query(query, [doctorId]);
    return result.rows;
  }

  /**
   * Find next available slot after a given start time
   */
  static async findNextSlot(doctorId, afterStartTime) {
    const query = `
      SELECT * FROM slots
      WHERE doctor_id = $1 AND start_time > $2
      ORDER BY start_time
      LIMIT 1;
    `;
    
    const result = await pool.query(query, [doctorId, afterStartTime]);
    return result.rows[0];
  }

  /**
   * Update slot usage
   */
  static async updateUsage(id, used) {
    const query = `
      UPDATE slots
      SET used = $2
      WHERE id = $1
      RETURNING *;
    `;
    
    const result = await pool.query(query, [id, used]);
    return result.rows[0];
  }

  /**
   * Increment slot usage
   */
  static async incrementUsage(id) {
    const query = `
      UPDATE slots
      SET used = used + 1
      WHERE id = $1
      RETURNING *;
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Decrement slot usage
   */
  static async decrementUsage(id) {
    const query = `
      UPDATE slots
      SET used = used - 1
      WHERE id = $1 AND used > 0
      RETURNING *;
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Get all slots with availability info
   */
  static async findAllWithAvailability(doctorId) {
    const query = `
      SELECT 
        s.*,
        s.capacity - s.used as available,
        CASE WHEN s.used < s.capacity THEN true ELSE false END as has_space
      FROM slots s
      WHERE s.doctor_id = $1
      ORDER BY s.start_time;
    `;
    
    const result = await pool.query(query, [doctorId]);
    return result.rows;
  }
}

module.exports = Slot;
