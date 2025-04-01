import pg from 'pg';

async function main() {
  console.log('Connecting to database...');
  
  // Create a connection to the database
  const { Pool } = pg;
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    console.log('Creating challenge_progress table...');
    
    // Create the challenge_progress table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS challenge_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        day_number INTEGER NOT NULL,
        completed_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    console.log('Table created successfully!');
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    await pool.end();
    console.log('Database connection closed');
  }
}

main().catch(console.error);