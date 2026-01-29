require("dotenv").config();
const pool = require("../config/db");

async function setupDatabase() {
  const client = await pool.connect();

  try {
    console.log("Creating tables...");

    // Drop existing tables (for fresh setup)
    await client.query(`
      DROP TABLE IF EXISTS tokens CASCADE;
      DROP TABLE IF EXISTS slots CASCADE;
      DROP TABLE IF EXISTS doctors CASCADE;
      DROP TYPE IF EXISTS token_type CASCADE;
      DROP TYPE IF EXISTS token_status CASCADE;
    `);

    // Create ENUM types
    await client.query(`
      CREATE TYPE token_type AS ENUM ('EMERGENCY', 'PRIORITY', 'FOLLOWUP', 'ONLINE', 'WALKIN');
      CREATE TYPE token_status AS ENUM ('CONFIRMED', 'WAITING', 'CANCELLED');
    `);

    // Create doctors table
    await client.query(`
      CREATE TABLE doctors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create slots table
    await client.query(`
      CREATE TABLE slots (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
        start_time VARCHAR(10) NOT NULL,
        end_time VARCHAR(10) NOT NULL,
        capacity INTEGER NOT NULL,
        used INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT check_capacity CHECK (used >= 0 AND used <= capacity + 5)
      );
    `);

    // Create index on doctor_id and start_time for faster queries
    await client.query(`
      CREATE INDEX idx_slots_doctor_start ON slots(doctor_id, start_time);
    `);

    // Create tokens table
    await client.query(`
      CREATE TABLE tokens (
        id SERIAL PRIMARY KEY,
        patient VARCHAR(255) NOT NULL,
        doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
        slot_id INTEGER REFERENCES slots(id) ON DELETE SET NULL,
        type token_type NOT NULL,
        priority NUMERIC(10, 2) NOT NULL,
        status token_status DEFAULT 'CONFIRMED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for faster queries
    await client.query(`
      CREATE INDEX idx_tokens_slot ON tokens(slot_id);
      CREATE INDEX idx_tokens_doctor ON tokens(doctor_id);
      CREATE INDEX idx_tokens_status ON tokens(status);
      CREATE INDEX idx_tokens_priority ON tokens(priority DESC);
    `);

    console.log("✅ Database setup complete!");
    console.log("Tables created: doctors, slots, tokens");

  } catch (error) {
    console.error("❌ Database setup failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();
