const path = require('path');
const fs   = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DB_PATH     = process.env.DB_PATH;
const SCHEMA_PATH = path.join(__dirname, '../db/schema.sql');

let db = null;

async function initDb() {
  if (db) return db;
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }
  db.run('PRAGMA foreign_keys = ON;');
  db.run(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  saveToDisk();
  return db;
}

function saveToDisk() {
  if (!db) return;
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
  } catch (e) {
    console.error('DB save error:', e.message);
  }
}

setInterval(saveToDisk, 5000);
process.on('exit',    saveToDisk);
process.on('SIGINT',  () => { saveToDisk(); process.exit(0); });
process.on('SIGTERM', () => { saveToDisk(); process.exit(0); });

module.exports = { initDb, saveToDisk };
