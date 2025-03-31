import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
const { Pool } = pg;
import * as schema from '../shared/schema';

// Initialize PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create drizzle instance with our schema
export const db = drizzle(pool, { schema });

// Export connection details for migrations
export const connection = {
  pool,
  db
};

// Simple function to test if the database is connected
export async function checkConnection() {
  try {
    const client = await pool.connect();
    client.release();
    console.log('Database connection successful!');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}