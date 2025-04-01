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
    
    console.log('Creating weekly_challenge_progress table...');
    
    // Create the weekly_challenge_progress table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS weekly_challenge_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        selected_tier TEXT NOT NULL,
        start_date TIMESTAMP NOT NULL DEFAULT NOW(),
        completed_prompts TEXT[] DEFAULT '{}'
      )
    `);

    console.log('Creating weekly_badges table...');
    
    // Create the weekly_badges table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS weekly_badges (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        tier TEXT NOT NULL,
        week_number INTEGER NOT NULL,
        earned_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    console.log('Tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await pool.end();
    console.log('Database connection closed');
  }
}

main().catch(console.error);