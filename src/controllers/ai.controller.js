const { z } = require('zod');
const openAIService = require('../services/openai.service');
const supabase = require('../config/supabase');

const chatSchema = z.object({
  message: z.string().min(1).max(500),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })).optional()
});

class AIController {
  
  // 1. CHATBOT LOGIC
  async handleChat(req, res) {
    try {
      const result = chatSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json(result.error);
      }
      
      const { message, history = [] } = result.data;
      
      // Fetch ALL dynamic contexts from Supabase 'site_content' table in one query
      const { data, error } = await supabase
        .from('site_content')
        .select('section_key, content_value')
        .in('section_key', ['chatbot_api_key', 'chatbot_system_prompt', 'chatbot_knowledge']);
        
      if (error) {
        console.error("Database fetch error:", error);
      }

      // Default values (fallback if missing in DB)
      let apiKey = process.env.OPENAI_API_KEY; 
      let systemPrompt = "You are Operix AI, the official intelligent assistant for Operix. Your mission is to provide accurate, professional, and technical answers strictly based on the company's knowledge base.";
      let contextString = "No context provided.";

      if (data) {
        const keyRow = data.find(r => r.section_key === 'chatbot_api_key');
        if (keyRow && keyRow.content_value) apiKey = keyRow.content_value;

        const promptRow = data.find(r => r.section_key === 'chatbot_system_prompt');
        if (promptRow && promptRow.content_value) systemPrompt = promptRow.content_value;

        const contextRow = data.find(r => r.section_key === 'chatbot_knowledge');
        if (contextRow && contextRow.content_value) contextString = contextRow.content_value;
      }

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

      const stream = await openAIService.createChatCompletionStream(messages, apiKey);

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
        }
      }
      
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      console.error("Chat Controller Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || "AI Engine failure." });
      } else {
        res.write(`data: ${JSON.stringify({ error: "Stream interrupted." })}\n\n`);
        res.end();
      }
    }
  }

  // 2. ADMIN PANEL: GET CONTEXT
  async getContext(req, res) {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('content_value')
        .eq('section_key', 'chatbot_knowledge')
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore "no rows found" error
        throw error;
      }

      res.status(200).json({ context: data ? data.content_value : '' });
    } catch (error) {
      console.error("Error fetching context:", error);
      res.status(500).json({ error: "Failed to fetch AI Context" });
    }
  }

  // 3. ADMIN PANEL: UPDATE CONTEXT
  async updateContext(req, res) {
    try {
      const { context } = req.body;

      if (typeof context !== 'string') {
        return res.status(400).json({ error: 'Context must be a string' });
      }

      // Upsert the content into site_content table
      const { error } = await supabase
        .from('site_content')
        .upsert(
          { section_key: 'chatbot_knowledge', content_value: context }, 
          { onConflict: 'section_key' }
        );

      if (error) throw error;

      res.status(200).json({ success: true, message: 'Context updated successfully' });
    } catch (error) {
      console.error("Error updating context:", error);
      res.status(500).json({ error: "Failed to update AI Context" });
    }
  }
}

module.exports = new AIController();
