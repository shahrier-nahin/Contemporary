const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(
  path.join(__dirname, "app.db")
);

db.pragma("journal_mode = WAL");

function addColumnIfMissing(table, column, definition) {
  const existing = db.prepare(`PRAGMA table_info(${table})`).all();
  const hasColumn = existing.some((col) => col.name === column);
  if (!hasColumn) {
    db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
    console.log(`Added column ${column} to ${table}`);
  }
}

db.prepare(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS daily_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usage_date TEXT,
    count INTEGER DEFAULT 0
)
`).run();

addColumnIfMissing("daily_usage", "app_type", "TEXT DEFAULT 'shared'");

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
addColumnIfMissing("card_history", "app_type", "TEXT");

db.prepare(`
  UPDATE card_history
  SET app_type = CASE
    WHEN COALESCE(rumor_title, '') <> '' OR COALESCE(fact_title, '') <> ''
      THEN 'fact-checker'
    ELSE 'generator'
  END
  WHERE app_type IS NULL OR app_type = ''
`).run();

console.log("SQLite database initialized.");

module.exports = db;