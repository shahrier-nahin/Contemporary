const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(
  path.join(__dirname, "app.db")
);

// Better performance
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

console.log("SQLite database initialized.");

module.exports = db;