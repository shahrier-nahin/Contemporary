const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(
  path.join(__dirname, "app.db")
);

db.pragma("journal_mode = WAL");

// ==========================
// USERS
// ==========================

db.prepare(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
)
`).run();

// ==========================
// DAILY USAGE
// ==========================

db.prepare(`
CREATE TABLE IF NOT EXISTS daily_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usage_date TEXT UNIQUE,
    count INTEGER DEFAULT 0
)
`).run();

// ==========================
// CARD HISTORY
// ==========================
// Base table kept for backward compatibility with old single-article rows.
db.prepare(`
CREATE TABLE IF NOT EXISTS card_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT,
    headline TEXT,
    summary TEXT,
    hashtags TEXT,
    article_url TEXT,
    image_url TEXT,
    source TEXT,
    generated_at TEXT
)
`).run();

// Add the new rumor/fact columns to existing DBs without wiping data.
// ALTER TABLE ADD COLUMN throws if the column already exists, so guard each one.
function addColumnIfMissing(table, column, definition) {
  const existing = db.prepare(`PRAGMA table_info(${table})`).all();
  const hasColumn = existing.some((col) => col.name === column);
  if (!hasColumn) {
    db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
    console.log(`Added column ${column} to ${table}`);
  }
}

addColumnIfMissing("card_history", "rumor_title", "TEXT");
addColumnIfMissing("card_history", "rumor_summary", "TEXT");
addColumnIfMissing("card_history", "rumor_article_url", "TEXT");
addColumnIfMissing("card_history", "rumor_image_url", "TEXT");
addColumnIfMissing("card_history", "rumor_verdict_type", "TEXT");
addColumnIfMissing("card_history", "rumor_label", "TEXT");

addColumnIfMissing("card_history", "fact_title", "TEXT");
addColumnIfMissing("card_history", "fact_summary", "TEXT");
addColumnIfMissing("card_history", "fact_article_url", "TEXT");
addColumnIfMissing("card_history", "fact_image_url", "TEXT");
addColumnIfMissing("card_history", "fact_label", "TEXT");
addColumnIfMissing("card_history", "fact_verdict_type", "TEXT");

console.log("SQLite database initialized.");

module.exports = db;