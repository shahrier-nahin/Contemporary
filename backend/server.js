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

const DAILY_LIMIT = 50;

app.set("trust proxy", 1);

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const upload = multer({
  storage: multer.memoryStorage()
});

// =============================
// GROQ API CONFIGURATION
// =============================

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callGroq(messages, temperature = 0.4) {
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "openai/gpt-oss-120b",
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
// SHARED: Bangla date formatting
// ==========================================================
function formatBanglaDate() {
  const date = new Date();

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

  return `${day} ${month} ${year}`;
}

function proxiedImage(image) {
  if (!image) return "";
  const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
  return `${backendUrl}/proxy-image?url=${encodeURIComponent(image)}`;
}

// ==========================================================
// SHARED: Scrape a single article (no AI call here)
// ==========================================================
async function scrapeArticle(articleUrl) {
  const cleanUrl = articleUrl.split("#")[0];
  const response = await axios.get(cleanUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    timeout: 15000
  });

  const html = response.data;
  const $ = cheerio.load(html);

  const title =
    $("h1").first().text().trim() ||
    $('meta[property="og:title"]').attr("content") ||
    $("title").text().trim() ||
    "";

  let content = $("article p").map((i, el) => $(el).text()).get().join("\n\n");
  if (!content || content.trim().length < 50) {
    content = $("p").map((i, el) => $(el).text()).get().join("\n\n");
  }

  let image =
    $('meta[property="og:image"]').attr("content") ||
    $('meta[name="twitter:image"]').attr("content") ||
    $("article img").first().attr("src") ||
    "";

  if (image && image.startsWith("/")) {
    const base = new URL(cleanUrl).origin;
    image = base + image;
  }

  const source = new URL(cleanUrl).hostname.replace("www.", "");

  return { title, content, image, source };
}

// ==========================================================
// SHARED: Legacy single-article scrape + AI
// (Kept for backward compatibility with /generate-card.
//  Not used by the new combined flow.)
// ==========================================================
async function scrapeAndGenerate(articleUrl) {
  const data = await scrapeArticle(articleUrl);

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

${data.title}


Article:

${data.content.substring(0, 5000)}
`
    }
  ];

  const aiText = await callGroq(messages, 0.4);
  const aiData = JSON.parse(aiText);

  return {
    headline: aiData.headline,
    summary: aiData.summary,
    hashtags: aiData.hashtags,
    image_url: proxiedImage(data.image),
    date: formatBanglaDate(),
    source: data.source
  };
}


// ==========================================================
// Resolve a source: either scrape a URL, or use raw pasted text
// ==========================================================
async function resolveSource(url, text) {
  if (text && text.trim().length > 0) {
    return {
      title: "",
      content: text.trim(),
      image: "",
      source: ""
    };
  }

  if (url && url.trim().length > 0) {
    return await scrapeArticle(url.trim());
  }

  throw new Error("Provide either an article URL or article text");
}

// ==========================================================
// Build messages for the combined fact-check AI call
// ==========================================================
function buildFactCheckMessages(rumorData, factData) {
  return [
    {
      role: "system",
      content: `
You are a senior Bengali fact-check editor working for a professional newsroom.

Your task is to read and understand multiple English news articles about the same topic and produce an original Bengali fact-check report.

Do NOT translate the English articles sentence by sentence.

Instead:
1. Read every source carefully.
2. Understand the complete event.
3. Identify the central claim.
4. Compare the information across the sources.
5. Determine the most reliable facts based only on the provided articles.
6. Write a completely new Bengali report in a professional newsroom style.

Editorial Rules

Headline
- Write one natural Bengali headline.
- The headline must communicate the investigation's main finding or contradiction.
- Never use clickbait.
- Never translate the English headline.
- Write like a professional Bengali fact-check newsroom.
- Keep it concise (approximately 8-15 words).

Rumor Title
- Write a short title describing only the viral claim.
- Do NOT include the verdict.
- Keep it within 4-8 words.

Rumor Summary
- Explain what people are claiming.
- Do not evaluate the claim.
- Write approximately 30-50 words.
- Keep it factual and neutral.

Fact Title
- Write a short title describing the verified finding.
- It should directly answer or refute the claim.
- Keep it within 5-10 words.

Fact Summary
- Write a professional Bengali fact-check report.
- Length: 30-50 words.
- Explain:
  • what the claim is,
  • what the investigation found,
  • the supporting evidence,
  • the final conclusion.
- Write naturally.
- Do not repeat the same sentence structure.
- Use short paragraphs and readable newsroom language.
- Do not invent facts.
- If the provided sources do not support a claim, clearly state that sufficient evidence is unavailable.

Facebook Caption
- Write a Facebook-friendly caption.
- Length: approximately 50-60 words.
- Start with a strong opening that summarizes the investigation.
- Briefly explain the key finding.
- Encourage readers to view the fact-check without using sensational language.
- Do not simply copy the Fact Summary.

Language
- Use fluent, natural Bengali.
- Never produce machine-translated Bengali.
- Think in Bengali before writing.
- Use professional newsroom language.
- Keep common international terms in Bengali transliteration when appropriate.

Examples:
Facebook → ফেসবুক
YouTube → ইউটিউব
WhatsApp → হোয়াটসঅ্যাপ
AI → এআই
Video → ভিডিও
Photo → ছবি
Post → পোস্ট
Claim → দাবি
Fact Check → ফ্যাক্ট চেক
Screenshot → স্ক্রিনশট
Website → ওয়েবসাইট
Organization → সংস্থা
Official → অফিসিয়াল

Writing Rules
- Never hallucinate.
- Never add information that is not supported by the provided sources.
- Never speculate.
- Never include your reasoning.
- Never mention that you compared articles.
- Produce original Bengali writing instead of translation.

Before generating the response, internally verify:
- Does the headline accurately represent the verified finding?
- Does the rumor section only describe the claim?
- Does the fact section clearly explain the investigation?
- Is every statement supported by the provided sources?
- Is the Bengali natural and suitable for publication?

Generate 6-7 relevant hashtags.
- Hashtags must be in English.
- Use topic-related hashtags only.
- Do not use Bengali hashtags.

Return ONLY valid JSON.
{
  "headline": "",
  "rumorTitle": "",
  "rumorSummary": "",
  "factTitle": "",
  "factSummary": "",
  "facebookCaption": "",
  "hashtags": []
}
`
    },
    {
      role: "user",
      content: `
SOURCE 1 — Rumor/Claim article:

Title: ${rumorData.title}

Content:
${rumorData.content.substring(0, 4000)}


SOURCE 2 — Fact-check/Verified article:

Title: ${factData.title}

Content:
${factData.content.substring(0, 4000)}
`
    }
  ];
}

// ==========================================================
// /generate-factcheck
// Body: { rumorArticleUrl, factArticleUrl }
// Scrapes BOTH articles, runs ONE combined AI call, returns
// everything needed for both panels + the shared headline.
// ==========================================================
app.post("/generate-factcheck", async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  let usage = db.prepare(`
    SELECT * FROM daily_usage WHERE usage_date = ?
  `).get(today);

  if (!usage) {
    db.prepare(`
      INSERT INTO daily_usage (usage_date, count) VALUES (?, ?)
    `).run(today, 0);
    usage = { usage_date: today, count: 0 };
  }

  if (usage.count >= DAILY_LIMIT) {
    return res.status(429).json({
      error: "Daily limit reached.",
      remaining: 0
    });
  }

  try {
    const {
      rumorArticleUrl,
      rumorArticleText,
      factArticleUrl,
      factArticleText
    } = req.body;

    const hasRumorSource = (rumorArticleUrl && rumorArticleUrl.trim()) || (rumorArticleText && rumorArticleText.trim());
    const hasFactSource = (factArticleUrl && factArticleUrl.trim()) || (factArticleText && factArticleText.trim());

    if (!hasRumorSource || !hasFactSource) {
      return res.status(400).json({
        error: "Provide either a URL or pasted text for both the rumor and fact sides"
      });
    }

    const [rumorData, factData] = await Promise.all([
      resolveSource(rumorArticleUrl, rumorArticleText),
      resolveSource(factArticleUrl, factArticleText)
    ]);

    const messages = buildFactCheckMessages(rumorData, factData);
    const aiText = await callGroq(messages, 0.4);
    const aiData = JSON.parse(aiText);

    db.prepare(`
      UPDATE daily_usage SET count = count + 1 WHERE usage_date = ?
    `).run(today);

    const updatedUsage = db.prepare(`
      SELECT count FROM daily_usage WHERE usage_date = ?
    `).get(today);

    const remaining = DAILY_LIMIT - updatedUsage.count;

    res.json({
      headline: aiData.headline,
      rumorTitle: aiData.rumorTitle,
      rumorSummary: aiData.rumorSummary,
      factTitle: aiData.factTitle,
      factSummary: aiData.factSummary,
      facebookCaption: aiData.facebookCaption,
      hashtags: aiData.hashtags,
      rumorImage: proxiedImage(rumorData.image),
      factImage: proxiedImage(factData.image),
      date: formatBanglaDate(),
      source: factData.source || rumorData.source || "",
      remaining
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================================
// /generate-card  (LEGACY — single article, single panel)
// Body: { articleUrl, panel }  — panel is "rumor" or "fact"
// Kept for backward compatibility. Not used by the new
// single-button combined flow.
// ==========================================================
app.post("/generate-card", async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  let usage = db.prepare(`
    SELECT *
    FROM daily_usage
    WHERE usage_date = ?
  `).get(today);

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



    const result = await scrapeAndGenerate(articleUrl);

    db.prepare(`
    UPDATE daily_usage
    SET count = count + 1
    WHERE usage_date = ?
    `).run(today);

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
// Inserts a new row on first save (no id), then updates that
// same row on every subsequent generate for the current card.
// ==========================================================
app.post("/save-card-history", (req, res) => {
  try {
    const {
      id,
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
      source,
      summary,
      hashtags,
      articleUrl,
      imageUrl,
      appType
    } = req.body;

    if (!["fact-checker", "generator"].includes(appType)) {
      return res.status(400).json({ error: "Invalid app type" });
    }

    if (id) {
      db.prepare(`
        UPDATE card_history SET
          headline = ?,
          rumor_title = ?, rumor_summary = ?, rumor_article_url = ?, rumor_image_url = ?,
          rumor_verdict_type = ?, rumor_label = ?,
          fact_title = ?, fact_summary = ?, fact_article_url = ?, fact_image_url = ?, fact_label = ?,
          source = ?, summary = ?, hashtags = ?, article_url = ?, image_url = ?, app_type = ?
        WHERE id = ?
      `).run(
        headline || "",
        rumorTitle || "", rumorSummary || "", rumorArticleUrl || "", rumorImage || "",
        rumorVerdictType || "", rumorLabel || "",
        factTitle || "", factSummary || "", factArticleUrl || "", factImage || "", factLabel || "",
        source || "", summary || "", hashtags || "", articleUrl || "", imageUrl || "", appType,
        id
      );

      return res.json({ success: true, id });
    }

    const result = db.prepare(`
      INSERT INTO card_history (
        user_email, headline,
        rumor_title, rumor_summary, rumor_article_url, rumor_image_url, rumor_verdict_type, rumor_label,
        fact_title, fact_summary, fact_article_url, fact_image_url, fact_label,
        source, summary, hashtags, article_url, image_url, app_type, generated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      ADMIN_EMAIL,
      headline || "",
      rumorTitle || "", rumorSummary || "", rumorArticleUrl || "", rumorImage || "",
      rumorVerdictType || "", rumorLabel || "",
      factTitle || "", factSummary || "", factArticleUrl || "", factImage || "", factLabel || "",
      source || "", summary || "", hashtags || "", articleUrl || "", imageUrl || "", appType,
      new Date().toISOString()
    );

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
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
  const { appType } = req.query;

  if (!["fact-checker", "generator"].includes(appType)) {
    return res.status(400).json({ error: "Invalid app type" });
  }

  const rows = db.prepare(`
    SELECT *
    FROM card_history
    WHERE app_type = ?
    ORDER BY generated_at DESC
  `).all(appType);

  res.json(rows);
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
