const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn("Environment file not found:", filePath);
    return;
  }

  const contents = fs.readFileSync(filePath, "utf8");
  const lines = contents.split(/\r?\n/);

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) return;

    let [, key, rawValue] = match;
    rawValue = rawValue.trim();

    if (
      (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
      (rawValue.startsWith("'") && rawValue.endsWith("'"))
    ) {
      rawValue = rawValue.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = rawValue;
    }
  });
}

const envFilePath = path.resolve(__dirname, ".env");
loadEnvFile(envFilePath);

const envResult = dotenv.config({
  path: envFilePath,
  override: true
});

if (envResult.error) {
  console.warn("Could not load .env file:", envResult.error.message);
} else {
  console.log("Loaded environment from:", envFilePath);
}

const FormData = require("form-data");
const multer = require("multer");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const db = require("./database/db");
const PORT = process.env.PORT || 3000;

const app = express();

const DAILY_LIMIT = 100;

app.set("trust proxy", 1);

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const upload = multer({
  storage: multer.memoryStorage()
});

// =============================
// GROQ API CONFIGURATION (Replaces OpenAI)
// =============================

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Helper function to call Groq API
async function callGroq(messages, temperature = 0.4) {
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama-3.3-70b-versatile", // or "llama3-70b-8192" or "gemma2-9b-it"
        messages: messages,
        temperature: temperature,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Groq API Error:", error.response?.data || error.message);
    throw new Error(`Groq API failed: ${error.message}`);
  }
}

// =============================
// LOGIN CREDENTIALS
// =============================

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

console.log("ADMIN_EMAIL:", ADMIN_EMAIL);
console.log("ADMIN_PASSWORD:", ADMIN_PASSWORD);
console.log("FACEBOOK_PAGE_ID:", process.env.FACEBOOK_PAGE_ID);
console.log("FACEBOOK_PAGE_ACCESS_TOKEN exists:", !!process.env.FACEBOOK_PAGE_ACCESS_TOKEN);
console.log("Loaded env keys:", Object.keys(process.env).filter(k => k.startsWith("FACEBOOK")));
console.log("GROQ_API_KEY exists:", !!process.env.GROQ_API_KEY);

// Test
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// =============================
// LOGIN
// =============================

app.post("/login", (req, res) => {
  const email = req.body?.email;
  const password = req.body?.password;

  if (!email || !password) {
    return res.status(400).json({
      error: "Missing email or password",
    });
  }

  if (
    email !== ADMIN_EMAIL ||
    password !== ADMIN_PASSWORD
  ) {
    return res.status(401).json({
      error: "Invalid email or password"
    });
  }

  const today = new Date().toISOString().split("T")[0];

  const usage = db.prepare(`
    SELECT count
    FROM daily_usage
    WHERE usage_date = ?
  `).get(today);

  const remaining = usage
    ? DAILY_LIMIT - usage.count
    : DAILY_LIMIT;

  return res.json({
    success: true,
    email,
    remaining
  });
});

// =============================
// REMAINING DAILY LIMIT
// =============================

app.get("/remaining", (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  const usage = db.prepare(`
    SELECT count
    FROM daily_usage
    WHERE usage_date = ?
  `).get(today);

  const remaining = usage
    ? DAILY_LIMIT - usage.count
    : DAILY_LIMIT;

  res.json({
    remaining
  });
});

// Image proxy (for html2canvas download)
app.get("/proxy-image", async (req, res) => {
  try {
    const imageUrl = req.query.url;

    if (!imageUrl) {
      return res.status(400).send("Image URL missing");
    }

    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    res.set(
      "Content-Type",
      response.headers["content-type"]
    );

    res.send(response.data);
  } catch(error) {
    console.log("Image proxy error:", error.message);
    res.status(500).send("Image failed");
  }
});

// ==========================================================
// SHARED: Scrape article + generate Bengali headline/summary
// Used by /generate-card for both the rumor panel and the
// fact panel — panel-agnostic, just takes a URL.
// ==========================================================
async function scrapeAndGenerate(articleUrl) {
  const cleanUrl = articleUrl.split("#")[0];
  const hostname = new URL(cleanUrl).hostname;

  const response = await axios.get(cleanUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    },
    timeout: 15000
  });

  const html = response.data;
  const $ = cheerio.load(html);

  // TITLE
  const title = $("h1").first().text().trim();

  // CONTENT
  const content = $("article p")
    .map((i, el) => $(el).text())
    .get()
    .join("\n\n");

  // IMAGE EXTRACTION
  let image =
    $('meta[property="og:image"]').attr("content") ||
    $('meta[name="twitter:image"]').attr("content") ||
    $("article img").first().attr("src") ||
    "";

  // Fix relative image URLs
  if (image && image.startsWith("/")) {
    const base = new URL(articleUrl).origin;
    image = base + image;
  }

  // DATE (card generation date)
  const date = new Date();
  console.log("CARD GENERATED AT:", date.toISOString());

  const banglaMonths = [
    "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
  ];

  const banglaDigits = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯"
  };

  function convertToBanglaNumber(number) {
    return String(number)
      .split("")
      .map(digit => banglaDigits[digit])
      .join("");
  }

  const day = convertToBanglaNumber(date.getDate());
  const month = banglaMonths[date.getMonth()];
  const year = convertToBanglaNumber(date.getFullYear());
  const formattedDate = `${day} ${month} ${year}`;

  console.log("FORMATTED DATE:", formattedDate);

  // SOURCE
  const source = new URL(articleUrl).hostname.replace("www.", "");

  console.log("TITLE:", title);
  console.log("IMAGE:", image);
  console.log("DATE:", date);

  // =============================
  // GROQ API CALL (Replaces OpenAI)
  // =============================
  
  const messages = [
    {
      role: "system",
      content: `
You are a senior Bengali newspaper editor.

Convert English sports news into professional Bengali newsroom content.

Rules:

Headline:
- Write a natural Bengali headline.
- Never translate word by word.
- Write like Prothom Alo or BBC Bangla.
- Keep it short and news-focused.
- Mention result, score, goalscorer or important event when available.

Summary:
- Write a 150-200 word Bengali summary of the article.
- Make it suitable for a news card.
- Keep it factual and easy to read.
- Write approximately 5-6 short lines.
- Do not add information that is not in the article.

Language:
- Use natural Bengali.
- Keep common international sports terms in Bengali transliteration.
  Examples:
  Champion → চ্যাম্পিয়ন
  Football → ফুটবল
  Match → ম্যাচ
  Goal → গোল
  Player → খেলোয়াড়
  Ranking → র‍্যাঙ্কিং

Before outputting any headline:
Ask internally:
"Is this a complete, natural Bengali newsroom sentence?"

If not, rewrite fully (do not patch).

Hashtags:
- Generate 6-7 relevant hashtags.
- Hashtags must be in English.
- Use only topic-related hashtags.
- Do not use Bengali hashtags.

Return ONLY valid JSON:

{
  "headline": "",
  "summary": "",
  "hashtags": []
}
`
    },
    {
      role: "user",
      content: `
English title:

${title}


Article:

${content.substring(0, 5000)}
`
    }
  ];

  const aiText = await callGroq(messages, 0.4);
  
  const aiData = JSON.parse(aiText);

  const banglaHeadline = aiData.headline;
  const summary = aiData.summary;
  const hashtags = aiData.hashtags;

  // FINAL IMAGE URL FOR REACT
  let finalImage = image;

  if (image) {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
    finalImage = `${backendUrl}/proxy-image?url=${encodeURIComponent(image)}`;
  }

  return {
    headline: banglaHeadline,
    summary,
    hashtags,
    image_url: finalImage,
    date: formattedDate,
    source
  };
}

// ==========================================================
// /generate-card
// Body: { articleUrl, panel }  — panel is "rumor" or "fact"
// Scrapes + runs AI, counts against the daily limit.
// Does NOT write to card_history — that happens on
// /save-card-history, once both panels are ready.
// ==========================================================
app.post("/generate-card", async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  // Check today's usage
  let usage = db.prepare(`
    SELECT *
    FROM daily_usage
    WHERE usage_date = ?
  `).get(today);

  // First generation today
  if (!usage) {
    db.prepare(`
    INSERT INTO daily_usage (usage_date, count)
    VALUES (?, ?)
    `).run(today, 0);

    usage = {
      usage_date: today,
      count: 0
    };
  }

  // Stop if daily limit reached
  if (usage.count >= DAILY_LIMIT) {
    return res.status(429).json({
      error: "Daily limit reached.",
      remaining: 0
    });
  }

  try {
    const { articleUrl, panel } = req.body;

    if (!articleUrl) {
      return res.status(400).json({
        error: "Article URL missing"
      });
    }

    if (!panel || !["rumor", "fact"].includes(panel)) {
      return res.status(400).json({
        error: "panel must be 'rumor' or 'fact'"
      });
    }

    const result = await scrapeAndGenerate(articleUrl);

    // Increase today's usage
    db.prepare(`
    UPDATE daily_usage
    SET count = count + 1
    WHERE usage_date = ?
    `).run(today);

    // Read updated count
    const updatedUsage = db.prepare(`
    SELECT count
    FROM daily_usage
    WHERE usage_date = ?
    `).get(today);

    const remaining = DAILY_LIMIT - updatedUsage.count;

    res.json({
      ...result,
      panel,
      remaining
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message
    });
  }
});

// ==========================================================
// /save-card-history
// Called once the user is happy with both panels — saves the
// full rumor+fact pair as a single history record.
// ==========================================================
app.post("/save-card-history", (req, res) => {
  try {
    const {
      headline,
      rumorTitle,
      rumorSummary,
      rumorArticleUrl,
      rumorImage,
      rumorVerdictType,
      rumorLabel,
      factTitle,
      factSummary,
      factArticleUrl,
      factImage,
      factLabel,
      source
    } = req.body;

    db.prepare(`
      INSERT INTO card_history (
        user_email, headline,
        rumor_title, rumor_summary, rumor_article_url, rumor_image_url, rumor_verdict_type, rumor_label,
        fact_title, fact_summary, fact_article_url, fact_image_url, fact_label,
        source, generated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      ADMIN_EMAIL,
      headline || "",
      rumorTitle || "",
      rumorSummary || "",
      rumorArticleUrl || "",
      rumorImage || "",
      rumorVerdictType || "",
      rumorLabel || "",
      factTitle || "",
      factSummary || "",
      factArticleUrl || "",
      factImage || "",
      factLabel || "",
      source || "",
      new Date().toISOString()
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message
    });
  }
});

app.post("/post-facebook", upload.single("image"), async (req, res) => {
  try {
    console.log("========== DEBUG ==========");
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    const summary = req.body?.summary || "";
    const hashtags = req.body?.hashtags || "";
    const image = req.file;

    console.log("========== FACEBOOK POST ==========");

    if (!image) {
      console.log("❌ No image received");
      return res.status(400).json({
        success: false,
        error: "No image received",
      });
    }

    console.log("Summary:", summary);
    console.log("Hashtags:", hashtags);
    console.log("Image Name:", image.originalname);
    console.log("Image Size:", image.size);
    console.log("Image Type:", image.mimetype);

    // ================================
    // 🚀 SEND TO FACEBOOK
    // ================================

    console.log("🚀 Posting to Facebook...");
    console.log("PAGE ID:", process.env.FACEBOOK_PAGE_ID);
    console.log("TOKEN EXISTS:", !!process.env.FACEBOOK_PAGE_ACCESS_TOKEN);

    const form = new FormData();

    form.append("source", image.buffer, {
      filename: image.originalname,
      contentType: image.mimetype,
    });

    form.append(
      "caption",
      `${summary}\n\n${hashtags}`
    );

    // ✅ Send the token as a form field
    form.append(
      "access_token",
      process.env.FACEBOOK_PAGE_ACCESS_TOKEN
    );

    const response = await axios.post(
      `https://graph.facebook.com/v23.0/${process.env.FACEBOOK_PAGE_ID}/photos`,
      form,
      {
        headers: form.getHeaders(),
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 30000,
      }
    );

    console.log("✅ Facebook Response:");
    console.log(response.data);

    return res.json({
      success: true,
      facebook: response.data,
    });
  } catch (error) {
    console.error("Facebook posting error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// =============================
// CARD HISTORY
// =============================

app.get("/card-history", (req, res) => {
  const rows = db.prepare(`
    SELECT *
    FROM card_history
    ORDER BY generated_at DESC
  `).all();

  res.json(rows);
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});