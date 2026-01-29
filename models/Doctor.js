const pool = require("../config/db");

class Doctor {
  /**
   * Create a new doctor
   */
  static async create(name) {
    const query = `
      INSERT INTO doctors (name)
      VALUES ($1)
      RETURNING *;
    `;
    
    const result = await pool.query(query, [name]);
    return result.rows[0];
  }

  /**
   * Find doctor by ID
   */
  static async findById(id) {
    const query = `
      SELECT * FROM doctors
      WHERE id = $1;
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Get all doctors
   */
  static async findAll() {
    const query = `
      SELECT * FROM doctors
      ORDER BY name;
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Delete doctor
   */
  static async delete(id) {
    const query = `
      DELETE FROM doctors
      WHERE id = $1
      RETURNING *;
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Doctor;
