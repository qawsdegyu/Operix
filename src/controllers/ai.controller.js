const { z } = require('zod');
const openAIService = require('../services/openai.service');
const ragService = require('../services/rag.service');

const chatSchema = z.object({
  message: z.string().min(1).max(500),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })).optional()
});

class AIController {
  async handleChat(req, res) {
    try {
      const result = chatSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json(result.error);
      }
      
      const { message, history = [] } = result.data;
      
      const contextString = await ragService.getContextString();

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

      const stream = await openAIService.createChatCompletionStream(messages);

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
}

module.exports = new AIController();
