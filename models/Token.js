const pool = require("../config/db");

class Token {
  /**
   * Create a new token
   */
  static async create(data) {
    const { patient, doctorId, slotId, type, priority, status } = data;
    
    const query = `
      INSERT INTO tokens (patient, doctor_id, slot_id, type, priority, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    
    const result = await pool.query(query, [
      patient,
      doctorId,
      slotId || null,
      type,
      priority,
      status || 'CONFIRMED'
    ]);
    
    return result.rows[0];
  }

  /**
   * Find token by ID
   */
  static async findById(id) {
    const query = `
      SELECT * FROM tokens
      WHERE id = $1;
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Find all tokens for a slot, sorted by priority
   */
  static async findBySlotId(slotId, status = 'CONFIRMED') {
    const query = `
      SELECT * FROM tokens
      WHERE slot_id = $1 AND status = $2
      ORDER BY priority DESC;
    `;
    
    const result = await pool.query(query, [slotId, status]);
    return result.rows;
  }

  /**
   * Find lowest priority token in a slot (victim for reallocation)
   */
  static async findLowestPriorityInSlot(slotId) {
    const query = `
      SELECT * FROM tokens
      WHERE slot_id = $1 AND status = 'CONFIRMED'
      ORDER BY priority ASC
      LIMIT 1;
    `;
    
    const result = await pool.query(query, [slotId]);
    return result.rows[0];
  }

  /**
   * Find all waiting tokens for a doctor
   */
  static async findWaitingByDoctorId(doctorId) {
    const query = `
      SELECT * FROM tokens
      WHERE doctor_id = $1 AND status = 'WAITING'
      ORDER BY priority DESC;
    `;
    
    const result = await pool.query(query, [doctorId]);
    return result.rows;
  }

  /**
   * Update token
   */
  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.slotId !== undefined) {
      fields.push(`slot_id = $${paramCount++}`);
      values.push(data.slotId);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(data.status);
    }
    if (data.priority !== undefined) {
      fields.push(`priority = $${paramCount++}`);
      values.push(data.priority);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE tokens
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *;
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Cancel token
   */
  static async cancel(id) {
    const query = `
      UPDATE tokens
      SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Get all tokens for a doctor with slot details
   */
  static async findByDoctorIdWithDetails(doctorId) {
    const query = `
      SELECT 
        t.*,
        s.start_time,
        s.end_time,
        d.name as doctor_name
      FROM tokens t
      LEFT JOIN slots s ON t.slot_id = s.id
      LEFT JOIN doctors d ON t.doctor_id = d.id
      WHERE t.doctor_id = $1
      ORDER BY t.created_at DESC;
    `;
    
    const result = await pool.query(query, [doctorId]);
    return result.rows;
  }

  /**
   * Get token statistics for a doctor
   */
  static async getStatsByDoctorId(doctorId) {
    const query = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'CONFIRMED') as confirmed_count,
        COUNT(*) FILTER (WHERE status = 'WAITING') as waiting_count,
        COUNT(*) FILTER (WHERE status = 'CANCELLED') as cancelled_count,
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE type = 'EMERGENCY') as emergency_count,
        COUNT(*) FILTER (WHERE type = 'PRIORITY') as priority_count,
        COUNT(*) FILTER (WHERE type = 'FOLLOWUP') as followup_count,
        COUNT(*) FILTER (WHERE type = 'ONLINE') as online_count,
        COUNT(*) FILTER (WHERE type = 'WALKIN') as walkin_count
      FROM tokens
      WHERE doctor_id = $1;
    `;
    
    const result = await pool.query(query, [doctorId]);
    return result.rows[0];
  }
}

module.exports = Token;
