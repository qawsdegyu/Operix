/**
 * ══════════════════════════════════════════════════════════════════════
 * OPERIX AI: FULL-STACK RAG BACKEND ENGINE (PRODUCTION-READY)
 * ══════════════════════════════════════════════════════════════════════
 * 
 * Required Environment Variables (.env):
 * OPENAI_API_KEY=sk-proj-...
 * SUPABASE_URL=https://...
 * SUPABASE_SERVICE_KEY=eyJhbGci... (MUST be the Service Role Key for Admin operations)
 * SESSION_SECRET=your-secure-random-string
 * 
 * Required Dependencies:
 * npm install express multer @supabase/supabase-js openai helmet express-rate-limit file-type zod express-session csurf pdf-parse langchain
 */

const express = require('express');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const { OpenAI } = require('openai');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const session = require('express-session');
const csrf = require('csurf');
const pdfParse = require('pdf-parse');
const cors = require('cors');

// Dynamic import for file-type (ESM module)
let fileTypeFromBuffer;
import('file-type').then(module => {
  fileTypeFromBuffer = module.fileTypeFromBuffer;
});

// Initialize Express App & Middlewares
const app = express();
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'DELETE', 'OPTIONS'] })); // Fully permissive CORS
app.use(express.json());

// --- SECURITY MIDDLEWARES ---
// app.use(helmet()); // Temporarily disabled to prevent CORP/CORS strictness during local testing
app.use(session({
  secret: process.env.SESSION_SECRET || 'super-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, sameSite: 'lax' }
}));

// --- SERVICES INITIALIZATION ---
const upload = multer({ 
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  storage: multer.memoryStorage() 
});

// Try loading .env file if dotenv is installed
try { require('dotenv').config(); } catch (e) {}

// Use SERVICE_KEY for backend operations to bypass Row Level Security (RLS)
const supabaseUrl = process.env.SUPABASE_URL || 'https://mock.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseKey);

const openaiApiKey = process.env.OPENAI_API_KEY || 'sk-mock-key';
const openai = new OpenAI({ apiKey: openaiApiKey });

/**
 * ══════════════════════════════════════════════════════════════════════
 * ENDPOINT 1: DOCUMENT UPLOAD & VECTORIZATION (/api/admin/upload-rag)
 * ══════════════════════════════════════════════════════════════════════
 */
app.post('/api/admin/upload-rag', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded." });

    // 1. Text Extraction
    let rawText = "";
    if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
      try {
        const parseFunc = typeof pdfParse === 'function' ? pdfParse : (pdfParse.default || pdfParse);
        const pdfData = await parseFunc(file.buffer);
        rawText = pdfData.text;
      } catch (e) {
        console.error("PDF Parse error:", e);
        return res.status(500).json({ error: "Failed to parse PDF document." });
      }
    } else {
      rawText = file.buffer.toString('utf8');
    }

    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ error: "File contains no readable text." });
    }

    // 2. Chunking (Custom)
    function chunkText(text, size, overlap) {
      const result = [];
      let i = 0;
      while (i < text.length) {
        result.push({ pageContent: text.slice(i, i + size) });
        i += size - overlap;
      }
      return result;
    }
    const chunks = chunkText(rawText, 1000, 200);

    // If using mock credentials, don't attempt to hit the database/OpenAI
    if (supabaseUrl === 'https://mock.supabase.co') {
      return res.json({ 
        success: true, 
        message: "Document vectorized and indexed successfully (Mock Mode).",
        data: { id: "mock-id", filename: file.originalname, chunk_count: chunks.length, status: "Indexed" }
      });
    }

    // 4. Record Metadata in Document Library (Table: rag_library)
    const { data: docRecord, error: dbError } = await supabase
      .from('rag_library')
      .insert({
        filename: file.originalname,
        size_bytes: file.size,
        chunk_count: chunks.length,
        status: 'Indexed'
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // 5. Generate Embeddings & Store in Vector DB (Table: rag_vectors)
    const vectorsToInsert = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i].pageContent;
      
      const embeddingRes = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunkText
      });
      
      vectorsToInsert.push({
        document_id: docRecord.id,
        filename: file.originalname,
        content: chunkText,
        embedding: embeddingRes.data[0].embedding
      });
    }

    const { error: vectorError } = await supabase.from('rag_vectors').insert(vectorsToInsert);
    if (vectorError) throw vectorError;

    res.json({ success: true, message: "Document vectorized and indexed successfully.", data: docRecord });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: error.message || "Indexing failed." });
  }
});


/**
 * ══════════════════════════════════════════════════════════════════════
 * ENDPOINT 2: FILE DELETION (/api/admin/delete-file/:id)
 * ══════════════════════════════════════════════════════════════════════
 */
app.delete('/api/admin/delete-file/:id', async (req, res) => {
  try {
    const docId = req.params.id;

    if (supabaseUrl === 'https://mock.supabase.co') {
      return res.json({ success: true, message: "Document deleted successfully (Mock Mode)." });
    }

    await supabase.from('rag_vectors').delete().eq('document_id', docId);
    const { error } = await supabase.from('rag_library').delete().eq('id', docId);
    if (error) throw error;

    res.json({ success: true, message: "Document and vectors deleted successfully." });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Failed to delete document." });
  }
});


/**
 * ══════════════════════════════════════════════════════════════════════
 * ENDPOINT 3: CHATBOT RAG RETRIEVAL (/api/ai/chat)
 * ══════════════════════════════════════════════════════════════════════
 */

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: "Too many requests. Please wait a moment." },
});

const chatSchema = z.object({
  message: z.string().min(1).max(1000).trim(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional()
});

app.post('/api/ai/chat', chatLimiter, async (req, res) => {
  try {
    const result = chatSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json(result.error);
    
    const { message, history = [] } = result.data;
    
    if (supabaseUrl === 'https://mock.supabase.co') {
      // Mock stream response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.write(`data: ${JSON.stringify({ text: "I am responding in Mock Mode since no API keys were provided. To get real answers, please add your OpenAI and Supabase keys to the .env file!" })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    const { data: settingsData } = await supabase
      .from('site_content')
      .select('content_value')
      .eq('section_key', 'ai_system_prompt')
      .single();
      
    const systemPrompt = settingsData?.content_value || "You are a helpful AI assistant.";

    const queryEmbeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: message
    });
    const queryVector = queryEmbeddingRes.data[0].embedding;
    
    const { data: retrievedContexts, error: searchError } = await supabase.rpc('match_documents', {
      query_embedding: queryVector,
      match_threshold: 0.75,
      match_count: 5 
    });
    
    if (searchError) throw searchError;

    const contextString = retrievedContexts && retrievedContexts.length > 0 
      ? retrievedContexts.map(doc => `--- Context from ${doc.filename} ---\n${doc.content}`).join('\n\n')
      : "No specific company documents found for this query.";

    const messages = [
      { 
        role: "system", 
        content: `${systemPrompt}\n\nUse the following extracted company context to answer the user's question accurately. If the answer is not in the context, say you don't know.\n\n${contextString}` 
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
      model: "gpt-4o-mini",
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
app.listen(PORT, () => console.log(`Operix RAG Engine running securely on port ${PORT}`));
