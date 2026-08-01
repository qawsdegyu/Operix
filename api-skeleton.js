// operix/api-skeleton.js
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

// Initialize Express App & Middlewares
const app = express();
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'DELETE', 'OPTIONS'] }));

app.use(express.json());

// OpenRouter / OpenAI Initialization
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://operixsys.online",
    "X-Title": "Operix"
  }
});

/**
 * ══════════════════════════════════════════════════════════════════════
 * ENDPOINT: CHATBOT RAG RETRIEVAL (/api/ai/chat)
 * ══════════════════════════════════════════════════════════════════════
 */
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 20, 
  message: "Too many chat requests."
});

const chatSchema = z.object({
  message: z.string().min(1).max(500),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })).optional()
});

app.post('/api/ai/chat', chatLimiter, async (req, res) => {
  try {
    const result = chatSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json(result.error);
    
    const { message, history = [] } = result.data;
    
    // Local File System Knowledge Base Approach
    let contextString = "No local documents found.";
    const kbDir = path.join(__dirname, 'operix'); // User named the folder 'operix'
    
    try {
      if (fs.existsSync(kbDir)) {
        const files = fs.readdirSync(kbDir);
        let allText = [];
        for (const filename of files) {
          const filePath = path.join(kbDir, filename);
          if (filename.endsWith('.txt') || filename.endsWith('.md')) {
            const text = fs.readFileSync(filePath, 'utf8');
            allText.push(`--- Context from ${filename} ---\n${text}`);
          } else if (filename.endsWith('.pdf')) {
            const dataBuffer = fs.readFileSync(filePath);
            let parseFunc = pdfParse;
            if (typeof pdfParse !== 'function') {
              parseFunc = pdfParse.default || (pdfParse.pdfParse ? pdfParse.pdfParse : pdfParse);
            }
            const data = await parseFunc(dataBuffer);
            allText.push(`--- Context from ${filename} ---\n${data.text}`);
          }
        }
        if (allText.length > 0) {
          contextString = allText.join('\n\n');
        }
      }
    } catch (err) {
      console.error("Error reading folder:", err);
    }

    const systemPrompt = "You are Operix AI, the official intelligent assistant for Operix. Your mission is to provide accurate, professional, and technical answers strictly based on the company's knowledge base. Do not invent features or prices. Always maintain an elite, futuristic tone.";

    const messages = [
      { 
        role: "system", 
        content: `${systemPrompt}\n\nHere is the company knowledge base. Use ONLY this information to answer:\n\n${contextString}` 
      },
      ...history, 
      { 
        role: "user", 
        content: message 
      }
    ];

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: messages,
      stream: true,
      temperature: 0.3,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
      }
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error("Chat Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || "AI Engine failure." });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream interrupted." })}\n\n`);
      res.end();
    }
  }
});

// JSON Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Operix RAG Engine running securely on port ${PORT}`));
}

module.exports = app;
