const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT || 3000);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const LEADS_JSON_PATH = path.join(__dirname, "data", "leads.json");
const LEADS_CSV_PATH = path.join(__dirname, "data", "leads.csv");
const GOOGLE_SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL || "";
const ROOT = __dirname;

const kbPath = path.join(ROOT, "ai-cs", "knowledge-base.md");
const handoffPath = path.join(ROOT, "ai-cs", "handoff-rules.md");
const promptPath = path.join(ROOT, "ai-cs", "system-prompt.txt");

const knowledgeBase = fs.existsSync(kbPath) ? fs.readFileSync(kbPath, "utf8") : "";
const handoffRules = fs.existsSync(handoffPath) ? fs.readFileSync(handoffPath, "utf8") : "";
const systemPrompt = fs.existsSync(promptPath) ? fs.readFileSync(promptPath, "utf8") : "";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function ensureLeadFiles() {
  const dataDir = path.join(ROOT, "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(LEADS_JSON_PATH)) {
    fs.writeFileSync(LEADS_JSON_PATH, "[]", "utf8");
  }
  if (!fs.existsSync(LEADS_CSV_PATH)) {
    fs.writeFileSync(
      LEADS_CSV_PATH,
      "timestamp,name,package,city,source,notes\n",
      "utf8"
    );
  }
}

function safeJoin(root, targetPath) {
  const resolved = path.normalize(path.join(root, targetPath));
  if (!resolved.startsWith(root)) return null;
  return resolved;
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((item) => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string")
    .slice(-12);
}

function fallbackReply() {
  return {
    reply:
      "Saya tetap bisa bantu untuk fungsi produk, legalitas BPOM, cara pakai, dan paket harga. Jika ingin lanjut order, saya arahkan ke admin WhatsApp 6285216667297.",
    source: "fallback",
  };
}

function toCsvValue(value) {
  const stringValue = String(value ?? "");
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function extractLead(body) {
  if (!body || typeof body !== "object") return null;
  const candidate = body.lead;
  if (!candidate || typeof candidate !== "object") return null;

  return {
    timestamp: new Date().toISOString(),
    name: String(candidate.name || "").trim(),
    package: String(candidate.package || "").trim(),
    city: String(candidate.city || "").trim(),
    source: String(candidate.source || "ai-widget").trim(),
    notes: String(candidate.notes || "").trim(),
  };
}

async function saveLead(lead) {
  ensureLeadFiles();

  const currentJson = JSON.parse(fs.readFileSync(LEADS_JSON_PATH, "utf8"));
  currentJson.push(lead);
  fs.writeFileSync(LEADS_JSON_PATH, JSON.stringify(currentJson, null, 2), "utf8");

  const csvLine =
    [
      lead.timestamp,
      lead.name,
      lead.package,
      lead.city,
      lead.source,
      lead.notes,
    ]
      .map(toCsvValue)
      .join(",") + "\n";

  fs.appendFileSync(LEADS_CSV_PATH, csvLine, "utf8");

  if (GOOGLE_SHEETS_WEBHOOK_URL) {
    try {
      await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lead),
      });
    } catch (error) {
      console.error("Google Sheets webhook failed:", error instanceof Error ? error.message : error);
    }
  }
}

async function requestOpenAI(messages) {
  const inputText = [
    "System instructions:",
    systemPrompt,
    "",
    "Knowledge base:",
    knowledgeBase,
    "",
    "Handoff rules:",
    handoffRules,
    "",
    "Conversation:",
    ...messages.map((message) => `${message.role.toUpperCase()}: ${message.content}`),
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: inputText,
      max_output_tokens: 300,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const reply = typeof data.output_text === "string" ? data.output_text.trim() : "";
  if (!reply) {
    throw new Error("OpenAI response did not contain output_text");
  }

  return {
    reply,
    source: "openai",
    model: OPENAI_MODEL,
  };
}

async function handleChat(req, res) {
  try {
    const rawBody = await readBody(req);
    const body = rawBody ? JSON.parse(rawBody) : {};
    const messages = normalizeMessages(body.messages);

    if (!messages.length) {
      return sendJson(res, 400, { error: "messages is required" });
    }

    if (!OPENAI_API_KEY) {
      return sendJson(res, 200, fallbackReply());
    }

    const result = await requestOpenAI(messages);
    return sendJson(res, 200, result);
  } catch (error) {
    return sendJson(res, 200, {
      ...fallbackReply(),
      debug: error instanceof Error ? error.message : "unknown_error",
    });
  }
}

async function handleLead(req, res) {
  try {
    const rawBody = await readBody(req);
    const body = rawBody ? JSON.parse(rawBody) : {};
    const lead = extractLead(body);

    if (!lead || !lead.name || !lead.package) {
      return sendJson(res, 400, {
        error: "lead.name and lead.package are required",
      });
    }

    await saveLead(lead);

    return sendJson(res, 200, {
      ok: true,
      stored: true,
    });
  } catch (error) {
    return sendJson(res, 500, {
      ok: false,
      error: error instanceof Error ? error.message : "unknown_error",
    });
  }
}

function handleStatic(req, res) {
  const requestPath = req.url === "/" ? "/index.html" : req.url.split("?")[0];
  const filePath = safeJoin(ROOT, decodeURIComponent(requestPath));

  if (!filePath) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(error.code === "ENOENT" ? 404 : 500, {
        "Content-Type": "text/plain; charset=utf-8",
      });
      res.end(error.code === "ENOENT" ? "Not found" : "Internal server error");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end("Bad request");
    return;
  }

  if (req.method === "POST" && req.url === "/api/chat") {
    handleChat(req, res);
    return;
  }

  if (req.method === "POST" && req.url === "/api/lead") {
    handleLead(req, res);
    return;
  }

  if (req.method === "GET") {
    handleStatic(req, res);
    return;
  }

  res.writeHead(405, {
    "Content-Type": "text/plain; charset=utf-8",
  });
  res.end("Method not allowed");
});

server.listen(PORT, () => {
  ensureLeadFiles();
  console.log(`Parama server running at http://localhost:${PORT}`);
  console.log(`Model: ${OPENAI_MODEL}`);
  console.log(`OpenAI key loaded: ${OPENAI_API_KEY ? "yes" : "no"}`);
  console.log(`Google Sheets webhook: ${GOOGLE_SHEETS_WEBHOOK_URL ? "configured" : "not configured"}`);
});
