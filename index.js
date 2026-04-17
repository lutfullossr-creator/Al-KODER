import express from "express";
import fetch from "node-fetch";
import fs from "fs";

const app = express();
app.use(express.json());

const MEMORY_FILE = "memory.json";

function loadMemory() {
  if (fs.existsSync(MEMORY_FILE)) {
    return JSON.parse(fs.readFileSync(MEMORY_FILE));
  }
  return [];
}

function saveMemory(memory) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory));
}

app.post("/chat", async (req, res) => {
  const userMsg = req.body.message;
  const apiKey = req.body.apiKey;

  let memory = loadMemory();
  const context = memory.slice(-20).join("\n");

  const prompt = `${context}\nUser: ${userMsg}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      })
    }
  );

  const data = await response.json();
  const reply = data.candidates[0].content.parts[0].text;

  memory.push(`User: ${userMsg}`);
  memory.push(`AI: ${reply}`);
  saveMemory(memory);

  res.json({ reply });
});

app.listen(3000, () => console.log("Server ishlamoqda!"));
