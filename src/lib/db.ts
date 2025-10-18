import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { initDb } from './initDb';

// Database connection
let db: Database | null = null;
let isInitialized = false;

export async function getDbConnection() {
  // Initialize DB from R2 on first connection (only runs once)
  if (!isInitialized) {
    console.log('[db.ts] Calling initDb() before first connection...');
    await initDb();
    isInitialized = true;
    console.log('[db.ts] initDb() completed successfully');
  }

  if (db) return db;
  
  const dbPath = path.join(process.cwd(), 'db', 'nfl_stats.db');
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  
  return db;
}